import { type SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export interface WorkoutSession {
  id: string;
  name: string;
  template_id?: string;
  status: 'in_progress' | 'completed' | 'draft' | 'canceled';
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
}

export interface SessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  name: string; // Join
  sort_order: number;
}

export interface WorkoutSet {
  id: string;
  session_exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  weight_unit: string;
  is_completed: boolean;
}

export class SessionRepository {
  constructor(private db: SQLiteDatabase) {}

  async getSessions(): Promise<WorkoutSession[]> {
    return await this.db.getAllAsync<WorkoutSession>('SELECT * FROM workout_sessions ORDER BY started_at DESC');
  }

  async getSessionById(id: string): Promise<WorkoutSession | null> {
    return await this.db.getFirstAsync<WorkoutSession>('SELECT * FROM workout_sessions WHERE id = ?', [id]);
  }

  async createSession(name: string, templateId?: string): Promise<string> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await this.db.runAsync(
      'INSERT INTO workout_sessions (id, name, template_id, status, started_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, templateId || null, 'in_progress', now, now, now]
    );
    return id;
  }

  async getSessionExercises(sessionId: string): Promise<SessionExercise[]> {
    return await this.db.getAllAsync<SessionExercise>(
      \`SELECT wse.id, wse.session_id, wse.exercise_id, wse.sort_order, e.name
       FROM workout_session_exercises wse
       JOIN exercises e ON wse.exercise_id = e.id
       WHERE wse.session_id = ?
       ORDER BY wse.sort_order ASC\`,
      [sessionId]
    );
  }

  async addExerciseToSession(sessionId: string, exerciseId: string, sortOrder: number): Promise<string> {
    const id = Crypto.randomUUID();
    await this.db.runAsync(
      'INSERT INTO workout_session_exercises (id, session_id, exercise_id, sort_order) VALUES (?, ?, ?, ?)',
      [id, sessionId, exerciseId, sortOrder]
    );
    return id;
  }

  async getSetsForExercise(sessionExerciseId: string): Promise<WorkoutSet[]> {
    return await this.db.getAllAsync<WorkoutSet>(
      'SELECT * FROM workout_sets WHERE session_exercise_id = ? ORDER BY set_number ASC',
      [sessionExerciseId]
    );
  }

  async addSet(sessionExerciseId: string, setNumber: number, reps: number, weight: number): Promise<void> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await this.db.runAsync(
      \`INSERT INTO workout_sets (id, session_exercise_id, set_number, reps, weight, weight_unit, is_warmup, is_completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'kg', 0, 1, ?, ?)\`,
      [id, sessionExerciseId, setNumber, reps, weight, now, now]
    );
  }

  async completeSession(sessionId: string, durationSeconds: number): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      "UPDATE workout_sessions SET status = 'completed', ended_at = ?, duration_seconds = ?, updated_at = ? WHERE id = ?",
      [now, durationSeconds, now, sessionId]
    );
  }
}
