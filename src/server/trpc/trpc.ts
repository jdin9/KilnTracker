import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

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

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUser);
export const mergeRouters = t.mergeRouters;
