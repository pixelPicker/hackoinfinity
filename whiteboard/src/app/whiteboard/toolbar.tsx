"use client";

import { useState } from "react";
import {
  IconArrowsMove,
  IconPencil,
  IconTextCaption,
  IconShape,
  IconEraser,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconTrash,
  IconRectangle,
  IconCircle,
  IconTriangle,
  IconStar,
  IconColorPicker,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import { useWhiteBoardStore } from "./_store/whiteboardStore";
import Konva from "konva";
import { useInkStore } from "./_store/inkStore";
import { useEraserStore } from "./_store/eraserStore";
import clsx from "clsx";
import MyColorPicker from "./colorPicker";
import { useShapeStore } from "./_store/shapeStore";
import { presetColors } from "./_shapes/utils";

export default function ToolBar({
  boardRef,
}: {
  boardRef: React.RefObject<Konva.Stage | null>;
}) {
  const {
    undo,
    redo,
    undoStack,
    redoStack,
    selectedTool,
    setSelectedTool,
    resetCanvas,
    canvasObjects,
  } = useWhiteBoardStore((s) => s);

  return (
    <section className="fixed top-[20px] left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white shadow-lg rounded-xl p-3 border border-gray-200">
      <IconArrowsMove
        className={clsx(
          "cursor-pointer hover:text-blue-500",
          selectedTool === "select" && "text-blue-500"
        )}
        onClick={() => setSelectedTool("select")}
      />

      <PenSelector />

      <IconTextCaption
        className="cursor-pointer hover:text-blue-500"
        onClick={() => setSelectedTool("addText")}
      />

      <ShapeSelector />

      <EraserSelector />

      <IconArrowBackUp
        className={`cursor-pointer ${
          undoStack.length === 0 ? "opacity-30" : "hover:text-blue-500"
        }`}
        onClick={undo}
      />
      <IconArrowForwardUp
        className={`cursor-pointer ${
          redoStack.length === 0 ? "opacity-30" : "hover:text-blue-500"
        }`}
        onClick={redo}
      />

      <IconTrash
        className={`cursor-pointer ${
          canvasObjects.length === 0 ? "opacity-30" : "hover:text-red-500"
        }`}
        onClick={resetCanvas}
      />
    </section>
  );
}

function ShapeSelector() {
  const [showShapes, setShowShapes] = useState(false);
  const {
    borderColor,
    borderWidth,
    fillColor,
    setBorderColor,
    setBorderWidth,
    setFillColor,
  } = useShapeStore((s) => s);

  const { setSelectedTool, selectedTool } = useWhiteBoardStore((s) => s);
  return (
    <div className="relative">
      <IconShape
        className={clsx(
          "cursor-pointer hover:text-blue-500",
          selectedTool.includes("add") &&
            selectedTool !== "addText" &&
            "text-blue-500"
        )}
        onClick={() => setShowShapes((prev) => !prev)}
      />

      {showShapes && (
        <div className="absolute top-10 left-0 bg-white shadow-md rounded-lg p-3 flex flex-col justify-between gap-4 w-60">
          <div className="flex justify-between">
            <IconRectangle
              className={clsx(
                "cursor-pointer hover:text-blue-500",
                selectedTool === "addRectangle" && "text-blue-500"
              )}
              onClick={() => {
                setSelectedTool("addRectangle");
                setShowShapes(false);
              }}
            >
              Rectangle
            </IconRectangle>
            <IconCircle
              className={clsx(
                "cursor-pointer hover:text-blue-500",
                selectedTool === "addOval" && "text-blue-500"
              )}
              onClick={() => {
                setSelectedTool("addOval");
                setShowShapes(false);
              }}
            >
              Circle
            </IconCircle>
            <IconTriangle
              className={clsx(
                "cursor-pointer hover:text-blue-500",
                selectedTool === "addTriangle" && "text-blue-500"
              )}
              onClick={() => {
                setSelectedTool("addTriangle");
                setShowShapes(false);
              }}
            >
              Triangle
            </IconTriangle>
            <IconStar
              className={clsx(
                "cursor-pointer hover:text-blue-500",
                selectedTool === "addStar" && "text-blue-500"
              )}
              onClick={() => {
                setSelectedTool("addStar");
                setShowShapes(false);
              }}
            >
              Star
            </IconStar>
          </div>
          <hr />
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-2">
              <label className="text-sm text-gray-600">Fill color:</label>
              <hr />
              <input
                type="text"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="border rounded px-2 py-1 text-sm w-37"
              />
            </div>

            <div className="flex justify-between items-center gap-2">
              <label className="text-sm text-gray-600">Border color:</label>
              <hr />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="border rounded px-2 py-1 text-sm w-37"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="text-sm text-gray-600">Border size:</label>
              <input
                type="range"
                min={1}
                max={10}
                defaultValue={borderWidth}
                onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                className="accent-blue-500 w-37"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EraserSelector() {
  const { setSelectedTool, selectedTool } = useWhiteBoardStore((s) => s);
  const [showEraser, setShowEraser] = useState(false);
  const { eraserSize, setEraserSize } = useEraserStore((s) => s);

  const handleEraserSizePlus = () => {
    setEraserSize(Math.min(eraserSize + 1, 300));
  };

  const handleEraserSizeMinus = () => {
    setEraserSize(Math.max(eraserSize - 1, 0));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) setEraserSize(value);
  };

  return (
    <div className="relative">
      <IconEraser
        className={clsx(
          "cursor-pointer hover:text-blue-500",
          selectedTool === "eraser" && "text-blue-500"
        )}
        onClick={() => {
          setShowEraser((prev) => !prev);
          setSelectedTool("eraser");
        }}
      />
      {showEraser && (
        <div className="absolute top-10 left-0 bg-white shadow-md rounded-lg p-3 flex gap-3">
          <IconMinus
            className="cursor-pointer"
            onClick={handleEraserSizeMinus}
          />
          <div>
            <input
              value={eraserSize}
              className="w-[5ch] text-center outline-none focus-within:outline-none focus:outline-none focus-visible:outline-none"
              type="numeric"
              max={300}
              min={0}
              onChange={handleInputChange}
            />
          </div>
          <IconPlus className="cursor-pointer" onClick={handleEraserSizePlus} />
        </div>
      )}
    </div>
  );
}

function PenSelector() {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { selectedTool, setSelectedTool } = useWhiteBoardStore((s) => s);

  return (
    <div className="relative">
      <IconPencil
        className={clsx(
          "cursor-pointer hover:text-blue-500",
          selectedTool === "pen" && "text-blue-500"
        )}
        onClick={() => {
          setShowColorPicker((prev) => !prev);
          setSelectedTool("pen");
        }}
      />
      {showColorPicker && (
        <MyColorPicker
          isOpen={showColorPicker}
          toggleOpen={(isOpen) => setShowColorPicker(isOpen)}
        />
      )}
    </div>
  );
}
