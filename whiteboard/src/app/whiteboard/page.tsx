"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import io, { Socket } from "socket.io-client";
import { Room, User } from "@prisma/client";
import { dmsans, spaceGrotesk } from "../ui/fonts";
import { useSession } from "next-auth/react";
import {
  IconCircleDashedPlus,
  IconCopy,
  IconDoorExit,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

const Whiteboard = dynamic(() => import("./whiteboard"), { ssr: false });
const ToolBar = dynamic(() => import("./toolbar"), { ssr: false });

let socket: Socket | null = null;

export default function App() {
  const whiteboardRef = useRef<Konva.Stage>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState(null);

  const [users, setUsers] = useState<User[]>([]);
  const [roomActive, setRoomActive] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    if (!socket) {
      console.log("connecting socket");
      socket = io("http://localhost:8000", {
        transports: ["polling", "websocket"], // polling first, then websocket
        upgrade: true,
      });
    }
    socket.on("connect_error", (err) => {
      console.log(err.message);
    });

    socket.on("created-room", (room) => {
      console.log("Room created:", room);
      setRoom(room);
      setRoomActive(true);
      // setUsers(room.participants.map((p: { user: User }) => p.user));
    });

    socket.on("room-users", (userList: User[]) => {
      setUsers(userList);
    });

    socket.on("joined-room", (room) => {
      console.log("Room joined", room);
      setRoom(room);
      setRoomActive(true);
      setShowCreateModal(false);
      setShowJoinModal(false);
    });

    socket.on("room:error", (msg: string) => {});

    return () => {
      if (socket) socket.disconnect();
      socket?.off("room:users");
      socket?.off("joined-room");
      setRoom(null);
      setRoomActive(false);
      // socket?.off("room:error");
    };
  }, []);

  

  const resetState = () => {
    setShowCreateModal(false);
    setShowJoinModal(false);
    setJoinCode("");
  };

  const handleCreateRoom = () => {
    resetState();
    if (!session || !session.user || !session.user.email) {
      console.log("No habla inges?", session);
      router.push("/auth/login");
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log("Room creation request");

    socket?.emit("create-room", { roomCode: code, userId: session.user.id });
  };

  const handleJoinRoomClick = () => {
    resetState();
    if (!session || !session.user) return;
    setShowJoinModal(true);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    if (!session || !session.user || !session.user.email) return;
    e.preventDefault();
    if (joinCode.length !== 6) return;
    socket?.emit("join-room", { roomCode: joinCode, userId: session.user.id });
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit("leave-room", { roomCode });
    }
    setRoomActive(false);
    setUsers([]);
    setRoomCode("");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {}
  };

  const handleStartRoom = () => {
    router.push(`/whiteboard?room=${roomCode}`);
  };

  return (
    <main className="w-screen h-screen bg-Surface relative">
      {/* Whiteboard + Toolbar */}
      <Whiteboard boardRef={whiteboardRef} />
      <ToolBar boardRef={whiteboardRef} />

      {/* Sidebar (only when inside a room) */}
      {roomActive && (
        <RoomInfoDump
          handleLeaveRoom={handleLeaveRoom}
          resetState={resetState}
          users={users}
        />
      )}
      {!roomActive && (
        <div className="absolute top-4 right-4 z-50">
          <div className={dmsans.className}>
            <RoomButtons
              handleCreateRoom={handleCreateRoom}
              handleJoinRoomClick={handleJoinRoomClick}
            />

            {showCreateModal && (
              <CreateRoomModal
                copyToClipBoard={copyToClipboard}
                handleStartRoom={handleStartRoom}
                resetState={resetState}
                roomCode={roomCode}
              />
            )}

            {showJoinModal && (
              <ShowJoinRoomModal
                handleJoinRoom={(e: React.FormEvent<Element>) =>
                  handleJoinRoom(e)
                }
                joinCode={joinCode}
                resetState={resetState}
                setJoinCode={setJoinCode}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function RoomButtons({
  handleCreateRoom,
  handleJoinRoomClick,
}: {
  handleCreateRoom: () => void;
  handleJoinRoomClick: () => void;
}) {
  return (
    <div className="fixed top-[20px] right-[10px] flex gap-4">
      <button
        onClick={handleCreateRoom}
        className={clsx(
          "flex items-center gap-2 select-none cursor-pointer transition-transform duration-200 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white p-3 shadow-lg rounded-lg",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        Create a room <IconCircleDashedPlus />
      </button>

      <button
        onClick={handleJoinRoomClick}
        className={clsx(
          "cursor-pointer transition-transform duration-200 bg-gray-600 text-white p-3 rounded-lg shadow-lg",
          "flex items-center gap-2 select-none"
        )}
      >
        Join a room <IconUser />
      </button>
    </div>
  );
}

function CreateRoomModal({
  resetState,
  handleStartRoom,
  copyToClipBoard,
  roomCode,
}: {
  resetState: () => void;
  handleStartRoom: () => void;
  copyToClipBoard: () => void;
  roomCode: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative border-4 border-Accent">
        <button
          onClick={resetState}
          className="absolute top-4 right-4 text-Secondary-Text hover:text-Primary-Text"
        >
          <IconX size={20} />
        </button>
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-Accent rounded-full flex items-center justify-center mb-4">
              <IconCircleDashedPlus className="text-2xl text-Primary-Text" />
            </div>
            <h2 className="text-2xl font-bold text-Primary-Text mb-2">
              Room Created!
            </h2>
            <p className="text-Secondary-Text">
              Share this code with others to join your room
            </p>
          </div>
          <div className="bg-Surface rounded-2xl p-6 mb-6 border-2 border-Accent">
            <div className="text-3xl font-mono font-bold text-Primary-Text mb-3 tracking-wider">
              {roomCode}
            </div>
            <button
              onClick={copyToClipBoard}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-Accent text-Primary-Text rounded-2xl hover:bg-Accent-Dark transition-colors font-medium"
            >
              <IconCopy size={16} />
              Copy Code
            </button>
          </div>
          <button
            onClick={handleStartRoom}
            className="w-full px-6 py-3 bg-Accent text-Primary-Text rounded-2xl hover:bg-Accent-Dark transition-colors font-medium border-3 border-Accent"
          >
            Enter Room
          </button>
        </div>
      </div>
    </div>
  );
}

function ShowJoinRoomModal({
  joinCode,
  handleJoinRoom,
  resetState,
  setJoinCode,
}: {
  joinCode: string;
  handleJoinRoom: (e: React.FormEvent<Element>) => void;
  resetState: () => void;
  setJoinCode: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative border-4 border-Accent">
        <button
          onClick={resetState}
          className="absolute top-4 right-4 text-Secondary-Text hover:text-Primary-Text"
        >
          <IconX size={20} />
        </button>
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-Acborder-Accent rounded-full flex items-center justify-center mb-4">
              <IconUsers className="text-2xl text-Primary-Text" />
            </div>
            <h2 className="text-2xl font-bold text-Primary-Text mb-2">
              Join a Room
            </h2>
            <p className="text-Secondary-Text">
              Enter the 6-digit room code to join
            </p>
          </div>
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <input
                type="text"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                }
                placeholder="Enter room code"
                className="w-full px-4 py-3 text-center text-2xl font-mono font-bold tracking-wider border-3 border-Accent rounded-2xl focus:outline-none focus:ring-4 focus:ring-Acborder-Accent bg-white text-Primary-Text"
                maxLength={6}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetState}
                className="flex-1 px-6 py-3 border-3 border-Accent text-Primary-Text rounded-2xl hover:bg-Surface transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-Acborder-Accent text-Primary-Text rounded-2xl hover:bg-Accent-Dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function RoomInfoDump({
  handleLeaveRoom,
  resetState,
  users,
}: {
  resetState: () => void;
  handleLeaveRoom: () => void;
  users: User[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  const router = useRouter();
  return (
    <aside
      className={clsx(
        "absolute h-[calc(100vh-30px)] mt-[20px] top-0 left-1 z-50 bg-white shadow-lg rounded-lg border border-gray-300 p-2 flex flex-col gap-4 w-64 -translate-x-0 transition-all",
        !isOpen && "!bg-Surface !w-20 shadow-none transition-all border-none"
      )}
    >
      <div className="flex-1 p-[2px]">
        <div className="flex justify-between w-full items-center mb-2">
          <h3 className={clsx("font-medium text-lg", !isOpen && "hidden")}>
            Participants
          </h3>

          {isOpen ? (
            <IconLayoutSidebarLeftCollapse
              onClick={() => setIsOpen((prev) => !prev)}
            />
          ) : (
            <IconLayoutSidebarLeftExpand
              className="mx-auto"
              onClick={() => setIsOpen((prev) => !prev)}
            />
          )}
        </div>
        <hr className={clsx(!isOpen && "hidden")} />
        <ul className={clsx(!isOpen && "hidden", "text-gray-700 m-2")}>
          {users.map((u, i) => (
            <li key={u.id} className="mb-1 flex gap-2">
              <span className={spaceGrotesk.className }>{i}.</span>
              <span>{u.name ?? "Anonymous"}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleLeaveRoom}
        className={
          "py-3 cursor-pointer bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition flex items-center gap-2 justify-center"
        }
      >
        {isOpen && "Leave Room"}
        <IconDoorExit size={20} />
      </button>
    </aside>
  );
}
