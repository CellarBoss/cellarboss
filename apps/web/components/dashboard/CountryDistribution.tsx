import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import type { Bottle, Vintage, Wine, Region, Country } from "@cellarboss/types";
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

const chartConfig = {
  count: {
    label: "Bottles",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface CountryDistributionProps {
  bottles: Bottle[];
  vintages: Vintage[];
  wines: Wine[];
  regions: Region[];
  countries: Country[];
}

export function CountryDistribution({
  bottles,
  vintages,
  wines,
  regions,
  countries,
}: CountryDistributionProps) {
  const router = useRouter();

  const chartData = useMemo(() => {
    const vintageMap = new Map(vintages.map((v) => [v.id, v]));
    const wineMap = new Map(wines.map((w) => [w.id, w]));
    const regionMap = new Map(regions.map((r) => [r.id, r]));
    const countryMap = new Map(countries.map((c) => [c.id, c]));
    const storedBottles = bottles.filter((b) => b.status === "stored");

    const counts = new Map<string, { id: number; count: number }>();
    for (const bottle of storedBottles) {
      const vintage = vintageMap.get(bottle.vintageId);
      if (!vintage) continue;
      const wine = wineMap.get(vintage.wineId);
      if (!wine || !wine.regionId) continue;
      const region = regionMap.get(wine.regionId);
      if (!region) continue;
      const country = countryMap.get(region.countryId);
      if (!country) continue;

      const existing = counts.get(country.name);
      if (existing) {
        existing.count++;
      } else {
        counts.set(country.name, { id: country.id, count: 1 });
      }
    }

    return Array.from(counts.entries())
      .map(([country, { id, count }]) => ({ country, countryId: id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [bottles, vintages, wines, regions, countries]);

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center h-full min-h-[300px]">
        <CardContent>
          <p className="text-muted-foreground text-center">
            Add wines with regions to see country distribution
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Countries</CardTitle>
        <CardDescription>Stored bottles by country of origin</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 0 }}
            accessibilityLayer
          >
            <YAxis
              dataKey="country"
              type="category"
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
              onClick={(_data, index) => {
                const item = chartData[index];
                if (item) {
                  router.push(
                    `/bottles?status=stored&countryId=${item.countryId}`,
                  );
                }
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
