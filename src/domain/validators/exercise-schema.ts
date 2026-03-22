import { z } from 'zod';

export const exerciseSchema = z.object({
  name: z.string().min(1, 'El nombre del ejercicio es obligatorio').max(100, 'El nombre es muy largo'),
  primary_muscle_group: z.string().min(1, 'El grupo muscular principal es obligatorio'),
  equipment_type: z.string().min(1, 'El tipo de equipamiento es obligatorio'),
  is_unilateral: z.boolean().default(false),
  notes: z.string().optional()
});

export type ExerciseFormData = z.infer<typeof exerciseSchema>;
