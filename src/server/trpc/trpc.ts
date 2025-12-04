import { initTRPC, TRPCError } from '@trpc/server';

import { consumeRateLimit } from '../utils/rateLimiter';

import type { UserRole } from '../auth/types';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

const ADMIN_MUTATION_RATE_LIMIT = {
  limit: 20,
  windowMs: 60_000,
};

const enforceUser = t.middleware(({ ctx, next }) => {
  if (!ctx.currentUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Login required' });
  }

  return next({
    ctx: {
      ...ctx,
      currentUser: ctx.currentUser,
    },
  });
});

const enforceRole = (role: UserRole) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.currentUser) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Login required' });
    }

    if (ctx.currentUser.role !== role) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    }

    return next({ ctx });
  });

const adminRateLimitMiddleware = t.middleware(({ ctx, next, path, type }) => {
  if (type === 'mutation') {
    const identifier = ctx.currentUser?.id ?? ctx.sessionToken ?? 'anonymous';
    const rateLimitKey = `admin:${path}:${identifier}`;
    const result = consumeRateLimit(rateLimitKey, ADMIN_MUTATION_RATE_LIMIT);

    if (!result.success) {
      throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many admin actions. Please slow down.' });
    }
  }

  return next();
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUser);
export const adminProcedure = t.procedure.use(enforceRole('ADMIN'));
export const rateLimitedAdminProcedure = adminProcedure.use(adminRateLimitMiddleware);
export const mergeRouters = t.mergeRouters;
