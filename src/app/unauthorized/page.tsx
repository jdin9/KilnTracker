import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 px-6 py-10">
      <div className="max-w-lg space-y-4 rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Access restricted</p>
        <h1 className="text-3xl font-bold text-gray-900">You do not have permission to view this page.</h1>
        <p className="text-sm text-gray-600">
          Please sign in with an administrator account or contact your studio lead if you believe this is a mistake.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-orange-200 hover:text-orange-800"
          >
            Sign in as admin
          </Link>
          <Link
            href="/"
            className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
