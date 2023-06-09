/*********************************Variables*********************************/
let mainTemplateContent = document.getElementById("main_template").content;
let settingsTemplateContent =
  document.getElementById("settings_template").content;
let operationsTemplateContent = document.getElementById(
  "operations_template"
).content;
let cameraFeeds = document.getElementsByClassName("camera_feed");
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
let zoomDragger = operationsTemplateContent.getElementById(
  "operation_drag_zoom"
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
let plusZoom = operationsTemplateContent.getElementById(
  "operation_button_plus_zoom"
);
let minusZoom = operationsTemplateContent.getElementById(
  "operation_button_minus_zoom"
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
  zoomDragger,
  plusHeight,
  minusHeight,
  plusWidth,
  minusWidth,
  plusZoom,
  minusZoom,
];
const draggerInputs = [
  { type: "exposure", input: exposureDragger },
  { type: "saturation", input: saturationDragger },
  { type: "height", input: heightDragger },
  { type: "width", input: widthDragger },
  { type: "zoom", input: zoomDragger },
];

let exposureInfoSpan = document.getElementById("info_exposure");
let saturationInfoSpan = document.getElementById("info_saturation");
let heightInfoSpan = document.getElementById("info_height");
let widthInfoSpan = document.getElementById("info_width");
let zoomInfoSpan = document.getElementById("info_zoom");
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
  zoom: 0,
};
let currentTabId = "main_tab";
let crDarkBlueColor = "#122d53";
let crBlueColor = "#4674b2";

let processingOperations = {
  white_balance: {
    label: "WB",
    isProcessing: false,
  },
  color_to_gray: {
    label: "CTG",
    isProcessing: false,
  },
  canny_edge: {
    label: "CE",
    isProcessing: false,
  },
};

/*********************************Set the default actions on load*********************************/
manageTabs("main");
manageDragMouvement();

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
    return response.json();
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
  const streams = document.getElementsByClassName("camera_feed");
  if (isStreaming) {
    const { exposure, saturation, height, width, zoom } =
      await fetchDefaultValues();
    for (const s of streams) {
      s.style.cursor = "move";
    }
    settingsInfoBox.style.display = "flex";
    exposureInfoSpan.textContent = `Exposure: ${exposure}`;
    saturationInfoSpan.textContent = `Saturation: ${saturation}`;
    heightInfoSpan.textContent = `Height: ${height}`;
    widthInfoSpan.textContent = `Width: ${width}`;
    zoomInfoSpan.textContent = `Zoom: x${zoom}`;
  } else {
    settingsInfoBox.style.display = "none";
    for (const s of streams) {
      s.style.cursor = "unset";
    }
  }
  if (!isStreaming) {
    // reset settings on stop
    Object.keys(clickableValues).forEach((k) => (clickableValues[k] = 0));
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

/**
 * changes button style on click and send information to the back which processes is on/off
 * @param {string} templateId
 * @param {string} processingName
 */
async function applyImgProcessing(templateId, processingName) {
  processingOperations[processingName].isProcessing =
    !processingOperations[processingName].isProcessing;
  let isProcessing = processingOperations[processingName].isProcessing;
  if (isProcessing) {
    // deactivate all other processing button when another is pressed
    for (const [key, value] of Object.entries(processingOperations)) {
      if (key !== processingName && value.isProcessing) {
        value.isProcessing = false;
        let otherCameraProcessingButton = mainTemplateContent.getElementById(
          `camera_${key}_button`
        );
        otherCameraProcessingButton.style.backgroundColor = "white";
        otherCameraProcessingButton.style.color = "black";
        otherCameraProcessingButton.style.transform = "unset";
        otherCameraProcessingButton.style.boxShadow =
          "2px 2px 2px rgba(0, 0, 0, 0.5)";
        const param = { isProcessing: value.isProcessing, label: value.label };
        await fetch("/img_processing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(param),
        });
      }
    }
  }
  let label = processingOperations[processingName].label;
  let cameraProcessingButton = mainTemplateContent.getElementById(
    `camera_${processingName}_button`
  );
  cameraProcessingButton.style.backgroundColor = isProcessing
    ? crBlueColor
    : "white";
  cameraProcessingButton.style.color = isProcessing ? "white" : "black";
  cameraProcessingButton.style.transform = isProcessing
    ? "translateY(2px)"
    : "unset";
  cameraProcessingButton.style.boxShadow = isProcessing
    ? "unset"
    : "2px 2px 2px rgba(0, 0, 0, 0.5)";
  setButtonList(templateId);
  const param = { isProcessing, label };
  try {
    const response = await fetch("/img_processing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(param),
    });
    const result = await response.json();
    if (result.message) {
      informWithSnackbar(result.message, green_play_color);
    }
  } catch (error) {
    console.error(error);
    informWithSnackbar(
      "An error occured while applying white balance processing",
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
  for (const feed of cameraFeeds) {
    feed.src = isStreaming ? generateCameraUrl : noSignalGifPath;
  }
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
  let newText = `${name}: ${name === "zoom" ? "x" : ""}${value}`;
  span.textContent = newText.charAt(0).toUpperCase() + newText.slice(1);
}

/**
 * Create a copy of the template button list container to add to the div element (buttons container)
 * @param {string} templateId <template>'s id
 */
function setButtonList(templateId) {
  let buttonContainer = document.getElementById("buttons_container");
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

/**
 * Enable stream visualization mouvement on click and drag
 */
function manageDragMouvement() {
  const streams = document.getElementsByClassName("camera_feed");

  let isDragging = false;
  let startX, startY;
  for (const s of streams) {
    const container = s.parentElement;
    s.addEventListener("pointerdown", (e) => {
      isDragging = true;
      startX = -e.pageX - container.offsetLeft;
      startY = -e.pageY - container.offsetTop;
    });

    // throttle to avoid multiple call
    // execute the function every 100 ms
    s.addEventListener(
      "pointermove",
      throttle(async (e) => {
        if (!isDragging) return;
        e.preventDefault();
        // negative to be more natural on drag
        const x = -e.pageX - container.offsetLeft;
        const y = -e.pageY - container.offsetTop;
        // dividing by 10 because movement too fast on drag-and-move
        const deltaX = Math.round(x - startX) / 5;
        const deltaY = Math.round(y - startY) / 5;
        const param = { dx: deltaX, dy: deltaY };
        try {
          await fetch("/coords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(param),
          });
        } catch (error) {
          console.error(error);
          informWithSnackbar(
            "An error occured while moving zoom location",
            stop_red_color
          );
        }
      }, 100)
    );
  }

  window.addEventListener("pointerup", () => {
    isDragging = false;
  });
}

/**
 * execute the callback after {interval} ms
 * @param {Function} callback function to throttle
 * @param {number} interval in ms
 * @returns
 */
function throttle(callback, interval) {
  let enableCall = true;

  return function (...args) {
    if (!enableCall) return;

    enableCall = false;
    callback.apply(this, args);
    setTimeout(() => (enableCall = true), interval);
  };
}
