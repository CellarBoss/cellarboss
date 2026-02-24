import React from "react";
import type { UseApiQueryResult } from "@/hooks/use-api-query";

import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

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

export function queryGate<T extends UseApiQueryResult<unknown>[]>(
  ...queries: T
): GateSuccess<T> | GateBlocked {
  if (queries.some((q) => q.isLoading)) {
    return { ready: false, gate: <LoadingCard /> };
  }

  for (const q of queries) {
    if (q.error) {
      return {
        ready: false,
        gate: <ErrorCard message={q.error.apiError.message} />,
      };
    }
  }

  for (const q of queries) {
    if (q.data === undefined) {
      return {
        ready: false,
        gate: <ErrorCard message="Unexpected error: no data received" />,
      };
    }
  }

  const data = queries.map((q) => q.data) as ExtractDataTuple<T>;
  return { ready: true, data };
}
