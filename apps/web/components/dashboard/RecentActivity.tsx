import { useMemo } from "react";
import Link from "next/link";
import { Wine as WineIcon, Star } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type {
  Bottle,
  TastingNote,
  Vintage,
  Wine,
  WineMaker,
} from "@cellarboss/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ActivityEvent = {
  id: string;
  type: "purchase" | "tasting";
  wineName: string;
  wineId: number;
  vintageId: number;
  year: number | null;
  wineMakerId: number;
  wineMakerName: string;
  detail: string;
  date: Date;
};

interface RecentActivityProps {
  bottles: Bottle[];
  tastingNotes: TastingNote[];
  vintages: Vintage[];
  wines: Wine[];
  winemakers: WineMaker[];
}

export function RecentActivity({
  bottles,
  tastingNotes,
  vintages,
  wines,
  winemakers,
}: RecentActivityProps) {
  const events = useMemo(() => {
    const vintageMap = new Map(vintages.map((v) => [v.id, v]));
    const wineMap = new Map(wines.map((w) => [w.id, w]));
    const winemakerMap = new Map(winemakers.map((wm) => [wm.id, wm]));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result: ActivityEvent[] = [];

    for (const bottle of bottles) {
      const purchaseDate = parseISO(bottle.purchaseDate);
      if (purchaseDate < thirtyDaysAgo) continue;

      const vintage = vintageMap.get(bottle.vintageId);
      if (!vintage) continue;
      const wine = wineMap.get(vintage.wineId);
      if (!wine) continue;

      const winemaker = winemakerMap.get(wine.wineMakerId);
      if (!winemaker) continue;

      result.push({
        id: `bottle-${bottle.id}`,
        type: "purchase",
        wineName: wine.name,
        wineId: wine.id,
        vintageId: vintage.id,
        year: vintage.year,
        wineMakerId: winemaker.id,
        wineMakerName: winemaker.name,
        detail: "Purchased",
        date: purchaseDate,
      });
    }

    for (const note of tastingNotes) {
      const noteDate = parseISO(note.date);
      if (noteDate < thirtyDaysAgo) continue;

      const vintage = vintageMap.get(note.vintageId);
      if (!vintage) continue;
      const wine = wineMap.get(vintage.wineId);
      if (!wine) continue;

      const winemaker = winemakerMap.get(wine.wineMakerId);
      if (!winemaker) continue;

      result.push({
        id: `note-${note.id}`,
        type: "tasting",
        wineName: wine.name,
        wineId: wine.id,
        vintageId: vintage.id,
        year: vintage.year,
        wineMakerId: winemaker.id,
        wineMakerName: winemaker.name,
        detail: `Scored ${note.score}/10 by ${note.author}`,
        date: noteDate,
      });
    }

    return result
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);
  }, [bottles, tastingNotes, vintages, wines, winemakers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Purchases and tastings from the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No recent activity in the last 30 days
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      event.type === "purchase"
                        ? "color-mix(in oklch, var(--chart-1) 15%, transparent)"
                        : "color-mix(in oklch, var(--chart-4) 15%, transparent)",
                    color:
                      event.type === "purchase"
                        ? "var(--chart-1)"
                        : "var(--chart-4)",
                  }}
                >
                  {event.type === "purchase" ? (
                    <WineIcon className="h-4 w-4" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    <Link
                      href={`/wines/${event.wineId}`}
                      className="hover:underline"
                    >
                      {event.wineName}
                    </Link>
                    {event.year !== null && (
                      <Link
                        href={`/vintages/${event.vintageId}`}
                        className="text-muted-foreground ml-1 hover:underline"
                      >
                        {event.year}
                      </Link>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <Link
                      href={`/winemakers/${event.wineMakerId}`}
                      className="text-muted-foreground hover:underline"
                    >
                      {event.wineMakerName}
                    </Link>{" "}
                    &middot; {event.detail}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(event.date, { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
