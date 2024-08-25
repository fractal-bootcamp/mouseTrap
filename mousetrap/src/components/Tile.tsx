import React from "react";

interface TileProps {
  x: number;
  y: number;
  isTransparent: boolean;
}

export const Tile: React.FC<TileProps> = ({ x, y, isTransparent }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 50,
        height: 50,
        backgroundColor: isTransparent ? "transparent" : "brown",
        transition: "background-color 0.3s",
      }}
    />
  );
};
