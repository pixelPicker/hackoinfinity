// src/pages/api/socket.ts
import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/next";
import { Server as ServerIO } from "socket.io";

type UserInfo = { id: string; name: string; email?: string };

// Room -> socketId -> User
const roomUsers: Record<string, Record<string, UserInfo>> = {};

export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new ServerIO(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: "*" },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      let currentRoom = "";
      let me: UserInfo | null = null;

      socket.on("room:join", ({ room, user }: { room: string; user: UserInfo }) => {
        currentRoom = room.toUpperCase();
        me = user;
        socket.join(currentRoom);

        roomUsers[currentRoom] ??= {};
        roomUsers[currentRoom][socket.id] = user;

        io.to(currentRoom).emit("room:users", Object.values(roomUsers[currentRoom]));
      });

      socket.on("room:leave", () => {
        if (!currentRoom) return;
        if (roomUsers[currentRoom]) {
          delete roomUsers[currentRoom][socket.id];
          io.to(currentRoom).emit("room:users", Object.values(roomUsers[currentRoom]));
        }
        socket.leave(currentRoom);
      });

      // Forward whiteboard events (agar later integrate karna ho)
      socket.on("wb:draw", (payload) => currentRoom && socket.to(currentRoom).emit("wb:draw", payload));
      socket.on("wb:action", (payload) => currentRoom && socket.to(currentRoom).emit("wb:action", payload));

      socket.on("disconnect", () => {
        if (!currentRoom) return;
        if (roomUsers[currentRoom]) {
          delete roomUsers[currentRoom][socket.id];
          io.to(currentRoom).emit("room:users", Object.values(roomUsers[currentRoom]));
        }
      });
    });
  }
  (res as any).end();


}
