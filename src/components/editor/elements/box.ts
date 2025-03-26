import { defaultStyles, Styles } from "../styles";
import { BaseElement } from "./base";

export class BoxElement extends BaseElement {
  width: number = 0;
  height: number = 0;
  styles: Styles = defaultStyles;

  constructor(
    id: number,
    context: CanvasRenderingContext2D,
    x: number = 0,
    y: number = 0,
    width: number = 100,
    height: number = 100,
    styles: Styles = defaultStyles
  ) {
    super(id, context, x, y);
    this.width = width;
    this.height = height;

    this.styles = styles;
  }
  isInside(mouseX: number, mouseY: number) {
    return (
      mouseX > this.x &&
      mouseX < this.x + this.width &&
      mouseY > this.y &&
      mouseY < this.y + this.height
    );
  }
  draw() {
    this.context.strokeStyle = this.styles.strokeStyle;
    this.context.fillStyle = this.styles.fillStyle;
    this.context.strokeRect(this.x, this.y, this.width, this.height);
    this.context.fillRect(this.x, this.y, this.width, this.height);
  }
}
