"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import io, { Socket } from "socket.io-client";
import { useRouter, useSearchParams } from "next/navigation";
import RoomButtons from "@/components/RoomButtons";

const Whiteboard = dynamic(() => import("./whiteboard"), { ssr: false });
const ToolBar = dynamic(() => import("./toolbar"), { ssr: false });

interface User {
  id: string;
  name: string;
}

let socket: Socket | null = null;

export default function App() {
  const whiteboardRef = useRef<Konva.Stage>(null);
  const params = useSearchParams();
  const room = params?.get("room")?.toUpperCase() || "";
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!room) return;

    if (!socket) {
      socket = io({
        path: "/api/socket",
      });
    }

    socket.emit("room:join", { roomCode: room });

    socket.on("room:users", (userList: User[]) => {
      setUsers(userList);
    });

    return () => {
      if (socket) {
        socket.emit("room:leave", { roomCode: room });
        socket.off("room:users");
      }
    };
  }, [room]);

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit("room:leave", { roomCode: room });
    }
    router.push("/"); // back to homepage
  };

  return (
    <main className="w-screen h-screen bg-Surface relative">
      {/* Show Create/Join buttons only if not inside a room */}
      {!room && (
        <div className="absolute top-4 right-4 z-50">
          <RoomButtons />
        </div>
      )}

      {/* Whiteboard and tools */}
      <Whiteboard boardRef={whiteboardRef} />
      <ToolBar boardRef={whiteboardRef} />

      {/* Sidebar visible only inside room */}
      {room && (
        <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 m-[10px]">
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Leave Room
          </button>

          <div className="mt-4 bg-white p-3 rounded-lg shadow-md w-48">
            <h3 className="font-semibold mb-2">Participants</h3>
            <ul className="text-sm text-gray-700">
              {users.map((u) => (
                <li key={u.id} className="mb-1">
                  {u.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
