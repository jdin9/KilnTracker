"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { getClientStudioDetails, getClientStudioPassword, setSiteAccessCookie } from "@/lib/studioStorage";

export default function AccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 px-6 py-10">
          <div className="w-full max-w-xl rounded-3xl border border-purple-100 bg-white p-8 shadow-xl">
            <p className="text-center text-sm font-semibold text-purple-700">Loading studio access…</p>
          </div>
        </main>
      }
    >
      <AccessForm />
    </Suspense>
  );
}

function AccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [studioName, setStudioName] = useState(getClientStudioDetails().name);
  const [expectedCode, setExpectedCode] = useState(getClientStudioPassword());

  useEffect(() => {
    const studioDetails = getClientStudioDetails();
    setStudioName(studioDetails.name);
    setExpectedCode(getClientStudioPassword());
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (code.trim() === expectedCode) {
      setSiteAccessCookie(expectedCode);
      const redirectPath = searchParams?.get("redirect") ?? "/";
      router.push(redirectPath || "/");
      return;
    }

    setError("That code doesn't match the studio password. Please try again.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 px-6 py-10">
      <div className="w-full max-w-xl space-y-6 rounded-3xl border border-purple-100 bg-white p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Secure Access</p>
          <h1 className="text-3xl font-bold text-gray-900">Enter the studio code</h1>
          <p className="text-sm text-gray-600">
            Use the password configured in the Admin portal &gt; Studio tab to unlock the site.
          </p>
        </div>

        <div className="rounded-2xl bg-purple-50 p-4 text-sm text-gray-700 ring-1 ring-purple-100">
          <p className="font-semibold text-gray-900">Studio</p>
          <p className="text-gray-700">{studioName}</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="studio-code" className="block text-sm font-semibold text-gray-800">
              Studio code
            </label>
            <input
              id="studio-code"
              name="studio-code"
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              placeholder="Enter the studio password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            Unlock site
          </button>
        </form>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <Link href="/" className="font-semibold text-purple-700 hover:text-purple-800">
            Back to home
          </Link>
          <span>Need the code? Ask an admin to confirm the latest password.</span>
        </div>
      </div>
    </main>
  );
}
