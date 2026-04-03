import { CELL } from "./image-cell-class";

export function ImageEmptyCell() {
  return (
    <div className={`${CELL} text-muted-foreground text-sm italic`}>
      No images yet
    </div>
  );
}
