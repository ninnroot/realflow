import { create } from "zustand";

import { BoxElement } from "./elements/box";
import { BaseElement } from "./elements/base";

type ElementType = BoxElement;

export interface EditorStoreState {
  currentId: number;
  context: CanvasRenderingContext2D | null;
  setContext: (context: CanvasRenderingContext2D) => void;
  elements: ElementType[];
  selectedElement: ElementType | null;
  setSelectedElement: (element: ElementType) => void;
  pushElement: (element: ElementType) => void;
  addElement: () => void;
}

export const useEditorStore = create<EditorStoreState>()((set) => ({
  currentId: 0,
  context: null,
  setContext: (context) => set({ context }),
  elements: [],
  selectedElement: null,
  setSelectedElement: (element) => set({ selectedElement: element }),
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
}));
