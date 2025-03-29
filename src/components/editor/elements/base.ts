export class BaseElement {
  id: number;
  context: CanvasRenderingContext2D;
  drawBackground: () => void;
  x: number = 0;
  y: number = 0;
  constructor(id: number, context: CanvasRenderingContext2D, x: number, y: number, drawBackground: () => void) {
    this.id = id;
    this.context = context;
    this.x = x;
    this.y = y;
    this.drawBackground = drawBackground;
  }
  draw(){

  }
  onClick(input: HTMLInputElement, afterHandleInput: () => void){
    
  }
  onMouseUp(

  ){
    
  }
  onMouseMove(
    offsetX: number,
    offsetY: number,
    originX: number,
    originY: number
  ){

  }

  onDrag(offsetX:number,offsetY:number,originX:number,originY: number){
    this.x=this.x+(offsetX-originX)
    this.y=this.y+(offsetY-originY)
  }
}
