import { type SQLiteDatabase } from 'expo-sqlite';
import seedData from './seed.json';

export async function runInitialSeed(db: SQLiteDatabase) {
  // Check if system exercises already exist
  const existing = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM exercises WHERE type = 'system'"
  );

  if (existing && existing.count > 0) {
    console.log('Seed: System exercises already exist, skipping...');
    return;
  }

  console.log('Seed: Inserting system exercises...');
  const now = new Date().toISOString();

  for (const ex of seedData) {
    await db.runAsync(
      `INSERT INTO exercises (
        id, type, name, primary_muscle_group, secondary_muscle_groups,
        equipment_type, movement_pattern, exercise_type, is_unilateral,
        difficulty, instructions, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ex.id,
        ex.type,
        ex.name,
        ex.primary_muscle_group,
        ex.secondary_muscle_groups || null,
        ex.equipment_type,
        ex.movement_pattern || null,
        ex.exercise_type || null,
        ex.is_unilateral !== undefined ? ex.is_unilateral : null,
        ex.difficulty || null,
        ex.instructions || null,
        ex.tags || null,
        now,
        now,
      ]
    );
  }
  
  console.log('Seed: Done inserting system exercises.');
}
