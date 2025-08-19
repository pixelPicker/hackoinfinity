// src/lib/useRoomSocket.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export type RoomUser = { id: string; name: string; email?: string };

export function useRoomSocket(room?: string, me?: RoomUser) {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket
  useEffect(() => {
    // ensure server side socket route is booted (useful in dev)
    fetch("/api/socket").catch(() => {});
    const s = io({ path: "/api/socket" });
    socketRef.current = s;

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("room:users", (list: RoomUser[]) => setUsers(list));

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Join when ready
  useEffect(() => {
    if (!socketRef.current || !connected || !room || !me) return;
    socketRef.current.emit("room:join", { room: room.toUpperCase(), user: me });
  }, [connected, room, me]);

  const leaveRoom = () => socketRef.current?.emit("room:leave");

  // Optional helpers for whiteboard sync
  const sendDraw = (stroke: any) => socketRef.current?.emit("wb:draw", stroke);
  const onDraw = (cb: (stroke: any) => void) => {
    socketRef.current?.off("wb:draw");
    socketRef.current?.on("wb:draw", cb);
  };
  const sendAction = (action: any) => socketRef.current?.emit("wb:action", action);
  const onAction = (cb: (action: any) => void) => {
    socketRef.current?.off("wb:action");
    socketRef.current?.on("wb:action", cb);
  };

  return { users, connected, leaveRoom, sendDraw, onDraw, sendAction, onAction };
}
