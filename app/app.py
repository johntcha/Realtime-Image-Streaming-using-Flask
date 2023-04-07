from flask import Flask, Response, render_template
from camera import generate_camera_stream


app = Flask(__name__)


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
