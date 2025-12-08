"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import {
  getClientStudioDetails,
  getClientStudioPassword,
  getSiteAccessCode,
  setSiteAccessCookie,
} from "@/lib/studioStorage";

export function AccessGate({ children }: { children: ReactNode }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expectedCode, setExpectedCode] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const studioName = useMemo(() => getClientStudioDetails().name, []);

  useEffect(() => {
    const expected = getClientStudioPassword();
    const provided = getSiteAccessCode();

    setExpectedCode(expected);
    setHasAccess(expected.length > 0 && provided === expected);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = code.trim();

    if (expectedCode && trimmed === expectedCode) {
      setSiteAccessCookie(trimmed);
      setHasAccess(true);
      return;
    }

    setError("That code doesn't match the studio password. Please try again.");
  };

  return (
    <>
      <div aria-hidden={!hasAccess} className={!hasAccess ? "pointer-events-none blur-[1px]" : undefined}>
        {children}
      </div>

      {!hasAccess && expectedCode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg space-y-6 rounded-3xl border border-purple-100 bg-white p-8 shadow-2xl">
            <div className="space-y-2 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Secure Access</p>
              <h1 className="text-2xl font-bold text-gray-900">Enter the studio code</h1>
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
                  autoFocus
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
              <span>Need the code? Ask an admin to confirm the latest password.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
