import { type SQLiteDatabase } from 'expo-sqlite';

export interface GeneralStats {
  totalSessions: number;
  totalSets: number;
  totalVolume: number;
}

export class StatsRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getGeneralStats(): Promise<GeneralStats> {
    const sessionsRes = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM workout_sessions WHERE status = "completed"');
    const setsRes = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM workout_sets WHERE is_completed = 1');
    const volRes = await this.db.getFirstAsync<{ total: number }>('SELECT SUM(weight * reps) as total FROM workout_sets WHERE is_completed = 1 AND weight > 0 AND reps > 0');

    return {
      totalSessions: sessionsRes?.count || 0,
      totalSets: setsRes?.count || 0,
      totalVolume: volRes?.total || 0
    };
  }
}

export class ProgressRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getMaxWeightForExercise(exerciseId: string): Promise<number> {
    const res = await this.db.getFirstAsync<{ max_weight: number }>(
      \`SELECT MAX(s.weight) as max_weight 
       FROM workout_sets s 
       JOIN workout_session_exercises wse ON s.session_exercise_id = wse.id 
       WHERE wse.exercise_id = ? AND s.is_completed = 1\`, 
      [exerciseId]
    );
    return res?.max_weight || 0;
  }
}
