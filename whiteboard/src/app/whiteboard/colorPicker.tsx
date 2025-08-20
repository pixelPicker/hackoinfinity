import React, { useState } from "react";
import { useInkStore } from "./_store/inkStore";
import { presetColors } from "./_shapes/utils";

interface colorPickerProps {
  isOpen: boolean;
  toggleOpen: (isOpen: boolean) => void;
}

function MyColorPicker({ isOpen, toggleOpen }: colorPickerProps) {
  const { inkWidth, setInkColor, inkColor, setInkWidth } = useInkStore(
    (s) => s
  );
  return (
    <div className="toolbar-dropdown absolute top-10 left-0 bg-white shadow-xl rounded-xl border-2 border-orange-200 p-4 flex flex-col gap-3 w-60 z-50">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        {presetColors.map((preset) => (
          <button
            key={preset}
            className="w-7 h-7 rounded-sm border border-gray-300"
            style={{ backgroundColor: preset }}
            onClick={() => {
              setInkColor(preset);
              toggleOpen(!isOpen);
            }}
          />
        ))}
      </div>

      <div className="flex justify-between items-center gap-2 mt-4">
        <label className="text-sm text-gray-600">Color:</label>
        <input
          type="text"
          value={inkColor}
          onChange={(e) => setInkColor(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-37"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="text-sm text-gray-600">Size:</label>
        <input
          type="range"
          min={1}
          max={30}
          defaultValue={inkWidth}
          onChange={(e) => setInkWidth(parseInt(e.target.value))}
          className="accent-blue-500 w-44"
        />
      </div>
    </div>
  );
}

export default MyColorPicker;
