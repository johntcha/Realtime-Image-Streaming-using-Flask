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
ALL_PROCESSING_LABEL = process["ALL_PROCESSING_LABEL"]
MIN_THRESHOLD_VALUE = int(process["MIN_THRESHOLD_VALUE"])
MAX_THRESHOLD_VALUE = int(process["MAX_THRESHOLD_VALUE"])

operations = {
    "width": STREAM_WIDTH,
    "height": STREAM_HEIGHT,
    "zoom": ZOOM_DEFAULT_VALUE,
}

processing_labels = ALL_PROCESSING_LABEL.split(",")
current_processing_label = ""
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
        ret, buffer = cv2.imencode(".jpg", applyOperations(frame))
        if not ret:
            raise ValueError("Couldn't encode the frame as jpeg")

        # convert to bytes in order to send over network
        frame = buffer.tobytes()

        # send the data to the client in chunks
        yield b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"


def capture_image():
    """Take a picture and return a dict with message timestamp if succeed"""
    # filtering the processed pictures by checking if process label is present
    filtered_listdir = list(
        filter(
            lambda x: not any(pl in x for pl in processing_labels),
            os.listdir(directoryPath),
        )
    )
    # number of "normal" picture already in the folder picture
    count = len(filtered_listdir) - 1
    success, frame = cap.read()
    if success:
        count += 1
        image_name = f"picture_{count}.jpg"
        cv2.imwrite(os.path.join("pictures", image_name), applyOperations(frame))
        timestamp = int(time.time())
        # only take picture with process if at least one has been chosen
        if current_processing_label != "":
            swb = cv2.xphoto.createSimpleWB()
            processed_img_name = (
                f"{os.path.splitext(image_name)[0]}_{current_processing_label}.jpg"
            )
            processing_operation(
                current_processing_label, swb, frame, processed_img_name
            )
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


def apply_img_processing(is_processing, label):
    """Duplicate and apply a process operation on all pictures
    in the /pictures folder according to the label.
    If the process operation is removed, delete all pictures with this processing operation.
    If the label is not recognized, throw an error
    """
    global current_processing_label
    swb = cv2.xphoto.createSimpleWB()

    current_processing_label = label
    # Loop through all the images in the folder
    for image_name in os.listdir(directoryPath):
        # Check if the file is an .jpg image
        if image_name.endswith(".jpg"):
            image_path = os.path.join(directoryPath, image_name)
            processed_img_name = f"{os.path.splitext(image_name)[0]}_{label}.jpg"
            img = cv2.imread(image_path)
            # Don't apply the processing on processed and already processed pictures
            if (
                is_processing is True
                # check if the picture name is already processed by checking on processing label
                and not any(pl in image_name for pl in processing_labels)
                and processed_img_name not in os.listdir(directoryPath)
            ):
                processing_operation(label, swb, img, processed_img_name)
            # Delete processed pictures
            if is_processing is False and label in image_name:
                os.remove(image_path)
                current_processing_label = ""

    if is_processing is True:
        return {"message": "Image processing has been sucessfully applied!"}
    else:
        return {"message": "Image processing has been sucessfully reverted!"}


def processing_operation(label, simple_WB, img, processed_img_name):
    """Chosing processing operation according to label"""
    if label == "WB":
        # Apply white balance correction
        simple_WB.setP(1.0)
        corrected_img = simple_WB.balanceWhite(img)
    elif label == "CTG" or label == "CE":
        # Convert the image to grayscale
        corrected_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        if label == "CE":
            # Apply Canny edge detection with minimum and maximum threshold values
            # Need to apply the grayscale first
            # since the basic Canny algorithm works on grayscale images
            corrected_img = cv2.Canny(
                corrected_img, MIN_THRESHOLD_VALUE, MAX_THRESHOLD_VALUE
            )
    else:
        raise ValueError(f"{label} operation label does not exist")
    output_path = os.path.join(directoryPath, processed_img_name)
    cv2.imwrite(output_path, corrected_img)


def applyOperations(frame):
    # ROI coordinates (top, left, bottom, right)
    # starting from top-left
    roi = [
        0,
        0,
        int(STREAM_HEIGHT / operations["zoom"]),
        int(STREAM_WIDTH / operations["zoom"]),
    ]
    # array[start_row:end_row, start_column:end_column]
    roi_frame = frame[roi[0] : roi[2], roi[1] : roi[3]]

    resized = cv2.resize(
        roi_frame,
        (
            int(operations["width"]),
            int(operations["height"]),
        ),
    )
    return resized
