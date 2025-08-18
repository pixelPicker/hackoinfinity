"use client";
import { useEffect, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";

const WhiteBoard = ({
  scale,
  handleScaleGrow,
  handleScaleShrink,
}: {
  scale: number;
  handleScaleGrow: () => void;
  handleScaleShrink: () => void;
}) => {
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(600);

  const offsetX = (window.innerWidth - width * scale) / 2;
  const offsetY = (window.innerHeight - height * scale) / 2;

  return (
    <Stage
      offsetX={0}
      offsetY={0}
      width={window.innerWidth}
      height={window.innerHeight}
    >
      <Layer>
        <Rect
          scaleX={scale}
          scaleY={scale}
          x={offsetX}
          y={offsetY}
          width={width}
          height={height}
          fill={"#F8F9FA"}
        />
      </Layer>
    </Stage>
  );
};

export default WhiteBoard;
