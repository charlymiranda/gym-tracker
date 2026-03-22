import { type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export interface BodyMeasurement {
  id: string;
  measured_at: string;
  body_weight: number;
}

export class BodyRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getMeasurements(): Promise<BodyMeasurement[]> {
    return await this.db.getAllAsync<BodyMeasurement>('SELECT * FROM body_measurements ORDER BY measured_at DESC');
  }

  async addMeasurement(weight: number): Promise<void> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await this.db.runAsync(
      'INSERT INTO body_measurements (id, measured_at, body_weight, created_at) VALUES (?, ?, ?, ?)',
      [id, now, weight, now]
    );
  }
}
