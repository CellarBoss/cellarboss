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

function unexpectedError(
  err: unknown,
  prefix = "",
): ApiResult<ProfileFormData> {
  return {
    ok: false,
    error: {
      message:
        prefix +
        ((err instanceof Error && err.message) || "Something went wrong"),
      status: 500,
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

  let passwordChanged = false;

  if (formData.password && formData.currentPassword) {
    try {
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
      passwordChanged = true;
    } catch (err) {
      return unexpectedError(err);
    }
  }

  // Once the password has changed, a failure below must not read as if
  // nothing was saved
  const nameFailurePrefix = passwordChanged
    ? "Password was changed, but the name could not be updated: "
    : "";

  try {
    const result = await authClient.updateUser({ name: formData.name });

    if (!result.data) {
      return {
        ok: false,
        error: {
          message:
            nameFailurePrefix +
            (result.error?.message || "Failed to update profile"),
          status: 400,
        },
      };
    }
  } catch (err) {
    return unexpectedError(err, nameFailurePrefix);
  }

  // Refresh the session to get updated user data. Everything is already
  // saved by now, so a failed refresh is not a failed save.
  try {
    await authClient.getSession();
  } catch {
    // The session hook refetches on its own
  }

  return {
    ok: true,
    data: formData,
  };
}
