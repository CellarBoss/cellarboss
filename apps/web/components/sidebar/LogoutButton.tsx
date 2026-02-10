"use client";

import { authClient } from "@/lib/auth-client";

export function LogoutButton() {

  return (
    <button
      onClick={() => authClient.signOut()}
      className="ml-3 text-sm text-red-600 hover:underline"
    >
      Logout
    </button>
  );
}