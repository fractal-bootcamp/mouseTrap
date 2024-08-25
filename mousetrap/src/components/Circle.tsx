import React from "react";

interface CircleProps {
  x: number;
  y: number;
}

export const Circle: React.FC<CircleProps> = ({ x, y }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 50,
        height: 50,
        borderRadius: "50%",
        backgroundColor: "red",
        transition: "left 0.1s, top 0.1s",
      }}
    />
  );
};
