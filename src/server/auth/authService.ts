import { prisma } from '@/db/client';

import { hashPassword, verifyPassword } from './password';
import { getSession, revokeSession, startSessionForUser } from './session';
import type { SessionUser } from './types';

type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
  studioName: string;
  studioPassword: string;
};

type SignInInput = {
  email: string;
  password: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function signUp(input: SignUpInput): Promise<SessionUser> {
  const email = normalizeEmail(input.email);
  const studioName = input.studioName.trim();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const studio = await prisma.studio.findUnique({ where: { name: studioName } });

  if (!studio) {
    throw new Error('Studio not found. Please confirm the studio name and try again.');
  }

  const isStudioPasswordValid = await verifyPassword(input.studioPassword, studio.joinPasswordHash);

  if (!isStudioPasswordValid) {
    throw new Error('Invalid studio password.');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: input.displayName,
      studioId: studio.id,
      role: 'MEMBER',
    },
  });

  return startSessionForUser(user);
}

export async function signIn(input: SignInInput): Promise<SessionUser> {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);

  if (!isValid) {
    throw new Error('Invalid email or password.');
  }

  await prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });

  return startSessionForUser(user);
}

export async function logout() {
  const session = await getSession();
  await revokeSession(session?.token);
}
