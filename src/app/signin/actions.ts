'use server';

import { redirect } from 'next/navigation';

import { signIn } from '@/server/auth/authService';

export type AuthFormState = {
  error: string | null;
};

export async function signInAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    await signIn({ email, password });
    redirect('/');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to sign in.' };
  }
}
