import { z } from 'zod';
import { FiringEventType, FiringStatus, FiringType, FillLevel, SwitchPosition } from '@prisma/client';

export const createFiringInputSchema = z.object({
  kilnId: z.string(),
  firingType: z.nativeEnum(FiringType),
  targetCone: z.string(),
  fillLevel: z.nativeEnum(FillLevel),
  outsideTempStart: z.number(),
  notes: z.string().optional(),
});

export const firingEventInputSchema = z
  .object({
    firingId: z.string(),
    eventType: z.nativeEnum(FiringEventType),
    timestamp: z.coerce.date().optional(),
    switchIndex: z.number().int().nonnegative().optional(),
    newSwitchPosition: z.nativeEnum(SwitchPosition).optional(),
    dialSetting: z.string().optional(),
    pyrometerTemp: z.number().optional(),
    noteText: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (
      (val.eventType === FiringEventType.SWITCH_ON || val.eventType === FiringEventType.SWITCH_OFF) &&
      (val.switchIndex === undefined || val.newSwitchPosition === undefined)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'switchIndex and newSwitchPosition are required for switch events',
        path: ['switchIndex'],
      });
    }

    if (val.eventType === FiringEventType.TEMP_READING && val.pyrometerTemp === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'pyrometerTemp is required for temp readings',
        path: ['pyrometerTemp'],
      });
    }

    if (val.eventType === FiringEventType.NOTE && !val.noteText) {
      ctx.addIssue({
        code: 'custom',
        message: 'noteText is required for note events',
        path: ['noteText'],
      });
    }
  });

export const completeFiringInputSchema = z.object({
  firingId: z.string(),
  sitterDropTime: z.coerce.date(),
  coneUsed: z.string(),
  appendNotes: z.string().optional(),
});

export const deleteFiringInputSchema = z.object({
  firingId: z.string(),
});

export const listFiringFiltersSchema = z.object({
  kilnId: z.string().optional(),
  firingType: z.nativeEnum(FiringType).optional(),
  targetCone: z.string().optional(),
  coneUsed: z.string().optional(),
  status: z.nativeEnum(FiringStatus).optional(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
  maxTempMin: z.number().optional(),
  maxTempMax: z.number().optional(),
  notesKeyword: z.string().optional(),
});

export type CreateFiringInput = z.infer<typeof createFiringInputSchema>;
export type FiringEventInput = z.infer<typeof firingEventInputSchema>;
export type CompleteFiringInput = z.infer<typeof completeFiringInputSchema>;
export type DeleteFiringInput = z.infer<typeof deleteFiringInputSchema>;
export type ListFiringFiltersInput = z.infer<typeof listFiringFiltersSchema>;
