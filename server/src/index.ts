// index.ts
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import crypto from "crypto";
import { prisma } from "./prisma.js";
type UserInfo = { id: string; name: string; email?: string };

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
  allowEIO3: true,
});

io.on("connection", (socket) => {
  let currentRoom = "";
  let me: UserInfo | null = null;

  // CREATE ROOM
  socket.on("create-room", async ({ roomCode, userId }) => {
    console.log(1234);
    try {
      let room = await prisma.room.findUnique({
        where: { roomCode },
        include: {
          participants: {
            include: { user: true },
          },
        },
      });

      if (!room) {
        const newRoom = await prisma.room.create({
          data: {
            id: crypto.randomUUID(),
            roomCode,
            createdById: userId,
          },
        });

        await prisma.roomParticipant.create({
          data: {
            id: crypto.randomUUID(),
            roomId: newRoom.id,
            userId,
            joinedAt: new Date(),
          },
        });

        room = await prisma.room.findUnique({
          where: { id: newRoom.id },
          include: {
            participants: {
              include: { user: true },
            },
          },
        });
      } else {
        await prisma.roomParticipant.upsert({
          where: {
            roomId_userId: {
              roomId: room.id,
              userId,
            },
          },
          create: {
            id: crypto.randomUUID(),
            roomId: room.id,
            userId,
            joinedAt: new Date(),
          },
          update: {}, // no-op if already exists
        });

        room = await prisma.room.findUnique({
          where: { id: room.id },
          include: {
            participants: {
              include: { user: true },
            },
          },
        });
      }

      if (!room) throw new Error("failed to create room");

      socket.join(room.roomCode);
      console.log("create room", room.roomCode);

      io.to(room.roomCode).emit("created-room", room);
    } catch (err) {
      console.error("Error creating room:", err);
      socket.emit("room:error", { message: "Failed to create room" });
    }
  });

  // JOIN ROOM
  socket.on("join-room", async ({ roomCode, userId }) => {
    try {
      const room = await prisma.room.findUnique({
        where: { roomCode },
      });
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      await prisma.roomParticipant.upsert({
        where: {
          roomId_userId: { roomId: room.id, userId },
        },
        create: {
          id: crypto.randomUUID(),
          roomId: room.id,
          userId,
          joinedAt: new Date(),
        },
        update: {},
      });

      socket.join(roomCode);

      const participants = await prisma.roomParticipant.findMany({
        where: { roomId: room.id },
        include: { user: true },
      });

      socket.emit("joined-room", room);
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

  // SEND MESSAGE
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
        const room = await prisma.room.findUnique({
          where: { roomCode },
        });
        if (!room) return;

        const newMessage = await prisma.message.create({
          data: {
            id: crypto.randomUUID(),
            roomId: room.id,
            userId,
            content,
            createdAt: new Date(),
          },
          include: { sender: true },
        });

        io.to(roomCode).emit("new-message", newMessage);
      } catch (err) {
        console.error("send-message error", err);
      }
    }
  );

  // LEAVE ROOM
  socket.on("leave-room", async ({ roomCode, userId }) => {
    try {
      const room = await prisma.room.findUnique({
        where: { roomCode },
      });
      if (!room) return;

      await prisma.roomParticipant.deleteMany({
        where: {
          roomId: room.id,
          userId,
        },
      });

      socket.leave(roomCode);

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

  // Whiteboard events
  socket.on("add-canvas-object", ({ room, object }) => {
    console.log({ room, object, event: "add" });
    socket.to(room).emit("add-canvas-object", { object });
  });
  
  socket.on("update-canvas-object", ({ room, object }) => {
    console.log({ room, object, event: "update" });
    socket.to(room).emit("update-canvas-object", { object });
  });
  
  socket.on("delete-canvas-object", ({ room, id }) => {
    console.log({ room, id, event: "delete" });
    socket.to(room).emit("delete-canvas-object", { id });
  });

  socket.on("reset-canvas", ({ roomCode }) => {
    console.log("resetting canvas");
    socket.to(roomCode).emit("reset-canvas");
  });

  socket.on("undo", ({ roomCode }) => {
    console.log("undo canvas");
    socket.to(roomCode).emit("undo");
  });

  socket.on("redo", ({ roomCode }) => {
    console.log("redo canvas");
    socket.to(roomCode).emit("redo");
  });
});

// Express health route
app.get("/", (req, res) => {
  res.send("Socket.io + Express + Prisma server running 🚀");
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
