import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Label, Pie, PieChart } from "recharts";
import type { Bottle, Vintage, Wine } from "@cellarboss/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const WINE_TYPE_COLORS: Record<string, string> = {
  red: "oklch(0.55 0.2 25)",
  white: "oklch(0.8 0.12 90)",
  rose: "oklch(0.7 0.14 350)",
  orange: "oklch(0.7 0.15 55)",
  sparkling: "oklch(0.75 0.1 200)",
  fortified: "oklch(0.45 0.15 30)",
  dessert: "oklch(0.65 0.18 310)",
};

const WINE_TYPE_LABELS: Record<string, string> = {
  red: "Red",
  white: "White",
  rose: "Ros\u00e9",
  orange: "Orange",
  sparkling: "Sparkling",
  fortified: "Fortified",
  dessert: "Dessert",
};

interface WineTypeBreakdownProps {
  bottles: Bottle[];
  vintages: Vintage[];
  wines: Wine[];
}

export function WineTypeBreakdown({
  bottles,
  vintages,
  wines,
}: WineTypeBreakdownProps) {
  const router = useRouter();
  const { chartData, chartConfig, totalBottles } = useMemo(() => {
    const vintageMap = new Map(vintages.map((v) => [v.id, v]));
    const wineMap = new Map(wines.map((w) => [w.id, w]));
    const storedBottles = bottles.filter((b) => b.status === "stored");

    const counts = new Map<string, number>();
    for (const bottle of storedBottles) {
      const vintage = vintageMap.get(bottle.vintageId);
      if (!vintage) continue;
      const wine = wineMap.get(vintage.wineId);
      if (!wine) continue;
      counts.set(wine.type, (counts.get(wine.type) || 0) + 1);
    }

    const data = Array.from(counts.entries())
      .map(([type, count]) => ({
        type,
        count,
        fill: WINE_TYPE_COLORS[type] || "var(--chart-5)",
      }))
      .sort((a, b) => b.count - a.count);

    const config: ChartConfig = {};
    for (const item of data) {
      config[item.type] = {
        label: WINE_TYPE_LABELS[item.type] || item.type,
        color: item.fill,
      };
    }

    return {
      chartData: data,
      chartConfig: config,
      totalBottles: storedBottles.length,
    };
  }, [bottles, vintages, wines]);

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center h-full min-h-[300px]">
        <CardContent>
          <p className="text-muted-foreground text-center">
            Add some bottles to see your wine type breakdown
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Wine Types</CardTitle>
        <CardDescription>Bottles by wine type</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="type"
              innerRadius={60}
              strokeWidth={2}
              stroke="var(--background)"
              className="cursor-pointer"
              onClick={(data) => {
                if (data?.type) {
                  router.push(`/bottles?type=${data.type}`);
                }
              }}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalBottles}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          bottles
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="type" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
