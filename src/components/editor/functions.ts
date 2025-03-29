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
  const { setMouseDownOrigin, elements, setSelectedElementId, drawBackground, setSelectionRect, setSelectedElementIds, selectedElementIds } =
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
    // Start selection rectangle
    setSelectionRect({ x: event.offsetX, y: event.offsetY, width: 0, height: 0 });
    setSelectedElementIds([]); // Clear previous selection
    return;
  }

  // If clicking an unselected element without shift, clear other selections
  if (!event.shiftKey && !selectedElementIds.includes(clickedElement.id)) {
    setSelectedElementIds([clickedElement.id]);
  }
  // If clicking with shift, toggle the element's selection
  else if (event.shiftKey) {
    if (selectedElementIds.includes(clickedElement.id)) {
      setSelectedElementIds(selectedElementIds.filter(id => id !== clickedElement.id));
    } else {
      setSelectedElementIds([...selectedElementIds, clickedElement.id]);
    }
  }
  // If clicking an already selected element, maintain the selection
  else if (selectedElementIds.includes(clickedElement.id)) {
    // Do nothing, keep the current selection
  }

  setMouseDownOrigin({ x: event.offsetX, y: event.offsetY });
  setSelectedElementId(clickedElement.id);
};

export const onMouseMove = (event: MouseEvent) => {
  let isAtLeastOneElementDragged = false;
  const { elements, mouseDownOrigin, drawBackground, setMouseDownOrigin, selectionRect, setSelectionRect, setSelectedElementIds, selectedElementIds } =
    useEditorStore.getState();

  // Reset all elements' nearest state
  elements.forEach(e => {
    e.isNearestElement = false;
    e.proximateBorder = null;
  });

  // Handle arrow drawing
  const arrowStartElement = elements.find(e => e.isArrowStart);

  // Handle selection rectangle
  if (selectionRect && !mouseDownOrigin) {
    const width = event.offsetX - selectionRect.x;
    const height = event.offsetY - selectionRect.y;
    setSelectionRect({ ...selectionRect, width, height });

    // Select elements within the rectangle
    const selectedIds = elements
      .filter(e => {
        const elementRight = e.x + e.width;
        const elementBottom = e.y + e.height;
        const rectRight = selectionRect.x + (width > 0 ? width : 0);
        const rectBottom = selectionRect.y + (height > 0 ? height : 0);
        const rectLeft = width > 0 ? selectionRect.x : selectionRect.x + width;
        const rectTop = height > 0 ? selectionRect.y : selectionRect.y + height;

        return !(elementRight < rectLeft || 
                e.x > rectRight || 
                elementBottom < rectTop || 
                e.y > rectBottom);
      })
      .map(e => e.id);

    setSelectedElementIds(selectedIds);
    drawBackground();
    elements.forEach(element => element.draw());
    return;
  }

  // Find the nearest element to the cursor for border highlighting
  if (!mouseDownOrigin && !arrowStartElement) {
    let nearestElement = null;
    let minDistance = Infinity;
    
    for (const e of elements) {
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
    }
  }

  if (arrowStartElement) {
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

    drawBackground();
    elements.forEach(element => element.draw());
    return;
  }

  // Handle normal dragging
  if (mouseDownOrigin) {
    const clickedElement = getClickedElement({
      offsetX: mouseDownOrigin.x,
      offsetY: mouseDownOrigin.y
    } as MouseEvent);
    
    // If we're dragging a selected element, move all selected elements
    if (clickedElement && selectedElementIds.includes(clickedElement.id)) {
      const deltaX = event.offsetX - mouseDownOrigin.x;
      const deltaY = event.offsetY - mouseDownOrigin.y;

      elements.forEach(element => {
        if (selectedElementIds.includes(element.id)) {
          element.onDrag(deltaX, deltaY);
          isAtLeastOneElementDragged = true;
        }
      });

      document.body.style.cursor = "move";
    }
    // If we're dragging an unselected element, just move that one
    else if (clickedElement) {
      const deltaX = event.offsetX - mouseDownOrigin.x;
      const deltaY = event.offsetY - mouseDownOrigin.y;
      clickedElement.onDrag(deltaX, deltaY);
      document.body.style.cursor = "move";
      isAtLeastOneElementDragged = true;
    }

    setMouseDownOrigin({
      x: event.offsetX,
      y: event.offsetY,
    });
  }

  // Always redraw to ensure border highlights are shown
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
    setSelectionRect,
    selectionRect,
  } = useEditorStore.getState();

  // Clear selection rectangle
  if (selectionRect) {
    setSelectionRect(null);
  }

  // Handle arrow completion
  const arrowStartElement = elements.find(e => e.isArrowStart);
  const targetElement = getClickedElement(event);
  
  if (arrowStartElement && targetElement && targetElement.proximateBorder) {
    console.log('Creating new arrow connection');
    addArrow({
      startElementId: arrowStartElement.id,
      endElementId: targetElement.id,
      startBorder: arrowStartElement.proximateBorder!,
      endBorder: targetElement.proximateBorder,
      style: useEditorStore.getState().arrowStyle
    });
    arrowStartElement.isArrowStart = false;
    targetElement.isArrowEnd = true;
  } else if (arrowStartElement) {
    arrowStartElement.isArrowStart = false;
    arrowStartElement.arrowStartPoint = null;
    arrowStartElement.arrowEndPoint = null;
  }

  // Ensure all elements' input fields are cleaned up
  elements.forEach(element => {
    element.onMouseUp();
  });

  if (selectedElementId !== null) {
    const element = elements.find((e) => e.id === selectedElementId);
    if (element) {
      element.onMouseUp();
    }
  }
  setSelectedElementId(null);
  setMouseDownOrigin(null);
  document.body.style.cursor = "default";
  
  drawBackground();
  elements.forEach(element => element.draw());
};
