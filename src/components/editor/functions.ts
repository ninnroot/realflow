import { defaultCanvasOptions, useEditorStore } from "./store";

export const init = (
  canvas: HTMLCanvasElement,
  options = defaultCanvasOptions
) => {
  canvas.height = options.height;
  canvas.width = options.width;
  registerEventListeners(canvas);
};

export const registerEventListeners = (canvas: HTMLCanvasElement) => {
  canvas.onclick = (e) => onClick(e);
  canvas.onmousedown = (e) => onMouseDown(e);
  canvas.onmousemove = (e) => onMouseMove(e);
  canvas.onmouseup = (e) => onMouseUp(e, canvas);
};

const getClickedElement = (event: MouseEvent) => {
  const { elements } = useEditorStore.getState();
  for (const e of elements) {
    if (e.isInside(event.offsetX, event.offsetY)) {
      return e;
    }
  }
  return null;
};

export const onClick = (event: MouseEvent) => {
  const { elements, setSelectedElementId } = useEditorStore.getState();
  const clickedElement = getClickedElement(event);
  if (!clickedElement) {
    setSelectedElementId(null);
    return;
  }
  setSelectedElementId(clickedElement.id);
};

export const onMouseDown = (event: MouseEvent) => {
  const { setMouseDownOrigin, elements, setSelectedElementId } =
    useEditorStore.getState();
  const clickedElement = getClickedElement(event);
  if (!clickedElement) {
    return;
  }
  setMouseDownOrigin({ x: event.offsetX, y: event.offsetY });
  setSelectedElementId(clickedElement.id);
};

export const onMouseMove = (event: MouseEvent) => {
  let isAtLeastOneElementDragged = false;
  const { elements, mouseDownOrigin, drawBackground, setMouseDownOrigin } =
    useEditorStore.getState();
  if (mouseDownOrigin) {
    for (const e of elements) {
      if (e.isInside(event.offsetX, event.offsetY)) {
        e.onDrag(
          event.offsetX,
          event.offsetY,
          mouseDownOrigin.x,
          mouseDownOrigin.y
        );
        document.body.style.cursor = "move";

        isAtLeastOneElementDragged = true;
      }
      if (isAtLeastOneElementDragged) {
        break;
      }
    }
    setMouseDownOrigin({
      x: event.offsetX,
      y: event.offsetY,
    });

    drawBackground();
    elements.forEach((element) => {
      element.draw();
    });
  }
};

const onMouseUp = (event: MouseEvent, canvas: HTMLCanvasElement) => {
  const { setMouseDownOrigin, setSelectedElementId } =
    useEditorStore.getState();
  //   canvas.onmousemove = null;
  setSelectedElementId(null);
  setMouseDownOrigin(null);
  document.body.style.cursor = "default";
};
