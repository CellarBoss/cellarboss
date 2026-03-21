"use server";

import type { ApiResult } from "@cellarboss/common";
import { api } from "./client";

export type { AdminUser, UserFormData } from "@cellarboss/common";
type AdminUser = import("@cellarboss/common").AdminUser;
type UserFormData = import("@cellarboss/common").UserFormData;

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
