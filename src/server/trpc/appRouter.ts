import { router } from './trpc';
import { firingRouter } from './routers/firingRouter';
import { projectRouter } from './routers/projectRouter';

export const appRouter = router({
  firing: firingRouter,
  project: projectRouter,
});

export type AppRouter = typeof appRouter;
