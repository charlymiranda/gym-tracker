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
    return await this.db.getFirstAsync('SELECT * FROM user_preferences LIMIT 1');
  }
}
