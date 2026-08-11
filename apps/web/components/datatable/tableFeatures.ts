import {
  tableFeatures,
  metaHelper,
  columnFilteringFeature,
  createFilteredRowModel,
  rowSortingFeature,
  createSortedRowModel,
  rowPaginationFeature,
  createPaginatedRowModel,
  rowExpandingFeature,
  createExpandedRowModel,
  rowSelectionFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnSizingFeature,
  sortFn_text,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  Column,
  Row,
  ReactTable,
  Table,
  RowData,
} from "@tanstack/react-table";

/**
 * Column meta shared by every DataTable column, replacing the v8 module
 * augmentation of `ColumnMeta` (v9 scopes meta to the table's own feature set
 * instead of a single global declaration).
 */
export interface DataTableColumnMeta {
  /**
   * Filter/sort-only column. Never visible to the user and excluded from the
   * column visibility toggle menu. Use for columns that exist purely to back
   * a filter or custom sort.
   */
  isSuppressed?: boolean;
  /**
   * Whether the column is shown by default when the user has no saved
   * preference for it. Defaults to `true`.
   */
  defaultVisible?: boolean;
  /**
   * Whether the user is allowed to hide this column. Primary columns should
   * set this to `false`. Defaults to `true`.
   */
  isHideable?: boolean;
  /**
   * Label shown in the column visibility menu. Falls back to the column
   * `header` when it is a plain string.
   */
  label?: string;
  /** Internal: set by processColumns when a column declares an explicit size. */
  _hasExplicitSize?: boolean;
}

/**
 * The single feature set every DataTable instance is built with. Registered
 * once at module scope per TanStack's guidance, covering every feature the
 * table uses across the app: filtering, sorting, pagination, expansion,
 * selection, visibility, ordering, and static column sizing.
 */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowExpandingFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnSizingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  columnMeta: metaHelper<DataTableColumnMeta>(),
  // Auto sort-fn resolution (columns with no explicit `sortFn`) needs these
  // registered by name, or it silently falls back to `basic` comparison.
  sortFns: {
    text: sortFn_text,
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
  },
});

export type AppFeatures = typeof dataTableFeatures;

export type AppColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  AppFeatures,
  TData,
  TValue
>;

export type AppTable<TData extends RowData> = ReactTable<AppFeatures, TData>;

/**
 * The core (framework-agnostic) table type, as seen inside cell/header render
 * contexts (`HeaderContext.table`, `CellContext.table`) — those are typed as
 * core `Table`, not the React-wrapped `ReactTable` returned by `useTable`.
 */
export type AppCoreTable<TData extends RowData> = Table<AppFeatures, TData>;

export type AppRow<TData extends RowData> = Row<AppFeatures, TData>;

export type AppColumn<TData extends RowData, TValue = unknown> = Column<
  AppFeatures,
  TData,
  TValue
>;
