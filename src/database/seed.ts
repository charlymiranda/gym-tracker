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
    
    const translateMuscle = (m: string) => {
      const map: Record<string, string> = { 'abdominals': 'Abdominales', 'abductors': 'Abductores', 'adductors': 'Aductores', 'biceps': 'Bíceps', 'calves': 'Pantorrillas', 'chest': 'Pecho', 'forearms': 'Antebrazos', 'glutes': 'Glúteos', 'hamstrings': 'Isquiotibiales', 'lats': 'Dorsales', 'lower back': 'Espalda Baja', 'middle back': 'Espalda Media', 'neck': 'Cuello', 'quadriceps': 'Cuádriceps', 'shoulders': 'Hombros', 'traps': 'Trapecios', 'triceps': 'Tríceps' };
      return map[m?.toLowerCase()] || m || 'Otro';
    };

    const translateEq = (eq: string) => {
      const map: Record<string, string> = { 'body only': 'Peso Corporal', 'machine': 'Máquina', 'other': 'Otro', 'foam roll': 'Foam Roller', 'kettlebells': 'Pesas Rusas', 'dumbbell': 'Mancuernas', 'cable': 'Polea', 'barbell': 'Barra', 'bands': 'Bandas', 'medicine ball': 'Balón Medicinal', 'exercise ball': 'Pelota de Ejercicio', 'e-z curl bar': 'Barra EZ' };
      return map[eq?.toLowerCase()] || eq || 'none';
    };

    const translateName = (name: string) => {
      let t = name;
      const dict = {
        'Barbell': 'Barra', 'Dumbbell': 'Mancuerna', 'Kettlebell': 'Pesa Rusa', 'Cable': 'Polea', 'Band': 'Banda',
        'Machine': 'Máquina', 'Bench Press': 'Press de Banca', 'Incline': 'Inclinado', 'Decline': 'Declinado',
        'Seated': 'Sentado', 'Standing': 'de Pie', 'Lying': 'Tumbado', 'Squat': 'Sentadilla', 'Deadlift': 'Peso Muerto',
        'Lunge': 'Estocada', 'Row': 'Remo', 'Pull-Up': 'Dominada', 'Chin-Up': 'Dominada Supina', 'Push-Up': 'Flexión',
        'Extension': 'Extensión', 'Curl': 'Curl', 'Raise': 'Elevación', 'Fly': 'Apertura', 'Press': 'Press',
        'Crunch': 'Encogimiento', 'Alternate': 'Alterno', 'Single Leg': 'a Una Pierna', 'One Arm': 'a Un Brazo',
        'Front': 'Frontal', 'Reverse': 'Inverso', 'Wide Grip': 'Agarre Abierto', 'Close Grip': 'Agarre Cerrado',
        'Overhead': 'sobre la Cabeza', 'Lateral': 'Lateral', 'Jump': 'Salto'
      };
      for (const [eng, spa] of Object.entries(dict)) {
        t = t.replace(new RegExp(`\\b${eng}\\b`, 'gi'), spa);
      }
      return t;
    };

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
        $name: translateName(ex.name),
        $primary_muscle_group: translateMuscle(ex.primaryMuscles?.[0]),
        $secondary_muscle_groups: ex.secondaryMuscles?.map(translateMuscle).join(', ') || null,
        $equipment_type: translateEq(ex.equipment),
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

    // --- CUSTOM RUNNING DRILLS ---
    const runningDrills = [
      { name: 'A-Skips', type: 'plyometrics', focus: 'calves', notes: 'Técnica de carrera: rodilla alta y apoyo reactivo.' },
      { name: 'B-Skips', type: 'plyometrics', focus: 'hamstrings', notes: 'Extensión de pierna y zarpazo simulando la zancada.' },
      { name: 'High Knees (Rodillas al Pecho)', type: 'cardio', focus: 'quadriceps', notes: 'Frecuencia alta y contacto mínimo con el suelo.' },
      { name: 'Butt Kicks (Talones a Glúteos)', type: 'cardio', focus: 'hamstrings', notes: 'Activación rápida de isquiotibiales.' },
      { name: 'Pogo Jumps', type: 'plyometrics', focus: 'calves', notes: 'Saltos reactivos usando solo los tobillos, rodillas bloqueadas.' },
      { name: 'Single-Leg Bounds', type: 'plyometrics', focus: 'glutes', notes: 'Saltos amplios a una pierna para ganar amplitud de zancada.' },
      { name: 'Wall Drills (Postura de Aceleración)', type: 'strength', focus: 'core', notes: 'Empujando la pared en 45°, simulando el empuje inicial.' },
      { name: 'Carioca', type: 'cardio', focus: 'adductors', notes: 'Desplazamiento lateral cruzando pies para movilidad de cadera.' },
      { name: 'Strides (Progresiones)', type: 'cardio', focus: 'quadriceps', notes: 'Aceleraciones de 80m al 90% de velocidad máxima.' },
      { name: 'Tibialis Wall Raises', type: 'strength', focus: 'calves', notes: 'Previene periostitis tibial (Shin splints).' }
    ];

    for (const drill of runningDrills) {
      await statement.executeAsync({
        $id: String(Math.random()),
        $type: 'system',
        $name: drill.name,
        $primary_muscle_group: drill.focus,
        $secondary_muscle_groups: null,
        $equipment_type: 'body only',
        $movement_pattern: 'compound',
        $exercise_type: drill.type,
        $is_unilateral: drill.name.includes('Single') ? 1 : 0,
        $difficulty: 'intermediate',
        $instructions: drill.notes,
        $tags: 'running-drill',
        $created_at: now,
        $updated_at: now,
        $running_recommended: 1,
        $sports_tags: 'running, track',
        $is_single_leg_focus: drill.name.includes('Single') ? 1 : 0,
        $is_injury_prevention: drill.name.includes('Tibialis') ? 1 : 0
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
