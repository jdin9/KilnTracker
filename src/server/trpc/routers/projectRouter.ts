import { protectedProcedure, router } from '../trpc';
import { getCurrentUser } from '../../auth/getCurrentUser';
import {
  addFiringStepInputSchema,
  addGlazeStepInputSchema,
  createProjectInputSchema,
  projectDetailInputSchema,
} from '../../schemas/projectSchemas';
import {
  addFiringStep,
  addGlazeStep,
  createProject,
  getProjectDetail,
} from '../../services/projectService';

export const projectRouter = router({
  create: protectedProcedure.input(createProjectInputSchema).mutation(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return createProject(ctx, user, input);
  }),

  addGlazeStep: protectedProcedure.input(addGlazeStepInputSchema).mutation(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return addGlazeStep(ctx, user, input);
  }),

  addFiringStep: protectedProcedure.input(addFiringStepInputSchema).mutation(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return addFiringStep(ctx, user, input);
  }),

  detail: protectedProcedure.input(projectDetailInputSchema).query(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return getProjectDetail(ctx, user, input.projectId);
  }),
});
