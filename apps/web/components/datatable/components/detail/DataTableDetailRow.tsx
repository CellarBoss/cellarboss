import { Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/components/ui/table";

interface DataTableDetailRowProps<T> {
  columnSpan: number;
  row: Row<T>;
  renderDetail: (row: T) => React.ReactNode;
}

export default function DataTableDetailRow<T>({
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
