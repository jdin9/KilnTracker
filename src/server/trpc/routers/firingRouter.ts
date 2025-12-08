import { adminProcedure, protectedProcedure, router } from '../trpc';
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
  create: protectedProcedure.input(createFiringInputSchema).mutation(async ({ ctx, input }: any) => {
    const user = getCurrentUser(ctx);
    return createFiring(ctx, user, input);
  }),

  addEvent: protectedProcedure.input(firingEventInputSchema).mutation(async ({ ctx, input }: any) => {
    const user = getCurrentUser(ctx);
    return appendFiringEvent(ctx, user, input);
  }),

  complete: protectedProcedure.input(completeFiringInputSchema).mutation(async ({ ctx, input }: any) => {
    const user = getCurrentUser(ctx);
    return completeFiring(ctx, user, input);
  }),

  delete: adminProcedure.input(deleteFiringInputSchema).mutation(async ({ ctx, input }: any) => {
    const user = getCurrentUser(ctx);
    return deleteFiring(ctx, user, input.firingId);
  }),

  list: protectedProcedure
    .input(listFiringFiltersSchema.optional())
    .query(async ({ ctx, input = {} }: any) => {
      const user = getCurrentUser(ctx);
      return listFirings(ctx, user, input);
    }),
});
