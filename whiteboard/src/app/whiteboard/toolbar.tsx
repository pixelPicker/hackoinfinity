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
    setSelectedTool,
    resetCanvas,
    canvasObjects,
  } = useWhiteBoardStore((s) => s);
  const { inkColor, inkWidth, setInkColor, setInkWidth } = useInkStore(
    (s) => s
  );
  const { eraserSize, setEraserSize } = useEraserStore((s) => s);
  const [showShapes, setShowShapes] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <section className="fixed top-[20px] left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white shadow-lg rounded-xl p-3 border border-gray-200">
      <IconArrowsMove
        className="cursor-pointer hover:text-blue-500"
        onClick={() => setSelectedTool("select")}
      />

      <IconPencil
        className="cursor-pointer hover:text-blue-500"
        onClick={() => setSelectedTool("pen")}
      />

      <div className="relative">
        <IconColorPicker
          className="cursor-pointer hover:text-blue-500"
          onClick={() => setShowColorPicker((prev) => !prev)}
        />
        {showColorPicker && (
          <div className="absolute top-10 left-0 bg-white shadow-md rounded-lg p-3">
            <input
              type="color"
              value={inkColor}
              onChange={(e) => setInkColor(e.target.value)}
            />
          </div>
        )}
      </div>

      <IconTextCaption
        className="cursor-pointer hover:text-blue-500"
        onClick={() => setSelectedTool("addText")}
      />

      <ShapeSelector />

      <EraserSelector />
      {/* <div className="relative">
        <IconEraser className="cursor-pointer hover:text-blue-500" />
      </div> */}

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
  const { setSelectedTool } = useWhiteBoardStore((s) => s);
  return (
    <div className="relative">
      <IconShape
        className="cursor-pointer hover:text-blue-500"
        onClick={() => setShowShapes((prev) => !prev)}
      />
      {showShapes && (
        <div className="absolute top-10 left-0 bg-white shadow-md rounded-lg p-3 flex gap-4">
          <IconRectangle
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              setSelectedTool("addRectangle");
              setShowShapes(false);
            }}
          >
            Rectangle
          </IconRectangle>
          <IconCircle
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              setSelectedTool("addOval");
              setShowShapes(false);
            }}
          >
            Circle
          </IconCircle>
          <IconTriangle
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              setSelectedTool("addTriangle");
              setShowShapes(false);
            }}
          >
            Triangle
          </IconTriangle>
          <IconStar
            className="cursor-pointer hover:text-blue-500"
            onClick={() => {
              setSelectedTool("addStar");
              setShowShapes(false);
            }}
          >
            Star
          </IconStar>
        </div>
      )}
    </div>
  );
}

function EraserSelector() {
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
        className="cursor-pointer hover:text-blue-500"
        onClick={() => setShowEraser((prev) => !prev)}
      />
      {showEraser && (
        <div className="absolute top-10 left-0 bg-white shadow-md rounded-lg p-3 flex gap-3">
          {/* Zoom Out */}
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
