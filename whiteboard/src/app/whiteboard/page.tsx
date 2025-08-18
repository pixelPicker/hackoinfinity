"use client";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";

const Whiteboard = dynamic(() => import("./whiteboard"), {
  ssr: false,
});
const ToolBar = dynamic(() => import("./toolbar"), {
  ssr: false,
});

export default function App() {
  const [scale, setScale] = useState(1);

  const handleScaleGrow = () => {
    if (scale > 2) return;
    setScale((prev) => parseFloat((prev + 0.1).toFixed(1)));
  };
  const handleScaleShrink = () => {
    if (scale < 0.5) return;
    setScale((prev) => parseFloat((prev - 0.1).toFixed(1)));
  };

  return (
    <main className="w-screen h-screen bg-[#454545] relative">
      {/* <section>Chat</section>
      <section>Room details</section>
      <section>Undo Redo</section> */}
      <Whiteboard
        scale={scale}
        handleScaleGrow={handleScaleGrow}
        handleScaleShrink={handleScaleShrink}
      />
      <ToolBar />
      <WhiteBoardScale
        scale={scale}
        handleScaleGrow={handleScaleGrow}
        handleScaleShrink={handleScaleShrink}
      />
    </main>
  );
}

function WhiteBoardScale({
  scale,
  handleScaleGrow,
  handleScaleShrink,
}: {
  scale: number;
  handleScaleGrow: () => void;
  handleScaleShrink: () => void;
}) {
  return (
    <div className="p-1 bg-Surface rounded-sm absolute bottom-[10px] right-[10px] border-[1px] border-Accent flex items-center gap-4">
      <IconMinus size={16} onClick={handleScaleShrink} />
      <span className="w-7 text-center">{scale}</span>
      <IconPlus size={16} onClick={handleScaleGrow} />
    </div>
  );
}
