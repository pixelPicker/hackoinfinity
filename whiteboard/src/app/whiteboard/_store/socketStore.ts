// socketStore.ts
import { create } from "zustand";
import { io, Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  connect: () => Promise<Socket>;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,

  connect: () => {
    return new Promise<Socket>((resolve) => {
      let existing = get().socket;
      if (existing && existing.connected) {
        return resolve(existing);
      }

      const socket = io("http://localhost:8000", {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        set({ socket });
        resolve(socket);
      });

      socket.on("disconnect", (reason) => {
        console.log("⚠️ Socket disconnected:", reason);
        set({ socket: null });
      });
    });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
