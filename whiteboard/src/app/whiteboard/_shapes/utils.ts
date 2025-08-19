export const getStrokeWidth = (
  strokeWidth: number | undefined,
  width: number | undefined,
  height: number | undefined
) => {
  if (width && height) {
    const minStrokeWidth = Math.max(Math.min(width, height) / 2, 1);
    if (strokeWidth && strokeWidth * 2 > Math.min(width, height)) {
      return minStrokeWidth;
    }
    return strokeWidth;
  }
};

export const SHAPE_MIN_WIDTH = 5;
export const SHAPE_MIN_HEIGHT = 5;
export const SHAPE_DEFAULT_WIDTH = 50;
export const SHAPE_DEFAULT_HEIGHT = 50;

export const presetColors: string[] = [
  // Row 1 (Black and Gray)
  "#000000",
  "#4D4D4D",
  "#808080",
  "#B3B3B3",
  "#CCCCCC",
  "#E6E6E6",
  "#F2F2F2",
  "#FFFFFF",
  // Row 2 (Highly Saturated Colors)
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#0000FF",
  "#8B00FF",
  "#FF00FF",
  // Row 3 (Low Saturated / Softer Colors)
  "#FFCCCC",
  "#FFCC99",
  "#FFFFCC",
  "#CCFFCC",
  "#CCFFFF",
  "#CCCCFF",
  "#E5CCFF",
  "#FFCCE5",
];
