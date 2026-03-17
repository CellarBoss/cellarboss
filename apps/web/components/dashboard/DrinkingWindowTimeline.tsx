import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { Bottle, Vintage } from "@cellarboss/types";
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

const chartConfig = {
  ready: {
    label: "Ready",
    color: "oklch(0.65 0.17 145)",
  },
  tooYoung: {
    label: "Too Young",
    color: "oklch(0.7 0.12 230)",
  },
  pastPeak: {
    label: "Past Peak",
    color: "oklch(0.65 0.15 25)",
  },
} satisfies ChartConfig;

interface DrinkingWindowTimelineProps {
  bottles: Bottle[];
  vintages: Vintage[];
}

export function DrinkingWindowTimeline({
  bottles,
  vintages,
}: DrinkingWindowTimelineProps) {
  const chartData = useMemo(() => {
    const vintageMap = new Map(vintages.map((v) => [v.id, v]));
    const storedBottles = bottles.filter((b) => b.status === "stored");
    const currentYear = new Date().getFullYear();

    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

    return years.map((year) => {
      let ready = 0;
      let tooYoung = 0;
      let pastPeak = 0;

      for (const bottle of storedBottles) {
        const vintage = vintageMap.get(bottle.vintageId);
        if (!vintage) continue;
        if (vintage.drinkFrom === null && vintage.drinkUntil === null) continue;

        if (vintage.drinkUntil !== null && year > vintage.drinkUntil) {
          pastPeak++;
        } else if (vintage.drinkFrom !== null && year < vintage.drinkFrom) {
          tooYoung++;
        } else {
          ready++;
        }
      }

      return { year: String(year), ready, tooYoung, pastPeak };
    });
  }, [bottles, vintages]);

  const hasData = chartData.some(
    (d) => d.ready > 0 || d.tooYoung > 0 || d.pastPeak > 0,
  );

  if (!hasData) {
    return (
      <Card className="flex flex-col items-center justify-center h-full min-h-[300px]">
        <CardContent>
          <p className="text-muted-foreground text-center">
            Add drinking windows to your vintages to see this timeline
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drinking Window Timeline</CardTitle>
        <CardDescription>
          When your bottles are ready to drink over the next 10 years
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="ready"
              stackId="a"
              fill="var(--color-ready)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="tooYoung"
              stackId="a"
              fill="var(--color-tooYoung)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="pastPeak"
              stackId="a"
              fill="var(--color-pastPeak)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
