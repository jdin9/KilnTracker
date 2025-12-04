import { cookies } from 'next/headers';

import { prisma } from '../../db/client';
import { getSessionUser } from '../auth/session';
import type { SessionUser } from '../auth/types';

export interface Context {
  prisma: typeof prisma;
  currentUser: SessionUser | null;
  sessionToken: string | null;
}

export async function createContext(): Promise<Context> {
  const sessionToken = cookies().get('kiln.session-token')?.value ?? null;
  const currentUser = getSessionUser();

  return {
    prisma,
    currentUser,
    sessionToken,
  };
}
