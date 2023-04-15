import os
import cv2

# cv2.CAP_DSHOW parameter with DirectShow API for Windows
# displays a black screen on browser and frame is very slowly generated
# maybe camera hardware issue ?
# cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

# although the cv2.VideoCapture(0).get() is not returning the real current value
# I will be using this one to stream the camera and see the parameter changements on browser
cap = cv2.VideoCapture(0)

# display camera settings window but seems to be only working with cv2.CAP_DSHOW parameter on VideoCapture
# cap.set(cv2.CAP_PROP_SETTINGS,0)
# same for get(), with CAP_DSHOW, it returns the value updated but without, it returns the default value
# even after being set
# cap.get(cv2.CAP_PROP_EXPOSURE)
# cap.get(cv2.CAP_PROP_SATURATION)

if not os.path.exists("pictures"):
    os.makedirs("pictures")

# get current directory to find pictures folder
currentDirectory = os.path.dirname(os.path.abspath(__file__))
directoryPath = f"{currentDirectory}/pictures"
# number of picture already in the folder picture
count = len(os.listdir(directoryPath)) - 1
exposureDefaultValue = -5
saturationDefaultValue = 32


def generate_camera_stream():
    """Get camera frames, encode it and send it in chunks"""
    # setting default value where the stream quality is stable
    cap.set(cv2.CAP_PROP_EXPOSURE, exposureDefaultValue)
    cap.set(cv2.CAP_PROP_SATURATION, saturationDefaultValue)
    while True:
        # capture frame by frame
        is_success, frame = cap.read()
        if not is_success:
            raise ValueError("Frame is not read correctly")

        # encode the image format into streaming data
        # jpeg format good compression and reasonable image quality
        ret, buffer = cv2.imencode(".jpg", frame)
        if not ret:
            raise ValueError("Couldn't encode the frame as jpeg")

        # convert to bytes in order to send over network
        frame = buffer.tobytes()

        # send the data to the client in chunks
        yield b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"


def capture_image():
    """Take a picture and return a message if succeed"""
    global count
    success, frame = cap.read()
    if success:
        count += 1
        cv2.imwrite(os.path.join("pictures", f"picture_{count}.jpg"), frame)
        return "Picture has been taken successfully!"
    raise ValueError("Frame is not read correctly")


def set_camera_settings(setting_key, setting_value):
    """Change the camera exposure and saturation settings"""
    dictio = {
        "exposure": {
            "prop": cv2.CAP_PROP_EXPOSURE,
            "defaultValue": exposureDefaultValue,
        },
        "saturation": {
            "prop": cv2.CAP_PROP_SATURATION,
            "defaultValue": saturationDefaultValue,
        },
    }
    cap.set(
        dictio[setting_key]["prop"], setting_value + dictio[setting_key]["defaultValue"]
    )
