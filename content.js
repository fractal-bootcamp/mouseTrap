let circle;
let posX = 0;
let posY = 0;
let isExtensionActive = false;

function initializeExtension() {
  chrome.runtime.sendMessage({ action: "getExtensionState" }, (response) => {
    isExtensionActive = response.isActive;
    if (isExtensionActive) {
      removeAllJavaScript();
      createBrownOverlay();
      createCircle();
      updateClipPath();
      applyAllModifications();
      observer.observe(document.body, observerConfig);
    }
  });
}

function reinitializeExtension() {
  if (isExtensionActive) {
    removeAllJavaScript();
    createBrownOverlay();
    createCircle();
    updateClipPath();
    applyAllModifications();
    observer.observe(document.body, observerConfig);
  }
}
initializeExtension();

function createCircle() {
  console.log("CIRCLE_CREATE");
  circle = document.createElement("div");
  circle.style.position = "absolute";
  circle.style.width = "50px";
  circle.style.height = "50px";
  circle.style.borderRadius = "50%";
  circle.style.backgroundColor = "transparent";
  circle.style.border = "2px solid red";
  circle.style.zIndex = "10000";
  updateCirclePosition();
  document.body.appendChild(circle);
}

function createBrownOverlay() {
  console.log("BROWN_OVERLAY_CREATE");
  const overlay = document.createElement("div");
  overlay.id = "brownOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "brown";
  overlay.style.zIndex = "9999";
  document.body.appendChild(overlay);
}

function updateCirclePosition() {
  circle.style.left = posX + "px";
  circle.style.top = posY + "px";
}

function updateClipPath() {
  const overlay = document.getElementById("brownOverlay");
  if (overlay) {
    const radius = 25; // Half of the circle's width/height
    const clipPath = `polygon(
      0 0,
      100% 0,
      100% 100%,
      0 100%,
      0 0,
      ${posX}px ${posY}px,
      ${posX}px ${posY + 2 * radius}px,
      ${posX + 2 * radius}px ${posY + 2 * radius}px,
      ${posX + 2 * radius}px ${posY}px,
      ${posX}px ${posY}px
    )`;
    overlay.style.clipPath = clipPath;
  }
}

function moveCircle(dx, dy) {
  posX += dx;
  posY += dy;
  updateCirclePosition();
  updateClipPath();
}

function changeButtonColors() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.style.backgroundColor = "yellow";
  });
}

function changeTextToWingdings() {
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (
        node.parentElement &&
        node.parentElement.tagName !== "SCRIPT" &&
        node.parentElement.tagName !== "STYLE"
      ) {
        node.parentElement.style.fontFamily = "Wingdings, sans-serif";
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (let child of node.childNodes) {
        traverse(child);
      }
    }
  }
  traverse(document.body);
}

function replaceMediaWithEmptyDivs() {
  const elementsToReplace = document.querySelectorAll(
    "video, img, iframe, audio, source, embed, object"
  );
  elementsToReplace.forEach((element) => {
    if (!element.hasAttribute("data-replaced")) {
      const emptyDiv = document.createElement("div");
      emptyDiv.style.width = (element.offsetWidth || 100) + "px";
      emptyDiv.style.height = (element.offsetHeight || 100) + "px";
      emptyDiv.style.backgroundColor = "purple";
      emptyDiv.setAttribute("data-replaced", "true");
      element.parentNode.replaceChild(emptyDiv, element);
    }
  });
}

function removeAllJavaScript() {
  const scripts = document.getElementsByTagName("script");
  while (scripts.length > 0) {
    scripts[0].parentNode.removeChild(scripts[0]);
  }
}

function applyAllModifications() {
  removeAllJavaScript();
  changeButtonColors();
  changeTextToWingdings();
  replaceMediaWithEmptyDivs();
}

document.addEventListener(
  "keydown",
  function (event) {
    if (isExtensionActive) {
      event.stopPropagation();
      event.preventDefault();

      const step = 10;
      switch (event.key) {
        case "w":
          moveCircle(0, -step);
          break;
        case "s":
          moveCircle(0, step);
          break;
        case "a":
          moveCircle(-step, 0);
          break;
        case "d":
          moveCircle(step, 0);
          break;
      }
    }
  },
  { capture: true }
);

const observer = new MutationObserver((mutations) => {
  if (isExtensionActive) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === "SCRIPT") {
              node.parentNode.removeChild(node);
            } else {
              replaceMediaWithEmptyDivs();
            }
          }
        });
      }
    });
    applyAllModifications();
  }
});

const observerConfig = {
  childList: true,
  subtree: true,
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "initializeCircle") {
    isExtensionActive = true;
    chrome.runtime.sendMessage({ action: "setExtensionState", isActive: true });
    removeAllJavaScript();
    createBrownOverlay();
    createCircle();
    applyAllModifications();
    observer.observe(document.body, observerConfig);
  } else if (request.action === "reinitializeExtension") {
    reinitializeExtension();
  }
});
