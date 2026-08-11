import type { RowData } from "@tanstack/react-table";
import type { AppRow } from "../../tableFeatures";
import { TableCell, TableRow } from "@/components/ui/table";

interface DataTableDetailRowProps<T extends RowData> {
  columnSpan: number;
  row: AppRow<T>;
  renderDetail: (row: T) => React.ReactNode;
}

export default function DataTableDetailRow<T extends RowData>({
  columnSpan,
  row,
  renderDetail,
}: DataTableDetailRowProps<T>) {
  return (
    <TableRow key={"detail-" + row.id} className="bg-table-detail">
      <TableCell colSpan={columnSpan} className="p-4">
        {renderDetail(row.original)}
      </TableCell>
    </TableRow>
  );
}
