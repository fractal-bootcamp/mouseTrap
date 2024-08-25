let circle: HTMLElement;
let posX = 0;
let posY = 0;
let isExtensionActive = false;

console.log("CONTENT_SCRIPTS_LOADED");

export function initializeExtension() {
  console.log("Initializing extension...");
  try {
    chrome.runtime.sendMessage({ action: "getExtensionState" }, (response) => {
      console.log("Received response:", response);
      if (chrome.runtime.lastError) {
        console.error("Chrome runtime error:", chrome.runtime.lastError);
        return;
      }
      if (response && response.isActive !== undefined) {
        isExtensionActive = response.isActive;
        console.log("Extension active state:", isExtensionActive);
        if (isExtensionActive) {
          removeAllJavaScript();
          createBrownOverlay();
          updateClipPath();
          applyAllModifications();
          observer.observe(document.body, observerConfig);
        }
      } else {
        console.error("Invalid response from background script:", response);
      }
    });
  } catch (error) {
    console.error("Error initializing extension:", error);
  }
}

export function reinitializeExtension() {
  if (isExtensionActive) {
    removeAllJavaScript();
    createBrownOverlay();
    updateClipPath();
    applyAllModifications();
    observer.observe(document.body, observerConfig);
  }
}
initializeExtension();

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

function updateClipPath() {
  const overlay = document.getElementById("brownOverlay");
  if (overlay) {
    const size = 50; // Size of the visible area
    const clipPath = `polygon(
      0 0,
      100% 0,
      100% 100%,
      0 100%,
      0 0,
      ${posX}px ${posY}px,
      ${posX}px ${posY + size}px,
      ${posX + size}px ${posY + size}px,
      ${posX + size}px ${posY}px,
      ${posX}px ${posY}px
    )`;
    overlay.style.clipPath = clipPath;
  }
}

function moveClipPath(dx: number, dy: number) {
  posX += dx;
  posY += dy;
  updateClipPath();
}

export function changeButtonColors() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.style.backgroundColor = "yellow";
  });
}

export function changeTextToWingdings() {
  function traverse(node: Node) {
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

export function replaceMediaWithEmptyDivs() {
  const elementsToReplace = document.querySelectorAll<HTMLElement>(
    "video, img, iframe, audio, source, embed, object"
  );
  elementsToReplace.forEach((element) => {
    if (!element.hasAttribute("data-replaced")) {
      const emptyDiv = document.createElement("div");
      emptyDiv.style.width = (element.offsetWidth || 100) + "px";
      emptyDiv.style.height = (element.offsetHeight || 100) + "px";
      emptyDiv.style.backgroundColor = "purple";
      emptyDiv.setAttribute("data-replaced", "true");
      element.parentNode?.replaceChild(emptyDiv, element);
    }
  });
}

export function removeAllJavaScript() {
  const scripts = document.getElementsByTagName("script");
  while (scripts.length > 0) {
    scripts[0].parentNode?.removeChild(scripts[0]);
  }
}

export function applyAllModifications() {
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
          moveClipPath(0, -step);
          break;
        case "s":
          moveClipPath(0, step);
          break;
        case "a":
          moveClipPath(-step, 0);
          break;
        case "d":
          moveClipPath(step, 0);
          break;
      }
    }
  },
  { capture: true }
);

export const observer = new MutationObserver((mutations: MutationRecord[]) => {
  if (isExtensionActive) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if ((node as Element).tagName === "SCRIPT") {
              node.parentNode?.removeChild(node);
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

export const observerConfig = {
  childList: true,
  subtree: true,
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "initializeCircle") {
    isExtensionActive = true;
    chrome.runtime.sendMessage({ action: "setExtensionState", isActive: true });
    removeAllJavaScript();
    createBrownOverlay();
    applyAllModifications();
    observer.observe(document.body, observerConfig);
  } else if (request.action === "reinitializeExtension") {
    reinitializeExtension();
  }
});
