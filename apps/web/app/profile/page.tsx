"use client";

import { authClient } from "@/lib/auth-client";
import { PageHeader } from "@/components/page/PageHeader";
import { GenericCard } from "@/components/cards/GenericCard";
import { profileFields, type ProfileFormData } from "@/lib/fields/profile";
import { ApiResult } from "@/lib/api/types";

async function handleSave(formData: ProfileFormData): Promise<ApiResult<ProfileFormData>> {
  // Validate password confirmation if password is being changed
  if (formData.password && formData.password !== formData.confirmPassword) {
    return {
      ok: false,
      error: {
        message: "Passwords do not match",
        errors: { confirmPassword: "Passwords do not match" },
        status: 400,
      },
    };
  }

  const updateData: any = {
    name: formData.name,
  };

  // Only include password if it's being changed
  if (formData.password) {
    updateData.password = formData.password;
  }

  try {
    const result = await authClient.updateUser(updateData);

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
      data: result.data as any,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: {
        message: err.message || "Something went wrong",
        status: 500,
      },
    };
  }
}

export default function ProfilePage() {
  const session = authClient.useSession();
  const user = session.data?.user;

  if (!user) {
    return (
      <section>
        <PageHeader title="Profile" />
        <div className="text-center text-gray-500 py-8">
          Please log in to view your profile.
        </div>
      </section>
    );
  }

  const initialData: ProfileFormData = {
    id: user.id as any,
    name: user.name || "",
    email: user.email || "",
    password: "",
    confirmPassword: "",
  };

  return (
    <section>
      <PageHeader title="Profile" />
      <GenericCard<ProfileFormData>
        mode="edit"
        data={initialData}
        fields={profileFields}
        processSave={handleSave}
        redirectTo="/profile"
      />
    </section>
  );
}
