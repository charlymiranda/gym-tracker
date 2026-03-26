import { type SQLiteDatabase } from 'expo-sqlite';
import yuhonasData from './yuhonas.json';

export async function runInitialSeed(db: SQLiteDatabase) {
  const existing = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM exercises WHERE type = 'system'"
  );

  if (existing && existing.count > 100) {
    console.log('Seed: System exercises already exist, skipping massive seed...');
    return;
  }

  console.log('Seed: Deleting old system placeholders and inserting massive catalog...');
  await db.execAsync("DELETE FROM exercises WHERE type = 'system';");

  const now = new Date().toISOString();

  const statement = await db.prepareAsync(`
    INSERT INTO exercises (
      id, type, name, primary_muscle_group, secondary_muscle_groups,
      equipment_type, movement_pattern, exercise_type, is_unilateral,
      difficulty, instructions, tags, created_at, updated_at,
      running_recommended, sports_tags, is_single_leg_focus, is_injury_prevention
    ) VALUES (
      $id, $type, $name, $primary_muscle_group, $secondary_muscle_groups,
      $equipment_type, $movement_pattern, $exercise_type, $is_unilateral,
      $difficulty, $instructions, $tags, $created_at, $updated_at,
      $running_recommended, $sports_tags, $is_single_leg_focus, $is_injury_prevention
    )
  `);

  try {
    // The dataset is huge, so we wrap it in a transaction for speed
    await db.execAsync('BEGIN TRANSACTION;');
    
    for (const ex of yuhonasData as any[]) {
      const isRunner = () => {
        const n = ex.name.toLowerCase();
        const m = ex.primaryMuscles?.join(' ').toLowerCase() || '';
        if (n.includes('lunge') || n.includes('step up') || n.includes('calf') || n.includes('bridge') || n.includes('plank')) return 1;
        if ((m.includes('glutes') || m.includes('hamstrings') || m.includes('calves')) && (ex.equipment === 'body only' || ex.equipment === 'dumbbell' || ex.equipment === 'kettlebells' || ex.equipment === 'bands')) return 1;
        return 0;
      };

      const isSingleLeg = () => {
        const n = ex.name.toLowerCase();
        return (n.includes('single leg') || n.includes('lunge') || n.includes('split squat') || n.includes('pistol') || n.includes('one leg') || n.includes('alternate')) ? 1 : 0;
      };

      const isInjuryPrevention = () => {
        const n = ex.name.toLowerCase();
        const cat = ex.category?.toLowerCase() || '';
        if (cat === 'stretching' || n.includes('band') || n.includes('rotator') || n.includes('face pull') || n.includes('tibialis')) return 1;
        return 0;
      };

      await statement.executeAsync({
        $id: ex.id || String(Math.random()),
        $type: 'system',
        $name: ex.name,
        $primary_muscle_group: ex.primaryMuscles?.[0] || 'other',
        $secondary_muscle_groups: ex.secondaryMuscles?.join(', ') || null,
        $equipment_type: ex.equipment || 'none',
        $movement_pattern: ex.mechanic || null,
        $exercise_type: ex.category || null,
        $is_unilateral: isSingleLeg(),
        $difficulty: ex.level || 'beginner',
        $instructions: Array.isArray(ex.instructions) ? ex.instructions.join('\\n') : (ex.instructions || null),
        $tags: ex.force ? ex.force : null,
        $created_at: now,
        $updated_at: now,
        $running_recommended: isRunner(),
        $sports_tags: isRunner() ? 'running' : null,
        $is_single_leg_focus: isSingleLeg(),
        $is_injury_prevention: isInjuryPrevention()
      });
    }
    
    await db.execAsync('COMMIT;');
  } catch (e) {
    await db.execAsync('ROLLBACK;');
    console.error('Seed Error:', e);
  } finally {
    await statement.finalizeAsync();
  }
  
  console.log('Seed: Done inserting massive catalog.');
}
