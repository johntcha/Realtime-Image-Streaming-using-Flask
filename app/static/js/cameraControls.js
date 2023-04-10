let cameraFeed = document.getElementById("camera_feed");
let cameraPlayButton = document.getElementById("camera_play_button");
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
