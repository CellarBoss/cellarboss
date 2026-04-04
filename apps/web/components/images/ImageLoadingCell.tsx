import { CELL } from "./image-cell-class";

export function ImageLoadingCell() {
  return (
    <div className={`${CELL} text-muted-foreground text-sm italic`}>
      Loading...
    </div>
  );
}
