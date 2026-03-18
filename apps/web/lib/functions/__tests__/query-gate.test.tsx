import { describe, it, expect, vi } from "vitest";

// Mock the card components so we don't need a full DOM environment
vi.mock("@/components/cards/LoadingCard", () => ({
  LoadingCard: () => null,
}));
vi.mock("@/components/cards/ErrorCard", () => ({
  ErrorCard: () => null,
}));

import { queryGate } from "../query-gate";
import type { UseApiQueryResult } from "@/hooks/use-api-query";

function makeLoadingQuery<T>(): UseApiQueryResult<T> {
  return {
    data: undefined,
    isLoading: true,
    isPending: true,
    isError: false,
    error: null,
  } as any;
}

function makeErrorQuery<T>(message: string): UseApiQueryResult<T> {
  return {
    data: undefined,
    isLoading: false,
    isPending: false,
    isError: true,
    error: { apiError: { message } } as any,
  } as any;
}

function makeSuccessQuery<T>(data: T): UseApiQueryResult<T> {
  return {
    data,
    isLoading: false,
    isPending: false,
    isError: false,
    error: null,
  } as any;
}

describe("queryGate", () => {
  it("returns gate when any query is loading", () => {
    const q1 = makeSuccessQuery("data1");
    const q2 = makeLoadingQuery<string>();
    const result = queryGate([q1, q2]);
    expect(result.ready).toBe(false);
  });

  it("returns gate when any query has an error", () => {
    const q1 = makeSuccessQuery("data1");
    const q2 = makeErrorQuery<string>("Something went wrong");
    const result = queryGate([q1, q2]);
    expect(result.ready).toBe(false);
  });

  it("returns gate when data is undefined", () => {
    const q1 = makeSuccessQuery("data1");
    const q2 = { data: undefined, isLoading: false, error: null } as any;
    const result = queryGate([q1, q2]);
    expect(result.ready).toBe(false);
  });

  it("returns ready with data when all queries succeed", () => {
    const q1 = makeSuccessQuery("hello");
    const q2 = makeSuccessQuery(42);
    const result = queryGate([q1, q2]);
    expect(result.ready).toBe(true);
    if (result.ready) {
      const [a, b] = result.data;
      expect(a).toBe("hello");
      expect(b).toBe(42);
    }
  });

  it("returns ready with single query data", () => {
    const q1 = makeSuccessQuery([1, 2, 3]);
    const result = queryGate([q1]);
    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.data[0]).toEqual([1, 2, 3]);
    }
  });

  it("returns ready with three queries", () => {
    const q1 = makeSuccessQuery("a");
    const q2 = makeSuccessQuery("b");
    const q3 = makeSuccessQuery("c");
    const result = queryGate([q1, q2, q3]);
    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.data).toEqual(["a", "b", "c"]);
    }
  });

  it("prioritizes loading over error", () => {
    const q1 = makeLoadingQuery<string>();
    const q2 = makeErrorQuery<string>("error");
    const result = queryGate([q1, q2]);
    expect(result.ready).toBe(false);
  });
});
