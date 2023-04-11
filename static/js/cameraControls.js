let cameraFeed = document.getElementById("camera_feed");
let cameraPlayButton = document.getElementById("camera_play_button");
let snackbar = document.getElementById("snackbar");
let isStreaming = false;

/**
 * function fetching the camera feed according to the play/stop button
 * changing the button if the feed is displayed or not
 */
function startStopCamera() {
  isStreaming = !isStreaming;
  cameraFeed.src = isStreaming ? generateCameraUrl : noSignalGifPath;
  isStreaming
    ? (cameraPlayButton.style.backgroundColor = "#D2042D")
    : (cameraPlayButton.style.backgroundColor = "#4fa165");
  cameraPlayButton.querySelector("span").innerText = isStreaming
    ? "Stop"
    : "Play";
  cameraPlayButton
    .querySelector("image")
    .setAttribute("href", isStreaming ? stopSvgPath : playSvgPath);
}

/**
 * send post request to capture image
 * and return a text to inform the result
 */
async function captureImage() {
  try {
    const response = await fetch("/capture", {
      method: "POST",
    });
    const text = await response.text();
    snackbar.textContent = text;
  } catch (error) {
    console.error(error);
    snackbar.textContent = "An error occured";
  }
  snackbar.style.visibility = "visible";
  snackbar.style.opacity = "1";
  snackbar.style.transform = "translate(-50%, 50%)";
  setTimeout(() => {
    snackbar.style.opacity = "0";
    snackbar.style.transform = "translate(-50%, 0%)";
  }, 1500);
}
