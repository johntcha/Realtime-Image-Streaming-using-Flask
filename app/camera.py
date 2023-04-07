import os
import cv2

cap = cv2.VideoCapture(0)

if not os.path.exists("pictures"):
    os.makedirs("pictures")

# get current directory to find pictures folder
currentDirectory = os.path.dirname(os.path.abspath(__file__))
directoryPath = f"{currentDirectory}/pictures"


def generate_camera_stream():
    """Get camera frames, encode it and send it in chunks"""
    # number of picture already in the folder picture
    # count = len(os.listdir(directoryPath)) - 1
    while True:
        # capture frame by frame
        is_success, frame = cap.read()

        if not is_success:
            raise ValueError("Frame is not read correctly")
        # cv2.imshow("Realtime Image Streaming", frame)

        # encode the image format into streaming data
        # jpeg format good compression and reasonable image quality
        ret, buffer = cv2.imencode(".jpg", frame)
        if not ret:
            raise ValueError("Couldn't encode the frame as jpeg")

        # convert to bytes in order to send over network
        frame = buffer.tobytes()

        # send the data to the client in chunks
        yield b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"

        # concat frame one by one and show result
        # key = cv2.waitKey(1)

        # shot if 'r' key is pressed
        # if key == ord("r"):
        #    count += 1
        #    cv2.imwrite(os.path.join("pictures", f"picture_{count}.jpg"), frame)
        # quit if 'q' key is pressed
        # if key == ord("q"):
        #    break
