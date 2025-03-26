export class BaseElement {
  id: number;
  context: CanvasRenderingContext2D;
  x: number = 0;
  y: number = 0;
  constructor(id: number, context: CanvasRenderingContext2D, x: number, y: number) {
    this.id = id;
    this.context = context;
    this.x = x;
    this.y = y;
  }
}
