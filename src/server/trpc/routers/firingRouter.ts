import { router, publicProcedure } from '../trpc';
import { getCurrentUser } from '../../auth/getCurrentUser';
import {
  completeFiringInputSchema,
  createFiringInputSchema,
  deleteFiringInputSchema,
  firingEventInputSchema,
  listFiringFiltersSchema,
} from '../../schemas/firingSchemas';
import {
  appendFiringEvent,
  completeFiring,
  createFiring,
  deleteFiring,
  listFirings,
} from '../../services/firingService';

export const firingRouter = router({
  create: publicProcedure.input(createFiringInputSchema).mutation(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return createFiring(ctx, user, input);
  }),

  addEvent: publicProcedure.input(firingEventInputSchema).mutation(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return appendFiringEvent(ctx, user, input);
  }),

  complete: publicProcedure.input(completeFiringInputSchema).mutation(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return completeFiring(ctx, user, input);
  }),

  delete: publicProcedure.input(deleteFiringInputSchema).mutation(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return deleteFiring(ctx, user, input.firingId);
  }),

  list: publicProcedure
    .input(listFiringFiltersSchema.optional())
    .query(async ({ ctx, input = {} }) => {
      const user = getCurrentUser(ctx);
      return listFirings(ctx, user, input);
    }),
});
