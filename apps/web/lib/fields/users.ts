import type { FieldConfig } from "@/lib/types/field";
import type { AdminUser, UserFormData } from "@/lib/api/users";
import * as z from "zod";

const strongPassword = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), "Password must contain at least one special character")
  .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
  .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
  .refine((val) => /[0-9]/.test(val), "Password must contain at least one number");

const passwordValidator = z.union([z.string().length(0), strongPassword]);

const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

export const createUserFields: FieldConfig<UserFormData>[] = [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    validator: z.string().min(1, "Name is required").max(255),
  },
  {
    key: "email",
    label: "Email Address",
    type: "text",
    validator: z.email("Invalid email address"),
  },
  {
    key: "password",
    label: "Password",
    type: "password",
    validator: strongPassword,
  },
  {
    key: "role",
    label: "Role",
    type: "fixed-list",
    options: roleOptions,
    validator: z.enum(["user", "admin"]),
  },
];

export const editUserFields: FieldConfig<UserFormData>[] = [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    validator: z.string().min(1, "Name is required").max(255),
  },
  {
    key: "email",
    label: "Email Address",
    type: "text",
    validator: z.email("Invalid email address"),
  },
  {
    key: "role",
    label: "Role",
    type: "fixed-list",
    options: roleOptions,
    validator: z.enum(["user", "admin"]),
  },
  {
    key: "password",
    label: "New Password (leave blank to keep current)",
    type: "password",
    validator: passwordValidator,
  },
];

export const viewUserFields: FieldConfig<AdminUser>[] = [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    validator: z.string(),
  },
  {
    key: "email",
    label: "Email Address",
    type: "text",
    validator: z.string(),
  },
  {
    key: "role",
    label: "Role",
    type: "text",
    validator: z.string(),
  },
  {
    key: "createdAt",
    label: "Created At",
    type: "text",
    validator: z.string(),
  },
];
