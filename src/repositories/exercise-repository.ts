import { type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export interface Exercise {
  id: string;
  type: string;
  name: string;
  primary_muscle_group: string;
  equipment_type: string;
  is_unilateral: boolean | number;
  notes?: string;
  running_recommended?: boolean | number;
  sports_tags?: string | null;
  is_single_leg_focus?: boolean | number;
  is_injury_prevention?: boolean | number;
}

export class ExerciseRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAllExercises(): Promise<Exercise[]> {
    return await this.db.getAllAsync<Exercise>('SELECT * FROM exercises ORDER BY name ASC');
  }

  async getCustomExercises(): Promise<Exercise[]> {
    return await this.db.getAllAsync<Exercise>("SELECT * FROM exercises WHERE type = 'custom' ORDER BY name ASC");
  }

  async createCustomExercise(data: Omit<Exercise, 'id' | 'type'>): Promise<string> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      "INSERT INTO exercises (id, type, name, primary_muscle_group, equipment_type, is_unilateral, notes, created_at, updated_at) VALUES (?, 'custom', ?, ?, ?, ?, ?, ?, ?)",
      [id, data.name, data.primary_muscle_group, data.equipment_type, data.is_unilateral ? 1 : 0, data.notes || null, now, now]
    );
    
    return id;
  }

  async updateCustomExercise(id: string, data: Partial<Exercise>): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      "UPDATE exercises SET name = ?, primary_muscle_group = ?, equipment_type = ?, is_unilateral = ?, notes = ?, updated_at = ? WHERE id = ? AND type = 'custom'",
      [data.name!, data.primary_muscle_group!, data.equipment_type!, data.is_unilateral ? 1 : 0, data.notes || null, now, id]
    );
  }

  async deleteCustomExercise(id: string): Promise<void> {
    await this.db.runAsync("DELETE FROM exercises WHERE id = ? AND type = 'custom'", [id]);
  }
}
