import { TRPCError } from '@trpc/server';
import { FiringStatus, type Firing, type User } from '@prisma/client';
import type { Context } from '../trpc/context';
import type {
  CompleteFiringInput,
  CreateFiringInput,
  FiringEventInput,
  ListFiringFiltersInput,
} from '../schemas/firingSchemas';

function assertFiringIsOngoing(firing: Firing) {
  if (firing.status !== FiringStatus.ONGOING) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Firing is not ongoing.' });
  }
}

async function ensureFiring(ctx: Context, user: User, firingId: string) {
  const firing = await ctx.prisma.firing.findFirst({
    where: {
      id: firingId,
      kiln: { studioId: user.studioId },
    },
  });

  if (!firing) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Firing not found for this studio.' });
  }

  return firing;
}

export async function createFiring(ctx: Context, user: User, input: CreateFiringInput) {
  const kiln = await ctx.prisma.kiln.findFirst({
    where: { id: input.kilnId, studioId: user.studioId },
  });

  if (!kiln) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Kiln not found in your studio.' });
  }

  const firing = await ctx.prisma.firing.create({
    data: {
      kilnId: input.kilnId,
      startedByUserId: user.id,
      firingType: input.firingType,
      targetCone: input.targetCone,
      fillLevel: input.fillLevel,
      outsideTempStart: input.outsideTempStart,
      status: FiringStatus.ONGOING,
      notes: input.notes,
    },
  });

  return firing;
}

export async function appendFiringEvent(ctx: Context, user: User, input: FiringEventInput) {
  const firing = await ensureFiring(ctx, user, input.firingId);
  assertFiringIsOngoing(firing);

  await ctx.prisma.firingEvent.create({
    data: {
      firingId: firing.id,
      eventType: input.eventType,
      timestamp: input.timestamp ?? new Date(),
      switchIndex: input.switchIndex,
      newSwitchPosition: input.newSwitchPosition,
      dialSetting: input.dialSetting,
      pyrometerTemp: input.pyrometerTemp,
      noteText: input.noteText,
    },
  });

  const events = await ctx.prisma.firingEvent.findMany({
    where: { firingId: firing.id },
    orderBy: { timestamp: 'asc' },
  });

  return events;
}

export async function completeFiring(ctx: Context, user: User, input: CompleteFiringInput) {
  const firing = await ensureFiring(ctx, user, input.firingId);
  assertFiringIsOngoing(firing);

  const temps = await ctx.prisma.firingEvent.findMany({
    where: { firingId: firing.id, pyrometerTemp: { not: null } },
    select: { pyrometerTemp: true },
  });

  const maxTemp = temps.length
    ? temps.reduce((max, e) => Math.max(max, e.pyrometerTemp ?? Number.NEGATIVE_INFINITY), Number.NEGATIVE_INFINITY)
    : null;

  const mergedNotes = input.appendNotes
    ? [firing.notes, input.appendNotes].filter(Boolean).join('\n\n')
    : firing.notes;

  const updated = await ctx.prisma.firing.update({
    where: { id: firing.id },
    data: {
      status: FiringStatus.COMPLETED,
      sitterDropTime: input.sitterDropTime,
      coneUsed: input.coneUsed,
      maxTemp: maxTemp === null || maxTemp === Number.NEGATIVE_INFINITY ? null : maxTemp,
      notes: mergedNotes,
    },
  });

  return updated;
}

export async function deleteFiring(ctx: Context, user: User, firingId: string) {
  await ensureFiring(ctx, user, firingId);

  await ctx.prisma.firing.delete({ where: { id: firingId } });

  return { success: true };
}

type FiringSummary = {
  id: string;
  kilnId: string;
  firingType: Firing['firingType'];
  targetCone: string;
  coneUsed: string | null;
  status: Firing['status'];
  startTime: Date;
  sitterDropTime: Date | null;
  durationMinutes: number | null;
  fillLevel: Firing['fillLevel'];
  outsideTempStart: number;
  maxTemp: number | null;
  notes: string | null;
};

export async function listFirings(ctx: Context, user: User, filters: ListFiringFiltersInput) {
  const where: any = {
    kiln: { studioId: user.studioId },
  };

  if (filters.kilnId) where.kilnId = filters.kilnId;
  if (filters.firingType) where.firingType = filters.firingType;
  if (filters.targetCone) where.targetCone = filters.targetCone;
  if (filters.coneUsed) where.coneUsed = filters.coneUsed;
  if (filters.status) where.status = filters.status;
  if (filters.startDateFrom || filters.startDateTo) {
    where.startTime = {
      ...(filters.startDateFrom ? { gte: filters.startDateFrom } : {}),
      ...(filters.startDateTo ? { lte: filters.startDateTo } : {}),
    };
  }
  if (filters.maxTempMin !== undefined || filters.maxTempMax !== undefined) {
    where.maxTemp = {
      ...(filters.maxTempMin !== undefined ? { gte: filters.maxTempMin } : {}),
      ...(filters.maxTempMax !== undefined ? { lte: filters.maxTempMax } : {}),
    };
  }
  if (filters.notesKeyword) {
    where.notes = { contains: filters.notesKeyword, mode: 'insensitive' };
  }

  const firings = await ctx.prisma.firing.findMany({
    where,
    orderBy: { startTime: 'desc' },
    select: {
      id: true,
      kilnId: true,
      firingType: true,
      targetCone: true,
      coneUsed: true,
      status: true,
      startTime: true,
      sitterDropTime: true,
      fillLevel: true,
      outsideTempStart: true,
      maxTemp: true,
      notes: true,
    },
  });

  const summaries: FiringSummary[] = firings.map((f) => {
    const end = f.sitterDropTime ?? null;
    const durationMinutes = end ? Math.round((end.getTime() - f.startTime.getTime()) / 60000) : null;

    return {
      ...f,
      durationMinutes,
    };
  });

  return summaries;
}
