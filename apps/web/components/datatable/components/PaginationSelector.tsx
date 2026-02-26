type PaginationSelectorProps = {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
};

export function PaginationSelector({
  pageSize,
  onPageSizeChange,
}: PaginationSelectorProps) {
  return (
    <>
      <span>Rows per page</span>
      <select
        className="border rounded px-2 py-1 cursor-pointer"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
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
