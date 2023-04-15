// variables
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
const disableableHTMLComponents = [
  cameraShotButton,
  exposureDragger,
  saturationDragger,
  minusExposure,
  plusExposure,
  minusSaturation,
  plusSaturation,
];
let exposureInfoSpan = document.getElementById("info_exposure");
let saturationInfoSpan = document.getElementById("info_saturation");
let timeStampInfoSpan = document.getElementById("info_timestamp");
let settingsInfoBox = document.getElementById("settings_info_box");
let snackbar = document.getElementById("snackbar");
let isStreaming = false;
let green_play_color = "#4fa165";
let stop_red_color = "#D2042D";
let clickableValueExposure = 0;
let clickableValueSaturation = 0;

/**
 *
 * @returns object with default settings and their values
 */
async function fetchDefaultSettings() {
  let textContent = "";
  let backgroundColor = "";
  try {
    const response = await fetch("/default_settings", {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    textContent = "An error occured while fetching default settings values";
    backgroundColor = stop_red_color;
  }
  informWithSnackbar(textContent, backgroundColor);
}

/**
 * function fetching the camera feed according to the play/stop button
 * changing the button if the feed is displayed or not
 */
async function startStopCamera() {
  isStreaming = !isStreaming;
  await resetOnStop(isStreaming);
  cameraFeed.src = isStreaming ? generateCameraUrl : noSignalGifPath;
  // start/stop button management
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
 * Disable buttons and reset settings values on stop stream
 * @param {boolean} isStreaming
 */
async function resetOnStop(isStreaming) {
  // picture button and settings disabled when not streaming
  for (const button of disableableHTMLComponents) {
    button.disabled = !isStreaming;
  }

  // set default settings values and hide the info box if not streaming
  if (isStreaming) {
    const { exposure, saturation } = await fetchDefaultSettings();
    let currentValueExposure = exposure;
    let currentValueSaturation = saturation;
    settingsInfoBox.style.display = "flex";
    exposureInfoSpan.textContent = `Exposure: ${currentValueExposure}`;
    saturationInfoSpan.textContent = `Saturation: ${currentValueSaturation}`;
  } else {
    settingsInfoBox.style.display = "none";
  }
  // reset settings on stop
  exposureDragger.value = 0;
  saturationDragger.value = 0;
  clickableValueExposure = 0;
  clickableValueSaturation = 0;
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
}

/**
 * send post request to capture image and get message and timestamp of the capture
 * @returns object with message and timestamp
 */
async function captureImage() {
  let textContent = "";
  let backgroundColor = "";
  try {
    const response = await fetch("/capture", {
      method: "POST",
    });
    const { message, timestamp } = await response.json();
    textContent = message;
    timeStampInfoSpan.textContent = `Last capturing timing stamp: ${timestamp}`;
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
async function setCameraDraggerSettings(settingName) {
  let modifiedSettingDrag = document.getElementById(
    `setting_drag_${settingName}`
  );
  let correspondingSpan = modifiedSettingDrag.previousElementSibling;

  settingNewText(settingName, modifiedSettingDrag.value, correspondingSpan);
  let param = { [settingName]: modifiedSettingDrag.value };

  try {
    const response = await fetch("/camera_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(param),
    });
    const settings = await response.json();
    let infoSpan = document.getElementById(`info_${settingName}`);
    settingNewText(settingName, settings[settingName], infoSpan);
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
async function setCameraClickButtonSettings(increase, settingName) {
  let correspondingSpan = document.getElementById(
    `setting_drag_${settingName}`
  ).previousElementSibling;
  let value = 0;
  if (settingName === "exposure") {
    clickableValueExposure += increase ? 1 : -1;
    value = clickableValueExposure;
  }
  if (settingName === "saturation") {
    clickableValueSaturation += increase ? 5 : -5;
    value = clickableValueSaturation;
  }
  settingNewText(settingName, value, correspondingSpan);
  let param = { [settingName]: value };

  try {
    const response = await fetch("/camera_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(param),
    });
    const settings = await response.json();
    let infoSpan = document.getElementById(`info_${settingName}`);
    settingNewText(settingName, settings[settingName], infoSpan);
    console.log("settings", settings);
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
