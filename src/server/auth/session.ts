import crypto from 'crypto';
import { cookies } from 'next/headers';

import { prisma } from '@/db/client';

import type { SessionUser } from './types';

const SESSION_COOKIE = 'kiln.session-token';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildSessionUser(user: {
  id: string;
  email: string;
  displayName: string;
  studioId: string;
  role: SessionUser['role'];
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    studioId: user.studioId,
    role: user.role,
  };
}

function setSessionCookie(token: string, expiresAt: Date) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
  });
}

async function createSessionToken(userId: string) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt } as const;
}

export async function startSessionForUser(user: {
  id: string;
  email: string;
  displayName: string;
  studioId: string;
  role: SessionUser['role'];
}) {
  const { token, expiresAt } = await createSessionToken(user.id);
  setSessionCookie(token, expiresAt);
  return buildSessionUser(user);
}

export async function getSession() {
  const rawToken = cookies().get(SESSION_COOKIE)?.value ?? null;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) {
    cookies().delete(SESSION_COOKIE);
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { tokenHash } }).catch(() => undefined);
    cookies().delete(SESSION_COOKIE);
    return null;
  }

  return {
    token: rawToken,
    user: buildSessionUser(session.user),
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function revokeSession(token?: string) {
  const rawToken = token ?? cookies().get(SESSION_COOKIE)?.value ?? null;
  if (!rawToken) return;

  const tokenHash = hashToken(rawToken);
  await prisma.session.deleteMany({ where: { tokenHash } });
  cookies().delete(SESSION_COOKIE);
}
