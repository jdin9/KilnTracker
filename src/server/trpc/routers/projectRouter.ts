import { router, publicProcedure } from '../trpc';
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
  create: publicProcedure.input(createProjectInputSchema).mutation(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return createProject(ctx, user, input);
  }),

  addGlazeStep: publicProcedure.input(addGlazeStepInputSchema).mutation(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return addGlazeStep(ctx, user, input);
  }),

  addFiringStep: publicProcedure.input(addFiringStepInputSchema).mutation(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return addFiringStep(ctx, user, input);
  }),

  detail: publicProcedure.input(projectDetailInputSchema).query(async ({ ctx, input }) => {
    const user = getCurrentUser(ctx);
    return getProjectDetail(ctx, user, input.projectId);
  }),
});
