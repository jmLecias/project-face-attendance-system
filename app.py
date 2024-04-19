from flask import Flask, render_template, Response, request, send_from_directory, abort, jsonify
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
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['CAPTURES_FOLDER'] = 'uploads/captures'
app.config['DETECTIONS_FOLDER'] = 'faces/detections'
app.config['FACE_DATABASE'] = 'faces/database/class1'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['CAPTURES_FOLDER'], exist_ok=True)
os.makedirs(app.config['DETECTIONS_FOLDER'], exist_ok=True)
os.makedirs(app.config['FACE_DATABASE'], exist_ok=True)
    

cam = cv2.VideoCapture(0)
# cam = cv2.VideoCapture('rtsp://CAPSTONE:@CAPSTONE1@192.168.1.2:554/live/ch00_0') # Apartment Wifi
# cam = cv2.VideoCapture('rtsp://CAPSTONE:@CAPSTONE1@192.168.254.104:554/live/ch00_0') # Home wifi

output_folder = 'static'

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
    results = []

    # Get faces and captured_path from request
    data = request.get_json()
    faces = data.get('faces')
    captured_path = data.get('capturedPath')
    
    # Remake the 'faces/detections' folder if not exists
    if not os.path.exists(app.config["DETECTIONS_FOLDER"]):
        os.makedirs(app.config["DETECTIONS_FOLDER"])
    
    # Loop through every face from detections, crop them using 'facial_area'
    # Save each detected face temporarily in 'faces/detections'
    frame = cv2.imread(captured_path)
    for face in faces:
        face_id = face['face_id']
        face_info = face['face_info']
        facial_area = face_info.get('facial_area', [0, 0, 0, 0])
        face_img = frame[facial_area[1]:facial_area[3], facial_area[0]:facial_area[2]]
            
        new_face_id = f"{face_id}-{int(time.time())}.jpg"
        temp_face_img_path = os.path.join(app.config["DETECTIONS_FOLDER"], new_face_id)
        cv2.imwrite(temp_face_img_path, face_img)
            
        result = DeepFace.find(
            img_path=temp_face_img_path, 
            db_path=app.config["FACE_DATABASE"],
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
    file_path = os.path.join(app.config["FACE_DATABASE"], filename)
    
    if os.path.exists(file_path):
        return send_from_directory(directory=app.config["FACE_DATABASE"], path=filename)
    else:
        abort(404)
        

@app.route('/detect-faces', methods=['POST'])
def detect_faces():
    print("Detecting faces...")
    
    # Check if 'capturedFrame' was sent from request
    if 'capturedFrame' not in request.files:
        return jsonify({'error': 'No capturedFrame part'}), 400
    
    # If exists, check for its filename
    captured_file = request.files['capturedFrame']
    if captured_file.filename == '':
        return jsonify({'error': 'No selected image'}), 400
    
    # Clean the filename, then save to 'uploads/captures'
    filename = secure_filename(captured_file.filename)
    captured_path = os.path.join(app.config['CAPTURES_FOLDER'], filename)
    captured_file.save(captured_path)
    
    # Delete previous face detections, if there is any
    if os.path.exists(app.config["DETECTIONS_FOLDER"]):
        shutil.rmtree(app.config["DETECTIONS_FOLDER"])

    # Read save captured_file, detect faces, and save to list
    frame = cv2.imread(captured_path)
    faces = RetinaFace.detect_faces(frame)
    faces_list = [{"face_id": str(face_id), "face_info": face_info} for face_id, face_info in faces.items()]
        
    json_data = json.dumps({"faces": faces_list, "capturedPath": captured_path}, cls=NumpyArrayEncoder)
    return Response(json_data, mimetype='application/json')


@app.route('/detected-face/<filename>')
def detected_face(filename):
    file_path = os.path.join(app.config["DETECTIONS_FOLDER"], filename)
    
    if os.path.exists(file_path):
        return send_from_directory(directory=app.config["DETECTIONS_FOLDER"], path=filename)
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
