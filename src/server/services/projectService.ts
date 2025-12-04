import { TRPCError } from '@trpc/server';
import { ApplicationMethod, ProjectStep, StepType, type Firing } from '@prisma/client';
import type { Context } from '../trpc/context';
import type { SessionUser } from '../auth/types';
import type {
  AddFiringStepInput,
  AddGlazeStepInput,
  CreateProjectInput,
} from '../schemas/projectSchemas';

async function ensureProject(ctx: Context, user: SessionUser, projectId: string) {
  const project = await ctx.prisma.project.findFirst({
    where: { id: projectId, studioId: user.studioId },
  });

  if (!project) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found for this studio.' });
  }

  return project;
}

async function nextStepOrder(ctx: Context, projectId: string) {
  const max = await ctx.prisma.projectStep.aggregate({
    where: { projectId },
    _max: { stepOrder: true },
  });
  return (max._max.stepOrder ?? 0) + 1;
}

function enrichFiringStepWithDerivedData(step: ProjectStep & { firingStep: any }) {
  if (!step.firingStep?.firing) return step;

  const { firing } = step.firingStep as { firing: Firing };
  return {
    ...step,
    firingStep: {
      ...step.firingStep,
      derivedCone: firing.coneUsed ?? firing.targetCone,
      derivedPeakTemp: firing.maxTemp,
      derivedKilnId: firing.kilnId,
      derivedFiringDate: firing.sitterDropTime ?? firing.startTime,
    },
  };
}

async function fetchProjectDetail(ctx: Context, projectId: string, studioId: string) {
  const project = await ctx.prisma.project.findFirst({
    where: { id: projectId, studioId },
    include: {
      clayBody: true,
      steps: {
        orderBy: { stepOrder: 'asc' },
        include: {
          glazeStep: { include: { glaze: true } },
          firingStep: { include: { firing: true } },
          photos: true,
        },
      },
    },
  });

  if (!project) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found for this studio.' });
  }

  const coverPhoto = project.steps
    .flatMap((s) => s.photos)
    .find((p) => p.isCoverForProject === true);

  const stepsWithDerived = project.steps.map((s) => enrichFiringStepWithDerivedData(s));

  return { ...project, steps: stepsWithDerived, coverPhoto };
}

export async function createProject(ctx: Context, user: SessionUser, input: CreateProjectInput) {
  const clayBody = await ctx.prisma.clayBody.findFirst({
    where: { id: input.clayBodyId, studioId: user.studioId },
  });

  if (!clayBody) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Clay body not found in your studio.' });
  }

  const project = await ctx.prisma.project.create({
    data: {
      studioId: user.studioId,
      createdByUserId: user.id,
      clayBodyId: input.clayBodyId,
      hasBeenBisque: input.hasBeenBisque,
      bisqueTemp: input.bisqueTemp,
      makerName: input.makerName ?? user.displayName,
      title: input.title,
      notes: input.notes,
    },
  });

  return project;
}

export async function addGlazeStep(ctx: Context, user: SessionUser, input: AddGlazeStepInput) {
  await ensureProject(ctx, user, input.projectId);

  const glaze = await ctx.prisma.glaze.findFirst({
    where: { id: input.glazeId, studioId: user.studioId },
  });

  if (!glaze) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Glaze not found in your studio.' });
  }

  const order = await nextStepOrder(ctx, input.projectId);

  await ctx.prisma.projectStep.create({
    data: {
      projectId: input.projectId,
      stepOrder: order,
      stepType: StepType.GLAZE,
      createdByUserId: user.id,
      notes: input.notes,
      glazeStep: {
        create: {
          glazeId: input.glazeId,
          numCoats: input.numCoats,
          applicationMethod: input.applicationMethod as ApplicationMethod,
          patternDescription: input.patternDescription,
        },
      },
    },
  });

  const steps = await ctx.prisma.projectStep.findMany({
    where: { projectId: input.projectId },
    orderBy: { stepOrder: 'asc' },
    include: {
      glazeStep: { include: { glaze: true } },
      firingStep: { include: { firing: true } },
      photos: true,
    },
  });

  return steps.map((s) => enrichFiringStepWithDerivedData(s));
}

export async function addFiringStep(ctx: Context, user: SessionUser, input: AddFiringStepInput) {
  await ensureProject(ctx, user, input.projectId);

  let firing: Firing | null = null;
  if (input.firingId) {
    firing = await ctx.prisma.firing.findFirst({
      where: { id: input.firingId, kiln: { studioId: user.studioId } },
    });

    if (!firing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Firing not found in your studio.' });
    }
  }

  const order = await nextStepOrder(ctx, input.projectId);

  await ctx.prisma.projectStep.create({
    data: {
      projectId: input.projectId,
      stepOrder: order,
      stepType: StepType.FIRING,
      createdByUserId: user.id,
      notes: input.notes,
      firingStep: {
        create: {
          firingId: input.firingId,
          localCone: input.localCone,
          localPeakTemp: input.localPeakTemp,
          firingDate: input.firingDate,
        },
      },
    },
  });

  const steps = await ctx.prisma.projectStep.findMany({
    where: { projectId: input.projectId },
    orderBy: { stepOrder: 'asc' },
    include: {
      glazeStep: { include: { glaze: true } },
      firingStep: { include: { firing: true } },
      photos: true,
    },
  });

  return steps.map((s) => enrichFiringStepWithDerivedData(s));
}

export async function getProjectDetail(ctx: Context, user: SessionUser, projectId: string) {
  return fetchProjectDetail(ctx, projectId, user.studioId);
}
