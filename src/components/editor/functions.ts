import { useEditorStore } from "./store";

export interface CanvasOptions {
  height: number;
  width: number;
}

export const defaultCanvasOptions: CanvasOptions = {
  height: 480,
  width: 640,
};

export const init = (
  canvas: HTMLCanvasElement,
  options = defaultCanvasOptions
) => {
  canvas.height = options.height;
  canvas.width = options.width;
  registerEventListeners(canvas);
};

export const registerEventListeners = (canvas: HTMLCanvasElement) => {
  canvas.onclick = (e) => onClick(e, canvas);
};

export const onClick = (event: MouseEvent, canvas: HTMLCanvasElement) => {
  const { elements } = useEditorStore.getState();
  for (const e of elements) {
    if (e.isInside(event.offsetX, event.offsetY)) {
      useEditorStore.getState().setSelectedElement(e);
      return;
    }
  }
};
