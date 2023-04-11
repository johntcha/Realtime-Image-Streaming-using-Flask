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

The next task was to use the Flask framework in order to stream the webcam on the browser. At first, I commented the capture images feature since it was not required in this task. I had to encode and convert it in bytes the stream data so I could send it to the client. The keyword `yield` was necessary to continuously send the images through the network. Then, I built the skeleton of my Flask application by adding the `app.py` and `index.html` files. My `index.html` file is simply rendering a div with the title and the camera stream I a fetching through the `generate_camera` route I added in the `app.py` file.

When I was first lauching the Flask app, I was using the following command lines: `export FLASK_APP=app.py` to set the Flask app and `flask run` to run the application. However, `export` is not available on Windows prompt command, it is `set` instead. I decided to use a .env in order to set my environment variables here so I used the [python-dotenv](https://pypi.org/project/python-dotenv/) library to use it. With it, I didn't need to `export` or `set` the flask app variable. I also wanted to have the auto reload on save and more logs so I added the debug mode variable in my .env file `FLASK_DEBUG`.

Then, I needed a build management system to automate the compilation of my source code so I used [Makefile](https://www.gnu.org/software/make/). In my makefile, I added the command build which cleans all pycache files, install all the necessary modules written in the requirements.txt, format the code and check the lint of .py files.

## Task 3

[Prettier](https://prettier.io/docs/en/install.html)
