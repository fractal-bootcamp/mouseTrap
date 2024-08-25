import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Tile } from "./components/Tile";
import { Circle } from "./components/Circle";

let isExtensionActive = false;

console.log("CONTENT_SCRIPTS_LOADED");

interface Tile {
  id: string;
  x: number;
  y: number;
  isTransparent: boolean;
}

function App() {
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });
  const [tiles, setTiles] = useState<Tile[]>([]);

  React.useEffect(() => {
    if (isExtensionActive) {
      createTiles();
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExtensionActive]);

  React.useEffect(() => {
    checkTileCollision();
  }, [circlePosition]);

  const createTiles = () => {
    const tileSize = 50;
    const tilesX = Math.ceil(window.innerWidth / tileSize);
    const tilesY = Math.ceil(window.innerHeight / tileSize);
    const newTiles = [];

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        newTiles.push({
          id: `${x}-${y}`,
          x: x * tileSize,
          y: y * tileSize,
          isTransparent: false,
        });
      }
    }

    setTiles(newTiles);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const step = 10;
    switch (event.key) {
      case "w":
        setCirclePosition((prev) => ({ ...prev, y: prev.y - step }));
        break;
      case "s":
        setCirclePosition((prev) => ({ ...prev, y: prev.y + step }));
        break;
      case "a":
        setCirclePosition((prev) => ({ ...prev, x: prev.x - step }));
        break;
      case "d":
        setCirclePosition((prev) => ({ ...prev, x: prev.x + step }));
        break;
    }
  };

  const checkTileCollision = () => {
    setTiles((prevTiles) =>
      prevTiles.map((tile) => {
        if (
          circlePosition.x < tile.x + 50 &&
          circlePosition.x + 50 > tile.x &&
          circlePosition.y < tile.y + 50 &&
          circlePosition.y + 50 > tile.y
        ) {
          return { ...tile, isTransparent: true };
        }
        return tile;
      })
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
      }}
    >
      {tiles.map((tile) => (
        <Tile key={tile.id} {...tile} />
      ))}
      <Circle x={circlePosition.x} y={circlePosition.y} />
    </div>
  );
}

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
          const root = document.createElement("div");
          root.id = "mousetrap-root";
          document.body.appendChild(root);
          ReactDOM.render(<App />, root);
        }
      } else {
        console.error("Invalid response from background script:", response);
      }
    });
  } catch (error) {
    console.error("Error initializing extension:", error);
  }
}

initializeExtension();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "initializeCircle") {
    isExtensionActive = true;
    chrome.runtime.sendMessage({ action: "setExtensionState", isActive: true });
    initializeExtension();
  } else if (request.action === "reinitializeExtension") {
    const root = document.getElementById("mousetrap-root");
    if (root) {
      ReactDOM.unmountComponentAtNode(root);
      document.body.removeChild(root);
    }
    isExtensionActive = false;
  }
});
