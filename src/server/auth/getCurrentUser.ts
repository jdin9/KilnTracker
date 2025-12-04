import { TRPCError } from '@trpc/server';

import type { Context } from '../trpc/context';
import type { SessionUser, UserRole } from './types';

export function getCurrentUser(ctx: Context): SessionUser {
  if (!ctx.currentUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be signed in.' });
  }

  return ctx.currentUser;
}

export function requireRole(ctx: Context, role: UserRole): SessionUser {
  const user = getCurrentUser(ctx);

  if (user.role !== role) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions.' });
  }

  return user;
}
