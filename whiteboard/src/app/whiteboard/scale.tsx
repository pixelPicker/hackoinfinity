"use client"

import { IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import { useWhiteBoardStore } from "./_store/whiteboardStore";

export default function WhiteBoardScale() {
  const { scale, handleScaleGrow, handleScaleShrink } = useWhiteBoardStore(
    (s) => s
  );
  return (
    <div className="p-2 bg-gray-300 rounded-lg absolute bottom-[10px] right-[10px] flex items-center gap-4">
      <IconZoomOut size={20} className="cursor-pointer" onClick={handleScaleShrink} />
      <span className="w-7 select-none text-center">{scale}</span>
      <IconZoomIn size={20} className="cursor-pointer" onClick={handleScaleGrow} />
    </div>
  );
}
