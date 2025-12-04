"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

import { initialStudios } from "@/lib/studios";

type Account = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  password: string;
  studioName: string;
};

const initialAccounts: Account[] = [
  {
    id: 1,
    email: "jrivera@example.com",
    firstName: "Jamie",
    lastName: "Rivera",
    nickname: "Jamie",
    password: "wheelThrow123",
    studioName: initialStudios[0].name,
  },
  {
    id: 2,
    email: "tshaw@example.com",
    firstName: "Taylor",
    lastName: "Shaw",
    nickname: "Tay",
    password: "glazeGuard!",
    studioName: initialStudios[0].name,
  },
];

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    nickname: "",
    password: "",
    studioName: "",
    studioPassword: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const studioOptions = useMemo(() => initialStudios.map((studio) => studio.name), []);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const match = accounts.find(
      (account) => account.email.trim().toLowerCase() === loginForm.email.trim().toLowerCase()
    );

    if (!match || match.password !== loginForm.password) {
      setError("We couldn't find an account with those credentials.");
      return;
    }

    setMessage(`Welcome back, ${match.nickname || match.firstName}!`);
  };

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (
      !signupForm.email ||
      !signupForm.firstName ||
      !signupForm.lastName ||
      !signupForm.nickname ||
      !signupForm.password ||
      !signupForm.studioName ||
      !signupForm.studioPassword
    ) {
      setError("Please complete all fields to create an account.");
      return;
    }

    const studioMatch = initialStudios.find(
      (studio) =>
        studio.name.trim().toLowerCase() === signupForm.studioName.trim().toLowerCase() &&
        studio.password === signupForm.studioPassword
    );

    if (!studioMatch) {
      setError("Studio credentials didn't match. Reach out to your admin for the correct details.");
      return;
    }

    const emailTaken = accounts.some(
      (account) => account.email.trim().toLowerCase() === signupForm.email.trim().toLowerCase()
    );

    if (emailTaken) {
      setError("An account with that email already exists. Try logging in instead.");
      return;
    }

    const nextId = accounts.length ? Math.max(...accounts.map((account) => account.id)) + 1 : 1;
    const newAccount: Account = {
      id: nextId,
      email: signupForm.email.trim(),
      firstName: signupForm.firstName.trim(),
      lastName: signupForm.lastName.trim(),
      nickname: signupForm.nickname.trim(),
      password: signupForm.password,
      studioName: studioMatch.name,
    };

    setAccounts((prev) => [...prev, newAccount]);
    setMessage("Account created successfully. You can log in now.");
    setSignupForm({
      email: "",
      firstName: "",
      lastName: "",
      nickname: "",
      password: "",
      studioName: "",
      studioPassword: "",
    });
    setMode("login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-100">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Access</p>
            <h1 className="text-3xl font-bold text-gray-900">Login or create your account</h1>
            <p className="mt-1 text-sm text-gray-600">
              Use your studio&apos;s shared credentials to register. Admins can adjust studio details on
              the Admin dashboard.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-purple-200 hover:text-purple-800"
          >
            Back to home
          </Link>
        </header>

        <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-lg">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:bg-gradient-to-r md:from-purple-50 md:to-indigo-50">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Mode</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === "login" ? "Log in to your account" : "Sign up for access"}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === "login"
                  ? "Use the email and password you set when signing up."
                  : "Provide your studio details so we can verify your membership."}
              </p>
            </div>
            <div className="flex rounded-full bg-purple-100 p-1 text-sm font-semibold text-purple-800 shadow-inner">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-full px-4 py-2 transition ${
                  mode === "login" ? "bg-white shadow" : "hover:bg-white/70"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-full px-4 py-2 transition ${
                  mode === "signup" ? "bg-white shadow" : "hover:bg-white/70"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="grid gap-8 border-t border-purple-100 bg-white p-6 md:grid-cols-5">
            <div className="md:col-span-3">
              {mode === "login" ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="login-email">
                      Email
                    </label>
                    <input
                      id="login-email"
                      name="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="login-password">
                      Password
                    </label>
                    <input
                      id="login-password"
                      name="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700"
                  >
                    Log in
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleSignup}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-800" htmlFor="signup-email">
                        Email
                      </label>
                      <input
                        id="signup-email"
                        name="signup-email"
                        type="email"
                        value={signupForm.email}
                        onChange={(event) =>
                          setSignupForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                        className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-800" htmlFor="signup-nickname">
                        Nickname
                      </label>
                      <input
                        id="signup-nickname"
                        name="signup-nickname"
                        value={signupForm.nickname}
                        onChange={(event) =>
                          setSignupForm((prev) => ({ ...prev, nickname: event.target.value }))
                        }
                        className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                        placeholder="What should we call you?"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-800" htmlFor="signup-first">
                        First name
                      </label>
                      <input
                        id="signup-first"
                        name="signup-first"
                        value={signupForm.firstName}
                        onChange={(event) =>
                          setSignupForm((prev) => ({ ...prev, firstName: event.target.value }))
                        }
                        className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                        placeholder="Jordan"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-800" htmlFor="signup-last">
                        Last name
                      </label>
                      <input
                        id="signup-last"
                        name="signup-last"
                        value={signupForm.lastName}
                        onChange={(event) =>
                          setSignupForm((prev) => ({ ...prev, lastName: event.target.value }))
                        }
                        className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                        placeholder="Patel"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="signup-password">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      value={signupForm.password}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                      className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                      placeholder="Create a secure password"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="signup-studio">
                      Studio
                    </label>
                    <input
                      id="signup-studio"
                      name="signup-studio"
                      list="studio-list"
                      value={signupForm.studioName}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, studioName: event.target.value }))
                      }
                      className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                      placeholder="Studio name"
                      required
                    />
                    <datalist id="studio-list">
                      {studioOptions.map((studio) => (
                        <option key={studio} value={studio} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="signup-studio-password">
                      Studio password
                    </label>
                    <input
                      id="signup-studio-password"
                      name="signup-studio-password"
                      type="password"
                      value={signupForm.studioPassword}
                      onChange={(event) =>
                        setSignupForm((prev) => ({ ...prev, studioPassword: event.target.value }))
                      }
                      className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                      placeholder="Ask your admin for the studio password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700"
                  >
                    Create account
                  </button>
                </form>
              )}
            </div>

            <div className="md:col-span-2 space-y-4 rounded-2xl bg-purple-50 p-4 shadow-inner ring-1 ring-purple-100">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                  Studio verification
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  New sign-ups must match a studio name and shared password. If the details don&apos;t
                  match, let them know to reach out to the admin for the correct credentials.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Studios</p>
                <ul className="space-y-2 text-sm text-gray-900">
                  {initialStudios.map((studio) => (
                    <li
                      key={studio.id}
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-inner ring-1 ring-purple-100"
                    >
                      <span className="font-semibold">{studio.name}</span>
                      <span className="font-mono text-xs text-gray-600">{studio.password}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 shadow-sm">
                  {message}
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 shadow-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
