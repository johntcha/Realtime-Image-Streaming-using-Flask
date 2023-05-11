# Realtime Image Streaming using Flask

## Context

_The idea of this project is to stream the webcam on a browser and be able to take pictures and adjust webcam parameters through it. The project is split into 4 tasks:_

The project is split into 8 tasks:

- **Task1: Capture Webcam Image Data by OpenCV**
- **Task2: Stream Image Data In Web Browser GUI using Flask**
- **Task3: Improve the UI/UX**
- **Task5: Add Image Operation Functionalities**
- **Task6: Simple Image Processing on Captured Images**
- **Task7: Add Another View for Image Data Streaming in Parallel**
- **Task8: Wrap Up the Program Inside a Docker**

Each task will be developed in different branches in order to have track of the source code.

## Initialization

First of all, I installed the last version of [Python](https://www.python.org/downloads/) and [pip](https://pypi.org/project/pip/) to install the different packages I needed for this application: [OpenCV](https://opencv.org/) and [Flask](https://flask.palletsprojects.com/en/2.2.x/installation/) (versions are in the **requirements.txt**)

To easily build and start the project, you will need [Makefile](https://www.gnu.org/software/make/). For Linux/Mac OS, you can use the following command line: `make install`. As I am using Windows, I couldn't use this command line but I installed it with [Chocolatey](https://community.chocolatey.org/packages/make)

Once everything is installed, you can run the following make command to build your application: `make build`. It will install a virtual environment named `myenv` and install all the dependencies you will need to run the application.
If you are using Linux/Mac OS, you will need in the Makefile to comment the Windows lines and uncomment the Linux/Max OS ones.
It will also create a `.env` file copying the `env.example` content. If you wish to have different default value for the camera stream, feel free to modify it in the `.env`.

You can then run the application by running the `run.bat` on Windows or `run.sh` on Linux/Mac OS and go to `http://localhost:5000/`. You should see the website running on a television with no signal.

## How to use it?

There are 3 tabs on the right where it displays different buttons below the stream visualization. Each of them has interaction buttons on the stream.

The buttons `Shot` and `dragging sliders (+/- on smaller screen size)` are disabled when the camera is not streaming. Click on the `Play` button to start it. You should see your camera inside the television, the small black information box on the right upper side, the `Play` button becoming the `Stop` button and the disabled buttons being active.

You can now modify settings with the `dragging sliders (or +/- buttons)` and see the modification on real-time on camera and on the black information box. You can also move the camera stream if the zoom is high enough by clicking on and dragging the visualization.

On the main tab, there are 3 buttons on the right of the `Shot` button. They are image processing operations. Only one can be active at a time and can be pressed even if the camera stream is not active. When a button is pressed, all pictures in the backend will be duplicated and the processing operation will be applied to them. If the user click on the same button again or another processing button is clicked, the processed pictures will be deleted (and duplicated pictures with new process will be added). If the pictures have been processed or remove, the `snackbar` will appear to inform the user.

By clicking on the `Shot` button, it will take a pictures, add them inside the `pictures` folder and add the timestamp of the picture on the black information box. If the picture has been taken, a small `snackbar` will appear for a second on the top of the television indicating the shot has been successfully done. If a processing button has been clicked, it will take a picture of the original stream camera and duplicate it to apply the current processing operation.

If there are some errors, the same `snackbar` will be displayed indicating the error.

If you click on the `Stop` button, the camera stream will be stopped and you will return to the initial status. All the modifications will be reinitialized
