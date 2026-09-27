import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ProfileFormData } from "@/lib/fields/profile";

const authClient = vi.hoisted(() => ({
  changePassword: vi.fn(),
  updateUser: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ authClient }));

import { saveProfile } from "../profile";

const baseForm: ProfileFormData = {
  id: "u1",
  name: "Alice",
  email: "alice@example.com",
  currentPassword: "",
  password: "",
  confirmPassword: "",
};

describe("saveProfile", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authClient.changePassword.mockResolvedValue({
      data: { token: null },
      error: null,
    });
    authClient.updateUser.mockResolvedValue({
      data: { status: true },
      error: null,
    });
    authClient.getSession.mockResolvedValue({ data: null, error: null });
  });

  it("updates only the name when no new password is given", async () => {
    const result = await saveProfile(baseForm);

    expect(result).toEqual({ ok: true, data: baseForm });
    expect(authClient.changePassword).not.toHaveBeenCalled();
    expect(authClient.updateUser).toHaveBeenCalledWith({ name: "Alice" });
  });

  it("changes the password through changePassword, not updateUser", async () => {
    const form = {
      ...baseForm,
      currentPassword: "OldPass1!",
      password: "NewPass1!",
      confirmPassword: "NewPass1!",
    };

    const result = await saveProfile(form);

    expect(result.ok).toBe(true);
    expect(authClient.changePassword).toHaveBeenCalledWith({
      currentPassword: "OldPass1!",
      newPassword: "NewPass1!",
      revokeOtherSessions: true,
    });
    // updateUser silently ignores a password, so it must never be sent there
    expect(authClient.updateUser).toHaveBeenCalledWith({ name: "Alice" });
  });

  it("rejects mismatched passwords without calling the server", async () => {
    const result = await saveProfile({
      ...baseForm,
      currentPassword: "OldPass1!",
      password: "NewPass1!",
      confirmPassword: "Different1!",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.errors).toEqual({
        confirmPassword: "Passwords do not match",
      });
    }
    expect(authClient.changePassword).not.toHaveBeenCalled();
    expect(authClient.updateUser).not.toHaveBeenCalled();
  });

  it("requires the current password to set a new one", async () => {
    const result = await saveProfile({
      ...baseForm,
      password: "NewPass1!",
      confirmPassword: "NewPass1!",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.errors).toHaveProperty("currentPassword");
    }
    expect(authClient.changePassword).not.toHaveBeenCalled();
    expect(authClient.updateUser).not.toHaveBeenCalled();
  });

  it("reports an incorrect current password and leaves the name alone", async () => {
    authClient.changePassword.mockResolvedValue({
      data: null,
      error: {
        code: "INVALID_PASSWORD",
        message: "Invalid password",
        status: 400,
      },
    });

    const result = await saveProfile({
      ...baseForm,
      currentPassword: "WrongPass1!",
      password: "NewPass1!",
      confirmPassword: "NewPass1!",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.errors).toEqual({
        currentPassword: "Current password is incorrect",
      });
    }
    expect(authClient.updateUser).not.toHaveBeenCalled();
  });

  it("passes through other changePassword errors", async () => {
    authClient.changePassword.mockResolvedValue({
      data: null,
      error: {
        code: "PASSWORD_TOO_LONG",
        message: "Password too long",
        status: 400,
      },
    });

    const result = await saveProfile({
      ...baseForm,
      currentPassword: "OldPass1!",
      password: "NewPass1!",
      confirmPassword: "NewPass1!",
    });

    expect(result).toEqual({
      ok: false,
      error: { message: "Password too long", status: 400 },
    });
  });

  it("returns an error when updateUser fails", async () => {
    authClient.updateUser.mockResolvedValue({
      data: null,
      error: { message: "Nope", status: 500 },
    });

    const result = await saveProfile(baseForm);

    expect(result).toEqual({
      ok: false,
      error: { message: "Nope", status: 400 },
    });
  });

  it("says the password changed when the name update then fails", async () => {
    authClient.updateUser.mockResolvedValue({
      data: null,
      error: { message: "Nope", status: 500 },
    });

    const result = await saveProfile({
      ...baseForm,
      currentPassword: "OldPass1!",
      password: "NewPass1!",
      confirmPassword: "NewPass1!",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        message:
          "Password was changed, but the name could not be updated: Nope",
        status: 400,
      },
    });
  });

  it("says the password changed when the name update then throws", async () => {
    authClient.updateUser.mockRejectedValue(new Error("Network down"));

    const result = await saveProfile({
      ...baseForm,
      currentPassword: "OldPass1!",
      password: "NewPass1!",
      confirmPassword: "NewPass1!",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        message:
          "Password was changed, but the name could not be updated: Network down",
        status: 500,
      },
    });
  });

  it("still succeeds when only the session refresh fails", async () => {
    authClient.getSession.mockRejectedValue(new Error("Network down"));

    const result = await saveProfile(baseForm);

    expect(result).toEqual({ ok: true, data: baseForm });
    expect(authClient.updateUser).toHaveBeenCalled();
  });

  it("returns a 500 when the client throws", async () => {
    authClient.updateUser.mockRejectedValue(new Error("Network down"));

    const result = await saveProfile(baseForm);

    expect(result).toEqual({
      ok: false,
      error: { message: "Network down", status: 500 },
    });
  });
});
