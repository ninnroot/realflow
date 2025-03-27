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
  draw(){

  }
  onDrag(offsetX:number,offsetY:number,originX:number,originY: number){
    this.x=this.x+(offsetX-originX)
    this.y=this.y+(offsetY-originY)
  }
}
