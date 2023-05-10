/*********************************Variables*********************************/
let mainTemplateContent = document.getElementById("main_template").content;
let settingsTemplateContent =
  document.getElementById("settings_template").content;
let operationsTemplateContent = document.getElementById(
  "operations_template"
).content;
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
let plusSaturation = settingsTemplateContent.getElementById(
  "setting_button_plus_saturation"
);
let minusSaturation = settingsTemplateContent.getElementById(
  "setting_button_minus_saturation"
);
let heightDragger = operationsTemplateContent.getElementById(
  "operation_drag_height"
);
let widthDragger = operationsTemplateContent.getElementById(
  "operation_drag_width"
);
let plusHeight = operationsTemplateContent.getElementById(
  "operation_button_plus_height"
);
let minusHeight = operationsTemplateContent.getElementById(
  "operation_button_minus_height"
);
let plusWidth = operationsTemplateContent.getElementById(
  "operation_button_plus_width"
);
let minusWidth = operationsTemplateContent.getElementById(
  "operation_button_minus_width"
);
const disableableHTMLComponents = [
  cameraShotButton,
  exposureDragger,
  saturationDragger,
  minusExposure,
  plusExposure,
  minusSaturation,
  plusSaturation,
  heightDragger,
  widthDragger,
  plusHeight,
  minusHeight,
  plusWidth,
  minusWidth,
];
const draggerInputs = [
  { type: "exposure", input: exposureDragger },
  { type: "saturation", input: saturationDragger },
  { type: "height", input: heightDragger },
  { type: "width", input: widthDragger },
];

let exposureInfoSpan = document.getElementById("info_exposure");
let saturationInfoSpan = document.getElementById("info_saturation");
let heightInfoSpan = document.getElementById("info_height");
let widthInfoSpan = document.getElementById("info_width");
let timeStampInfoSpan = document.getElementById("info_timestamp");
let settingsInfoBox = document.getElementById("settings_info_box");
let snackbar = document.getElementById("snackbar");
let isStreaming = false;
let green_play_color = "#4fa165";
let stop_red_color = "#D2042D";
let clickableValues = {
  exposure: 0,
  saturation: 0,
  height: 0,
  width: 0,
};
let currentTabId = "main_tab";
let crDarkBlueColor = "#122d53";
let crBlueColor = "#4674b2";

/*********************************Set the default actions on load*********************************/
manageTabs("main");

/*********************************Data management functions*********************************/

/**
 *
 * @returns object with default settings and their values
 */
async function fetchDefaultValues() {
  let textContent = "";
  let backgroundColor = "";
  try {
    const response = await fetch("/default_values", {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    textContent = "An error occured while fetching default values";
    backgroundColor = stop_red_color;
  }
  informWithSnackbar(textContent, backgroundColor);
}

/**
 * Send post request to capture image and get message and timestamp of the capture
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
    const { exposure, saturation, height, width } = await fetchDefaultValues();
    settingsInfoBox.style.display = "flex";
    exposureInfoSpan.textContent = `Exposure: ${exposure}`;
    saturationInfoSpan.textContent = `Saturation: ${saturation}`;
    heightInfoSpan.textContent = `Height: ${height}`;
    widthInfoSpan.textContent = `Width: ${width}`;
  } else {
    settingsInfoBox.style.display = "none";
  }
  if (!isStreaming) {
    // reset settings on stop
    Object.keys(clickableValues).forEach((k) => (k = 0));
    for (const dragger of draggerInputs) {
      dragger.input.value = 0;
      settingNewText(
        dragger.type,
        dragger.input.value,
        dragger.input.previousElementSibling
      );
    }
  }
}

/**
 * Getting one dragger setting and sending it to the back
 * Also displaying the added or removed value
 * @param {string} typeValue setting/operation/etc...
 * @param {string} valueName height/width/saturation/etc...
 * @param {string} templateId <template>'s id
 */
async function setCameraDraggerValues(typeValue, valueName, templateId) {
  let modifiedValueDrag = document.getElementById(
    `${typeValue}_drag_${valueName}`
  );
  let templateContent = document.getElementById(templateId).content;
  let templateValueDrag = templateContent.getElementById(
    `${typeValue}_drag_${valueName}`
  );
  let templateCorrespondingSpan = templateValueDrag.previousElementSibling;
  settingNewText(valueName, modifiedValueDrag.value, templateCorrespondingSpan);
  let param = { [valueName]: modifiedValueDrag.value };
  try {
    const response = await fetch("/camera_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(param),
    });
    const values = await response.json();
    let infoSpan = document.getElementById(`info_${valueName}`);
    settingNewText(valueName, values[valueName], infoSpan);
    templateValueDrag.value = modifiedValueDrag.value;
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
 * @param {string} typeValue setting/operation/etc...
 * @param {number} value number to increment
 * @param {string} valueName height/width/saturation/etc...
 * @param {string} templateId <template>'s id
 */
async function setCameraClickButtonSettings(
  typeValue,
  value,
  valueName,
  templateId
) {
  let templateContent = document.getElementById(templateId).content;
  let templateCorrespondingSpan = templateContent.getElementById(
    `${typeValue}_drag_${valueName}`
  ).previousElementSibling;
  clickableValues[valueName] += value;

  settingNewText(
    valueName,
    clickableValues[valueName],
    templateCorrespondingSpan
  );
  let param = { [valueName]: clickableValues[valueName] };

  try {
    const response = await fetch("/camera_settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(param),
    });
    const settings = await response.json();
    let infoSpan = document.getElementById(`info_${valueName}`);
    settingNewText(valueName, settings[valueName], infoSpan);
    setButtonList(templateId);
  } catch (error) {
    console.error(error);
    informWithSnackbar(
      "An error occured while changing settings",
      stop_red_color
    );
  }
}

/*********************************Display management functions*********************************/

/**
 * function fetching the camera feed according to the play/stop button
 * changing the button if the feed is displayed or not
 * @param {string} templateId <template>'s id
 */
async function startStopCamera(templateId) {
  isStreaming = !isStreaming;
  await resetOnStop(isStreaming);
  cameraFeed.src = isStreaming ? generateCameraUrl : noSignalGifPath;
  cameraFeed.style.height = isStreaming ? "unset" : "100%";
  cameraFeed.style.width = isStreaming ? "unset" : "100%";
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
 * displays the snackbar and a message inside to inform users
 * @param {string} textContent
 * @param {string} backgroundColor
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
 * Create a copy of the template button list container to add to the div element (buttons container)
 * @param {string} templateId <template>'s id
 */
function setButtonList(templateId) {
  let buttonContainer = document.getElementById("buttons_container");
  if (
    templateId === "settings_template" ||
    templateId === "operations_template"
  ) {
    buttonContainer.style.justifyContent = "center";
  } else if (templateId === "main_template") {
    buttonContainer.style.justifyContent = "space-between";
  }
  let templateContentClone = document
    .getElementById(templateId)
    .content.cloneNode(true);
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
