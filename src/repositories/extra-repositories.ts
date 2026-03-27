import { type SQLiteDatabase } from 'expo-sqlite';

export class ProgressRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getProgressByExercise(exerciseId: string) {
    return [];
  }
}

export class StatsRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getGeneralStats() {
    return {
      totalSessions: 0,
      totalVolume: 0
    };
  }
}

export class GoalsRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getGoals() {
    return [];
  }
}

export class BodyRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getMeasurements() {
    return [];
  }
}

export class PreferencesRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getPreferences() {
    return await this.db.getFirstAsync<any>('SELECT * FROM user_preferences LIMIT 1');
  }

  async setPreference(key: string, value: string | number) {
    const prefs = await this.getPreferences();
    const now = new Date().toISOString();
    if (!prefs) {
      // Default initial row
      await this.db.runAsync(
        `INSERT INTO user_preferences (id, preferred_weight_unit, updated_at) VALUES ('1', 'kg', ?)`,
        [now]
      );
    }
    await this.db.runAsync(
      `UPDATE user_preferences SET ${key} = ?, updated_at = ? WHERE id = '1'`,
      [value, now]
    );
  }
}
