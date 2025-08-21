"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import Konva from "konva";
import io, { Socket } from "socket.io-client";
import { User } from "@prisma/client";

type Room = {
  id: string;
  roomCode: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: User;
};
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
  IconUserCircle,
  IconDoor,
  IconChevronDown,
  IconLogin,
  IconLogout,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useWhiteBoardStore } from "./_store/whiteboardStore";
import { useRoomStore } from "./_store/roomStore";
import { useSocketStore } from "./_store/socketStore";

const Whiteboard = dynamic(() => import("./whiteboard"), { ssr: false });
const ToolBar = dynamic(() => import("./toolbar"), { ssr: false });

export default function App() {
  const boardRef = useRef<Konva.Stage>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const { roomCode, setRoomCode, clearRoomCode } = useRoomStore((s) => s);
  const [room, setRoom] = useState(null);

  const [users, setUsers] = useState<User[]>([]);
  const [roomActive, setRoomActive] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  const [joinCode, setJoinCode] = useState("");
  const { connect, disconnect, socket } = useSocketStore((s) => s);

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside dropdown containers
      if (
        !target.closest(".dropdown-container") &&
        !target.closest(".dropdown-menu")
      ) {
        setShowUserDropdown(false);
        setShowRoomDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("created-room", (room) => {
        setRoom(room);
        setRoomCode(room.roomCode);
        setRoomActive(true);
        setUsers(room.participants.map((p: { user: User }) => p.user));
      });

      socket.on("room-users", (userList: User[]) => {
        setUsers(userList);
      });

      socket.on("joined-room", (room) => {
        setRoom(room);
        setRoomActive(true);
        setRoomCode(room.roomCode);
        setShowCreateModal(false);
        setShowJoinModal(false);
      });

      socket.on("room:error", (msg: string) => {});

      socket.on("add-canvas-object", ({ object }) => {
        useWhiteBoardStore.getState().addCanvasObject(object);
      });

      socket.on("update-canvas-object", ({ object }) => {
        useWhiteBoardStore.getState().updateCanvasObject(object.id, object);
      });

      socket.on("delete-canvas-object", ({ id }) => {
        useWhiteBoardStore.getState().deleteCanvasObject(id);
      });

      socket.on("reset-canvas", () => {
        useWhiteBoardStore.getState().resetCanvas();
      });

      socket.on("undo", () => {
        useWhiteBoardStore.getState().undo();
      });

      socket.on("redo", () => {
        useWhiteBoardStore.getState().redo();
      });
    }
    return () => {
      socket?.off("created-room");
      socket?.off("room-users");
      socket?.off("joined-room");
      socket?.off("add-canvas-object");
      socket?.off("update-canvas-object");
      socket?.off("delete-canvas-object");
      socket?.off("reset-canvas");
      socket?.off("undo");
      socket?.off("redo");
      setRoom(null);
      setRoomActive(false);
    };
  }, [socket]);

  const resetState = () => {
    setShowCreateModal(false);
    setShowJoinModal(false);
    setJoinCode("");
    setShowUserDropdown(false);
    setShowRoomDropdown(false);
  };

  const handleCreateRoom = async () => {
    resetState();
    if (!session || !session.user || !session.user.id) {
      router.push("/auth/login");
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    const socket = await connect();
    socket.emit("create-room", {
      roomCode: code,
      userId: session.user?.id,
    });
  };

  const handleJoinRoomClick = () => {
    resetState();
    if (!session || !session.user) return;
    setShowJoinModal(true);
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    if (!session || !session.user || !session.user.id) return;
    e.preventDefault();
    if (joinCode.length !== 6) return;
    const socket = await connect();
    socket.emit("join-room", {
      roomCode: joinCode,
      userId: session.user?.id,
    });
  };

  const handleLeaveRoom = async () => {
    if (roomCode) {
      const socket = await connect();
      socket.emit("leave-room", { roomCode });
    }
    setRoomActive(false);
    setUsers([]);
    setRoomCode("");
  };

  const copyToClipboard = async () => {
    try {
      if (roomCode) await navigator.clipboard.writeText(roomCode);
    } catch {}
  };

  const handleStartRoom = () => {
    router.push(`/whiteboard?room=${roomCode}`);
  };

  return (
    <main className="w-screen h-screen bg-Surface relative">
      {/* Whiteboard + Toolbar */}
      <Whiteboard boardRef={boardRef} />
      <ToolBar boardRef={boardRef} />

      {/* Sidebar (only when inside a room) */}
      {roomActive && (
        <RoomInfoDump
          handleLeaveRoom={handleLeaveRoom}
          resetState={resetState}
          users={users}
        />
      )}
      <div className="absolute top-4 right-4 z-50">
        <div className={dmsans.className}>
          <HeaderButtons
            roomActive={roomActive}
            session={session}
            showUserDropdown={showUserDropdown}
            setShowUserDropdown={setShowUserDropdown}
            showRoomDropdown={showRoomDropdown}
            setShowRoomDropdown={setShowRoomDropdown}
            handleCreateRoom={handleCreateRoom}
            handleJoinRoomClick={handleJoinRoomClick}
            router={router}
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
    </main>
  );
}

