import React from "react";
import type { UseApiQueryResult } from "@/hooks/use-api-query";
import {
  queryGateCore,
  type QueryGateOptions,
  type GateSuccess,
  type GateBlocked,
} from "@cellarboss/common/query-gate";

import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export type { QueryGateOptions, GateSuccess, GateBlocked };

export function queryGate<T extends UseApiQueryResult<unknown>[]>(
  queries: [...T],
  options?: QueryGateOptions,
): GateSuccess<T> | GateBlocked {
  return queryGateCore(queries, {
    loadingComponent: options?.loadingComponent ?? <LoadingCard />,
    errorComponent:
      options?.errorComponent ??
      ((message: string) => <ErrorCard message={message} />),
  });
}
