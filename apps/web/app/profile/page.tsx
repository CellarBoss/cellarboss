"use client";

import { authClient } from "@/lib/auth-client";
import { PageHeader } from "@/components/page/PageHeader";
import { GenericCard } from "@/components/cards/GenericCard";
import { profileFields, type ProfileFormData } from "@/lib/fields/profile";
import { saveProfile } from "@/lib/functions/profile";

export default function ProfilePage() {
  const session = authClient.useSession();
  const user = session.data?.user;

  if (!user) {
    return (
      <section>
        <PageHeader title="Profile" />
        <div className="text-center text-muted-foreground py-8">
          Please log in to view your profile.
        </div>
      </section>
    );
  }

  const initialData: ProfileFormData = {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    currentPassword: "",
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
        processSave={saveProfile}
        redirectTo="/profile"
      />
    </section>
  );
}
