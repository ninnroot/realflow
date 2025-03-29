import { create } from "zustand";

import { BoxElement } from "./elements/box";
import { BaseElement } from "./elements/base";
import { CSSProperties } from "react";

export type ArrowStyle = "direct" | "right-angle" | "curve";

export interface ArrowConnection {
  startElementId: number;
  endElementId: number;
  startBorder: "top" | "bottom" | "left" | "right";
  endBorder: "top" | "bottom" | "left" | "right";
  style: ArrowStyle;
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
  selectedElementIds: number[];
  setSelectedElementId: (id: number | null) => void;
  setSelectedElementIds: (ids: number[]) => void;
  pushElement: (element: ElementType) => void;
  addElement: () => void;
  deleteSelectedElements: () => void;

  mouseDownOrigin: { x: number; y: number } | null;
  setMouseDownOrigin: (origin: { x: number; y: number }|null) => void;

  // Selection rectangle state
  selectionRect: { x: number; y: number; width: number; height: number } | null;
  setSelectionRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;

  drawBackground: () => void;

  // canvas container for positioning input elements
  parentElement: HTMLElement | null;
  setParentElement: (parentElement: HTMLElement) => void;

  // Arrow connections
  arrows: ArrowConnection[];
  addArrow: (arrow: ArrowConnection) => void;
  removeArrow: (startElementId: number, endElementId: number) => void;

  arrowStyle: ArrowStyle;
  setArrowStyle: (style: ArrowStyle) => void;
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
  selectedElementIds: [],
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setSelectedElementIds: (ids) => {
    set((state) => {
      // Update selection state of all elements
      state.elements.forEach(e => {
        e.isSelected = ids.includes(e.id);
      });
      return { selectedElementIds: ids };
    });
  },
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
  deleteSelectedElements: () => {
    set((state) => {
      const selectedIds = state.selectedElementIds;
      // Remove selected elements
      const newElements = state.elements.filter(e => !selectedIds.includes(e.id));
      // Remove arrows connected to selected elements
      const newArrows = state.arrows.filter(
        arrow => !selectedIds.includes(arrow.startElementId) && !selectedIds.includes(arrow.endElementId)
      );
      return {
        elements: newElements,
        arrows: newArrows,
        selectedElementIds: [],
        selectedElementId: null
      };
    });
  },
  selectionRect: null,
  setSelectionRect: (rect) => set({ selectionRect: rect }),

  mouseDownOrigin: null,
  setMouseDownOrigin: (origin) => set({ mouseDownOrigin: origin }),

  drawBackground: () => {
    const state = get();
    state.context!.fillStyle = state.canvasOptions.backgroundColor;
    state.context!.fillRect(0, 0, state.canvasOptions.width, state.canvasOptions.height);
    
    // Draw selection rectangle if it exists
    if (state.selectionRect) {
      state.context!.strokeStyle = "#4F46E5";
      state.context!.lineWidth = 2;
      state.context!.strokeRect(
        state.selectionRect.x,
        state.selectionRect.y,
        state.selectionRect.width,
        state.selectionRect.height
      );
      
      // Fill with semi-transparent color
      state.context!.fillStyle = "rgba(79, 70, 229, 0.1)";
      state.context!.fillRect(
        state.selectionRect.x,
        state.selectionRect.y,
        state.selectionRect.width,
        state.selectionRect.height
      );
    }
    
    // Draw all arrows after clearing the background
    console.log('Drawing background, arrows:', state.arrows);
    state.arrows.forEach(arrow => {
      const startElement = state.elements.find(e => e.id === arrow.startElementId);
      const endElement = state.elements.find(e => e.id === arrow.endElementId);
      
      if (startElement && endElement) {
        const startPoint = startElement.getBorderPoint(arrow.startBorder);
        const endPoint = endElement.getBorderPoint(arrow.endBorder);
        startElement.drawArrow(startPoint, endPoint, arrow.style);
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
      // Check if an arrow already exists between these boxes (in either direction)
      const existingArrow = state.arrows.find(
        existing => 
          (existing.startElementId === arrow.startElementId && existing.endElementId === arrow.endElementId) ||
          (existing.startElementId === arrow.endElementId && existing.endElementId === arrow.startElementId)
      );

      if (existingArrow) {
        console.log('Arrow already exists between these boxes');
        return state; // Return unchanged state if arrow already exists
      }

      const newArrows = [...state.arrows, { ...arrow, style: state.arrowStyle }];
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
  arrowStyle: "direct",
  setArrowStyle: (style) => set((state) => {
    // Update all existing arrows with the new style
    const updatedArrows = state.arrows.map(arrow => ({
      ...arrow,
      style
    }));
    return { 
      arrowStyle: style,
      arrows: updatedArrows
    };
  }),
}));
