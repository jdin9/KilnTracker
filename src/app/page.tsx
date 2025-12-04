import Link from "next/link";

import { logoutAction } from "./authActions";
import { getSessionUser } from "@/server/auth/session";

export default async function HomePage() {
  const sessionUser = await getSessionUser();
  const isAdmin = sessionUser?.role === "ADMIN";

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
              Kiln Tracker
            </p>
            <h1 className="text-4xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-base text-gray-600">
              Choose where you want to work today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-purple-200 hover:text-purple-800"
              >
                Admin Panel
              </Link>
            ) : (
              <Link
                href="/signin"
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-purple-200 hover:text-purple-800"
              >
                Admin sign in
              </Link>
            )}

            {sessionUser ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-red-200 hover:text-red-700"
                >
                  Sign out
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-1 items-center">
          <div className="grid w-full gap-6 md:grid-cols-2">
            <Link
              href="/kiln"
              className="group relative flex min-h-[320px] flex-col justify-center overflow-hidden rounded-3xl bg-white/80 p-8 shadow-lg ring-1 ring-purple-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-indigo-50/70 opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-4 text-gray-900">
                <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
                  Kiln Tracker
                </p>
                <h2 className="text-3xl font-bold">Manage firings with confidence</h2>
                <p className="text-lg text-gray-700">
                  Start new firings, monitor temperatures, and review logs in one place.
                </p>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700">
                  Go to Kiln Tracker
                </span>
              </div>
            </Link>

            <Link
              href="/projects"
              className="group relative flex min-h-[320px] flex-col justify-center overflow-hidden rounded-3xl bg-white/80 p-8 shadow-lg ring-1 ring-purple-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-transparent to-purple-50/70 opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-4 text-gray-900">
                <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
                  Pottery Tracker
                </p>
                <h2 className="text-3xl font-bold">Organize projects and pieces</h2>
                <p className="text-lg text-gray-700">
                  Track clay bodies, glaze stages, and studio notes for every project.
                </p>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700">
                  Go to Pottery Tracker
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
