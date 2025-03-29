import { defaultStyles, Styles } from "../styles";
import { BaseElement } from "./base";

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
  redrawAllElements: () => void

  constructor(
    id: number,
    context: CanvasRenderingContext2D,
    drawBackground: () => void,
    afterHandleInput: () => void,
    x: number = 0,
    y: number = 0,
    width: number = 100,
    height: number = 100,
    styles: Styles = defaultStyles
  ) {
    super(id, context, x, y, drawBackground);
    this.width = width;
    this.height = height;
    this.redrawAllElements = afterHandleInput;

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

  handleInput = (e: Event) => {
    // set the context style
    this.context.font = `${this.styles.fontStyle} ${this.styles.fontWeight} ${this.styles.fontSize}px ${this.styles.fontFamily}`;

    // calculate text properties
    this.text = (e.target as HTMLInputElement).value;
    console.log(this.text);
    const longestLine = this.text.split("\n").reduce((a, b) => {
      return a.length > b.length ? a : b;
    });
    const textProps = this.context.measureText(longestLine);
    const lineCount = this.text.split("\n").length;
    const longestLineLength = textProps.width;
    const totalLineHeight = lineCount * 1.2 * (this.styles.fontSize as number);

    if (totalLineHeight > this.height - this.TEXT_PADDING_X * 2) {
      this.height = totalLineHeight + this.TEXT_PADDING_X * 2;
    }
    if (longestLineLength > this.width - this.TEXT_PADDING_X * 2) {
      this.width = longestLineLength + this.TEXT_PADDING_X * 2;
    }
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

    this.redrawAllElements();
  };

  renderInput(parentElement: HTMLElement) {
    this.can_render_text = false;
    this.draw()
    this.redrawAllElements();
    this.input = document.createElement("textarea");
    this.input.value = this.text;
    this.input.style.border = "none";
    this.input.style.outline = "none";
    this.input.onkeyup = this.handleInput;
    this.input.id = `input-${this.id}`;
    this.input.style.resize = "none";
    this.input.style.scrollbarWidth = "none";
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

  onDrag(
    offsetX: number,
    offsetY: number,
    originX: number,
    originY: number
  ): void {
    super.onDrag(offsetX, offsetY, originX, originY);
    this.can_render_text = true;
    this.input?.remove();
  }

  draw() {
    this.context.strokeStyle = this.styles.strokeStyle;
    this.context.fillStyle = this.styles.fillStyle;
    this.context.strokeRect(this.x, this.y, this.width, this.height);
    this.context.fillRect(this.x, this.y, this.width, this.height);
    if (this.can_render_text) {
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
}
