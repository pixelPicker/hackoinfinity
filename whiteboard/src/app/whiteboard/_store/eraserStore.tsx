import { create } from "zustand";

interface EraserState {
  eraserSize: number;
  setEraserSize: (size: number) => void;
}

export const useEraserStore = create<EraserState>((set) => ({
  eraserSize: 5,
  setEraserSize: (size) => set({ eraserSize: size }),
}));
