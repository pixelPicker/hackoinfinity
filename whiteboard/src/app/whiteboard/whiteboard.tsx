"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Stage } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useWhiteBoardStore } from "./_store/whiteboardStore";
import { CanvasObjectType, ShapeName } from "./types";
import InkLayer from "./inkLayer";
import ZoomToolbar from "./zoomToolbar";
import { useInkStore } from "./_store/inkStore";
import { useEraserStore } from "./_store/eraserStore";
import ShapeLayer from "./shapeLayer";
import {
  getFontStyleStringFromTextStyleArray,
  getTextDecorationStringFromTextStyleArray,
  TEXT_DEFAULT_HEIGHT,
  TEXT_DEFAULT_WIDTH,
} from "./_text/utils";
import { useTextStore } from "./_store/textStore";
import { useShapeStore } from "./_store/shapeStore";
import { SHAPE_DEFAULT_HEIGHT, SHAPE_DEFAULT_WIDTH } from "./_shapes/utils";
import TextLayer from "./textLayer";
import {
  IconCircleDashedPlus,
  IconCopy,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const WhiteBoard = ({
  boardRef,
}: {
  boardRef: React.RefObject<Konva.Stage | null>;
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [newObject, setNewObject] = useState<CanvasObjectType | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { data: session } = useSession();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset all state when closing modals
  const resetState = () => {
    setShowCreateModal(false);
    setShowJoinModal(false);
    setShowAuthModal(false);
    setRoomCode("");
    setJoinCode("");
    setCopied(false);
    setError("");
    setLoading(false);
  };

  // Check authentication before showing modals
  const handleCreateRoom = async () => {
    // Reset state first
    resetState();

    if (!session) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      const code = Math.random().toString(36).substr(2, 6).toUpperCase();

      // Create room in database
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: code,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRoomCode(code);
        setShowCreateModal(true);
      } else {
        setError(data.error || "Failed to create room");
      }
    } catch (error) {
      setError("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoomClick = () => {
    // Reset state first
    resetState();

    if (!session) {
      setShowAuthModal(true);
      return;
    }
    setShowJoinModal(true);
  };

  // Copy code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Handle join room with database validation
  const handleJoinRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (joinCode.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: joinCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to whiteboard with room code
        router.push(`/whiteboard?room=${joinCode}`);
      } else {
        setError(data.error || "Room not found");
      }
    } catch (error) {
      setError("Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoom = () => {
    router.push(`/whiteboard?room=${roomCode}`);
  };

  const {
    selectedTool,
    selectedObjectId,
    undo,
    redo,
    canvasObjects,
    addCanvasObject,
    updateCanvasObject,
    selectCanvasObject,
    deleteCanvasObject,
    resetCanvas,
  } = useWhiteBoardStore();
  const { inkColor, inkWidth } = useInkStore((s) => s);
  const { eraserSize } = useEraserStore((s) => s);
  const {
    textColor,
    textSize,
    lineSpacing,
    setLineSpacing,
    setTextAlignment,
    setTextColor,
    setTextSize,
    setTextStyle,
    textAlignment,
    textStyle,
  } = useTextStore((s) => s);
  const {
    borderColor,
    borderWidth,
    fillColor,
    setBorderColor,
    setBorderWidth,
    setFillColor,
  } = useShapeStore((s) => s);

  const handleDelete = useCallback(() => {
    if (selectedObjectId) {
      deleteCanvasObject(selectedObjectId);
    }
  }, [selectedObjectId, canvasObjects]);

  const resetCanvasState = useCallback(() => {
    resetCanvas();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Delete" || // Del for Windows/Linux
        (event.metaKey && event.key === "Backspace") // Cmd+delete for macOS
      ) {
        handleDelete();
      } else if (
        (event.ctrlKey && event.key === "z") || // Ctrl+Z for Windows/Linux
        (event.metaKey && event.key === "z" && !event.shiftKey) // Cmd+Z for macOS
      ) {
        undo();
      } else if (
        (event.ctrlKey && event.key === "y") || // Ctrl+Y for Windows/Linux
        (event.metaKey && event.shiftKey && event.key === "z") // Cmd+Shift+Z for macOS
      ) {
        redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleDelete]);

  const addTextField = (x: number, y: number) => {
    // dispatch(setIsSidePanelOpen(true));

    const newObjectId = crypto.randomUUID();
    let newObject: CanvasObjectType = {
      id: newObjectId,
      type: "text" as const,
      x: x,
      y: y,
      width: TEXT_DEFAULT_WIDTH,
      height: TEXT_DEFAULT_HEIGHT,
      fill: textColor,
      text: "Double click to edit.",
      fontSize: textSize,
      align: textAlignment,
      lineHeight: lineSpacing,
      fontStyle: getFontStyleStringFromTextStyleArray(textStyle),
      textDecoration: getTextDecorationStringFromTextStyleArray(textStyle),
      fontFamily: "Arial",
    };

    setNewObject(newObject);
    selectCanvasObject(newObjectId);
  };

  const addShape = (shapeName: ShapeName, x: number, y: number) => {
    // dispatch(setIsSidePanelOpen(true));
    const newShapeId = crypto.randomUUID();
    const baseShape = {
      id: newShapeId,
      shapeName,
      type: "shape" as const,
      strokeWidth: borderWidth,
      stroke: borderColor,
      fill: fillColor,
      x: x,
      y: y,
      width: SHAPE_DEFAULT_WIDTH,
      height: SHAPE_DEFAULT_HEIGHT,
    }; // common shape properties

    let newShape: CanvasObjectType;
    switch (shapeName) {
      case "rectangle":
        newShape = {
          ...baseShape,
        };
        break;
      case "oval":
        newShape = {
          ...baseShape,
        };
        break;
      case "triangle":
        newShape = {
          ...baseShape,
          height: 43.3, // equilateral triangle
        };
        break;
      case "star":
        newShape = {
          ...baseShape,
        };
        break;
      default:
        console.warn(`Unknown shapeName: ${shapeName}`);
        return;
    }

    setNewObject(newShape);
    selectCanvasObject(newShapeId);
  };

  const [isInProgress, setIsInProgress] = useState(false);

  const handleMouseDown = (e: any) => {
    if (!selectedObjectId) {
      setIsInProgress(true);

      if (selectedTool.includes("add")) {
        const pos = e.target.getStage().getRelativePointerPosition();
        const { x, y } = pos;

        // Add new object based on tool
        switch (selectedTool) {
          case "addText":
            addTextField(x, y);
            break;
          case "addRectangle":
            addShape("rectangle", x, y);
            break;
          case "addOval":
            addShape("oval", x, y);
            break;
          case "addTriangle":
            addShape("triangle", x, y);
            break;
          case "addStar":
            addShape("star", x, y);
            break;
          default:
            console.warn(`Unknown tool: ${selectedTool}`);
            return;
        }
        return;
      }

      if (selectedTool === "pen" || selectedTool === "eraser") {
        const pos = e.target.getStage().getRelativePointerPosition();
        setNewObject({
          id: crypto.randomUUID(),
          type: selectedTool === "eraser" ? "eraserStroke" : "ink",
          points: [pos.x, pos.y],
          stroke: selectedTool === "eraser" ? inkColor : inkColor,
          strokeWidth: selectedTool === "eraser" ? eraserSize : inkWidth,
        });
      }
    }

    // deselect object if clicked empty area or ink
    if (
      e.target === e.target.getStage() ||
      e.target.attrs.name?.includes("ink") ||
      e.target.attrs.name?.includes("eraserStroke")
    ) {
      selectCanvasObject("");
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isInProgress || !newObject) return;

    const stage = e.target.getStage();
    const point = stage.getRelativePointerPosition();

    if (newObject.type !== "ink" && newObject.type !== "eraserStroke") {
      const width = Math.max(Math.abs(point.x - newObject.x!) || 5);
      const height = Math.max(Math.abs(point.y - newObject.y!) || 5);

      setNewObject({
        ...newObject,
        width: newObject.shapeName === "star" ? Math.min(width, height) : width,
        height:
          newObject.shapeName === "star" ? Math.min(width, height) : height,
      });
    } else {
      setNewObject({
        ...newObject,
        points: newObject.points!.concat([point.x, point.y]),
      });
    }
  };

  const handleMouseUp = () => {
    if (isInProgress && newObject) {
      addCanvasObject(newObject);

      if (selectedTool !== "pen" && selectedTool !== "eraser") {
        // switch back to select mode
        useWhiteBoardStore.setState({ selectedTool: "select" });
      }
    }
    setNewObject(null);
    setIsInProgress(false);
  };

  /** =====================
   * Zoom Handler
   * ===================== */
  function handleWheelZoom(e: KonvaEventObject<WheelEvent>): void {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const scaleBy = 1.05;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clamped = Math.max(0.1, Math.min(newScale, 3));

    stage.scale({ x: clamped, y: clamped });
    stage.position({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    });

    setZoomLevel(clamped);
  }

  return (
    <>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        draggable={selectedTool === "select" && !selectedObjectId}
        onWheel={handleWheelZoom}
      >
        <InkLayer objects={canvasObjects} newObject={newObject} />

        <ShapeLayer
          objects={canvasObjects}
          newObject={newObject}
          selectedObjectId={selectedObjectId}
          setSelectedObjectId={selectCanvasObject}
          onChange={updateCanvasObject}
        />
        <TextLayer
          objects={canvasObjects}
          newObject={newObject}
          selectedObjectId={selectedObjectId}
          setSelectedObjectId={selectCanvasObject}
          onChange={updateCanvasObject}
          zoomLevel={zoomLevel}
        />
      </Stage>

      <ZoomToolbar
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        stageRef={stageRef}
      />
      <div className="fixed top-[20px] right-[10px] p-3 rounded-lg border border-gray-200 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-all cursor-pointer text-white shadow-lg flex items-center gap-2" onClick={handleCreateRoom}>
        <button>Create a Room</button>
        <IconCircleDashedPlus />
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative border-4 border-[var(--accent)]">
            <button
              onClick={resetState}
              className="absolute top-4 right-4 text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
            >
              <IconX size={20} />
            </button>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-[var(--accent)] rounded-full flex items-center justify-center mb-6">
                <IconUsers className="text-2xl text-[var(--primary-text)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--primary-text)] mb-4">
                Sign In Required
              </h2>
              <p className="text-[var(--secondary-text)] mb-6">
                You need to be logged in to create or join a room.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={resetState}
                  className="flex-1 px-6 py-3 border-3 border-[var(--accent)] text-[var(--primary-text)] rounded-2xl hover:bg-[var(--surface)] transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="flex-1 px-6 py-3 bg-[var(--accent)] text-[var(--primary-text)] rounded-2xl hover:bg-[var(--accent-dark)] transition-colors font-medium"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative border-4 border-[var(--accent)]">
            <button
              onClick={resetState}
              className="absolute top-4 right-4 text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
            >
              <IconX size={20} />
            </button>

            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto h-16 w-16 bg-[var(--accent)] rounded-full flex items-center justify-center mb-4">
                  <IconCircleDashedPlus className="text-2xl text-[var(--primary-text)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--primary-text)] mb-2">
                  Room Created!
                </h2>
                <p className="text-[var(--secondary-text)]">
                  Share this code with others to join your room
                </p>
              </div>

              <div className="bg-[var(--surface)] rounded-2xl p-6 mb-6 border-2 border-[var(--accent)]">
                <div className="text-3xl font-mono font-bold text-[var(--primary-text)] mb-3 tracking-wider">
                  {roomCode}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-[var(--accent)] text-[var(--primary-text)] rounded-2xl hover:bg-[var(--accent-dark)] transition-colors font-medium"
                >
                  <IconCopy size={16} />
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>

              <button
                onClick={handleStartRoom}
                className="w-full px-6 py-3 bg-[var(--accent)] text-[var(--primary-text)] rounded-2xl hover:bg-[var(--accent-dark)] transition-colors font-medium border-3 border-[var(--accent)]"
              >
                Enter Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhiteBoard;
