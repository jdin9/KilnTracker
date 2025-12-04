'use server';

import { redirect } from 'next/navigation';

import { logout } from '@/server/auth/authService';

export async function logoutAction() {
  await logout();
  redirect('/signin');
}
