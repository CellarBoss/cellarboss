import { describe, it, expect } from "vitest";
import { ApiQueryError } from "../../types";
import type { ApiError } from "../../types";

describe("ApiQueryError", () => {
  it("sets message from apiError", () => {
    const apiError: ApiError = { message: "Not found", status: 404 };
    const error = new ApiQueryError(apiError);

    expect(error.message).toBe("Not found");
    expect(error.name).toBe("ApiQueryError");
    expect(error.apiError).toBe(apiError);
  });

  it("preserves field-level errors", () => {
    const apiError: ApiError = {
      message: "Validation failed",
      status: 400,
      errors: { name: "Required", email: "Invalid" },
    };
    const error = new ApiQueryError(apiError);

    expect(error.apiError.errors).toEqual({
      name: "Required",
      email: "Invalid",
    });
  });

  it("is an instance of Error", () => {
    const error = new ApiQueryError({ message: "test", status: 500 });
    expect(error).toBeInstanceOf(Error);
  });
});
