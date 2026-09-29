import Link from "next/link";
import type { VintageDetail } from "@cellarboss/types";
import { BOTTLE_STATUSES } from "@cellarboss/validators/constants";
import { formatStatus } from "@/lib/functions/format";

const HIDDEN_STATUSES = ["drunk", "gifted", "sold"];

export function BottleCountDisplay({ vintage }: { vintage: VintageDetail }) {
  const visible = BOTTLE_STATUSES.filter(
    (status) =>
      !HIDDEN_STATUSES.includes(status) && vintage.bottles[status] > 0,
  );

  if (visible.length === 0)
    return <span className="text-muted-foreground">0</span>;

  return (
    <span>
      {visible.map((status, index) => (
        <span key={status}>
          <Link
            href={`/bottles?wineId=${vintage.wineId}&yearMin=${vintage.year}&yearMax=${vintage.year}&status=${status}`}
            className="hover:underline"
          >
            {vintage.bottles[status]} {formatStatus(status)}
          </Link>
          {index < visible.length - 1 && ", "}
        </span>
      ))}
    </span>
  );
}
