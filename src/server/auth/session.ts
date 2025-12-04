import crypto from 'crypto';
import { cookies } from 'next/headers';

import { authConfig } from '../config/env';

import type { SessionUser, UserRole } from './types';

const SESSION_COOKIE = 'kiln.session-token';

function signPayload(payload: string) {
  return crypto.createHmac('sha256', authConfig.sessionSecret).update(payload).digest('base64url');
}

function serialize(user: SessionUser) {
  return Buffer.from(JSON.stringify(user)).toString('base64url');
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) return false;

  return crypto.timingSafeEqual(bufferA, bufferB);
}

function deserialize(token: string | null): SessionUser | null {
  if (!token) return null;

  try {
    const [payload, signature] = token.split('.');

    if (!payload || !signature) return null;

    const expectedSignature = signPayload(payload);

    if (!safeEqual(expectedSignature, signature)) return null;

    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
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
  const payload = serialize(user);
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function getSessionUser(): SessionUser | null {
  const token = cookies().get(SESSION_COOKIE)?.value ?? null;
  return deserialize(token);
}

export function setSessionUser(user: SessionUser) {
  const token = issueSessionToken(user);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
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
