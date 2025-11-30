import { TRPCError } from '@trpc/server';
import type { Context } from '../trpc/context';
import type { User } from '@prisma/client';

export function getCurrentUser(ctx: Context): User {
  if (!ctx.currentUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be signed in.' });
  }
  return ctx.currentUser;
}
