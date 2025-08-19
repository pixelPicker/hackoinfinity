import React, { useEffect, useState } from "react";
import Konva from "konva";
import {
  IconMinus,
  IconPlus,
  IconUserScreen,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";

type ToolbarProps = {
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
};

export default function ZoomToolbar({
  zoomLevel,
  setZoomLevel,
  stageRef,
}: ToolbarProps) {
  const [inputValue, setInputValue] = useState<string>(
    (zoomLevel * 100).toFixed(0)
  );

  useEffect(() => {
    setInputValue((zoomLevel * 100).toFixed(0));
  }, [zoomLevel]);

  const handleZoomIn = () => {
    const stage = stageRef.current;
    if (stage) {
      const newScale = Math.min(zoomLevel + 0.1, 3); // Max zoom level = 300%

      const oldScale = stage.scaleX();
      const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const centerTo = {
        x: (center.x - stage.x()) / oldScale,
        y: (center.y - stage.y()) / oldScale,
      };

      const newPos = {
        x: center.x - centerTo.x * newScale,
        y: center.y - centerTo.y * newScale,
      };

      moveStage(stage, newPos, newScale);
    }
  };

  const handleZoomOut = () => {
    const stage = stageRef.current;
    if (stage) {
      const newScale = Math.max(zoomLevel - 0.1, 0.1); // Min zoom level = 10%

      const oldScale = stage.scaleX();
      const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
      const centerTo = {
        x: (center.x - stage.x()) / oldScale,
        y: (center.y - stage.y()) / oldScale,
      };

      const newPos = {
        x: center.x - centerTo.x * newScale,
        y: center.y - centerTo.y * newScale,
      };

      moveStage(stage, newPos, newScale);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    applyZoom();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyZoom();
    }
  };

  const applyZoom = (): void => {
    const value = Number(inputValue);

    if (!isNaN(value) && value >= 10 && value <= 300) {
      const stage = stageRef.current;
      if (stage) {
        const newScale = value / 100;

        const oldScale = stage.scaleX();
        const center = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        };
        const centerTo = {
          x: (center.x - stage.x()) / oldScale,
          y: (center.y - stage.y()) / oldScale,
        };

        const newPos = {
          x: center.x - centerTo.x * newScale,
          y: center.y - centerTo.y * newScale,
        };

        moveStage(stage, newPos, newScale);
      }
    } else {
      // If the input is invalid, reset to current zoom level
      setInputValue((zoomLevel * 100).toFixed(0));
    }
  };

  const moveStage = (
    stage: Konva.Stage,
    offset: { x: number; y: number },
    scale: number,
    animationDuration: number = 0
  ) => {
    // update state
    setZoomLevel(scale);

    const tween = new Konva.Tween({
      duration: animationDuration,
      easing: Konva.Easings.EaseInOut,
      node: stage,
      scaleX: scale || 1,
      scaleY: scale || 1,
      x: offset.x,
      y: offset.y,
      onFinish: () => {
        tween.destroy();
        stage.batchDraw();
      },
    });

    tween.play();
  };

  return (
    <div className="p-2 bg-gray-300 rounded-lg fixed bottom-[10px] right-[10px] flex items-center gap-4">
      {/* Zoom In */}
      <IconZoomOut onClick={handleZoomOut} />
      {/* Zoom Percentage Input */}
      <div>
        <input
          value={inputValue}
          className="w-[5ch] text-center outline-none focus-within:outline-none focus:outline-none focus-visible:outline-none"
          type="numberic"
          max={300}
          min={0}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
        />
      </div>

      <IconZoomIn onClick={handleZoomIn} />

    </div>
  );
}
