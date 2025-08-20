// src/pages/api/socket.ts
import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/next";
import { Server as ServerIO } from "socket.io";
import { prisma } from "@/lib/prisma";

type UserInfo = { id: string; name: string; email?: string };

// Room -> socketId -> User
const roomUsers: Record<string, Record<string, UserInfo>> = {};

export const config = { api: { bodyParser: false } };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    const io = new ServerIO(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: "*" },
    });
    res.socket.server.io = io;

    io.engine.on("connection_error", (err) => {
      console.log(err.req); // the request object
      console.log(err.code); // the error code, for example 1
      console.log(err.message); // the error message, for example "Session ID unknown"
      console.log(err.context); // some additional error context
    });

    io.on("connection", (socket) => {
      let currentRoom = "";
      let me: UserInfo | null = null;

      socket.on("create-room", async ({ roomCode, userId }) => {
        try {
          let room = await prisma.room.findUnique({
            where: { roomCode },
          });

          if (!room) {
            room = await prisma.room.create({
              data: {
                roomCode,
                createdById: userId,
                participants: {
                  create: { userId },
                },
              },
              include: {
                participants: { include: { user: true } },
              },
            });
          } else {
            await prisma.roomParticipant.upsert({
              where: { roomId_userId: { roomId: room.id, userId } },
              update: {},
              create: { roomId: room.id, userId },
            });

            room = await prisma.room.findUnique({
              where: { id: room.id },
              include: {
                participants: { include: { user: true } },
              },
            });
          }
          if (!room) {
            throw new Error("failed to create room");
          }

          socket.join(room.roomCode);
          io.to(room.roomCode).emit("created-room", room);
        } catch (err) {
          console.error("Error creating room:", err);
          socket.emit("room:error", { message: "Failed to create room" });
        }
      });

      socket.on("join-room", async ({ roomCode, userId }) => {
        try {
          const room = await prisma.room.findUnique({
            where: { roomCode },
          });

          if (!room) {
            socket.emit("error", "Room not found");
            return;
          }

          // ensure participant exists
          await prisma.roomParticipant.upsert({
            where: { roomId_userId: { roomId: room.id, userId } },
            create: { roomId: room.id, userId },
            update: {},
          });

          socket.join(roomCode);

          // fetch updated participants
          const participants = await prisma.roomParticipant.findMany({
            where: { roomId: room.id },
            include: { user: true },
          });

          socket.emit("joined-room", roomCode);

          io.to(roomCode).emit(
            "room-users",
            participants.map((p) => p.user)
          );

          console.log(`User ${userId} joined room ${roomCode}`);
        } catch (err) {
          console.error("join-room error", err);
          socket.emit("error", "Failed to join room");
        }
      });

      socket.on(
        "send-message",
        async ({
          roomCode,
          userId,
          content,
        }: {
          roomCode: string;
          userId: string;
          content: string;
        }) => {
          try {
            const room = await prisma.room.findUnique({ where: { roomCode } });
            if (!room) return;

            const message = await prisma.message.create({
              data: {
                roomId: room.id,
                userId,
                content,
                createdAt: Date.toString(),
              },
              include: { sender: true },
            });

            io.to(roomCode).emit("new-message", message);
          } catch (err) {
            console.error("send-message error", err);
          }
        }
      );

      socket.on("leave-room", async ({ roomCode, userId }) => {
        try {
          const room = await prisma.room.findUnique({
            where: { roomCode },
          });
          if (!room) return;

          // remove participant from DB
          await prisma.roomParticipant.deleteMany({
            where: {
              roomId: room.id,
              userId,
            },
          });

          socket.leave(roomCode);

          // fetch updated participants
          const participants = await prisma.roomParticipant.findMany({
            where: { roomId: room.id },
            include: { user: true },
          });

          io.to(roomCode).emit(
            "room-users",
            participants.map((p) => p.user)
          );

          console.log(`User ${userId} left room ${roomCode}`);
        } catch (err) {
          console.error("room:leave error", err);
        }
      });

      // Forward whiteboard events (agar later integrate karna ho)
      socket.on(
        "wb:draw",
        (payload) =>
          currentRoom && socket.to(currentRoom).emit("wb:draw", payload)
      );
      socket.on(
        "wb:action",
        (payload) =>
          currentRoom && socket.to(currentRoom).emit("wb:action", payload)
      );
    });
  }
  (res as any).end();
}
