import { useMemo } from "react";
import { Star } from "lucide-react";
import type { TastingNote, Vintage, Wine, WineMaker } from "@cellarboss/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopRatedWinesProps {
  tastingNotes: TastingNote[];
  vintages: Vintage[];
  wines: Wine[];
  winemakers: WineMaker[];
}

export function TopRatedWines({
  tastingNotes,
  vintages,
  wines,
  winemakers,
}: TopRatedWinesProps) {
  const topWines = useMemo(() => {
    const vintageMap = new Map(vintages.map((v) => [v.id, v]));
    const wineMap = new Map(wines.map((w) => [w.id, w]));
    const winemakerMap = new Map(winemakers.map((wm) => [wm.id, wm]));

    const scoresByVintage = new Map<number, { total: number; count: number }>();
    for (const note of tastingNotes) {
      const existing = scoresByVintage.get(note.vintageId) || {
        total: 0,
        count: 0,
      };
      existing.total += note.score;
      existing.count += 1;
      scoresByVintage.set(note.vintageId, existing);
    }

    return Array.from(scoresByVintage.entries())
      .map(([vintageId, { total, count }]) => {
        const vintage = vintageMap.get(vintageId);
        if (!vintage) return null;
        const wine = wineMap.get(vintage.wineId);
        if (!wine) return null;
        const winemaker = winemakerMap.get(wine.wineMakerId);

        return {
          vintageId,
          wineName: wine.name,
          year: vintage.year,
          winemakerName: winemaker?.name || "Unknown",
          avgScore: total / count,
          noteCount: count,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.avgScore - a!.avgScore)
      .slice(0, 5) as Array<{
      vintageId: number;
      wineName: string;
      year: number | null;
      winemakerName: string;
      avgScore: number;
      noteCount: number;
    }>;
  }, [tastingNotes, vintages, wines, winemakers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Rated Wines</CardTitle>
        <CardDescription>Highest rated by tasting notes</CardDescription>
      </CardHeader>
      <CardContent>
        {topWines.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Start rating your wines to see top picks here
          </p>
        ) : (
          <div className="space-y-4">
            {topWines.map((wine, index) => (
              <div key={wine.vintageId} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: `color-mix(in oklch, var(--chart-${(index % 5) + 1}) 15%, transparent)`,
                    color: `var(--chart-${(index % 5) + 1})`,
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {wine.wineName}
                    {wine.year && (
                      <span className="text-muted-foreground ml-1">
                        {wine.year}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {wine.winemakerName}
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1 shrink-0">
                  <Star className="h-3 w-3" />
                  {wine.avgScore.toFixed(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
