export type ObjectType = "ink" | "eraserStroke" | "shape" | "text";

export type ToolType =
  | "select"
  | "eraser"
  | "pen"
  | "addText"
  | "addOval"
  | "addRectangle"
  | "addTriangle"
  | "addStar";

export type ShapeName = "rectangle" | "oval" | "triangle" | "star";

export interface CanvasObjectType {
  id: string;
  type: ObjectType;
  shapeName?: ShapeName;
  stroke?: string;
  strokeWidth?: number;
  fill?: string; 
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  align?: string;
  lineHeight?: number;
}
