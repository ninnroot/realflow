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
  
  // Check if we clicked on a border of an element
  if (clickedElement && clickedElement.proximateBorder) {
    clickedElement.isArrowStart = true;
    const startPoint = clickedElement.getBorderPoint(clickedElement.proximateBorder);
    if (startPoint) {
      clickedElement.arrowStartPoint = startPoint;
      clickedElement.arrowEndPoint = { x: event.offsetX, y: event.offsetY };
    }
    return;
  }

  // Handle normal dragging
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

  // Handle arrow drawing
  const arrowStartElement = elements.find(e => e.isArrowStart);
  if (arrowStartElement) {
    // Reset all elements' nearest state
    elements.forEach(e => {
      e.isNearestElement = false;
      e.proximateBorder = null;
    });

    // Find the nearest element to the cursor
    let nearestElement = null;
    let minDistance = Infinity;
    
    for (const e of elements) {
      if (e.id === arrowStartElement.id) continue;
      
      const centerX = e.x + e.width / 2;
      const centerY = e.y + e.height / 2;
      const distance = Math.sqrt(
        Math.pow(centerX - event.offsetX, 2) +
        Math.pow(centerY - event.offsetY, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestElement = e;
      }
    }

    // Only check borders if we're within a certain distance of the nearest element
    const MIN_DISTANCE_FOR_BORDER_CHECK = 50;
    if (nearestElement && minDistance < MIN_DISTANCE_FOR_BORDER_CHECK) {
      nearestElement.isNearestElement = true;
      nearestElement.checkProximateBorder(event.offsetX, event.offsetY);
      
      if (nearestElement.proximateBorder) {
        // If we're near a border, snap to it
        const endPoint = nearestElement.getBorderPoint(nearestElement.proximateBorder);
        if (endPoint) {
          arrowStartElement.arrowEndPoint = endPoint;
        } else {
          arrowStartElement.arrowEndPoint = { x: event.offsetX, y: event.offsetY };
        }
      } else {
        // Otherwise, follow the cursor
        arrowStartElement.arrowEndPoint = { x: event.offsetX, y: event.offsetY };
      }
    } else {
      // No element nearby or too far, follow the cursor
      arrowStartElement.arrowEndPoint = { x: event.offsetX, y: event.offsetY };
    }

    // Only redraw if we're not already in a redraw cycle
    if (!isAtLeastOneElementDragged) {
      drawBackground();
      elements.forEach(element => element.draw());
    }
    return;
  }

  let nearestElement = null;
  // calculate the nearest element to the mouse cursor
  for (const e of elements) {
    e.isNearestElement = false;
    const centerX = e.x + e.width / 2;
    const centerY = e.y + e.height / 2;
    const distance = Math.sqrt(
      Math.pow(centerX - event.offsetX, 2) +
        Math.pow(centerY - event.offsetY, 2)
    );
    if (!nearestElement || distance < nearestElement.distance) {
      nearestElement = { element: e, distance };
    }
  }
  if (nearestElement?.element) {
    if (nearestElement?.element) {
      nearestElement.element.isNearestElement = true;
      nearestElement.element.checkProximateBorder(event.offsetX, event.offsetY);
    }
  }

  // Handle normal dragging
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
  }
  drawBackground();
  elements.forEach((element) => {
    element.draw();
  });
};

const onMouseUp = (event: MouseEvent, canvas: HTMLCanvasElement) => {
  const {
    setMouseDownOrigin,
    setSelectedElementId,
    selectedElementId,
    elements,
    drawBackground,
    addArrow,
  } = useEditorStore.getState();

  // Handle arrow completion
  const arrowStartElement = elements.find(e => e.isArrowStart);
  const targetElement = getClickedElement(event);
  
  if (arrowStartElement && targetElement && targetElement.proximateBorder) {
    console.log('Creating new arrow connection');
    // Store the permanent arrow connection in the global store
    addArrow({
      startElementId: arrowStartElement.id,
      endElementId: targetElement.id,
      startBorder: arrowStartElement.proximateBorder!,
      endBorder: targetElement.proximateBorder
    });
    arrowStartElement.isArrowStart = false;
    targetElement.isArrowEnd = true;
  } else if (arrowStartElement) {
    // If we didn't end on a valid target, cancel the arrow
    arrowStartElement.isArrowStart = false;
    arrowStartElement.arrowStartPoint = null;
    arrowStartElement.arrowEndPoint = null;
  }

  if (selectedElementId !== null) {
    const element = elements.find((e) => e.id === selectedElementId);
    if (element) {
      element.onMouseUp();
    }
  }
  setSelectedElementId(null);
  setMouseDownOrigin(null);
  document.body.style.cursor = "default";
  
  // Ensure we redraw everything
  drawBackground();
  elements.forEach(element => element.draw());
};
