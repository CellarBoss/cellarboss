"use server";

import type { ApiResult } from "@cellarboss/api-client";
import { api } from "./client";

export type { AdminUser, UserFormData } from "@cellarboss/api-client";
type AdminUser = import("@cellarboss/api-client").AdminUser;
type UserFormData = import("@cellarboss/api-client").UserFormData;

export async function getUsers(): Promise<ApiResult<AdminUser[]>> {
  return api.users.getAll();
}

export async function getUserById(id: string): Promise<ApiResult<AdminUser>> {
  return api.users.getById(id);
}

export async function createUser(
  data: UserFormData,
): Promise<ApiResult<AdminUser>> {
  return api.users.create(data);
}

export async function updateUser(
  data: UserFormData,
): Promise<ApiResult<AdminUser>> {
  return api.users.update(data);
}

export async function deleteUser(id: string): Promise<ApiResult<boolean>> {
  return api.users.delete(id);
}
