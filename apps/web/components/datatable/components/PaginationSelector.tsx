import { Table } from "@tanstack/react-table";

type PaginationSelectorProps = {
  table: Table<any>;
  pageSize: number;
};

export function PaginationSelector({ table, pageSize }: PaginationSelectorProps) {
  return (
    <>
      <span>Rows per page</span>
      <select
        className="border rounded px-2 py-1 cursor-pointer"
        value={pageSize}
        onChange={(e) => table.setPageSize(Number(e.target.value))}
      >
        {[10, 20, 30, 40, 50].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </>
  );
}