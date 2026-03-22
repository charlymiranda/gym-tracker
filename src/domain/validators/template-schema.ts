import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(1, 'El nombre de la rutina es obligatorio').max(100, 'El nombre es muy largo'),
  description: z.string().optional()
});

export type TemplateFormData = z.infer<typeof templateSchema>;
