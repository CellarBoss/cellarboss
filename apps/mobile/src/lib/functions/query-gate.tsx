import React from "react";
import type { UseApiQueryResult } from "@/hooks/use-api-query";

import { LoadingScreen } from "@/components/LoadingScreen";
import { ErrorScreen } from "@/components/ErrorScreen";

type ExtractData<Q> = Q extends UseApiQueryResult<infer T> ? T : never;

type ExtractDataTuple<T extends UseApiQueryResult<unknown>[]> = {
  [K in keyof T]: ExtractData<T[K]>;
};

type GateSuccess<T extends UseApiQueryResult<unknown>[]> = {
  ready: true;
  data: ExtractDataTuple<T>;
};

type GateBlocked = {
  ready: false;
  gate: React.JSX.Element;
};

export interface QueryGateOptions {
  loadingComponent?: React.JSX.Element;
  errorComponent?: (message: string) => React.JSX.Element;
}

export function queryGate<T extends UseApiQueryResult<unknown>[]>(
  queries: [...T],
  options?: QueryGateOptions,
): GateSuccess<T> | GateBlocked {
  const loading = options?.loadingComponent ?? <LoadingScreen />;
  const renderError =
    options?.errorComponent ??
    ((message: string) => <ErrorScreen message={message} />);

  if (queries.some((q) => q.isLoading)) {
    return { ready: false, gate: loading };
  }

  for (const q of queries) {
    if (q.error) {
      return {
        ready: false,
        gate: renderError(q.error.apiError.message),
      };
    }
  }

  for (const q of queries) {
    if (q.data === undefined) {
      return {
        ready: false,
        gate: renderError("Unexpected error: no data received"),
      };
    }
  }

  const data = queries.map((q) => q.data) as ExtractDataTuple<T>;
  return { ready: true, data };
}
