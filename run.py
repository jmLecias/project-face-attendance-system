# from deepface import DeepFace
# from retinaface import RetinaFace
# import cv2

# # Initialize the camera
# cam = cv2.VideoCapture(0)

# # Capture an image
# ret, img = cam.read()

# # Check if the image was successfully captured
# if not ret:
#     print("Failed to capture image.")
# else:
#     # Detect faces using RetinaFace
#     faces = RetinaFace.detect_faces(img)

#     for face_id, face_info in faces.items():
#         # Extract the face image using the bounding box
#         face_img = img[face_info['facial_area'][1]:face_info['facial_area'][3], face_info['facial_area'][0]:face_info['facial_area'][2]]

#         # Use ArcFace for recognition
#         result = DeepFace.verify(face_img, "john_mark.jpg", model_name='ArcFace', detector_backend='retinaface', enforce_detection=False)

#         # Print the result
#         print(f"Face {face_id} is verified: {result['verified']}")
#         cv2.imshow("Detected face", face_img)

#     # Display the captured image
#     cv2.imshow("Captured Image", img)
#     cv2.waitKey(0) # Wait for a key press

# # Release the camera
# cam.release()

# # Close all OpenCV windows
# cv2.destroyAllWindows()

import tensorflow as tf
print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))
#  If the output is greater than 0, it means TensorFlow is able to detect and use your GPU(s).
#  If 0 need to install CUDA Toolkit
# CHECK:
# For Windows:
# Using Command Prompt:
# - Open a Command Prompt window.
# - Type nvcc --version and press Enter.
# - If CUDA is installed correctly, you should see the version of the CUDA Toolkit that is installed, along with the version of the NVIDIA GPU driver 1.  