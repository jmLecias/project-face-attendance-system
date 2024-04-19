from flask import Flask, render_template, Response, request, send_from_directory, abort
from flask_cors import CORS
from deepface import DeepFace
from retinaface import RetinaFace
from datetime import datetime
import time
import cv2
import numpy as np
import pandas as pd
import os
import shutil
import json

app = Flask(__name__)
CORS(app)

# cam = cv2.VideoCapture(0)
cam = cv2.VideoCapture('rtsp://CAPSTONE:@CAPSTONE1@192.168.1.2:554/live/ch00_0') # Apartment Wifi
# cam = cv2.VideoCapture('rtsp://CAPSTONE:@CAPSTONE1@192.168.254.104:554/live/ch00_0') # Home wifi

output_folder = 'static'
face_db_path = os.path.join("face-database", "class1")
detections_dir = os.path.join(output_folder, "detections")


@app.route('/')
def index():
    return render_template('index.html')

class NumpyArrayEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NumpyArrayEncoder, self).default(obj)
        
        
def gen_frames():
    global cam
    while True:
        ret, frame = cam.read()
        if not ret:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video-feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/recognize-faces', methods=['POST'])
def recognize_faces():
    print("Recognizing face...")

    data = request.get_json()
    faces = data.get('faces')
    captured_path = data.get('capturedPath')
    
    results = []

    og_frame = cv2.imread(os.path.join(output_folder, captured_path))
    frame = cv2.resize(og_frame, (1280, 720))
    
    if not os.path.exists(detections_dir):
        os.makedirs(detections_dir)
    
    for face in faces:
        face_id = face['face_id']
        face_info = face['face_info']
        facial_area = face_info.get('facial_area', [0, 0, 0, 0])
        face_img = frame[facial_area[1]:facial_area[3], facial_area[0]:facial_area[2]]
            
        new_face_id = f"{face_id}-{int(time.time())}.jpg"
        temp_face_img_path = os.path.join(detections_dir, new_face_id)
        cv2.imwrite(temp_face_img_path, face_img)
            
        result = DeepFace.find(
            img_path=temp_face_img_path, 
            db_path=face_db_path,
            model_name="ArcFace",
            detector_backend="retinaface",
            enforce_detection=False,
        )
            
        filtered_result = [df for df in result if not df.empty]
            
        if filtered_result:
            sorted_result = sorted(filtered_result, key=lambda df: df.iloc[0]['distance'])
            identity = sorted_result[0].iloc[0]['identity']
            accuracy = (1 - sorted_result[0].iloc[0]['distance']) * 100
            results.append({"detected": new_face_id, "identity": identity, "accuracy": accuracy})
        else:
            results.append({"detected": new_face_id, "identity": None, "accuracy": 0})
            print(f"Face {face_id} does not have any matches in face database.")
    
    print(results)
    
    max_accuracies = {}
    for result in results:
        identity = result['identity']
        accuracy = result['accuracy']
        if identity not in max_accuracies or accuracy > max_accuracies[identity]:
            max_accuracies[identity] = accuracy
            
    for result in results:
        if result['accuracy'] < max_accuracies[result['identity']]:
            result['identity'] = None
            result['accuracy'] = 0
        
    print(results)
    
    json_data = json.dumps({"results": results}, cls=NumpyArrayEncoder)
    
    return Response(json_data, mimetype='application/json')

    
@app.route('/recognized-face/<filename>')
def recognized_face(filename):
    file_path = os.path.join(face_db_path, filename)
    
    if os.path.exists(file_path):
        return send_from_directory(directory=face_db_path, path=filename)
    else:
        abort(404)
        

@app.route('/detect-faces', methods=['POST'])
def detect_faces():
    print("Detecting faces...")
    
    data = request.get_json()
    captured_path = data.get('capturedPath') 
    
    captured_timestamp = int(captured_path.split(".")[0])
    captured_datetime = datetime.fromtimestamp(captured_timestamp)
    captured_datetime = captured_datetime.strftime("%m-%d-%Y %a %I:%M:%S %p")
    
    if os.path.exists(detections_dir):
        shutil.rmtree(detections_dir)

    og_frame = cv2.imread(os.path.join(output_folder, captured_path))
    frame = cv2.resize(og_frame, (1280, 720))

    faces = RetinaFace.detect_faces(frame)
    
    faces_list = [{"face_id": str(face_id), "face_info": face_info} for face_id, face_info in faces.items()]
    
    json_data = json.dumps({"faces": faces_list, "datetime": captured_datetime, "capturedPath": captured_path}, cls=NumpyArrayEncoder)
    
    return Response(json_data, mimetype='application/json')


@app.route('/detected-face/<filename>')
def dete(filename):
    file_path = os.path.join(detections_dir, filename)
    
    if os.path.exists(file_path):
        return send_from_directory(directory=detections_dir, path=filename)
    else:
        abort(404)


@app.route('/capture', methods=['POST'])
def capture():
    print("Capturing frame...")
    global cam
    ret, frame = cam.read()

    if not ret:
        return "Failed to capture image."
    
    if frame is not None:
        filename = f"{datetime.now().timestamp()}.jpg"
        cv2.imwrite(os.path.join(output_folder, filename), frame)
        
    json_data = json.dumps({"capturedPath": filename}, cls=NumpyArrayEncoder)
    
    return Response(json_data, mimetype='application/json')


with app.app_context():
    if not cam.isOpened():
        print("Cannot open camera")
        exit()

if __name__ == '__main__':
    app.run(debug=True)
    cam.release()
