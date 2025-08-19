"use client";

import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconArrowsMove,
  IconColorPicker,
  IconCornerUpLeft,
  IconCornerUpRight,
  IconDownload,
  IconEraser,
  IconPencil,
  IconShape,
  IconTextCaption,
  IconTrash,
} from "@tabler/icons-react";
import Konva from "konva";
import { Stage } from "konva/lib/Stage";
import { KonvaNodeComponent, StageProps } from "react-konva";

export default function ToolBar({
  boardRef,
}: {
  boardRef: React.RefObject<Konva.Stage | null>;
}) {
  const handleCanvasClear = () => {
    if (!boardRef.current) return;
    boardRef.current.clear();
  };

  return (
    <section className="absolute top-[20px] left-1/2 -translate-x-1/2 p-2 bg-gray-300 rounded-lg flex items-center gap-6">
      <IconArrowsMove className="cursor-pointer" onClick={handleCanvasClear} />
      <IconPencil className="cursor-pointer" onClick={handleCanvasClear} />
      <IconEraser className="cursor-pointer" onClick={handleCanvasClear} />
      <IconTextCaption className="cursor-pointer" onClick={handleCanvasClear} />
      <IconShape className="cursor-pointer" onClick={handleCanvasClear} />
      <IconTrash className="cursor-pointer" onClick={handleCanvasClear} />
      <IconDownload className="cursor-pointer" onClick={handleCanvasClear} />
      <IconColorPicker className="cursor-pointer" onClick={handleCanvasClear} />
      <IconArrowBackUp className="cursor-pointer" onClick={handleCanvasClear} />
      <IconArrowForwardUp
        className="cursor-pointer"
        onClick={handleCanvasClear}
      />
    </section>
  );
}
