'use client';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface Props {
  children: ReactNode;
}

/**
 * Wrap any protected page with this component.
 * Redirects to /login if no valid token is found.
 */
export default async function ProtectedRoute({ children }: Props) {
  const router = useRouter();

  const session = await getServerSession(authOptions);

    if (!session) {
      router.replace('/login');
      return <p className="text-center mt-10">Redirecting to login...</p>;
    }

  return <>{children}</>;
}