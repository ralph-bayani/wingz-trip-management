"use client";

import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login, accessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (accessToken) {
    router.replace("/rides");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push("/rides");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-100 dark:bg-[#0d0d0f] px-4">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-4 top-4 rounded-lg px-3 py-1.5 text-sm font-medium text-surface-600 dark:text-gray-400 hover:bg-surface-200 dark:hover:bg-gray-700"
        title={theme === "dark" ? "Switch to light" : "Switch to dark"}
      >
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
      </button>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-surface-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-surface-900 dark:text-white">Wingz Trip Management</h1>
            <p className="mt-1 text-sm text-surface-600 dark:text-gray-400">Sign in to manage rides</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-surface-800 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-surface-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-surface-900 placeholder:text-surface-400 dark:placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-surface-800 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-surface-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-surface-900 placeholder:text-surface-400 dark:placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-surface-500 dark:text-gray-400">
            Only users with admin role can access the dashboard.
          </p>
          {process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS !== "false" && (
            <p className="mt-3 rounded-lg bg-surface-100 dark:bg-gray-700/50 px-3 py-2 text-center text-xs text-surface-600 dark:text-gray-400">
              <span className="font-medium">Demo:</span> admin@example.com / adminpass
            </p>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-surface-600 dark:text-gray-400">
          Back to{" "}
          <Link href="/" className="text-brand-500 dark:text-brand-400 hover:underline">
            home
          </Link>
        </p>
      </div>
    </div>
  );
}
