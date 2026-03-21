import React from "react";
import type { UseApiQueryResult } from "@/hooks/use-api-query";
import {
  queryGateCore,
  type QueryGateOptions,
  type GateSuccess,
  type GateBlocked,
} from "@cellarboss/common/query-gate";

import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";

export type { QueryGateOptions, GateSuccess, GateBlocked };

export function queryGate<T extends UseApiQueryResult<unknown>[]>(
  queries: [...T],
  options?: QueryGateOptions,
): GateSuccess<T> | GateBlocked {
  return queryGateCore(queries, {
    loadingComponent: options?.loadingComponent ?? <LoadingScreen />,
    errorComponent:
      options?.errorComponent ??
      ((message: string) => <ErrorScreen message={message} />),
  });
}
