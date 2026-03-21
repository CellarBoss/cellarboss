import { describe, it, expect } from "vitest";
import React from "react";
import { queryGateCore } from "../query-gate";
import type { UseApiQueryResult } from "../hooks/use-api-query";
import type { ApiQueryError } from "../types";

function makeQuery<T>(
  overrides: Partial<UseApiQueryResult<T>>,
): UseApiQueryResult<T> {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    isPending: false,
    isFetching: false,
    isRefetching: false,
    status: "pending",
    fetchStatus: "idle",
    failureCount: 0,
    failureReason: null,
    refetch: (() => {}) as any,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    isLoadingError: false,
    isRefetchError: false,
    isPaused: false,
    isPlaceholderData: false,
    isStale: false,
    isFetched: false,
    isFetchedAfterMount: false,
    errorUpdateCount: 0,
    promise: Promise.resolve() as any,
    ...overrides,
  } as UseApiQueryResult<T>;
}

const loadingComponent = React.createElement("div", null, "Loading...");
const errorComponent = (msg: string) =>
  React.createElement("div", null, `Error: ${msg}`);
const options = { loadingComponent, errorComponent };

describe("queryGateCore", () => {
  it("returns loading gate when any query is loading", () => {
    const q1 = makeQuery<string>({ isLoading: true });
    const q2 = makeQuery<number>({ data: 42, isSuccess: true });

    const result = queryGateCore([q1, q2], options);

    expect(result.ready).toBe(false);
    if (!result.ready) {
      expect(result.gate).toBe(loadingComponent);
    }
  });

  it("returns error gate when a query has an error", () => {
    const apiError = {
      message: "Not found",
      status: 404,
    };
    const q1 = makeQuery<string>({
      error: {
        name: "ApiQueryError",
        message: "Not found",
        apiError,
      } as ApiQueryError,
      isError: true,
    });

    const result = queryGateCore([q1], options);

    expect(result.ready).toBe(false);
    if (!result.ready) {
      expect(result.gate.props.children).toBe("Error: Not found");
    }
  });

  it("returns error gate when data is undefined (no loading, no error)", () => {
    const q1 = makeQuery<string>({});

    const result = queryGateCore([q1], options);

    expect(result.ready).toBe(false);
    if (!result.ready) {
      expect(result.gate.props.children).toBe(
        "Error: Unexpected error: no data received",
      );
    }
  });

  it("returns success with data tuple when all queries have data", () => {
    const q1 = makeQuery<string>({ data: "hello", isSuccess: true });
    const q2 = makeQuery<number>({ data: 42, isSuccess: true });

    const result = queryGateCore([q1, q2], options);

    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.data).toEqual(["hello", 42]);
    }
  });

  it("works with a single query", () => {
    const q1 = makeQuery<string[]>({
      data: ["a", "b"],
      isSuccess: true,
    });

    const result = queryGateCore([q1], options);

    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.data).toEqual([["a", "b"]]);
    }
  });

  it("prioritizes loading over error", () => {
    const q1 = makeQuery<string>({ isLoading: true });
    const q2 = makeQuery<number>({
      error: {
        name: "ApiQueryError",
        message: "fail",
        apiError: { message: "fail", status: 500 },
      } as ApiQueryError,
      isError: true,
    });

    const result = queryGateCore([q1, q2], options);

    expect(result.ready).toBe(false);
    if (!result.ready) {
      expect(result.gate).toBe(loadingComponent);
    }
  });

  it("returns first error encountered", () => {
    const q1 = makeQuery<string>({
      error: {
        name: "ApiQueryError",
        message: "first",
        apiError: { message: "first error", status: 400 },
      } as ApiQueryError,
      isError: true,
    });
    const q2 = makeQuery<number>({
      error: {
        name: "ApiQueryError",
        message: "second",
        apiError: { message: "second error", status: 500 },
      } as ApiQueryError,
      isError: true,
    });

    const result = queryGateCore([q1, q2], options);

    expect(result.ready).toBe(false);
    if (!result.ready) {
      expect(result.gate.props.children).toBe("Error: first error");
    }
  });
});
