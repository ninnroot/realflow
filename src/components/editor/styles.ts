import { CSSProperties } from "react";

export interface Styles {
    fontStyle: CSSProperties["fontStyle"]
    fontWeight: CSSProperties["fontWeight"]
    fontSize: CSSProperties["fontSize"]
    fontFamily: CSSProperties["fontFamily"]
    strokeStyle: CanvasRenderingContext2D["strokeStyle"]
    fillStyle: CanvasRenderingContext2D["fillStyle"]
}

export const defaultStyles: Styles = {
    fontStyle: "normal",
    fontSize: 16,
    fontWeight: "normal",
    fontFamily: "arial",
    strokeStyle: "black",
    fillStyle: "white",
}