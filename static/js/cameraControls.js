// variables
let mainTemplateContent = document.getElementById("main_template").content;
let settingsTemplateContent =
  document.getElementById("settings_template").content;
let cameraFeed = document.getElementById("camera_feed");
let cameraPlayButton = mainTemplateContent.getElementById("camera_play_button");
let cameraShotButton = mainTemplateContent.getElementById("camera_shot_button");
let exposureDragger = settingsTemplateContent.getElementById(
  "setting_drag_exposure"
);
let saturationDragger = settingsTemplateContent.getElementById(
  "setting_drag_saturation"
);
let minusExposure = settingsTemplateContent.getElementById(
  "setting_button_minus_exposure"
);
let plusExposure = settingsTemplateContent.getElementById(
  "setting_button_plus_exposure"
);
let minusSaturation = settingsTemplateContent.getElementById(
  "setting_button_minus_saturation"
);
let plusSaturation = settingsTemplateContent.getElementById(
  "setting_button_plus_saturation"
);
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
let currentTabId = "main_tab";
let crDarkBlueColor = "#122d53";
let crBlueColor = "#4674b2";

// set the default action buttons on load
manageTabs("main");

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
async function startStopCamera(templateId) {
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
  setButtonList(templateId);
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
  if (!isStreaming) {
    // reset settings on stop
    exposureDragger.value = 0;
    saturationDragger.value = 0;
    clickableValueExposure = 0;
    clickableValueSaturation = 0;
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
async function setCameraDraggerSettings(settingName, templateId) {
  let modifiedSettingDrag = document.getElementById(
    `setting_drag_${settingName}`
  );
  let templateSettingDrag = settingsTemplateContent.getElementById(
    `setting_drag_${settingName}`
  );
  let templateCorrespondingSpan = templateSettingDrag.previousElementSibling;
  settingNewText(
    settingName,
    modifiedSettingDrag.value,
    templateCorrespondingSpan
  );
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
    templateSettingDrag.value = modifiedSettingDrag.value;
    setButtonList(templateId);
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
async function setCameraClickButtonSettings(increase, settingName, templateId) {
  let correspondingSpan = document.getElementById(
    `setting_drag_${settingName}`
  ).previousElementSibling;
  let templateCorrespondingSpan = settingsTemplateContent.getElementById(
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
  settingNewText(settingName, value, templateCorrespondingSpan);
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
    setButtonList(templateId);
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

/**
 * Create a copy of the template button list container to add to the div element
 * @param {string} buttonContainerId
 * @param {string} templateId
 */
function setButtonList(templateId) {
  let buttonContainer = document.getElementById("buttons_container");
  if (templateId === "settings_template") {
    buttonContainer.style.justifyContent = "center";
  } else if (templateId === "main_template") {
    buttonContainer.style.justifyContent = "space-between";
  }
  let templateContentClone = document
    .getElementById(templateId)
    .content.cloneNode(true);
  console.log(
    document.getElementById(templateId).content,
    settingsTemplateContent
  );
  buttonContainer.replaceChildren(templateContentClone);
}

/**
 * Action on tab changing
 * @param {string} tabName
 */
function manageTabs(tabName) {
  let selectedTabId = `${tabName}_tab`;
  document.getElementById(currentTabId).style.backgroundColor = crDarkBlueColor;
  document.getElementById(`${tabName}_tab`).style.backgroundColor = crBlueColor;
  currentTabId = selectedTabId;
  setButtonList(`${tabName}_template`);
}
