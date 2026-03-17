import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import type { Bottle } from "@cellarboss/types";
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
  type ChartConfig,
} from "@/components/ui/chart";
import { formatPrice } from "@/lib/functions/format";

const chartConfig = {
  value: {
    label: "Cellar Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface CellarValueOverTimeProps {
  bottles: Bottle[];
  currency: string;
}

export function CellarValueOverTime({
  bottles,
  currency,
}: CellarValueOverTimeProps) {
  const chartData = useMemo(() => {
    const storedBottles = bottles.filter((b) => b.status === "stored");
    if (storedBottles.length === 0) return [];

    const sorted = [...storedBottles].sort(
      (a, b) =>
        new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime(),
    );

    const monthlyData = new Map<string, number>();
    for (const bottle of sorted) {
      const month = format(parseISO(bottle.purchaseDate), "yyyy-MM");
      monthlyData.set(
        month,
        (monthlyData.get(month) || 0) + (bottle.purchasePrice || 0),
      );
    }

    let cumulative = 0;
    return Array.from(monthlyData.entries()).map(([month, added]) => {
      cumulative += added;
      return {
        month,
        label: format(parseISO(month + "-01"), "MMM yyyy"),
        value: cumulative,
      };
    });
  }, [bottles]);

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[300px]">
        <CardContent>
          <p className="text-muted-foreground text-center">
            Add bottles with purchase prices to track your cellar value
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cellar Value Over Time</CardTitle>
        <CardDescription>
          Cumulative purchase value of stored bottles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData} accessibilityLayer>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatPrice(val, currency)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatPrice(value as number, currency)}
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              fill="url(#valueGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
