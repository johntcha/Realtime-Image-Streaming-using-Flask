# Realtime Image Streaming using Flask

## Context

_The idea of this project is to stream the webcam on a browser an be able to take pictures and to adjust webcam parameters through it._

The project is splitted in 4 task:

- **Task1: Capture Webcam Image Data by OpenCV**
- **Task2: Stream Image Data In Web Browser GUI using Flask**
- **Task3: Improve the UI/UX**
- **Task4: Add Camera Parameters Adjustment DOM**

Each task will be developed in different branches in order to have a track of the source code.

## Initialization

First of all, I installed the last version of [Python](https://www.python.org/downloads/) and [pip](https://pypi.org/project/pip/) to be install the different packages I needed for this application: [OpenCV](https://opencv.org/) and [Flask](https://flask.palletsprojects.com/en/2.2.x/installation/) (versions are in the **requirements.txt**)

To easily build and start the project, you will need [Makefile](https://www.gnu.org/software/make/). For Linux/Mac OS, you can use the following command line: `make install`. As I am using Windows, I couldn't use this command line but I installed it with [Chocolatey](https://community.chocolatey.org/packages/make)

Once everything installed, you can run the following make command to build your application: `make build`. It will install a virtual environment named `myenv` and install all the depedencies you will need to run the application.
If you are using Linux/Mac OS, you will need in the Makefile to comment the Windows lines and uncomment the Linux/Max OS ones.

Don't forget to create a .env by taking the example with the `env.example` file.

You can then run the application by running the run.bat on Windows or run.sh on Linux/Mac OS and go to `http://localhost:5000/`. You should see the website running with a television with no signal.

## How to use ?

The buttons `Shot` and `dragging sliders (+/- on smaller screen size)` are disabled when the camera is not streaming. Click on the `Play` button to start it. You should see your camera inside the television, the small black information box on right upper side, `Play` button becoming `Stop` button and the disabled buttons being active.

You can now modify settings with the `dragging sliders (or +/- buttons)` and see the changement on real time on camera and on the black information box.

By clicking on the `Shot` button, it will take a pictures, add it inside the `pictures` folder and add the timestamp of the picture on the black information box. If the picture has been taken, a small `snackbar` will appear for a second on the top of the television indicating the shot has been successfully done.

If there are some errors, the same `snackbar` will be displayed indicating the error.

If you click on the `Stop` button, the camera stream will be stopped and you will return at the initial status. All the changements will be reinitialized
