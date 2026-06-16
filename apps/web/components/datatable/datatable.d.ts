import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
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
}
