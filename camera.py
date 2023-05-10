import os
import time
import cv2
from dotenv import dotenv_values

# get .env values as a dict
process = dotenv_values(".env")
DEFAULT_CAMERA = int(process["DEFAULT_CAMERA"])
EXPOSURE_DEFAULT_VALUE = int(process["EXPOSURE_DEFAULT_VALUE"])
SATURATION_DEFAULT_VALUE = int(process["SATURATION_DEFAULT_VALUE"])
STREAM_WIDTH = int(process["STREAM_WIDTH"])
STREAM_HEIGHT = int(process["STREAM_HEIGHT"])
ZOOM_DEFAULT_VALUE = int(process["ZOOM_DEFAULT_VALUE"])

operations = {
    "width": STREAM_WIDTH,
    "height": STREAM_HEIGHT,
    "zoom": ZOOM_DEFAULT_VALUE,
}
# cv2.CAP_DSHOW parameter with DirectShow API for Windows
# displays a black screen on browser and frame is very slowly generated
# maybe camera hardware issue ?
# cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

# although the cv2.VideoCapture(0).get() is not returning the real current value
# I will be using this one to stream the camera and see the parameter changements on browser
cap = cv2.VideoCapture(DEFAULT_CAMERA)

# display camera settings window
# but seems to be only working with cv2.CAP_DSHOW parameter on VideoCapture
# cap.set(cv2.CAP_PROP_SETTINGS,0)

# same for get(), with CAP_DSHOW
# it returns the value updated but without it, it returns the default value
# even after being set
# cap.get(cv2.CAP_PROP_EXPOSURE)
# cap.get(cv2.CAP_PROP_SATURATION)

if not os.path.exists("pictures"):
    os.makedirs("pictures")

# get current directory to find pictures folder
currentDirectory = os.path.dirname(os.path.abspath(__file__))
directoryPath = f"{currentDirectory}/pictures"


def generate_camera_stream():
    """Get camera frames, encode it and send it in chunks"""
    # setting default value where the stream quality is stable
    global operations
    operations = {
        "width": STREAM_WIDTH,
        "height": STREAM_HEIGHT,
        "zoom": ZOOM_DEFAULT_VALUE,
    }
    cap.set(cv2.CAP_PROP_EXPOSURE, EXPOSURE_DEFAULT_VALUE)
    cap.set(cv2.CAP_PROP_SATURATION, SATURATION_DEFAULT_VALUE)
    while True:
        # capture frame by frame
        is_success, frame = cap.read()
        if not is_success:
            raise ValueError("Frame is not read correctly")

        # encode the image format into streaming data
        # jpeg format good compression and reasonable image quality
        resized = cv2.resize(
            frame,
            (
                int(operations["width"] * operations["zoom"]),
                int(operations["height"] * operations["zoom"]),
            ),
        )
        ret, buffer = cv2.imencode(".jpg", resized)
        if not ret:
            raise ValueError("Couldn't encode the frame as jpeg")

        # convert to bytes in order to send over network
        frame = buffer.tobytes()

        # send the data to the client in chunks
        yield b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"


def capture_image():
    """Take a picture and return a dict with message timestamp if succeed"""
    # number of picture already in the folder picture
    count = len(os.listdir(directoryPath)) - 1
    success, frame = cap.read()
    if success:
        count += 1
        cv2.imwrite(os.path.join("pictures", f"picture_{count}.jpg"), frame)
        timestamp = int(time.time())
        return {
            "message": "Picture has been taken successfully!",
            "timestamp": timestamp,
        }
    raise ValueError("Frame is not read correctly")


def set_camera_settings(setting_key, setting_value):
    """Change the camera exposure and saturation settings and return current settings value"""
    global operations
    settings = {
        "exposure": {
            "prop": cv2.CAP_PROP_EXPOSURE,
            "defaultValue": EXPOSURE_DEFAULT_VALUE,
            "currentValue": EXPOSURE_DEFAULT_VALUE,
        },
        "saturation": {
            "prop": cv2.CAP_PROP_SATURATION,
            "defaultValue": SATURATION_DEFAULT_VALUE,
            "currentValue": SATURATION_DEFAULT_VALUE,
        },
        "height": {
            "defaultValue": STREAM_HEIGHT,
            "currentValue": operations["height"],
        },
        "width": {
            "defaultValue": STREAM_WIDTH,
            "currentValue": operations["width"],
        },
        "zoom": {
            "defaultValue": ZOOM_DEFAULT_VALUE,
            "currentValue": operations["zoom"],
        },
    }
    # it would be easier to get the current value with cap.get()
    # but it is not working without cv2.CAP_DSHOW
    settings[setting_key]["currentValue"] = (
        setting_value + settings[setting_key]["defaultValue"]
    )
    # updating values in camera
    if "prop" in settings[setting_key]:
        cap.set(
            settings[setting_key]["prop"],
            settings[setting_key]["currentValue"],
        )
    # if prop not present, it means we have to attribute the value with =
    else:
        operations[setting_key] = settings[setting_key]["currentValue"]

    # creating new dict with all settings name paired with updated value
    real_time_settings = {}
    for key, value in settings.items():
        real_time_settings[key] = value["currentValue"]
    return real_time_settings


def get_default_values():
    """Returns the default settings values"""
    return {
        "exposure": process["EXPOSURE_DEFAULT_VALUE"],
        "saturation": process["SATURATION_DEFAULT_VALUE"],
        "width": process["STREAM_WIDTH"],
        "height": process["STREAM_HEIGHT"],
        "zoom": process["ZOOM_DEFAULT_VALUE"],
    }
