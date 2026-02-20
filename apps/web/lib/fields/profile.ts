import type { FieldConfig } from "@/lib/types/field";
import * as z from "zod";

export type ProfileFormData = {
  id: number;
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
};

export const profileFields: FieldConfig<ProfileFormData>[] = [
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
    editable: false,
  },
  {
    key: "password",
    label: "New Password (leave blank to keep current)",
    type: "password",
    validator: z.union([
      z.string().length(0), // Allow empty string to indicate no change
      z.string()
        .min(8, "Password must be at least 8 characters")
        .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), "Password must contain at least one special character")
        .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
        .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
        .refine((val) => /[0-9]/.test(val), "Password must contain at least one number"),
    ]),
  },
  {
    key: "confirmPassword",
    label: "Confirm New Password",
    type: "password",
    validator: z.string(),
  },
];
