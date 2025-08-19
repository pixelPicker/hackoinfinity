"use client";

import { IconMinus, IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";
import { useWhiteBoardStore } from "./_store/whiteboardStore";
import WhiteBoardScale from "./scale";
import { KonvaNodeComponent, StageProps } from "react-konva";
import { Stage } from "konva/lib/Stage";
import Konva from "konva";

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
      {/* <section>Chat</section>
      <section>Room details</section>
      */}
      <Whiteboard boardRef={whiteboardRef} />
      <ToolBar boardRef={whiteboardRef} />
      {/* <WhiteBoardScale /> */}
    </main>
  );
}
