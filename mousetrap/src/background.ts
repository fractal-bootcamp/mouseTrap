let isExtensionActive = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background script received message:", request);
  if (request.action === "getExtensionState") {
    console.log("Sending extension state:", isExtensionActive);
    sendResponse({ isActive: isExtensionActive });
  } else if (request.action === "setExtensionState") {
    isExtensionActive = request.isActive;
    console.log("Extension state updated:", isExtensionActive);
    sendResponse({ success: true });
  }
  return true;
});

console.log("Background script loaded");
