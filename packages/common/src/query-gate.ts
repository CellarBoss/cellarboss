import React from "react";
import type { UseApiQueryResult } from "./hooks/use-api-query";

type ExtractData<Q> = Q extends UseApiQueryResult<infer T> ? T : never;

type ExtractDataTuple<T extends UseApiQueryResult<unknown>[]> = {
  [K in keyof T]: ExtractData<T[K]>;
};

export type GateSuccess<T extends UseApiQueryResult<unknown>[]> = {
  ready: true;
  data: ExtractDataTuple<T>;
};

export type GateBlocked = {
  ready: false;
  gate: React.JSX.Element;
};

export interface QueryGateOptions {
  loadingComponent?: React.JSX.Element;
  errorComponent?: (message: string) => React.JSX.Element;
}

export function queryGateCore<T extends UseApiQueryResult<unknown>[]>(
  queries: [...T],
  options: Required<QueryGateOptions>,
): GateSuccess<T> | GateBlocked {
  const loading = options.loadingComponent;
  const renderError = options.errorComponent;

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
