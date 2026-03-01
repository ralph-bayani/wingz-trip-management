"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { accessToken, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (accessToken) {
      router.replace("/rides");
    } else {
      router.replace("/login");
    }
  }, [isReady, accessToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-[#0d0d0f]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}
