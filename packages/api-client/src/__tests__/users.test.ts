import { describe, it, expect, vi, beforeEach } from "vitest";
import { usersResource } from "../resources/users";
import type { RequestFn } from "../types";

describe("usersResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let users: ReturnType<typeof usersResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    users = usersResource(mockRequest);
  });

  describe("getAll", () => {
    it("unwraps users from nested response", async () => {
      const userList = [
        {
          id: "1",
          name: "Alice",
          email: "a@b.com",
          role: "admin",
          createdAt: "",
          banned: null,
          banReason: null,
        },
      ];
      vi.mocked(mockRequest).mockResolvedValue({
        ok: true,
        data: { users: userList, total: 1 },
      });

      const result = await users.getAll();

      expect(mockRequest).toHaveBeenCalledWith(
        "auth/admin/list-users?limit=1000",
        "GET",
      );
      expect(result).toEqual({ ok: true, data: userList });
    });

    it("returns error when request fails", async () => {
      const error = { message: "Unauthorized", status: 401 };
      vi.mocked(mockRequest).mockResolvedValue({ ok: false, error });

      const result = await users.getAll();
      expect(result).toEqual({ ok: false, error });
    });
  });

  describe("getById", () => {
    it("calls GET user/{id}", async () => {
      vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
      await users.getById("abc-123");
      expect(mockRequest).toHaveBeenCalledWith("user/abc-123", "GET");
    });
  });

  describe("create", () => {
    it("sends name, email, role", async () => {
      vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
      await users.create({
        id: "",
        name: "Alice",
        email: "a@b.com",
        role: "user",
      });

      const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
      expect(body).toEqual({ name: "Alice", email: "a@b.com", role: "user" });
      expect(body.password).toBeUndefined();
    });

    it("includes password when provided", async () => {
      vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
      await users.create({
        id: "",
        name: "Bob",
        email: "b@b.com",
        role: "admin",
        password: "secret",
      });

      const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
      expect(body.password).toBe("secret");
    });

    it("calls auth/admin/create-user endpoint", async () => {
      vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
      await users.create({
        id: "",
        name: "X",
        email: "x@x.com",
        role: "user",
      });
      expect(mockRequest).toHaveBeenCalledWith(
        "auth/admin/create-user",
        "POST",
        expect.any(String),
      );
    });
  });

  describe("update", () => {
    it("chains two requests: update profile then set role", async () => {
      const updatedUser = {
        id: "u1",
        name: "Alice",
        email: "a@b.com",
        role: "admin",
        createdAt: "",
        banned: null,
        banReason: null,
      };
      vi.mocked(mockRequest)
        .mockResolvedValueOnce({ ok: true, data: updatedUser })
        .mockResolvedValueOnce({ ok: true, data: updatedUser });

      const result = await users.update({
        id: "u1",
        name: "Alice",
        email: "a@b.com",
        role: "admin",
      });

      expect(mockRequest).toHaveBeenCalledTimes(2);
      // First call: update name/email
      expect(mockRequest).toHaveBeenNthCalledWith(
        1,
        "user/u1",
        "PUT",
        JSON.stringify({ name: "Alice", email: "a@b.com" }),
      );
      // Second call: set role
      expect(mockRequest).toHaveBeenNthCalledWith(
        2,
        "auth/admin/set-role",
        "POST",
        JSON.stringify({ userId: "u1", role: "admin" }),
      );
      expect(result).toEqual({ ok: true, data: updatedUser });
    });

    it("returns error if first request fails", async () => {
      const error = { message: "Not found", status: 404 };
      vi.mocked(mockRequest).mockResolvedValueOnce({ ok: false, error });

      const result = await users.update({
        id: "u1",
        name: "Alice",
        email: "a@b.com",
        role: "admin",
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: false, error });
    });

    it("returns error if role request fails", async () => {
      const user = {
        id: "u1",
        name: "Alice",
        email: "a@b.com",
        role: "user",
        createdAt: "",
        banned: null,
        banReason: null,
      };
      const error = { message: "Forbidden", status: 403 };
      vi.mocked(mockRequest)
        .mockResolvedValueOnce({ ok: true, data: user })
        .mockResolvedValueOnce({ ok: false, error });

      const result = await users.update({
        id: "u1",
        name: "Alice",
        email: "a@b.com",
        role: "admin",
      });

      expect(mockRequest).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ ok: false, error });
    });
  });

  describe("delete", () => {
    it("maps response to boolean", async () => {
      vi.mocked(mockRequest).mockResolvedValue({
        ok: true,
        data: { success: true },
      });

      const result = await users.delete("u1");

      expect(mockRequest).toHaveBeenCalledWith(
        "auth/admin/remove-user",
        "POST",
        JSON.stringify({ userId: "u1" }),
      );
      expect(result).toEqual({ ok: true, data: true });
    });

    it("returns error when request fails", async () => {
      const error = { message: "Forbidden", status: 403 };
      vi.mocked(mockRequest).mockResolvedValue({ ok: false, error });

      const result = await users.delete("u1");
      expect(result).toEqual({ ok: false, error });
    });
  });
});
