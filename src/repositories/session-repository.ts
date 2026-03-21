import { type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export class SessionRepository {
  constructor(private db: SQLiteDatabase) {}

  async getSessions() {
    return await this.db.getAllAsync('SELECT * FROM workout_sessions ORDER BY started_at DESC');
  }

  async createSession(name: string, templateId?: string) {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await this.db.runAsync(
      'INSERT INTO workout_sessions (id, name, template_id, status, started_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, templateId || null, 'in_progress', now, now, now]
    );
    return id;
  }
}
