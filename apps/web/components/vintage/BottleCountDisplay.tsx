import Link from "next/link";
import { useApiQuery } from "@/hooks/use-api-query";
import { getBottleCountsByVintageId } from "@/lib/api/bottles";
import { formatStatus } from "@/lib/functions/format";
import { getVintageById } from "@/lib/api/vintages";

export function BottleCountDisplay({ vintageId }: { vintageId: number }) {
  const bottleCountsQuery = useApiQuery({
    queryKey: ["bottleCounts", vintageId],
    queryFn: () => getBottleCountsByVintageId(vintageId),
  });

  const vintageQuery = useApiQuery({
    queryKey: ["vintage", vintageId],
    queryFn: () => getVintageById(vintageId),
  });

  if (bottleCountsQuery.isLoading || vintageQuery.isLoading)
    return <span className="text-muted-foreground">...</span>;
  if (!bottleCountsQuery.data || bottleCountsQuery.data.length === 0)
    return <span className="text-muted-foreground">0</span>;

  return (
    <span>
      {bottleCountsQuery.data
        .filter((item) => !["drunk", "gifted", "sold"].includes(item.status))
        .map((item, index, filtered) => (
          <span key={item.status}>
            <Link
              href={`/bottles?wineId=${vintageQuery.data?.wineId}&yearMin=${vintageQuery.data?.year}&yearMax=${vintageQuery.data?.year}&status=${item.status}`}
              className="hover:underline"
            >
              {item.count} {formatStatus(item.status)}
            </Link>
            {index < filtered.length - 1 && ", "}
          </span>
        ))}
    </span>
  );
}
