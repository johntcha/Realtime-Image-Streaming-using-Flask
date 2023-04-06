# Realtime Image Streaming using Flask
## Context
_The idea of this project is to stream the webcam on a browser an be able to take pictures and to adjust webcam parameters through it._

The project is splitted in 4 task:
- **Task1: Capture Webcam Image Data by OpenCV**
- **Task2: Stream Image Data In Web Browser GUI using Flask**
- **Task3: Improve the UI/UX**
- **Task4: Add Camera Parameters Adjustment DOM**

In each of these tasks, I will explain briefly what I did and how I came to it. Each task will be developed in different branches in order to have a track of the the source code.

## Initialization

First of all, I installed the last version of [Python](https://www.python.org/downloads/) and [pip](https://pypi.org/project/pip/) to be install the different packages I needed for this application: [OpenCV](https://opencv.org/) and [Flask](https://flask.palletsprojects.com/en/2.2.x/installation/) (versions are in the **requirements.txt**) 
## Task 1
In this task, the first thing I did was to get familiar with Python syntax again since it has been around 3 years that I didn't used it. The next step was to use `VideoCapture` method from OpenCV to open the webcam, to stream it and on button press close it. By entering the `python camera.py` command, the webcam window is opening and by pressing `q`, it is closing.
The next step was to be able to take pictures from the webcam and save them. I added this possibility by pressing the button `r`. Furthermore, I used the `os` python module to create a folder `pictures` if it doesn't exist when the script is launched in order to put my pictures here. In order to avoid the old pictures to be erased by the new ones, I also with the `os` module counted the number of pictures taken in the folder and add the next number in the picture title so they won't have the same name.

## Task 2