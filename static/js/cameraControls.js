let cameraFeed = document.getElementById("camera_feed");
let cameraPlayButton = document.getElementById("camera_play_button");
let cameraShotButton = document.getElementById("camera_shot_button");
let exposureDragger = document.getElementById("setting_drag_exposure");
let saturationDragger = document.getElementById("setting_drag_saturation");
let minusExposure = document.getElementById("setting_button_minus_exposure");
let plusExposure = document.getElementById("setting_button_plus_exposure");
let minusSaturation = document.getElementById(
  "setting_button_minus_saturation"
);
let plusSaturation = document.getElementById("setting_button_plus_saturation");
let snackbar = document.getElementById("snackbar");
let isStreaming = false;
let green_play_color = "#4fa165";
let stop_red_color = "#D2042D";
let valueExposure = 0;
let valueSaturation = 0;

/**
 * function fetching the camera feed according to the play/stop button
 * changing the button if the feed is displayed or not
 */
function startStopCamera() {
  isStreaming = !isStreaming;
  // picture button and settings disabled when not streaming
  cameraShotButton.disabled = !isStreaming;
  exposureDragger.disabled = !isStreaming;
  saturationDragger.disabled = !isStreaming;
  minusExposure.disabled = !isStreaming;
  plusExposure.disabled = !isStreaming;
  minusSaturation.disabled = !isStreaming;
  plusSaturation.disabled = !isStreaming;

  // reset settings on stop
  exposureDragger.value = 0;
  saturationDragger.value = 0;
  valueExposure = 0;
  valueSaturation = 0;
  if (!isStreaming) {
    settingNewText(
      "exposure",
      exposureDragger.value,
      exposureDragger.previousElementSibling
    );
    settingNewText(
      "saturation",
      saturationDragger.value,
      saturationDragger.previousElementSibling
    );
  }
  cameraFeed.src = isStreaming ? generateCameraUrl : noSignalGifPath;
  isStreaming
    ? (cameraPlayButton.style.backgroundColor = stop_red_color)
    : (cameraPlayButton.style.backgroundColor = green_play_color);
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
  let textContent = "";
  let backgroundColor = "";
  try {
    const response = await fetch("/capture", {
      method: "POST",
    });
    const text = await response.text();
    textContent = text;
    backgroundColor = green_play_color;
  } catch (error) {
    console.error(error);
    textContent = "An error occured while taking a picture";
    backgroundColor = stop_red_color;
  }
  informWithSnackbar(textContent, backgroundColor);
}

/**
 * Getting one dragger setting and sending it to the back
 * Also displaying the added or removed value
 * @param {string} settingName
 */
function setCameraDraggerSettings(settingName) {
  let modifiedSettingDrag = document.getElementById(
    `setting_drag_${settingName}`
  );
  let correspondingSpan = modifiedSettingDrag.previousElementSibling;

  settingNewText(settingName, modifiedSettingDrag.value, correspondingSpan);
  let param = { [settingName]: modifiedSettingDrag.value };

  try {
    fetch("/camera_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(param),
    });
  } catch (error) {
    console.error(error);
    informWithSnackbar(
      "An error occured while changing settings",
      stop_red_color
    );
  }
}

/**
 * Getting one click button setting and sending it to the back
 * Also displaying the added or removed value
 * @param {boolean} increase
 * @param {string} settingName
 */
function setCameraClickButtonSettings(increase, settingName) {
  let correspondingSpan = document.getElementById(
    `setting_drag_${settingName}`
  ).previousElementSibling;
  let value = 0;
  if (settingName === "exposure") {
    valueExposure += increase ? 1 : -1;
    value = valueExposure;
  } else {
    valueSaturation += increase ? 10 : -10;
    value = valueSaturation;
  }
  settingNewText(settingName, value, correspondingSpan);
  let param = { [settingName]: value };

  try {
    fetch("/camera_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(param),
    });
  } catch (error) {
    console.error(error);
    informWithSnackbar(
      "An error occured while changing settings",
      stop_red_color
    );
  }
}

/**
 * displays the snackbar and a message inside to inform users
 * @param {string} textContent
 */
function informWithSnackbar(textContent, backgroundColor) {
  snackbar.textContent = textContent;
  // change snackbar css value to show it and make a slight vertical translation
  snackbar.style.backgroundColor = backgroundColor;
  snackbar.style.visibility = "visible";
  snackbar.style.opacity = "1";
  snackbar.style.transform = "translate(-50%, 50%)";
  setTimeout(() => {
    snackbar.style.opacity = "0";
    snackbar.style.transform = "translate(-50%, 0%)";
  }, 1500);
}

/**
 * Set new text with new value & uppercase first letter
 * @param {string} name
 * @param {number} value
 * @param {HTMLSpanElement} span
 */
function settingNewText(name, value, span) {
  let newText = `${name}: ${value}`;
  span.textContent = newText.charAt(0).toUpperCase() + newText.slice(1);
}
