"use client";
import {
  IconMinus,
  IconPlayerPlay,
  IconCircleDashedPlus,
  IconUsers,
  IconPlus,
} from "@tabler/icons-react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useWhiteBoardStore } from "./_store/whiteboardStore";
import WhiteBoardScale from "./scale";
import { KonvaNodeComponent, StageProps } from "react-konva";
import { Stage } from "konva/lib/Stage";
import Konva from "konva";
import RoomButtons from "@/components/RoomButtons";

const Whiteboard = dynamic(() => import("./whiteboard"), {
  ssr: false,
});
const ToolBar = dynamic(() => import("./toolbar"), {
  ssr: false,
});

export default function App() {
  const whiteboardRef = useRef<Konva.Stage>(null);

  return (
    <main className="w-screen h-screen bg-Surface relative">
      <div className="absolute top-[-8] right-4 z-50">
        <RoomButtons />
      </div>
      <Whiteboard boardRef={whiteboardRef} />     
      <ToolBar boardRef={whiteboardRef} />
      
      
    </main>
  );
}
