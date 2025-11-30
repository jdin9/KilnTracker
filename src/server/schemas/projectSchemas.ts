import { z } from 'zod';
import { ApplicationMethod } from '@prisma/client';

export const createProjectInputSchema = z.object({
  clayBodyId: z.string(),
  hasBeenBisque: z.boolean(),
  bisqueTemp: z.number().optional(),
  title: z.string().optional(),
  makerName: z.string().optional(),
  notes: z.string().optional(),
});

export const addGlazeStepInputSchema = z.object({
  projectId: z.string(),
  glazeId: z.string(),
  numCoats: z.number(),
  applicationMethod: z.nativeEnum(ApplicationMethod),
  patternDescription: z.string().optional(),
  notes: z.string().optional(),
});

export const addFiringStepInputSchema = z
  .object({
    projectId: z.string(),
    firingId: z.string().optional(),
    localCone: z.string().optional(),
    localPeakTemp: z.number().optional(),
    firingDate: z.coerce.date().optional(),
    notes: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.firingId && val.localCone === undefined && val.localPeakTemp === undefined && val.firingDate === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['firingId'],
        message: 'Provide a firingId or local firing details.',
      });
    }
  });

export const projectDetailInputSchema = z.object({
  projectId: z.string(),
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type AddGlazeStepInput = z.infer<typeof addGlazeStepInputSchema>;
export type AddFiringStepInput = z.infer<typeof addFiringStepInputSchema>;
export type ProjectDetailInput = z.infer<typeof projectDetailInputSchema>;
