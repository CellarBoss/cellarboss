"use server";

import type { ApiResult } from "./types";
import { makeServerRequest } from "./server";

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

export async function getUsers(): Promise<ApiResult<AdminUser[]>> {
  const result = await makeServerRequest<{ users: AdminUser[]; total: number }>(
    "auth/admin/list-users?limit=1000",
    "GET",
  );
  if (!result.ok) return result;
  return { ok: true, data: result.data.users };
}

export async function getUserById(id: string): Promise<ApiResult<AdminUser>> {
  return makeServerRequest<AdminUser>(`user/${id}`, "GET");
}

export async function createUser(data: UserFormData): Promise<ApiResult<AdminUser>> {
  const body: Record<string, string> = {
    name: data.name,
    email: data.email,
    role: data.role,
  };
  if (data.password) {
    body.password = data.password;
  }
  return makeServerRequest<AdminUser>(
    "auth/admin/create-user",
    "POST",
    JSON.stringify(body),
  );
}

export async function updateUser(data: UserFormData): Promise<ApiResult<AdminUser>> {
  // Update name/email via custom route
  const updateResult = await makeServerRequest<AdminUser>(
    `user/${data.id}`,
    "PUT",
    JSON.stringify({ name: data.name, email: data.email }),
  );
  if (!updateResult.ok) return updateResult;

  // Update role via better-auth admin plugin
  const roleResult = await makeServerRequest<AdminUser>(
    "auth/admin/set-role",
    "POST",
    JSON.stringify({ userId: data.id, role: data.role }),
  );
  if (!roleResult.ok) return roleResult;

  return updateResult;
}

export async function deleteUser(id: string): Promise<ApiResult<boolean>> {
  const result = await makeServerRequest<{ success: boolean }>(
    "auth/admin/remove-user",
    "POST",
    JSON.stringify({ userId: id }),
  );
  if (!result.ok) return result;
  return { ok: true, data: true };
}
