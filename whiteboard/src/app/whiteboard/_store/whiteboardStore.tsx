import { create } from "zustand";
import { CanvasObjectType, ObjectType, ToolType } from "../types";

interface Line {
  points: number[];
}

interface WhiteboardState {
  scale: number;
  handleScaleGrow: () => void;
  handleScaleShrink: () => void;

  canvasObjects: CanvasObjectType[];
  setCanvasObjects: (objects: CanvasObjectType[]) => void;
  addCanvasObject: (object: CanvasObjectType) => void;
  updateCanvasObject: (id: string, updates: Partial<CanvasObjectType>) => void;
  deleteCanvasObject: (id: string) => void;
  selectCanvasObject: (id: string) => void;
  resetCanvas: () => void;

  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;

  selectedObjectId: string | null;

  undoStack: CanvasObjectType[][];
  redoStack: CanvasObjectType[][];
  undo: () => void;
  redo: () => void;
}

export const useWhiteBoardStore = create<WhiteboardState>((set, get) => ({
  // Zoom
  scale: 1,
  handleScaleGrow: () =>
    set((state) => ({
      scale: state.scale >= 2 ? state.scale : +(state.scale + 0.1).toFixed(1),
    })),
  handleScaleShrink: () =>
    set((state) => ({
      scale: state.scale <= 0.5 ? state.scale : +(state.scale - 0.1).toFixed(1),
    })),

  // Canvas objects
  canvasObjects: [],
  setCanvasObjects: (objects) => set({ canvasObjects: objects }),
  addCanvasObject: (object) =>
    set((state) => ({
      undoStack: [...state.undoStack, state.canvasObjects],
      redoStack: [],
      canvasObjects: [...state.canvasObjects, object],
    })),
  updateCanvasObject: (id, updates) =>
    set((state) => ({
      undoStack: [...state.undoStack, state.canvasObjects],
      redoStack: [],
      canvasObjects: state.canvasObjects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      ),
    })),
  deleteCanvasObject: (id) =>
    set((state) => ({
      undoStack: [...state.undoStack, state.canvasObjects],
      redoStack: [],
      canvasObjects: state.canvasObjects.filter((obj) => obj.id !== id),
      selectedObjectId: null,
    })),
  selectCanvasObject: (id) => set({ selectedObjectId: id }),
  resetCanvas: () =>
    set({
      canvasObjects: [],
      undoStack: [],
      redoStack: [],
      selectedObjectId: null,
    }),

  // Tools
  selectedTool: "pen",
  setSelectedTool: (tool) => set({ selectedTool: tool }),

  // Selection
  selectedObjectId: null,

  // Undo/Redo
  undoStack: [],
  redoStack: [],
  undo: () => {
    const { undoStack, redoStack, canvasObjects } = get();
    if (undoStack.length === 0) return;

    const prev = undoStack[undoStack.length - 1];
    set({
      canvasObjects: prev,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, canvasObjects],
    });
  },
  redo: () => {
    const { undoStack, redoStack, canvasObjects } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    set({
      canvasObjects: next,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, canvasObjects],
    });
  },
}));
