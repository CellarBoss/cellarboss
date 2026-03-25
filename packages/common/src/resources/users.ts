import type { ApiResult, RequestFn } from "../types";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  banned: boolean | null;
  banReason: string | null;
};

export type UserFormData = {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
};

export function usersResource(request: RequestFn) {
  return {
    getAll: async (): Promise<ApiResult<AdminUser[]>> => {
      const result = await request<{ users: AdminUser[]; total: number }>(
        "auth/admin/list-users?limit=1000",
        "GET",
      );
      if (!result.ok) return result;
      return { ok: true, data: result.data.users };
    },

    getById: (id: string): Promise<ApiResult<AdminUser>> =>
      request<AdminUser>(`user/${id}`, "GET"),

    create: (data: UserFormData): Promise<ApiResult<AdminUser>> => {
      const body: Record<string, string> = {
        name: data.name,
        email: data.email,
        role: data.role,
      };
      if (data.password) {
        body.password = data.password;
      }
      return request<AdminUser>(
        "auth/admin/create-user",
        "POST",
        JSON.stringify(body),
      );
    },

    update: async (data: UserFormData): Promise<ApiResult<AdminUser>> => {
      const updateResult = await request<AdminUser>(
        `user/${data.id}`,
        "PUT",
        JSON.stringify({ name: data.name, email: data.email }),
      );
      if (!updateResult.ok) return updateResult;

      const roleResult = await request<AdminUser>(
        "auth/admin/set-role",
        "POST",
        JSON.stringify({ userId: data.id, role: data.role }),
      );
      if (!roleResult.ok) return roleResult;

      return updateResult;
    },

    delete: async (id: string): Promise<ApiResult<boolean>> => {
      const result = await request<{ success: boolean }>(
        "auth/admin/remove-user",
        "POST",
        JSON.stringify({ userId: id }),
      );
      if (!result.ok) return result;
      return { ok: true, data: true };
    },
  };
}
