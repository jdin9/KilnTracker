import { prisma } from '../../db/client';
import { getSession } from '../auth/session';
import type { SessionUser } from '../auth/types';

export interface Context {
  prisma: typeof prisma;
  currentUser: SessionUser | null;
  sessionToken: string | null;
}

export async function createContext(): Promise<Context> {
  const session = await getSession();

  return {
    prisma,
    currentUser: session?.user ?? null,
    sessionToken: session?.token ?? null,
  };
}
