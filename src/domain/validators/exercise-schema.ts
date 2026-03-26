import { z } from 'zod';

export const exerciseSchema = z.object({
  name: z.string().min(1, 'El nombre del ejercicio es obligatorio').max(100, 'El nombre es muy largo'),
  primary_muscle_group: z.string().min(1, 'El grupo muscular principal es obligatorio'),
  equipment_type: z.string().min(1, 'El tipo de equipamiento es obligatorio'),
  is_unilateral: z.boolean().default(false),
  notes: z.string().optional(),
  running_recommended: z.boolean().default(false),
  sports_tags: z.string().optional(),
  is_single_leg_focus: z.boolean().default(false),
  is_injury_prevention: z.boolean().default(false)
});

export type ExerciseFormData = z.infer<typeof exerciseSchema>;
