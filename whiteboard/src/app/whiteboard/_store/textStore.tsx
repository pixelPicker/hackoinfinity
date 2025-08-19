import { create } from "zustand";

interface TextState {
  textSize: number;
  textStyle: string[];
  textColor: string;
  textAlignment: string;
  lineSpacing: number;

  setTextSize: (size: number) => void;
  setTextStyle: (style: string[]) => void;
  setTextColor: (color: string) => void;
  setTextAlignment: (alignment: string) => void;
  setLineSpacing: (spacing: number) => void;
}

export const useTextStore = create<TextState>((set) => ({
  textSize: 28,
  textStyle: [],
  textColor: "#000000",
  textAlignment: "left",
  lineSpacing: 1.5,

  setTextSize: (size) => set({ textSize: size }),
  setTextStyle: (style) => set({ textStyle: style }),
  setTextColor: (color) => set({ textColor: color }),
  setTextAlignment: (alignment) => set({ textAlignment: alignment }),
  setLineSpacing: (spacing) => set({ lineSpacing: spacing }),
}));
