"use client";

import { useState, useEffect } from "react";
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
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconBold,
  IconItalic,
  IconUnderline,
} from "@tabler/icons-react";
import { useWhiteBoardStore } from "./_store/whiteboardStore";
import Konva from "konva";
import { useInkStore } from "./_store/inkStore";
import { useEraserStore } from "./_store/eraserStore";
import clsx from "clsx";
import MyColorPicker from "./colorPicker";
import MiniColorPicker from "./miniColorPicker";
import { useShapeStore } from "./_store/shapeStore";
import { presetColors } from "./_shapes/utils";
import { useTextStore } from "./_store/textStore";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io";
import { useRoomStore } from "./_store/roomStore";
import { useSession } from "next-auth/react";

export default function ToolBar({
  boardRef,
  socket,
}: {
  boardRef: React.RefObject<Konva.Stage | null>;
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
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
  const [toggleClearAllModal, setToggleClearAllModal] = useState(false);
  const { roomCode } = useRoomStore((s) => s);
  const { data } = useSession();

  // Global state for all toolbar dropdowns
  const [showPenProperties, setShowPenProperties] = useState(false);
  const [showShapeProperties, setShowShapeProperties] = useState(false);
  const [showEraserProperties, setShowEraserProperties] = useState(false);
  const [showTextProperties, setShowTextProperties] = useState(false);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.toolbar-dropdown') && !target.closest('.toolbar-button')) {
        setShowPenProperties(false);
        setShowShapeProperties(false);
        setShowEraserProperties(false);
        setShowTextProperties(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAllDropdowns = () => {
    setShowPenProperties(false);
    setShowShapeProperties(false);
    setShowEraserProperties(false);
    setShowTextProperties(false);
  };
  return (
    <>
      <section className="fixed top-[20px] left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white shadow-lg rounded-xl p-3 border border-gray-200">
        <IconArrowsMove
          className={clsx(
            "cursor-pointer hover:text-blue-500 toolbar-button",
            selectedTool === "select" && "text-blue-500"
          )}
          onClick={() => {
            closeAllDropdowns();
            setSelectedTool("select");
          }}
        />

        <PenSelector 
          showColorPicker={showPenProperties}
          setShowColorPicker={setShowPenProperties}
          closeAllDropdowns={closeAllDropdowns}
        />

        <TextSelector 
          socket={socket}
          showTextPanel={showTextProperties}
          setShowTextPanel={setShowTextProperties}
          closeAllDropdowns={closeAllDropdowns}
        />

        <ShapeSelector 
          showShapes={showShapeProperties}
          setShowShapes={setShowShapeProperties}
          closeAllDropdowns={closeAllDropdowns}
        />

        <EraserSelector 
          showEraser={showEraserProperties}
          setShowEraser={setShowEraserProperties}
          closeAllDropdowns={closeAllDropdowns}
        />

        <IconArrowBackUp
          className={`cursor-pointer ${
            undoStack.length === 0 ? "opacity-30" : "hover:text-blue-500"
          }`}
          onClick={() => {
            undo();
            if (socket && roomCode) {
              socket.emit("undo", { roomCode });
            }
          }}
        />
        <IconArrowForwardUp
          className={`cursor-pointer ${
            redoStack.length === 0 ? "opacity-30" : "hover:text-blue-500"
          }`}
          onClick={() => {
            redo();
            if (socket && roomCode) {
              socket.emit("redo", { roomCode });
            }
          }}
        />

        <IconTrash
          className={`cursor-pointer ${
            canvasObjects.length === 0 ? "opacity-30" : "hover:text-red-500"
          }`}
          onClick={() => setToggleClearAllModal(true)}
        />
      </section>
      {toggleClearAllModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative border-4 border-Accent">
            <h2 className="text-xl pb-6">
              Are you sure you want to clear the canvas
            </h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setToggleClearAllModal(false)}
                className="flex-1 cursor-pointer px-6 py-3 border-3 border-Accent text-Primary-Text rounded-2xl hover:bg-Surface transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetCanvas();
                  if (socket && roomCode) {
                    socket.emit("reset-canvas", { roomCode });
                  }
                  setToggleClearAllModal(false);
                }}
                className="flex-1 cursor-pointer px-6 py-3 bg-Acborder-Accent text-Primary-Text rounded-2xl hover:bg-red-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ShapeSelector({
  showShapes,
  setShowShapes,
  closeAllDropdowns,
}: {
  showShapes: boolean;
  setShowShapes: (show: boolean) => void;
  closeAllDropdowns: () => void;
}) {
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
          "cursor-pointer hover:text-blue-500 toolbar-button",
          selectedTool.includes("add") &&
            selectedTool !== "addText" &&
            "text-blue-500"
        )}
        onClick={() => {
          closeAllDropdowns();
          setShowShapes(!showShapes);
        }}
      />

      {showShapes && (
        <div className="toolbar-dropdown absolute top-10 left-0 bg-white shadow-xl rounded-xl border-2 border-orange-200 p-4 flex flex-col justify-between gap-4 w-60 z-50">
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
          <div className="flex flex-col gap-3">
            <MiniColorPicker
              value={fillColor}
              onChange={setFillColor}
              label="Fill color"
            />

            <MiniColorPicker
              value={borderColor}
              onChange={setBorderColor}
              label="Border color"
            />

            <div className="flex items-center justify-between gap-2">
              <label className="text-sm text-gray-600">Border size:</label>
              <input
                type="range"
                min={1}
                max={10}
                defaultValue={borderWidth}
                onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                className="accent-orange-500 w-32"
              />
              <span className="text-xs text-gray-500 w-8">{borderWidth}px</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EraserSelector({
  showEraser,
  setShowEraser,
  closeAllDropdowns,
}: {
  showEraser: boolean;
  setShowEraser: (show: boolean) => void;
  closeAllDropdowns: () => void;
}) {
  const { setSelectedTool, selectedTool } = useWhiteBoardStore((s) => s);
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
          "cursor-pointer hover:text-blue-500 toolbar-button",
          selectedTool === "eraser" && "text-blue-500"
        )}
        onClick={() => {
          closeAllDropdowns();
          setShowEraser(!showEraser);
          setSelectedTool("eraser");
        }}
      />
      {showEraser && (
        <div className="toolbar-dropdown absolute top-10 left-0 bg-white shadow-xl rounded-xl border-2 border-orange-200 p-4 flex gap-3 z-50">
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

function PenSelector({
  showColorPicker,
  setShowColorPicker,
  closeAllDropdowns,
}: {
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  closeAllDropdowns: () => void;
}) {
  const { selectedTool, setSelectedTool } = useWhiteBoardStore((s) => s);

  return (
    <div className="relative">
      <IconPencil
        className={clsx(
          "cursor-pointer hover:text-blue-500 toolbar-button",
          selectedTool === "pen" && "text-blue-500"
        )}
        onClick={() => {
          closeAllDropdowns();
          setShowColorPicker(!showColorPicker);
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

function TextSelector({
  socket,
  showTextPanel,
  setShowTextPanel,
  closeAllDropdowns,
}: {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  showTextPanel: boolean;
  setShowTextPanel: (show: boolean) => void;
  closeAllDropdowns: () => void;
}) {
  const { roomCode } = useRoomStore((s) => s);

  const {
    selectedTool,
    setSelectedTool,
    selectedObjectId,
    updateCanvasObject,
    canvasObjects,
  } = useWhiteBoardStore((s) => s);
  const {
    lineSpacing,
    setLineSpacing,
    setTextAlignment,
    setTextColor,
    setTextSize,
    setTextStyle,
    textAlignment,
    textColor,
    textSize,
    textStyle,
  } = useTextStore((s) => s);

  return (
    <div className="relative">
      <IconTextCaption
        className={clsx(
          "cursor-pointer hover:text-blue-500 toolbar-button",
          selectedTool === "addText" && "text-blue-500"
        )}
        onClick={() => {
          closeAllDropdowns();
          setSelectedTool("addText");
          setShowTextPanel(!showTextPanel);
        }}
      />
      {showTextPanel && (
        <div className="toolbar-dropdown absolute top-10 left-0 bg-white shadow-xl rounded-xl border-2 border-orange-200 p-4 flex gap-3 z-50">
          <div className="flex flex-col gap-2 w-60">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm text-gray-600">Text size:</label>
              <input
                type="range"
                min={1}
                max={100}
                defaultValue={textSize}
                onChange={(e) => {
                  setTextSize(parseInt(e.target.value));
                  updateCanvasObject(selectedObjectId, {
                    fontSize: parseInt(e.target.value),
                  });
                  if (socket && roomCode && selectedObjectId) {
                    socket.emit("update-canvas-object", {
                      roomCode,
                      object: canvasObjects.find(
                        (obj) => obj.id === selectedObjectId
                      ),
                    });
                  }
                }}
                className="accent-blue-500 w-43"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="text-sm text-gray-600">Line height:</label>
              <input
                type="range"
                min={0}
                max={5}
                defaultValue={lineSpacing}
                onChange={(e) => {
                  setLineSpacing(parseInt(e.target.value));
                  updateCanvasObject(selectedObjectId, {
                    lineHeight: parseInt(e.target.value),
                  });
                  if (socket && roomCode && selectedObjectId) {
                    socket.emit("update-canvas-object", {
                      roomCode,
                      object: canvasObjects.find(
                        (obj) => obj.id === selectedObjectId
                      ),
                    });
                  }
                }}
                className="accent-blue-500 w-43"
              />
            </div>

            <div className="flex justify-between items-center gap-2">
              <label className="text-sm text-gray-600">Text color:</label>
              <input
                type="text"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  updateCanvasObject(selectedObjectId, {
                    fill: e.target.value,
                  });
                  if (socket && roomCode && selectedObjectId) {
                    socket.emit("update-canvas-object", {
                      roomCode,
                      object: canvasObjects.find(
                        (obj) => obj.id === selectedObjectId
                      ),
                    });
                  }
                }}
                className="border rounded px-2 py-1 text-sm w-37"
              />
            </div>

            <div>
              <p className="text-sm text-gray-600 pb-2">Alignment:</p>
              <div className="flex items-center justify-between gap-2 px-10">
                <IconAlignLeft
                  onClick={() => {
                    setTextAlignment("left");
                    updateCanvasObject(selectedObjectId, { align: "left" });
                    if (socket && roomCode && selectedObjectId) {
                      socket.emit("update-canvas-object", {
                        roomCode,
                        object: canvasObjects.find(
                          (obj) => obj.id === selectedObjectId
                        ),
                      });
                    }
                  }}
                />
                <span className="h-full w-[1px]"></span>
                <IconAlignLeft
                  onClick={() => {
                    setTextAlignment("center");
                    updateCanvasObject(selectedObjectId, { align: "center" });
                    if (socket && roomCode && selectedObjectId) {
                      socket.emit("update-canvas-object", {
                        roomCode,
                        object: canvasObjects.find(
                          (obj) => obj.id === selectedObjectId
                        ),
                      });
                    }
                  }}
                />
                <span className="h-full w-[1px]"></span>
                <IconAlignLeft
                  onClick={() => {
                    setTextAlignment("right");
                    updateCanvasObject(selectedObjectId, { align: "right" });
                    if (socket && roomCode && selectedObjectId) {
                      socket.emit("update-canvas-object", {
                        roomCode,
                        object: canvasObjects.find(
                          (obj) => obj.id === selectedObjectId
                        ),
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
