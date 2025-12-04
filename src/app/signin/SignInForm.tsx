'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';

import type { AuthFormState } from './actions';
import { signInAction } from './actions';

const initialState: AuthFormState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export default function SignInForm() {
  const [state, formAction] = useFormState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          placeholder="you@example.com"
          autoComplete="email"
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
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-gray-600">
        New to Kiln Tracker?{' '}
        <Link href="/signup" className="font-semibold text-purple-700 hover:text-purple-800">
          Create an account
        </Link>
      </p>
    </form>
  );
}
