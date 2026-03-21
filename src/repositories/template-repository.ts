import { type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export class TemplateRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAllTemplates() {
    return await this.db.getAllAsync('SELECT * FROM workout_templates WHERE is_archived = 0 ORDER BY updated_at DESC');
  }

  async createTemplate(name: string, description?: string) {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await this.db.runAsync(
      'INSERT INTO workout_templates (id, name, description, is_archived, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
      [id, name, description || null, now, now]
    );
    return id;
  }
}
