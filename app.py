from flask import Flask, Response, render_template, request
from flask_assets import Bundle, Environment

from camera import (
    apply_img_processing,
    capture_image,
    generate_camera_stream,
    get_default_values,
    set_camera_settings,
)

app = Flask(__name__)
assets = Environment(app)
# gen/main.css file is the output CSS file
# libsass tells Flask-Assets to use the libsass library to compile the SCSS code to CSS
# depends=('**/*.scss') tells Flask-Assets to rebuild the CSS file
# whenever any .scss file in the project changes
scss_bundle = Bundle(
    "scss/main.scss", output="gen/main.css", filters="libsass", depends=("**/*.scss",)
)
assets.register("scss_all", scss_bundle)


# Routes
@app.route("/")
def home():
    """Return the index.html template"""
    return render_template("index.html")


@app.route("/generate_camera")
def generate_camera():
    """
    Get camera stream
    multipart/x-mixed-replace is a streaming protocol to continuously send data
    """
    return Response(
        generate_camera_stream(), mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/capture", methods=["POST"])
def capture():
    """
    Return a dict with message and timestamp if succeed and an error if failed
    """
    return capture_image()


@app.route("/camera_settings", methods=["POST"])
def camera_settings():
    """
    Getting the key and value of setting and pass it to set_camera_settings
    returns real time settings
    """
    for key, value in request.json.items():
        setting_key = key
        setting_value = float(value)
    return set_camera_settings(setting_key, setting_value)


@app.route("/default_values", methods=["GET"])
def default_values():
    """
    Fetch the default values
    """
    return get_default_values()


@app.route("/img_processing", methods=["POST"])
def img_processing():
    """
    Apply image processing on all pictures
    """
    return apply_img_processing(request.json["isProcessing"], request.json["label"])
