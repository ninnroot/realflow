import { defaultCanvasOptions, useEditorStore } from "./store";

export const init = (
  canvas: HTMLCanvasElement,
  options = defaultCanvasOptions,
  parentElement: HTMLElement
) => {
  const { setParentElement } = useEditorStore.getState();
  setParentElement(parentElement);

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
  const { elements, setSelectedElementId, parentElement } =
    useEditorStore.getState();
  const clickedElement = getClickedElement(event);
  if (!clickedElement) {
    setSelectedElementId(null);
    elements.forEach((e) => {
      e.can_render_text = true;
      e.draw();
    });
    return;
  }
  clickedElement.onClick(parentElement!);
  setSelectedElementId(clickedElement.id);
};

export const onMouseDown = (event: MouseEvent) => {
  const { setMouseDownOrigin, elements, setSelectedElementId, drawBackground } =
    useEditorStore.getState();
  const clickedElement = getClickedElement(event);
  // no element clicked at the start of the mouseDown event
  if (!clickedElement) {
    return;
  }
  // only set mouseDownOrigin if at least one element is clicked (selected)
  setMouseDownOrigin({ x: event.offsetX, y: event.offsetY });
  setSelectedElementId(clickedElement.id);
};

export const onMouseMove = (event: MouseEvent) => {
  let isAtLeastOneElementDragged = false;
  const { elements, mouseDownOrigin, drawBackground, setMouseDownOrigin } =
    useEditorStore.getState();
  // if mouseDownOrigin is set, then at least one element is selected
  // meaning, the cursor was on top of an element when the mouseDown event was triggered
  // it doesn't make sense to drag an element if the cursor-drag started outside of an element
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
  const {
    setMouseDownOrigin,
    setSelectedElementId,
    selectedElementId,
    elements,
    drawBackground,
  } = useEditorStore.getState();

  if (selectedElementId !== null) {
    const element = elements.find((e) => e.id === selectedElementId);

    if (element) {
      element.onMouseUp();
    }
  }
  setSelectedElementId(null);
  setMouseDownOrigin(null);
  document.body.style.cursor = "default";
};
