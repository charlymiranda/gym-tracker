import { type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export interface Goal {
  id: string;
  goal_type: string;
  target_value: number;
  status?: string;
  created_at: string;
}

export class GoalsRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getGoals(): Promise<Goal[]> {
    return await this.db.getAllAsync<Goal>('SELECT * FROM goals ORDER BY created_at DESC');
  }

  async addGoal(summary: string): Promise<void> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await this.db.runAsync(
      'INSERT INTO goals (id, goal_type, target_value, status, created_at, updated_at) VALUES (?, ?, 0, "active", ?, ?)',
      [id, summary, now, now]
    );
  }

  async completeGoal(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync('UPDATE goals SET status = "completed", updated_at = ? WHERE id = ?', [now, id]);
  }
}
