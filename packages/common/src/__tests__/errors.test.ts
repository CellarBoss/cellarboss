import { describe, it, expect } from "vitest";
import { processBackendError } from "../errors";

describe("processBackendError", () => {
  const makeResponse = (status: number) => ({ status }) as Response;

  it("extracts field-level validation errors from data.errors array", () => {
    const result = processBackendError(makeResponse(422), {
      errors: [
        { path: "name", msg: "Name is required" },
        { path: "email", msg: "Invalid email" },
      ],
    });

    expect(result).toEqual({
      message: "Input validation failed",
      errors: {
        name: "Name is required",
        email: "Invalid email",
      },
      status: 422,
    });
  });

  it("skips errors without a path", () => {
    const result = processBackendError(makeResponse(422), {
      errors: [{ path: "name", msg: "Required" }, { msg: "General error" }],
    });

    expect(result.errors).toEqual({ name: "Required" });
  });

  it("falls back to data.error when no errors array", () => {
    const result = processBackendError(makeResponse(400), {
      error: "Bad request",
    });

    expect(result).toEqual({
      message: "Bad request",
      status: 400,
    });
  });

  it("falls back to data.message when no error field", () => {
    const result = processBackendError(makeResponse(500), {
      message: "Internal server error",
    });

    expect(result).toEqual({
      message: "Internal server error",
      status: 500,
    });
  });

  it("returns 'Unexpected error' when data has no recognizable fields", () => {
    const result = processBackendError(makeResponse(500), {});

    expect(result).toEqual({
      message: "Unexpected error",
      status: 500,
    });
  });

  it("returns 'Unexpected error' when data is null", () => {
    const result = processBackendError(makeResponse(500), null);

    expect(result).toEqual({
      message: "Unexpected error",
      status: 500,
    });
  });

  it("returns 'Unexpected error' when data is undefined", () => {
    const result = processBackendError(makeResponse(500), undefined);

    expect(result).toEqual({
      message: "Unexpected error",
      status: 500,
    });
  });

  it("ignores empty errors array and falls back", () => {
    const result = processBackendError(makeResponse(400), {
      errors: [],
      error: "Fallback message",
    });

    expect(result).toEqual({
      message: "Fallback message",
      status: 400,
    });
  });

  it("prefers data.error over data.message", () => {
    const result = processBackendError(makeResponse(400), {
      error: "Error field",
      message: "Message field",
    });

    expect(result.message).toBe("Error field");
  });
});
