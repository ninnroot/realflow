import { CSSProperties } from "react";

export interface Styles {
    fontStyle: CSSProperties["fontStyle"]
    fontSize: CSSProperties["fontSize"]
    fontWeight: CSSProperties["fontWeight"]
    fontFamily: CSSProperties["fontFamily"]
    strokeStyle: CanvasRenderingContext2D["strokeStyle"]
    fillStyle: CanvasRenderingContext2D["fillStyle"]
}

export const defaultStyles: Styles = {
    fontStyle: "normal",
    fontSize: "16px",
    fontWeight: "normal",
    fontFamily: "Arial",
    strokeStyle: "black",
    fillStyle: "white",
}