"use client";

import { authClient } from "@/lib/auth-client";

export default function Home() {
  return (
    <section className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">Welcome to CellarBoss 🍷</h1>
      <p className="text-gray-600">
        Track and manage your cellar in one place.
      </p>
      <UserDisplay />
    </section>
  );
}

export function UserDisplay() {
  const session = authClient.useSession();
  const user = session.data?.user;

  if (!session || !user) return null;
  return <p>Hello, {user.name}</p>;
}
