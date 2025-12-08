import { cookies } from 'next/headers';

import type { SessionUser, UserRole } from './types';

const SESSION_COOKIE = 'kiln.session-token';

function serialize(user: SessionUser) {
  return Buffer.from(JSON.stringify(user)).toString('base64url');
}

function deserialize(token: string | null): SessionUser | null {
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as SessionUser;

    if (
      typeof parsed.id === 'string' &&
      typeof parsed.email === 'string' &&
      typeof parsed.displayName === 'string' &&
      typeof parsed.studioId === 'string' &&
      (parsed.role === 'ADMIN' || parsed.role === 'MEMBER')
    ) {
      return parsed;
    }

    return null;
  } catch (error) {
    console.error('Failed to parse session token', error);
    return null;
  }
}

export function issueSessionToken(user: SessionUser) {
  return serialize(user);
}

export function getSessionUser(): SessionUser | null {
  const token = cookies().get(SESSION_COOKIE)?.value ?? null;
  return deserialize(token);
}

export function setSessionUser(user: SessionUser) {
  const token = issueSessionToken(user);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}

export function hasRequiredRole(user: SessionUser | null, required: UserRole) {
  return Boolean(user && user.role === required);
}
