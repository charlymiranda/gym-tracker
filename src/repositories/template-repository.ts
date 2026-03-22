import { type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  is_archived: boolean;
}

export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  name: string; // From joined exercise
  primary_muscle_group: string;
  sort_order: number;
}

export class TemplateRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAllTemplates(): Promise<WorkoutTemplate[]> {
    return await this.db.getAllAsync<WorkoutTemplate>('SELECT * FROM workout_templates WHERE is_archived = 0 ORDER BY updated_at DESC');
  }

  async getTemplateById(id: string): Promise<WorkoutTemplate | null> {
    return await this.db.getFirstAsync<WorkoutTemplate>('SELECT * FROM workout_templates WHERE id = ?', [id]);
  }

  async createTemplate(data: { name: string; description?: string }): Promise<string> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await this.db.runAsync(
      'INSERT INTO workout_templates (id, name, description, is_archived, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
      [id, data.name, data.description || null, now, now]
    );
    return id;
  }

  async getTemplateExercises(templateId: string): Promise<TemplateExercise[]> {
    return await this.db.getAllAsync<TemplateExercise>(
      \`SELECT wte.id, wte.template_id, wte.exercise_id, wte.sort_order, e.name, e.primary_muscle_group
       FROM workout_template_exercises wte
       JOIN exercises e ON wte.exercise_id = e.id
       WHERE wte.template_id = ?
       ORDER BY wte.sort_order ASC\`,
      [templateId]
    );
  }

  async addExerciseToTemplate(templateId: string, exerciseId: string, sortOrder: number): Promise<void> {
    const id = Crypto.randomUUID();
    await this.db.runAsync(
      \`INSERT INTO workout_template_exercises (id, template_id, exercise_id, sort_order)
       VALUES (?, ?, ?, ?)\`,
      [id, templateId, exerciseId, sortOrder]
    );
  }

  async removeExerciseFromTemplate(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM workout_template_exercises WHERE id = ?', [id]);
  }
}
