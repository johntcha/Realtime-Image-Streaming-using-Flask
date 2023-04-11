from flask import Flask, Response, render_template
from flask_assets import Environment, Bundle
from camera import capture_image, generate_camera_stream


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
    Return a message if succeed and an error if failed
    """
    return capture_image()
