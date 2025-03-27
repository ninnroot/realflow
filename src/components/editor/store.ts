import { create } from "zustand";

import { BoxElement } from "./elements/box";
import { BaseElement } from "./elements/base";
import { CSSProperties } from "react";
export interface CanvasOptions {
  height: number;
  width: number;
  backgroundColor: string;
}

export const defaultCanvasOptions: CanvasOptions = {
  height: 480,
  width: 640,
  backgroundColor: "white",
};

type ElementType = BoxElement;

export interface EditorStoreState {
  currentId: number;
  context: CanvasRenderingContext2D | null;
  setContext: (context: CanvasRenderingContext2D) => void;

  canvasOptions: CanvasOptions;
  setCanvasOptions: (options?: CanvasOptions) => void;

  elements: ElementType[];
  selectedElementId: number | null;
  setSelectedElementId: (id: number | null) => void;
  pushElement: (element: ElementType) => void;
  addElement: () => void;

  mouseDownOrigin: { x: number; y: number } | null;
  setMouseDownOrigin: (origin: { x: number; y: number }|null) => void;

  drawBackground: () => void;
}

export const useEditorStore = create<EditorStoreState>()((set) => ({
  currentId: 0,
  context: null,
  setContext: (context) => set({ context }),

  canvasOptions: defaultCanvasOptions,
  setCanvasOptions: (options = defaultCanvasOptions) =>
    set({ canvasOptions: options }),

  elements: [],
  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  pushElement: (element) =>
    // add at the first position
    set((state) => ({
      elements: [element, ...state.elements],
      currentId: state.currentId + 1,
    })),
  addElement: () => {
    const state = useEditorStore.getState();
    const element = new BoxElement(state.currentId, state.context!);
    state.pushElement(element);
    element.draw();
  },

  mouseDownOrigin: null,
  setMouseDownOrigin: (origin) => set({ mouseDownOrigin: origin }),
  drawBackground: () => {
    const state = useEditorStore.getState();
    state.context!.fillStyle = state.canvasOptions.backgroundColor;
    state.context!.fillRect(0, 0, state.canvasOptions.width, state.canvasOptions.height);
  }
}));
