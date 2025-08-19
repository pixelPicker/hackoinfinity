import { create } from "zustand";

interface ShapeState {
  borderWidth: number;
  borderColor: string;
  fillColor: string;
  setBorderWidth: (width: number) => void;
  setBorderColor: (color: string) => void;
  setFillColor: (color: string) => void;
}

export const useShapeStore = create<ShapeState>((set) => ({
  borderWidth: 2,
  borderColor: "#2986CC",
  fillColor: "#FFFFFF00",

  setBorderWidth: (width) => set({ borderWidth: width }),
  setBorderColor: (color) => set({ borderColor: color }),
  setFillColor: (color) => set({ fillColor: color }),
}));
