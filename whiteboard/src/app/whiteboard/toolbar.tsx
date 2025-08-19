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
} from "@tabler/icons-react";
import { useWhiteBoardStore } from "./_store/whiteboardStore";
import Konva from "konva";

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
  } = useWhiteBoardStore();

  const [showShapes, setShowShapes] = useState(false);

  return (
    <section className="fixed top-[20px] left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white shadow-lg rounded-xl p-3 border border-gray-200">
      {/* Move tool */}
      <IconArrowsMove
        className="cursor-pointer hover:text-blue-500"
        onClick={() => setSelectedTool("select")}
      />

      {/* Pencil */}
      <IconPencil
        className="cursor-pointer hover:text-blue-500"
        onClick={() => setSelectedTool("pen")}
      />

      {/* Text */}
      <IconTextCaption
        className="cursor-pointer hover:text-blue-500"
        onClick={() => setSelectedTool("addText")}
      />

      {/* Shapes popover */}
      <div className="relative">
        <IconShape
          className="cursor-pointer hover:text-blue-500"
          onClick={() => setShowShapes((prev) => !prev)}
        />
        {showShapes && (
          <div className="absolute bottom-10 left-0 bg-white shadow-md border rounded-lg flex flex-col p-2">
            <button
              className="hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => setSelectedTool("addRectangle")}
            >
              Rectangle
            </button>
            <button
              className="hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => setSelectedTool("addOval")}
            >
              Circle
            </button>
            <button
              className="hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => setSelectedTool("addTriangle")}
            >
              Triangle
            </button>
            <button
              className="hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => setSelectedTool("addStar")}
            >
              Star
            </button>
          </div>
        )}
      </div>

      {/* Eraser + slider */}
      <div className="relative">
        <IconEraser className="cursor-pointer hover:text-blue-500" />
      </div>

      {/* Undo / Redo */}
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

      {/* Delete / Clear */}
      <IconTrash
        className={`cursor-pointer ${
          canvasObjects.length === 0 ? "opacity-30" : "hover:text-red-500"
        }`}
        onClick={resetCanvas}
      />
    </section>
  );
}
