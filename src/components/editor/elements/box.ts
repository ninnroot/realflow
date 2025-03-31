import { defaultStyles, Styles } from "../styles";
import { BaseElement } from "./base";
import { useEditorStore } from "../store";
import { ArrowStyle } from "../store";

export class BoxElement extends BaseElement {
  width: number = 0;
  height: number = 0;
  styles: Styles = defaultStyles;
  input: HTMLTextAreaElement | null = null;
  text: string = "";
  TEXT_PADDING_X = 10;
  TEXT_PADDING_Y = 10;
  INPUT_WIDTH = 80;
  INPUT_HEIGHT = 20;
  INPUT_TOP = 0;
  can_render_text = true;
  redrawAllElements: () => void;
  proximateBorder: null | "top" | "bottom" | "left" | "right" = null;
  isNearestElement = false;
  isArrowStart = false;
  isArrowEnd = false;
  arrowStartPoint: { x: number; y: number } | null = null;
  arrowEndPoint: { x: number; y: number } | null = null;
  isSelected: boolean = false;

  constructor(
    id: number,
    context: CanvasRenderingContext2D,
    drawBackground: () => void,
    afterHandleInput: () => void,
    x: number = 0,
    y: number = 0,
    width: number = 100,
    height: number = 100,
    styles: Styles = defaultStyles,
    initialText: string = ""
  ) {
    super(id, context, x, y, drawBackground);
    this.width = width;
    this.height = height;
    this.redrawAllElements = afterHandleInput;
    this.styles = styles;
    this.text = initialText;
  }
  isInside(mouseX: number, mouseY: number) {
    return (
      mouseX > this.x &&
      mouseX < this.x + this.width &&
      mouseY > this.y &&
      mouseY < this.y + this.height
    );
  }

  handleInput = (e: Event) => {
    // set the context style
    this.context.font = `${this.styles.fontStyle} ${this.styles.fontWeight} ${this.styles.fontSize}px ${this.styles.fontFamily}`;

    // calculate text properties
    const newText = (e.target as HTMLInputElement).value;
    const longestLine = newText.split("\n").reduce((a, b) => {
      return a.length > b.length ? a : b;
    });
    const textProps = this.context.measureText(longestLine);
    const lineCount = newText.split("\n").length;
    const longestLineLength = textProps.width;
    const totalLineHeight = lineCount * 1.2 * (this.styles.fontSize as number);

    if (totalLineHeight > this.height - this.TEXT_PADDING_X * 2) {
      this.height = totalLineHeight + this.TEXT_PADDING_X * 2;
    }
    if (longestLineLength > this.width - this.TEXT_PADDING_X * 2) {
      this.width = longestLineLength + this.TEXT_PADDING_X * 2;
    }
    console.log(this.width, this.height);

    // Update text through the store to sync across tabs
    useEditorStore.getState().updateElementText(this.id, newText);
    this.redrawAllElements();

    this.INPUT_WIDTH = this.width - this.TEXT_PADDING_X * 2;
    this.INPUT_HEIGHT = totalLineHeight;

    if (this.input) {
      this.input.style.width = this.INPUT_WIDTH + "px";
      this.input.style.height = this.INPUT_HEIGHT + "px";
      this.input.style.top =
        this.y + (this.height / 2 - this.INPUT_HEIGHT / 2) + "px";
      this.input.style.left =
        this.x + (this.width / 2 - this.INPUT_WIDTH / 2) + "px";
    }
    this.INPUT_TOP = this.y + (this.height / 2 - this.INPUT_HEIGHT / 2);
  };

