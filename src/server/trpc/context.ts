import type { User } from '@prisma/client';
import { prisma } from '../../db/client';

export interface Context {
  prisma: typeof prisma;
  currentUser: User | null;
}

// Placeholder creator; integrate with your auth/session layer in Next.js.
export async function createContext(): Promise<Context> {
  return {
    prisma,
    currentUser: null,
  };
}
