import { authClient } from "@/lib/auth-client";
import type { ApiResult } from "@/lib/api/types";
import type { ProfileFormData } from "@/lib/fields/profile";

function validationError(
  field: keyof ProfileFormData,
  message: string,
): ApiResult<ProfileFormData> {
  return {
    ok: false,
    error: {
      message: "Could not save profile",
      errors: { [field]: message },
      status: 400,
    },
  };
}

/**
 * Saves the signed-in user's profile.
 *
 * Better Auth's update-user endpoint ignores a password, so a new password
 * goes through change-password, which also checks the current one.
 */
export async function saveProfile(
  formData: ProfileFormData,
): Promise<ApiResult<ProfileFormData>> {
  if (formData.password) {
    if (formData.password !== formData.confirmPassword) {
      return validationError("confirmPassword", "Passwords do not match");
    }
    if (!formData.currentPassword) {
      return validationError(
        "currentPassword",
        "Current password is required to set a new password",
      );
    }
  }

  try {
    if (formData.password && formData.currentPassword) {
      const passwordResult = await authClient.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.password,
        revokeOtherSessions: true,
      });

      if (passwordResult.error) {
        if (passwordResult.error.code === "INVALID_PASSWORD") {
          return validationError(
            "currentPassword",
            "Current password is incorrect",
          );
        }
        return {
          ok: false,
          error: {
            message:
              passwordResult.error.message || "Failed to change password",
            status: passwordResult.error.status || 400,
          },
        };
      }
    }

    const result = await authClient.updateUser({ name: formData.name });

    if (!result.data) {
      return {
        ok: false,
        error: {
          message: result.error?.message || "Failed to update profile",
          status: 400,
        },
      };
    }

    // Refresh the session to get updated user data
    await authClient.getSession();

    return {
      ok: true,
      data: formData,
    };
  } catch (err) {
    return {
      ok: false,
      error: {
        message:
          (err instanceof Error && err.message) || "Something went wrong",
        status: 500,
      },
    };
  }
}