  checkProximateBorder(mouseX: number, mouseY: number) {
    if (!this.isNearestElement) {
      this.proximateBorder = null;
      return;
    }

    const borderDistance = 10;
    const isNearLeft = mouseX < this.x + borderDistance && mouseX > this.x;
    const isNearRight = mouseX > this.x + this.width - borderDistance && mouseX < this.x + this.width;
    const isNearTop = mouseY < this.y + borderDistance && mouseY > this.y;
    const isNearBottom = mouseY > this.y + this.height - borderDistance && mouseY < this.y + this.height;

    // If we're near multiple borders, choose the closest one
    if (isNearLeft || isNearRight || isNearTop || isNearBottom) {
      const distances = {
        left: isNearLeft ? mouseX - this.x : Infinity,
        right: isNearRight ? this.x + this.width - mouseX : Infinity,
        top: isNearTop ? mouseY - this.y : Infinity,
        bottom: isNearBottom ? this.y + this.height - mouseY : Infinity
      };

      const closestBorder = Object.entries(distances).reduce((a, b) => 
        a[1] < b[1] ? a : b
      );

      if (closestBorder[1] <= borderDistance) {
        this.proximateBorder = closestBorder[0] as "top" | "bottom" | "left" | "right";
      } else {
        this.proximateBorder = null;
      }
    } else {
      this.proximateBorder = null;
    }
  }

  renderInput(parentElement: HTMLElement) {
    this.can_render_text = false;
    this.draw();
    this.redrawAllElements();
    this.input = document.createElement("textarea");
    this.input.value = this.text;
    this.input.style.border = "none";
    this.input.style.outline = "none";
    this.input.onkeyup = this.handleInput;
    this.input.id = `input-${this.id}`;
    this.input.style.resize = "none";
    this.input.style.scrollbarWidth = "none";
    this.input.style.lineHeight = "1.2px";
    this.input.wrap = "off";
    this.input.style.font = `${this.styles.fontStyle} ${this.styles.fontWeight} ${this.styles.fontSize}px ${this.styles.fontFamily}`;

    this.input.style.position = "absolute";
    this.input.style.textAlign = "center";

    this.input.style.left =
      this.x + (this.width / 2 - this.INPUT_WIDTH / 2) + "px";
    this.input.style.height = this.INPUT_HEIGHT + "px";
    this.input.style.top =
      this.y + (this.height / 2 - this.INPUT_HEIGHT / 2) + "px";
    this.input.style.width = this.width - this.TEXT_PADDING_X * 2 + "px";
    parentElement.appendChild(this.input);
    this.input.focus();
  }

  onClick(parentElement: HTMLElement): void {
    this.renderInput(parentElement);
  }
  onMouseUp(): void {
    // remove input element on mouse up
    if (this.input) {
      this.input.remove();
      this.input = null;
    }
    this.can_render_text = true;
  }
  onMouseMove(
    offsetX: number,
    offsetY: number,
    originX: number,
    originY: number
  ): void {
    if (this.isInside(offsetX, offsetY)) {
      const deltaX = offsetX - originX;
      const deltaY = offsetY - originY;
      this.onDrag(deltaX, deltaY);
    }
  }

  onDrag(deltaX: number, deltaY: number): void {
    this.x += deltaX;
    this.y += deltaY;
    this.can_render_text = true;
    // Ensure input is removed when dragging
    if (this.input) {
      this.input.remove();
      this.input = null;
    }
  }

  drawProximateBorder() {
    if (!this.proximateBorder) return;
    
    this.context.strokeStyle = "red";
    this.context.fillStyle = "red";
    this.context.lineWidth = 2;
    
    switch (this.proximateBorder) {
      case "top":
        this.context.fillRect(this.x, this.y, this.width, 5);
        break;
      case "bottom":
        this.context.fillRect(this.x, this.y + this.height - 5, this.width, 5);
        break;
      case "left":
        this.context.fillRect(this.x, this.y, 5, this.height);
        break;
      case "right":
        this.context.fillRect(this.x + this.width - 5, this.y, 5, this.height);
        break;
    }
  }

  removeProximateBorder() {
    this.context.strokeStyle = this.styles.strokeStyle;
    this.context.fillStyle = this.styles.fillStyle;
    switch (this.proximateBorder) {
      case "top":
        this.context.fillRect(this.x, this.y, this.width, 5);
        break;
      case "bottom":
        this.context.fillRect(this.x, this.y + this.height - 5, this.width, 5);
        break;
      case "left":
        this.context.fillRect(this.x, this.y, 5, this.height);
        break;
      case "right":
        this.context.fillRect(this.x + this.width - 5, this.y, 5, this.height);
        break;
    }
    this.proximateBorder = null;
  }

