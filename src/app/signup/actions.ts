'use server';

import { redirect } from 'next/navigation';

import { signUp } from '@/server/auth/authService';

import type { AuthFormState } from '../signin/actions';

export async function signUpAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const displayName = String(formData.get('displayName') ?? '').trim();
  const studioName = String(formData.get('studioName') ?? '').trim();
  const studioPassword = String(formData.get('studioPassword') ?? '');
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!displayName || !studioName || !studioPassword || !email || !password) {
    return { error: 'All fields are required.' };
  }

  try {
    await signUp({ displayName, studioName, studioPassword, email, password });
    redirect('/');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to sign up.' };
  }
}
