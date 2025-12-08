import { initTRPC, TRPCError } from '@trpc/server';

import type { UserRole } from '../auth/types';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

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

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUser);
export const adminProcedure = t.procedure.use(enforceRole('ADMIN'));
export const mergeRouters = t.mergeRouters;
