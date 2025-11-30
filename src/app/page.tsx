import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Kiln Tracker
            </p>
            <h1 className="text-4xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-base text-gray-600">
              Choose where you want to work today.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-amber-200 hover:text-amber-800"
          >
            Admin Login
          </Link>
        </div>

        <div className="mt-12 flex flex-1 items-center">
          <div className="grid w-full gap-6 md:grid-cols-2">
            <Link
              href="/kiln"
              className="group relative flex min-h-[320px] flex-col justify-center overflow-hidden rounded-3xl bg-white/80 p-8 shadow-lg ring-1 ring-amber-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 via-transparent to-orange-50/70 opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-4 text-gray-900">
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                  Kiln Tracker
                </p>
                <h2 className="text-3xl font-bold">Manage firings with confidence</h2>
                <p className="text-lg text-gray-700">
                  Start new firings, monitor temperatures, and review logs in one place.
                </p>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-amber-700">
                  Go to Kiln Tracker
                </span>
              </div>
            </Link>

            <Link
              href="/projects"
              className="group relative flex min-h-[320px] flex-col justify-center overflow-hidden rounded-3xl bg-white/80 p-8 shadow-lg ring-1 ring-amber-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-transparent to-amber-50/70 opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-4 text-gray-900">
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                  Pottery Tracker
                </p>
                <h2 className="text-3xl font-bold">Organize projects and pieces</h2>
                <p className="text-lg text-gray-700">
                  Track clay bodies, glaze stages, and studio notes for every project.
                </p>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-amber-700">
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
