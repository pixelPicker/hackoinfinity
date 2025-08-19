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

const WhiteBoard = ({
  boardRef,
}: {
  boardRef: React.RefObject<Konva.Stage | null>;
}) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [newObject, setNewObject] = useState<CanvasObjectType | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

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

      {/* <ConfirmationDialog
        open={false}
        onClose={() => {}}
        onConfirm={resetCanvas}
        title="Clear Canvas"
        description="Are you sure you want to clear the canvas? This action cannot be undone."
        isDarkMode={false}
      /> */}
      {/* <SidePanel /> */}
      <ZoomToolbar
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        stageRef={stageRef}
      />
      <div className="fixed top-1/2 left-1/2 "></div>
    </>
  );
};

export default WhiteBoard;
