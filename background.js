let isExtensionActive = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getExtensionState") {
    sendResponse({ isActive: isExtensionActive });
  } else if (request.action === "setExtensionState") {
    isExtensionActive = request.isActive;
  }
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (isExtensionActive && details.frameId === 0) {
    chrome.tabs.sendMessage(details.tabId, { action: "reinitializeExtension" });
  }
});
