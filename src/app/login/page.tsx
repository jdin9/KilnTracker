import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { setSessionUser } from "@/server/auth/session";
import { authConfig } from "@/server/config/env";
import { consumeRateLimit } from "@/server/utils/rateLimiter";

const AUTH_RATE_LIMIT = {
  limit: 5,
  windowMs: 60_000,
};

const defaultAdminUser = {
  id: "admin-1",
  email: "admin@example.com",
  displayName: "Admin User",
  studioId: "studio-1",
  role: "ADMIN" as const,
};

function isValidCredentials(username: string, password: string) {
  return username === authConfig.adminUsername && password === authConfig.adminPassword;
}

async function loginAction(formData: FormData) {
  "use server";

  const forwardedFor = headers().get("x-forwarded-for") ?? "unknown";
  const clientIp = forwardedFor.split(",")[0]?.trim() || "unknown";

  const rateLimitResult = consumeRateLimit(`login:${clientIp}`, AUTH_RATE_LIMIT);

  if (!rateLimitResult.success) {
    redirect("/login?error=rate_limit");
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidCredentials(username, password)) {
    redirect("/login?error=invalid");
  }

  setSessionUser(defaultAdminUser);
  redirect("/admin");
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const error = searchParams?.error;
  const hasError = error === "invalid";
  const rateLimited = error === "rate_limit";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 px-6 py-10">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-purple-100 bg-white p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Admin Sign In</p>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-600">Use your administrator credentials to continue.</p>
        </div>

        {hasError && <ErrorBanner message="Incorrect username or password. Please try again." />}
        {rateLimited && (
          <ErrorBanner message="Too many sign-in attempts. Please wait a minute before trying again." />
        )}

        <form action={loginAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-800">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">Use the administrator credentials provided to you.</p>
      </div>
    </main>
  );
}
