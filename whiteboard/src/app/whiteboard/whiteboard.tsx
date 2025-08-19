"use client";

import { useRef, useState } from "react";
import { Stage } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useWhiteBoardStore } from "./_store/whiteboardStore";
import { CanvasObjectType } from "./types";
import InkLayer from "./inkLayer";
import ZoomToolbar from "./zoomToolbar";
import { useInkStore } from "./_store/inkStore";
import { useEraserStore } from "./_store/eraserStore";

// import InkLayer from "./layers/InkLayer";
// import ShapeLayer from "./layers/ShapeLayer";
// import TextLayer from "./layers/TextLayer";
// import Toolbar from "./Toolbar";
// import ConfirmationDialog from "./ConfirmationDialog";
// import SidePanel from "./SidePanel";
// import ZoomToolbar from "./ZoomToolbar";

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
    canvasObjects,
    addCanvasObject,
    updateCanvasObject,
    selectCanvasObject,
  } = useWhiteBoardStore();
  const { inkColor, inkWidth, setInkColor, setInkWidth } = useInkStore(
    (s) => s
  );
  const { eraserSize, setEraserSize } = useEraserStore((s) => s);

  const [isInProgress, setIsInProgress] = useState(false);
  /** =====================
   * Mouse Handlers
   * ===================== */
  const handleMouseDown = (e: any) => {
    if (!selectedObjectId) {
      setIsInProgress(true);

      if (selectedTool.includes("add")) {
        const pos = e.target.getStage().getRelativePointerPosition();
        const { x, y } = pos;

        switch (selectedTool) {
          case "addText":
            setNewObject({
              id: crypto.randomUUID(),
              type: "text",
              text: "New text",
              x,
              y,
              width: 100,
              height: 30,
            });
            break;
          case "addRectangle":
            setNewObject({
              id: crypto.randomUUID(),
              type: "shape",
              shapeName: "rectangle",
              x,
              y,
              width: 0,
              height: 0,
            });
            break;
          case "addOval":
            setNewObject({
              id: crypto.randomUUID(),
              type: "shape",
              shapeName: "oval",
              x,
              y,
              width: 0,
              height: 0,
            });
            break;
          case "addTriangle":
            setNewObject({
              id: crypto.randomUUID(),
              type: "shape",
              shapeName: "triangle",
              x,
              y,
              width: 0,
              height: 0,
            });
            break;
          case "addStar":
            setNewObject({
              id: crypto.randomUUID(),
              type: "shape",
              shapeName: "star",
              x,
              y,
              width: 0,
              height: 0,
            });
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
          stroke: inkColor,
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

        {/* <ShapeLayer
          objects={canvasObjects}
          newObject={newObject}
          selectedObjectId={selectedObjectId}
          setSelectedObjectId={selectCanvasObject}
          onChange={updateCanvasObject}
        /> */}
        {/* <TextLayer
          objects={canvasObjects}
          newObject={newObject}
          selectedObjectId={selectedObjectId}
          setSelectedObjectId={selectCanvasObject}
          onChange={updateCanvasObject}
          zoomLevel={zoomLevel}
        /> */}
      </Stage>

      {/* <Toolbar objects={canvasObjects} onDelete={resetCanvas} /> */}
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
    </>
  );
};

export default WhiteBoard;
