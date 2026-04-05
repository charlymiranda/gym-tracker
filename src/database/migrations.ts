import { type SQLiteDatabase } from 'expo-sqlite';

export async function runMigrations(db: SQLiteDatabase) {
  // Use PRAGMA to handle foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const versionResult = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = versionResult?.user_version ?? 0;

  if (currentVersion === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        source_id TEXT NULL,
        source_name TEXT NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        primary_muscle_group TEXT NOT NULL,
        secondary_muscle_groups TEXT NULL,
        equipment_type TEXT NOT NULL,
        movement_pattern TEXT NULL,
        exercise_type TEXT NULL,
        is_unilateral INTEGER NULL,
        difficulty TEXT NULL,
        instructions TEXT NULL,
        common_mistakes TEXT NULL,
        tags TEXT NULL,
        image_url TEXT NULL,
        local_image_path TEXT NULL,
        video_url TEXT NULL,
        notes TEXT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NULL,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_template_days (
        id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        notes TEXT NULL,
        FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS workout_template_exercises (
        id TEXT PRIMARY KEY,
        template_day_id TEXT NULL,
        template_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        target_sets INTEGER NULL,
        target_reps_min INTEGER NULL,
        target_reps_max INTEGER NULL,
        target_weight REAL NULL,
        target_rest_seconds INTEGER NULL,
        notes TEXT NULL,
        intensity_technique TEXT NULL,
        FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE,
        FOREIGN KEY (template_day_id) REFERENCES workout_template_days(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS workout_sessions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        template_id TEXT NULL,
        status TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT NULL,
        duration_seconds INTEGER NULL,
        notes TEXT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS workout_session_exercises (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        status TEXT NULL,
        notes TEXT NULL,
        FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
      );

      CREATE TABLE IF NOT EXISTS workout_sets (
        id TEXT PRIMARY KEY,
        session_exercise_id TEXT NOT NULL,
        set_number INTEGER NOT NULL,
        reps INTEGER NULL,
        weight REAL NULL,
        weight_unit TEXT NOT NULL,
        rir INTEGER NULL,
        rpe REAL NULL,
        rest_seconds INTEGER NULL,
        duration_seconds INTEGER NULL,
        tempo TEXT NULL,
        distance REAL NULL,
        is_warmup INTEGER NOT NULL DEFAULT 0,
        is_failure INTEGER NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT NULL,
        notes TEXT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (session_exercise_id) REFERENCES workout_session_exercises(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS body_measurements (
        id TEXT PRIMARY KEY,
        measured_at TEXT NOT NULL,
        body_weight REAL NULL,
        body_fat_percentage REAL NULL,
        chest_cm REAL NULL,
        waist_cm REAL NULL,
        hips_cm REAL NULL,
        arms_cm REAL NULL,
        thighs_cm REAL NULL,
        notes TEXT NULL,
        progress_photo_path TEXT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        goal_type TEXT NOT NULL,
        target_value REAL NULL,
        target_unit TEXT NULL,
        exercise_id TEXT NULL,
        frequency_per_week INTEGER NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        preferred_weight_unit TEXT NOT NULL,
        default_rest_seconds INTEGER NULL,
        theme TEXT NULL,
        date_format TEXT NULL,
        locale TEXT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_backups (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        schema_version TEXT NOT NULL,
        app_version TEXT NOT NULL,
        file_path TEXT NOT NULL
      );

      PRAGMA user_version = 1;
    `);
    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await db.execAsync(`
      ALTER TABLE exercises ADD COLUMN running_recommended INTEGER DEFAULT 0;
      ALTER TABLE exercises ADD COLUMN sports_tags TEXT NULL;
      ALTER TABLE exercises ADD COLUMN is_single_leg_focus INTEGER DEFAULT 0;
      ALTER TABLE exercises ADD COLUMN is_injury_prevention INTEGER DEFAULT 0;
      PRAGMA user_version = 2;
    `);
    currentVersion = 2;
  }

  if (currentVersion === 2) {
    await db.execAsync(`
      ALTER TABLE workout_template_exercises ADD COLUMN target_sets_data TEXT NULL;
      PRAGMA user_version = 3;
    `);
    currentVersion = 3;
  }

  if (currentVersion === 3) {
    await db.execAsync(`
      ALTER TABLE user_preferences ADD COLUMN user_name TEXT NULL;
      PRAGMA user_version = 4;
    `);
    currentVersion = 4;
  }
}