  getBorderPoint(border: "top" | "bottom" | "left" | "right"): { x: number; y: number } {
    if (!border) {
      // Default to center of the box if no border specified
      return { 
        x: this.x + this.width / 2, 
        y: this.y + this.height / 2 
      };
    }

    switch (border) {
      case "top":
        return { x: this.x + this.width / 2, y: this.y };
      case "bottom":
        return { x: this.x + this.width / 2, y: this.y + this.height };
      case "left":
        return { x: this.x, y: this.y + this.height / 2 };
      case "right":
        return { x: this.x + this.width, y: this.y + this.height / 2 };
      default:
        // Default to center of the box for any invalid border
        return { 
          x: this.x + this.width / 2, 
          y: this.y + this.height / 2 
        };
    }
  }

  drawArrow(startPoint: { x: number; y: number }, endPoint: { x: number; y: number }, style: ArrowStyle = "direct", isSelected: boolean = false) {
    this.context.beginPath();
    this.context.moveTo(startPoint.x, startPoint.y);

    let lastSegmentStart = startPoint;
    let lastSegmentEnd = endPoint;

    switch (style) {
      case "direct":
        this.context.lineTo(endPoint.x, endPoint.y);
        break;

      case "right-angle":
        // Calculate the midpoint for right-angle connection
        const midX = (startPoint.x + endPoint.x) / 2;
        this.context.lineTo(midX, startPoint.y);
        this.context.lineTo(midX, endPoint.y);
        this.context.lineTo(endPoint.x, endPoint.y);
        lastSegmentStart = { x: midX, y: endPoint.y };
        break;

      case "curve":
        // Calculate control points for a smooth curve
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        
        // Create two control points for a cubic bezier curve
        const controlPoint1 = {
          x: startPoint.x + dx * 0.5,
          y: startPoint.y
        };
        const controlPoint2 = {
          x: startPoint.x + dx * 0.5,
          y: endPoint.y
        };
        
        // Draw the curve using cubic bezier curve
        this.context.bezierCurveTo(
          controlPoint1.x, controlPoint1.y,
          controlPoint2.x, controlPoint2.y,
          endPoint.x, endPoint.y
        );
        // For curves, we'll use the last control point to calculate the angle
        lastSegmentStart = controlPoint2;
        break;
    }
    
    // Calculate the angle for the arrowhead based on the last segment
    const angle = Math.atan2(
      endPoint.y - lastSegmentStart.y,
      endPoint.x - lastSegmentStart.x
    );
    const arrowLength = 15;
    const arrowWidth = 10;
    
    // Draw the arrowhead as part of the same path
    this.context.moveTo(endPoint.x, endPoint.y);
    this.context.lineTo(
      endPoint.x - arrowLength * Math.cos(angle - Math.PI / 6),
      endPoint.y - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    this.context.moveTo(endPoint.x, endPoint.y);
    this.context.lineTo(
      endPoint.x - arrowLength * Math.cos(angle + Math.PI / 6),
      endPoint.y - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    
    // Set the style and stroke the entire path
    this.context.strokeStyle = isSelected ? "#4F46E5" : this.styles.strokeStyle;
    this.context.lineWidth = isSelected ? 3 : 2;
    this.context.stroke();
  }

  draw() {
    this.context.strokeStyle = this.isSelected ? "#4F46E5" : this.styles.strokeStyle;
    this.context.fillStyle = this.styles.fillStyle;
    this.context.strokeRect(this.x, this.y, this.width, this.height);
    this.context.fillRect(this.x, this.y, this.width, this.height);
    
    if (this.isSelected) {
      // Draw selection handles
      const handleSize = 8;
      this.context.fillStyle = "#4F46E5";
      this.context.fillRect(this.x - handleSize/2, this.y - handleSize/2, handleSize, handleSize); // Top-left
      this.context.fillRect(this.x + this.width - handleSize/2, this.y - handleSize/2, handleSize, handleSize); // Top-right
      this.context.fillRect(this.x - handleSize/2, this.y + this.height - handleSize/2, handleSize, handleSize); // Bottom-left
      this.context.fillRect(this.x + this.width - handleSize/2, this.y + this.height - handleSize/2, handleSize, handleSize); // Bottom-right
    }
    
    if (this.isNearestElement) {
      this.drawProximateBorder();
    } else {
      this.removeProximateBorder();
    }

    // Draw the current arrow being drawn (if any)
    if (this.isArrowStart && this.arrowStartPoint && this.arrowEndPoint) {
      this.drawArrow(this.arrowStartPoint, this.arrowEndPoint, "direct", this.isSelected);
    }

    if (this.can_render_text) {
      this.input?.remove();
      const lines = this.text.split("\n");

      this.context.font = `${this.styles.fontStyle} ${this.styles.fontWeight} ${this.styles.fontSize}px ${this.styles.fontFamily}`;
      this.context.fillStyle = this.styles.strokeStyle;
      this.context.textAlign = "center";
      this.context.textBaseline = "top";

      // render each line with 1.2px in between, the text baseline is set to top
      for (let i = 0; i < lines.length; i++) {
        this.context.fillText(
          lines[i],
          this.x + this.width / 2,
          this.y +
            (this.height / 2 - this.INPUT_HEIGHT / 2) +
            i * 1.2 * (this.styles.fontSize as number)
        );
      }
    }
  }

  isNearArrow(startPoint: { x: number; y: number }, endPoint: { x: number; y: number }, mouseX: number, mouseY: number, style: ArrowStyle = "direct"): boolean {
    const threshold = 5; // Distance threshold for hit detection

    switch (style) {
      case "direct":
        return this.isNearLine(startPoint, endPoint, mouseX, mouseY, threshold);

      case "right-angle":
        const midX = (startPoint.x + endPoint.x) / 2;
        const points = [
          startPoint,
          { x: midX, y: startPoint.y },
          { x: midX, y: endPoint.y },
          endPoint
        ];
        return this.isNearPolyline(points, mouseX, mouseY, threshold);

      case "curve":
        const dx = endPoint.x - startPoint.x;
        const controlPoint1 = { x: startPoint.x + dx * 0.5, y: startPoint.y };
        const controlPoint2 = { x: startPoint.x + dx * 0.5, y: endPoint.y };
        return this.isNearBezierCurve(startPoint, controlPoint1, controlPoint2, endPoint, mouseX, mouseY, threshold);
    }
  }

  private isNearLine(p1: { x: number; y: number }, p2: { x: number; y: number }, mouseX: number, mouseY: number, threshold: number): boolean {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return false;
    
    const t = ((mouseX - p1.x) * dx + (mouseY - p1.y) * dy) / (length * length);
    const projectionX = p1.x + t * dx;
    const projectionY = p1.y + t * dy;
    
    const distance = Math.sqrt(
      Math.pow(mouseX - projectionX, 2) + 
      Math.pow(mouseY - projectionY, 2)
    );
    
    return distance <= threshold;
  }

  private isNearPolyline(points: { x: number; y: number }[], mouseX: number, mouseY: number, threshold: number): boolean {
    for (let i = 0; i < points.length - 1; i++) {
      if (this.isNearLine(points[i], points[i + 1], mouseX, mouseY, threshold)) {
        return true;
      }
    }
    return false;
  }

  private isNearBezierCurve(
    p1: { x: number; y: number },
    cp1: { x: number; y: number },
    cp2: { x: number; y: number },
    p2: { x: number; y: number },
    mouseX: number,
    mouseY: number,
    threshold: number
  ): boolean {
    // Approximate the curve with line segments
    const steps = 20;
    const points = [];
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.pow(1 - t, 3) * p1.x +
                3 * Math.pow(1 - t, 2) * t * cp1.x +
                3 * (1 - t) * Math.pow(t, 2) * cp2.x +
                Math.pow(t, 3) * p2.x;
      const y = Math.pow(1 - t, 3) * p1.y +
                3 * Math.pow(1 - t, 2) * t * cp1.y +
                3 * (1 - t) * Math.pow(t, 2) * cp2.y +
                Math.pow(t, 3) * p2.y;
      points.push({ x, y });
    }
    
    return this.isNearPolyline(points, mouseX, mouseY, threshold);
  }
}
