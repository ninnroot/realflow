"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasOptions, init, registerEventListeners } from "./functions";
import Menu from "./menu/menu";
import { useEditorStore } from "./store";

interface EditorProps {
  canvasOptions?: CanvasOptions;
}

const Editor: React.FC<EditorProps> = ({ canvasOptions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setContext, selectedElement } = useEditorStore();

  useEffect(() => {
    if (selectedElement) {
      console.log(selectedElement.id);
    }
  }, [selectedElement?.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      init(canvas, canvasOptions);
      setContext(context!);
    }
  }, []);

  return (
    <div>
      <Menu></Menu>
      <div className="border-2 border-gray-300">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default Editor;
