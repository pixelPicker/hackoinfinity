import { create } from "zustand";

interface RoomState {
  roomCode: string | null;
  setRoomCode: (code: string) => void;
  clearRoomCode: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomCode: null,
  setRoomCode: (code) => set({ roomCode: code }),
  clearRoomCode: () => set({ roomCode: null }),
}));
