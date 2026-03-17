import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { Bottle, Vintage, Wine, WineMaker } from "@cellarboss/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DrinkingSuggestionsProps {
  bottles: Bottle[];
  vintages: Vintage[];
  wines: Wine[];
  winemakers: WineMaker[];
}

export function DrinkingSuggestions({
  bottles,
  vintages,
  wines,
  winemakers,
}: DrinkingSuggestionsProps) {
  const suggestions = useMemo(() => {
    const vintageMap = new Map(vintages.map((v) => [v.id, v]));
    const wineMap = new Map(wines.map((w) => [w.id, w]));
    const winemakerMap = new Map(winemakers.map((wm) => [wm.id, wm]));
    const currentYear = new Date().getFullYear();
    const urgentCutoff = currentYear + 2;

    const storedBottles = bottles.filter((b) => b.status === "stored");

    // Group by vintage to avoid repeating the same wine
    const seen = new Set<number>();
    const urgent: Array<{
      vintageId: number;
      wineId: number;
      wineName: string;
      year: number | null;
      winemakerName: string;
      drinkUntil: number;
      bottleCount: number;
    }> = [];

    for (const bottle of storedBottles) {
      const vintage = vintageMap.get(bottle.vintageId);
      if (!vintage || vintage.drinkUntil === null) continue;
      if (vintage.drinkUntil > urgentCutoff) continue;
      if (vintage.drinkFrom !== null && currentYear < vintage.drinkFrom)
        continue;

      if (seen.has(vintage.id)) {
        const existing = urgent.find((u) => u.vintageId === vintage.id);
        if (existing) existing.bottleCount++;
        continue;
      }
      seen.add(vintage.id);

      const wine = wineMap.get(vintage.wineId);
      if (!wine) continue;
      const winemaker = winemakerMap.get(wine.wineMakerId);

      urgent.push({
        vintageId: vintage.id,
        wineId: wine.id,
        wineName: wine.name,
        year: vintage.year,
        winemakerName: winemaker?.name || "Unknown",
        drinkUntil: vintage.drinkUntil,
        bottleCount: 1,
      });
    }

    return urgent.sort((a, b) => a.drinkUntil - b.drinkUntil).slice(0, 5);
  }, [bottles, vintages, wines, winemakers]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle
            className="h-5 w-5"
            style={{ color: "oklch(0.75 0.15 55)" }}
          />
          <div>
            <CardTitle>Drink Soon</CardTitle>
            <CardDescription>
              Bottles nearing end of drinking window
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No bottles urgently need drinking — your cellar is well-timed!
          </p>
        ) : (
          <div className="space-y-4">
            {suggestions.map((item) => (
              <div key={item.vintageId} className="flex items-center gap-3">
                <Link
                  href={`/bottles?wineId=${item.wineId}${item.year !== null ? `&yearMin=${item.year}&yearMax=${item.year}` : ""}&status=stored`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0 hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor:
                      "color-mix(in oklch, oklch(0.75 0.15 55) 15%, transparent)",
                    color: "oklch(0.75 0.15 55)",
                  }}
                >
                  {item.bottleCount}
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {item.wineName}
                    {item.year && (
                      <span className="text-muted-foreground ml-1">
                        {item.year}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.winemakerName}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0"
                  style={{
                    borderColor: "oklch(0.75 0.15 55)",
                    color: "oklch(0.75 0.15 55)",
                  }}
                >
                  By {item.drinkUntil}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
