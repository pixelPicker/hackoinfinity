import React, { useState } from "react";
import { presetColors } from "./_shapes/utils";
import { IconColorPicker, IconChevronDown } from "@tabler/icons-react";
import clsx from "clsx";

interface MiniColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

function MiniColorPicker({ value, onChange, label }: MiniColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-between items-center gap-2">
      <label className="text-sm text-gray-600">{label}:</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-20"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-1 border rounded hover:bg-gray-50 cursor-pointer"
          >
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: value }}
            />
            <IconChevronDown size={12} className={clsx("transition-transform", isOpen && "rotate-180")} />
          </button>
          
          {isOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white shadow-xl rounded-lg border-2 border-orange-200 p-3 z-50 w-48">
              <div className="grid grid-cols-8 gap-1">
                {presetColors.map((preset) => (
                  <button
                    key={preset}
                    className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: preset }}
                    onClick={() => {
                      onChange(preset);
                      setIsOpen(false);
                    }}
                    title={preset}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MiniColorPicker;
