import os
import cv2

cap = cv2.VideoCapture(0)

if not os.path.exists("pictures"):
    os.makedirs("pictures")

# get current directory to find pictures folder
currentDirectory = os.path.dirname(os.path.abspath(__file__))
directoryPath = f"{currentDirectory}/pictures"

# number of picture already in the folder picture
count = len(os.listdir(directoryPath)) - 1

while True:
    # capture frame-by-frame
    isSuccess, frame = cap.read()
    # if frame is read correctly ret is True
    if not isSuccess:
        print("Frame is not read correctly. Exiting ...")
        break
    cv2.imshow("Realtime Image Streaming", frame)

    key = cv2.waitKey(1)

    # shot if 'r' key is pressed
    if key == ord("r"):
        count += 1
        cv2.imwrite(os.path.join("pictures", f"picture_{count}.jpg"), frame)
    # quit if 'q' key is pressed
    if key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
