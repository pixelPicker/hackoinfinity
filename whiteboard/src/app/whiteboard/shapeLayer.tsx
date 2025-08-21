import { Layer } from "react-konva";
import { CanvasObjectType } from "./types";
import RectangleShape from "./_shapes/rectangle";
import OvalShape from "./_shapes/oval";
import TriangleShape from "./_shapes/triangle";
import StarShape from "./_shapes/star";
import { useShapeStore } from "./_store/shapeStore";
import { useWhiteBoardStore } from "./_store/whiteboardStore";
import { useRoomStore } from "./_store/roomStore";
import { useSocketStore } from "./_store/socketStore";

type ShapesLayerProps = {
  objects: CanvasObjectType[];
  newObject: CanvasObjectType | null;
  onChange: (
    selectedObjectId: string,
    newAttrs: Partial<CanvasObjectType>
  ) => void;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string) => void;
};

export default function ShapeLayer({
  objects,
  newObject,
  onChange,
  selectedObjectId,
  setSelectedObjectId,
}: ShapesLayerProps) {
  const { setBorderColor, setBorderWidth, setFillColor } = useShapeStore(
    (s) => s
  );
  const { roomCode } = useRoomStore((s) => s);
  const { selectedTool } = useWhiteBoardStore((s) => s);
  const { connect, socket } = useSocketStore();
  const shapes = [
    ...objects.filter((obj: CanvasObjectType) => obj.type === "shape"),
    ...(newObject && newObject.type === "shape" ? [newObject] : []),
  ];

  const renderShape = (shape: CanvasObjectType) => {
    const commonProps = {
      shapeProps: shape,
      isSelected: shape.id === selectedObjectId,
      onSelect: (e: any) => {
        if (selectedTool === "select") {
          setSelectedObjectId(shape.id);

          //TODO: Show the side panel

          // update settings to match selected shape's
          setBorderWidth(shape.strokeWidth || 5);
          setBorderColor(shape.stroke || "#2986cc");
          setFillColor(shape.fill || "#FFFFFF");

          const stage = e.target.getStage();
          if (stage) {
            const container = stage.container();
            container.style.cursor = "grab";
          }

          // TODO: #18
          // console.log("e.target =", e.target);
          // e.target.getParent().moveToTop(); // Upon select, move the object Group to top of canvas
          // e.target.moveToTop(); // Upon select, move the object to top of canvas
          // e.target.getLayer().batchDraw(); // Redraw
        }
      },
      onChange: async (newAttrs: Partial<CanvasObjectType>) => {
        onChange(shape.id, newAttrs);
        if (roomCode) {
          const socket = await connect();
          socket.emit("update-canvas-object", {
            room: roomCode,
            object: newAttrs,
          });
        } else {
        }
      },
    };

    switch (shape.shapeName) {
      case "rectangle":
        return <RectangleShape key={shape.id} {...commonProps} />;
      case "oval":
        return <OvalShape key={shape.id} {...commonProps} />;
      case "triangle":
        return <TriangleShape key={shape.id} {...commonProps} />;
      case "star":
        return <StarShape key={shape.id} {...commonProps} />;
      default:
        console.warn(`Unknown shape: ${shape.shapeName}`);
        return null;
    }
  };

  return <Layer>{shapes.map((shape, i) => renderShape(shape))}</Layer>;
}
