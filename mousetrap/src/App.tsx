import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "getExtensionState" }, (response) => {
      if (response && response.isActive !== undefined) {
        setIsActive(response.isActive);
      }
    });
  }, []);

  const toggleExtension = () => {
    const newState = !isActive;
    setIsActive(newState);
    chrome.runtime.sendMessage({
      action: "setExtensionState",
      isActive: newState,
    });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: newState ? "initializeCircle" : "reinitializeExtension",
        });
      }
    });
  };

  return (
    <div className="App">
      <h1>MouseTrap Extension</h1>
      <button onClick={toggleExtension}>
        {isActive ? "Deactivate" : "Activate"} Extension
      </button>
    </div>
  );
}

export default App;
