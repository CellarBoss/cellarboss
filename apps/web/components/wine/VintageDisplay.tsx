import type { Vintage, Wine, WineMaker } from "@cellarboss/types";
import Link from "next/link";

interface Props {
  vintage: Vintage | undefined;
  wine: Wine | undefined;
  winemaker: WineMaker | undefined;
}

export function VintageDisplay({ vintage, wine, winemaker }: Props) {
  if (!vintage || !wine || !winemaker) {
    return <span className="text-muted-foreground">Unknown</span>;
  }

  return (
    <span>
      <Link href={`/wines/${wine.id}`}>{wine.name}</Link>
      &nbsp;
      <Link href={`/vintages/${vintage.id}`}>{vintage.year}</Link>
      <br />
      <Link
        href={`/winemakers/${winemaker.id}`}
        className="text-muted-foreground"
      >
        {winemaker.name}
      </Link>
    </span>
  );
}
