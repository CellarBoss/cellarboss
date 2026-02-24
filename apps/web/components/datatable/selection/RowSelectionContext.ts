import { createContext } from "react";
import { RowSelectionState } from "@tanstack/react-table";

// Context so selection cells can read the live rowSelection state without
// relying on a closure captured in TanStack Table's memoised column model.
export const RowSelectionContext = createContext<RowSelectionState>({});
