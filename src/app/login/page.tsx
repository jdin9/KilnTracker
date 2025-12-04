import { redirect } from "next/navigation";

import { setSessionUser } from "@/server/auth/session";

const ADMIN_USERNAME = "DinAdmin";
const ADMIN_PASSWORD = "Qwerty!123";

const defaultAdminUser = {
  id: "admin-1",
  email: "admin@example.com",
  displayName: "Admin User",
  studioId: "studio-1",
  role: "ADMIN" as const,
};

function isValidCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

async function loginAction(formData: FormData) {
  "use server";

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidCredentials(username, password)) {
    redirect("/login?error=invalid");
  }

  setSessionUser(defaultAdminUser);
  redirect("/admin");
}

function ErrorBanner() {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      Incorrect username or password. Please try again.
    </div>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const hasError = searchParams?.error === "invalid";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 px-6 py-10">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-purple-100 bg-white p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Admin Sign In</p>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-600">Use your administrator credentials to continue.</p>
        </div>

        {hasError && <ErrorBanner />}

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

        <p className="text-center text-xs text-gray-500">
          Hint: Username <span className="font-semibold text-gray-800">{ADMIN_USERNAME}</span> / Password
          <span className="font-semibold text-gray-800"> {ADMIN_PASSWORD}</span>
        </p>
      </div>
    </main>
  );
}
