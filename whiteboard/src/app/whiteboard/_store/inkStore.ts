import { create } from "zustand";

interface InkState {
  inkWidth: number;
  inkColor: string;
  setInkWidth: (width: number) => void;
  setInkColor: (color: string) => void;
}

export const useInkStore = create<InkState>((set) => ({
  inkWidth: 5,
  inkColor: "#2986cc",
  setInkWidth: (width) => set({ inkWidth: width }),
  setInkColor: (color) => set({ inkColor: color }),
}));
