import { Layer } from "react-konva";
import { convertTextPropertiesToTextStyleArray } from "./_text/utils";
import { useTextStore } from "./_store/textStore";
import { useWhiteBoardStore } from "./_store/whiteboardStore";
import { CanvasObjectType } from "./types";
import TextField from "./_text/textField";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io";
import { useRoomStore } from "./_store/roomStore";
import { useSocketStore } from "./_store/socketStore";

type Props = {
  objects: CanvasObjectType[];
  newObject: CanvasObjectType | null;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string) => void;
  onChange: (
    selectedObjectId: string,
    newAttrs: Partial<CanvasObjectType>
  ) => void;
  zoomLevel: number;
};

export default function TextLayer({
  objects,
  newObject,
  selectedObjectId,
  setSelectedObjectId,
  onChange,
  zoomLevel,
}: Props) {
  const {
    textSize,
    textStyle,
    textColor,
    textAlignment,
    lineSpacing,
    setTextSize,
    setTextStyle,
    setTextColor,
    setTextAlignment,
    setLineSpacing,
  } = useTextStore((s) => s);
  const { roomCode } = useRoomStore((s) => s);
  const { selectedTool } = useWhiteBoardStore((s) => s);

  const texts = [
    ...objects.filter((obj: CanvasObjectType) => obj.type === "text"),
    ...(newObject && newObject.type === "text" ? [newObject] : []),
  ];
  const { connect, socket } = useSocketStore();

  return (
    <Layer>
      {texts.map((text, _) => (
        <TextField
          key={text.id}
          objectProps={text}
          isSelected={text.id === selectedObjectId}
          onSelect={(e) => {
            if (selectedTool === "select") {
              setSelectedObjectId(text.id);

              // Open side panel
              // dispatch(setIsSidePanelOpen(true));

              // update settings to match selected text's
              setTextSize(text.fontSize || 28);
              setTextColor(text.fill || "#000");
              setTextAlignment(text.align || "left");
              setLineSpacing(text.lineHeight || 1.5);
              setTextStyle(
                convertTextPropertiesToTextStyleArray(
                  text.fontStyle,
                  text.textDecoration
                )
              );

              // Update cursor style
              const stage = e.target.getStage();
              if (stage) {
                const container = stage.container();
                container.style.cursor = "grab";
              }
            }

            // TODO: #18
            // console.log("e.target =", e.target);
            // e.target.moveToTop(); // Upon select, move the object to top of canvas
            // e.target.getLayer().batchDraw(); // Redraw
          }}
          onChange={async (newAttrs: Partial<CanvasObjectType>) => {
            onChange(text.id, newAttrs);
            if (roomCode) {
              const socket = await connect();
              socket.emit("update-canvas-object", { roomCode, newAttrs });
            }
          }}
          zoomLevel={zoomLevel}
        />
      ))}
    </Layer>
  );
}
