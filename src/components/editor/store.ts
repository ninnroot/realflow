import { create } from "zustand";

import { BoxElement } from "./elements/box";
import { BaseElement } from "./elements/base";
import { CSSProperties } from "react";

export interface ArrowConnection {
  startElementId: number;
  endElementId: number;
  startBorder: "top" | "bottom" | "left" | "right";
  endBorder: "top" | "bottom" | "left" | "right";
}

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

  // canvas container for positioning input elements
  parentElement: HTMLElement | null;
  setParentElement: (parentElement: HTMLElement) => void;

  // Arrow connections
  arrows: ArrowConnection[];
  addArrow: (arrow: ArrowConnection) => void;
  removeArrow: (startElementId: number, endElementId: number) => void;
}

export const useEditorStore = create<EditorStoreState>()((set, get) => ({
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
    const element = new BoxElement(state.currentId, state.context!, state.drawBackground, () => {
      state.elements.forEach((e) => {
        e.draw()
      })
    });
    state.pushElement(element);
    element.draw();
  },

  mouseDownOrigin: null,
  setMouseDownOrigin: (origin) => set({ mouseDownOrigin: origin }),

  drawBackground: () => {
    const state = get();
    state.context!.fillStyle = state.canvasOptions.backgroundColor;
    state.context!.fillRect(0, 0, state.canvasOptions.width, state.canvasOptions.height);
    
    // Draw all arrows after clearing the background
    console.log('Drawing background, arrows:', state.arrows);
    state.arrows.forEach(arrow => {
      const startElement = state.elements.find(e => e.id === arrow.startElementId);
      const endElement = state.elements.find(e => e.id === arrow.endElementId);
      
      if (startElement && endElement) {
        const startPoint = startElement.getBorderPoint(arrow.startBorder);
        const endPoint = endElement.getBorderPoint(arrow.endBorder);
        startElement.drawArrow(startPoint, endPoint);
      }
    });
  },
  parentElement: null,
  setParentElement: (parentElement) => set({ parentElement }),

  // Arrow connections
  arrows: [],
  addArrow: (arrow) => {
    console.log('Adding arrow:', arrow);
    set((state) => {
      const newArrows = [...state.arrows, arrow];
      console.log('New arrows state:', newArrows);
      return { arrows: newArrows };
    });
  },
  removeArrow: (startElementId, endElementId) => {
    console.log('Removing arrow:', startElementId, endElementId);
    set((state) => {
      const newArrows = state.arrows.filter(
        arrow => !(arrow.startElementId === startElementId && arrow.endElementId === endElementId)
      );
      console.log('New arrows state:', newArrows);
      return { arrows: newArrows };
    });
  },
}));