function HeaderButtons({
  roomActive,
  session,
  showUserDropdown,
  setShowUserDropdown,
  showRoomDropdown,
  setShowRoomDropdown,
  handleCreateRoom,
  handleJoinRoomClick,
  router,
}: {
  roomActive: boolean;
  session: any;
  showUserDropdown: boolean;
  setShowUserDropdown: (show: boolean) => void;
  showRoomDropdown: boolean;
  setShowRoomDropdown: (show: boolean) => void;
  handleCreateRoom: () => void;
  handleJoinRoomClick: () => void;
  router: any;
}) {
  const { connect } = useSocketStore();
  const { roomCode } = useRoomStore();
  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react");
    await signOut();
    setShowUserDropdown(false);
  };

  const handleLogin = () => {
    router.push("/auth/login");
    setShowUserDropdown(false);
  };
  return (
    <div className="fixed top-[20px] right-[10px] flex gap-4">
      {/* Room Button - Now on the left */}
      <div className="relative dropdown-container">
        {roomActive ? (
          <button
            onClick={async () => {
              const socket = await connect();
              if (roomCode) {
                socket.emit("leave-room", { roomCode });
              }
            }}
            className={clsx(
              "flex items-center gap-2 select-none cursor-pointer transition-all duration-200 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white p-3 shadow-lg rounded-lg font-medium"
            )}
          >
            <IconDoorExit size={20} />
            <span className="text-sm font-medium">Leave</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setShowRoomDropdown(!showRoomDropdown);
              setShowUserDropdown(false);
            }}
            className={clsx(
              "flex items-center gap-2 select-none cursor-pointer transition-all duration-200 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white p-3 shadow-lg rounded-lg font-medium"
            )}
          >
            <IconDoor size={20} />
            <span className="text-sm font-medium">Room</span>
            <IconChevronDown
              size={16}
              className={clsx(
                "transition-transform duration-200",
                showRoomDropdown && "rotate-180"
              )}
            />
          </button>
        )}

        {/* Room Dropdown */}
        {showRoomDropdown && (
          <div className="dropdown-menu absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border-2 border-orange-200 z-50 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => {
                handleCreateRoom();
                setShowRoomDropdown(false);
              }}
              className="w-full rounded-t-xl text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-3 cursor-pointer transition-colors duration-150 font-medium"
            >
              <IconCircleDashedPlus size={18} className="text-orange-500" />
              Create Room
            </button>
            <button
              onClick={() => {
                handleJoinRoomClick();
                setShowRoomDropdown(false);
              }}
              className="w-full rounded-b-xl text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-3 cursor-pointer transition-colors duration-150 font-medium"
            >
              <IconUser size={18} className="text-orange-500" />
              Join Room
            </button>
          </div>
        )}
      </div>

      {/* User Profile Button - Now on the right */}
      <div className="relative dropdown-container">
        <button
          onClick={() => {
            setShowUserDropdown(!showUserDropdown);
            setShowRoomDropdown(false);
          }}
          className={clsx(
            "flex items-center gap-2 select-none cursor-pointer transition-all duration-200 bg-gray-700 hover:bg-gray-800 active:bg-gray-900 text-white p-3 shadow-lg rounded-lg font-medium"
          )}
        >
          <IconUserCircle size={20} />
          <span className="text-sm font-medium">
            {session?.user?.name || "Guest"}
          </span>
          <IconChevronDown
            size={16}
            className={clsx(
              "transition-transform duration-200",
              showUserDropdown && "rotate-180"
            )}
          />
        </button>

        {/* User Dropdown */}
        {showUserDropdown && (
          <div className="dropdown-menu absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border-2 border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
            {session ? (
              <>
                <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-semibold text-gray-900">
                    {session.user?.name}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {session.user?.email}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left rounded-b-xl px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 cursor-pointer transition-colors duration-150 font-medium"
                >
                  <IconLogout size={18} />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full text-left px-4 py-3 text-sm text-orange-600 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-3 cursor-pointer transition-colors duration-150 font-medium"
              >
                <IconLogin size={18} />
                Login
              </button>
            )}
          </div>
        )}
      </div>
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
  roomCode: string | null;
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
  const { roomCode } = useRoomStore((s) => s);
  const router = useRouter();
  return (
    <aside
      className={clsx(
        "absolute mt-[20px] top-0 left-1 z-50 bg-white shadow-lg rounded-lg border border-gray-300 p-2 flex flex-col gap-4 w-64 -translate-x-0 transition-all",
        !isOpen && "!bg-Surface !w-20 shadow-none transition-all border-none"
      )}
    >
      <div className="flex justify-between p-[2px] items-center`">
        <h3 className="text-gray-600">Room Code</h3>
        <span className="ml-auto font-semibold">{roomCode}</span>
      </div>
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
              <span className={spaceGrotesk.className}>{i + 1}.</span>
              <span>{u.name ?? "Anonymous"}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
