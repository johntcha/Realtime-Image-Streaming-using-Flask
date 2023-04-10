let cameraFeed = document.getElementById("camera_feed");
let cameraPlayButton = document.getElementById("camera_play_button");
let isStreaming = true;

/**
 * function fetching the camera feed according to the play/stop button
 * changing the button if the feed is displayed or not
 */
function startStopCamera() {
  cameraFeed.src = isStreaming
    ? generateCameraUrl
    : "https://media.tenor.com/0SK8wi-u_gYAAAAd/no-signal-tv.gif";
  isStreaming
    ? (cameraPlayButton.style.backgroundColor = "#D2042D")
    : (cameraPlayButton.style.backgroundColor = "#4fa165");
  cameraPlayButton.querySelector("span").innerText = isStreaming
    ? "Stop"
    : "Play";
  cameraPlayButton
    .querySelector("image")
    .setAttribute("href", isStreaming ? stopSvgPath : playSvgPath);
  isStreaming = !isStreaming;
}
