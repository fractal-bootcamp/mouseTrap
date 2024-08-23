// Remove the console.log statement
// Add the following code:

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "initializeCircle"});
  });