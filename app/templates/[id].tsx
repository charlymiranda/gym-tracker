import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { TemplateRepository, WorkoutTemplate, TemplateExercise } from '../../src/repositories/template-repository';
import { SessionRepository } from '../../src/repositories/session-repository';
import { useWorkoutStore } from '../../src/store/workout-store';
import { ExercisePickerModal } from '../../src/components/ExercisePickerModal';
import { useTheme } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// ... (TemplateExerciseItem remains the same, assuming it's above this in the file)
function TemplateExerciseItem({ item, db, onRemove }: { item: TemplateExercise, db: SQLiteDatabase, onRemove: () => void }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const defaultSets = [{ reps: 10, weight: '' }];
  const [sets, setSets] = useState<{reps: number | string, weight: string}[]>(() => {
    try { return item.target_sets_data ? JSON.parse(item.target_sets_data) : defaultSets; } 
    catch { return defaultSets; }
  });

  const saveSets = async (newSets: any[]) => {
    setSets(newSets);
    const repo = new TemplateRepository(db);
    await repo.updateTemplateExerciseSets(item.id, JSON.stringify(newSets));
  };

  const addSet = () => saveSets([...sets, { reps: 10, weight: '' }]);
  const removeSet = (idx: number) => saveSets(sets.filter((_, i) => i !== idx));

  const updateSet = (idx: number, field: 'reps' | 'weight', val: string) => {
    const copy = [...sets];
    copy[idx][field] = val;
    saveSets(copy);
  };

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exHeader}>
        <View style={styles.orderBadge}>
          <Text style={styles.exOrder}>{item.sort_order}</Text>
        </View>
        <View style={styles.exInfo}>
          <Text style={styles.exName}>{item.name}</Text>
          <Text style={styles.exMuscle}>{item.primary_muscle_group}</Text>
        </View>
        <Pressable onPress={onRemove} style={{ padding: 4 }}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
        </Pressable>
      </View>

      <View style={styles.setsContainer}>
        {sets.map((s, idx) => (
          <View key={idx} style={styles.setRow}>
            <Text style={styles.setIndex}>{idx + 1}</Text>
            <View style={styles.inputGroup}>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={String(s.reps)} 
                onChangeText={v => updateSet(idx, 'reps', v)}
                placeholder="Reps"
                placeholderTextColor={theme.colors.border}
              />
              <Text style={styles.inputLabel}>reps</Text>
            </View>
            <Text style={styles.setDivider}>@</Text>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={s.weight} 
                onChangeText={v => updateSet(idx, 'weight', v)}
                placeholder="Peso"
                placeholderTextColor={theme.colors.border}
              />
              <Text style={styles.inputLabel}>kg</Text>
            </View>
            <Pressable onPress={() => removeSet(idx)} style={styles.removeSetBtn}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </Pressable>
          </View>
        ))}
        <Pressable style={styles.addSetBtn} onPress={addSet}>
          <Ionicons name="add" size={16} color={theme.colors.primary} />
          <Text style={styles.addSetText}>Agregar Serie</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function TemplateDetailScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const db = useSQLiteContext();
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  const loadData = () => {
    if (typeof id !== 'string') return;
    const repo = new TemplateRepository(db);
    repo.getTemplateById(id).then(setTemplate).catch(console.error);
    repo.getTemplateExercises(id).then(setExercises).catch(console.error);
  };

  useEffect(() => { loadData(); }, [id, db]);

  const handleStartSession = async () => {
    if (typeof id !== 'string' || !template) return;
    try {
      const sessRepo = new SessionRepository(db);
      const sessionId = await sessRepo.createSession(template.name, id);
      
      for (const ex of exercises) {
        const sessionExerciseId = await sessRepo.addExerciseToSession(sessionId, ex.exercise_id, ex.sort_order);
        
        let targetSets: {reps: number, weight: string}[] = [];
        try {
          if (ex.target_sets_data) targetSets = JSON.parse(ex.target_sets_data);
        } catch(e) {}
        
        if (targetSets.length === 0) targetSets = [{ reps: 10, weight: '' }];
        
        for (let i = 0; i < targetSets.length; i++) {
          const s = targetSets[i];
          const weightNum = parseFloat(s.weight) || 0;
          const repsNum = parseInt(String(s.reps)) || 0;
          await sessRepo.addSet(sessionExerciseId, i+1, repsNum, weightNum);
        }
      }
      
      useWorkoutStore.getState().setActiveSession(sessionId);
      router.push(`/sessions/${sessionId}`);
    } catch (e) {
      console.error('Failed to start session', e);
    }
  };

  const handleAddExercise = async (exerciseId: string) => {
    if (typeof id !== 'string') return;
    try {
      const repo = new TemplateRepository(db);
      const nextOrder = exercises.length + 1;
      await repo.addExerciseToTemplate(id, exerciseId, nextOrder);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveExercise = async (exerciseTemplateId: string) => {
    const repo = new TemplateRepository(db);
    await repo.removeExerciseFromTemplate(exerciseTemplateId);
    loadData();
  };

  if (!template) return <View style={styles.empty}><Text style={styles.loadingText}>Cargando...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{template.name}</Text>
        {template.description && <Text style={styles.desc}>{template.description}</Text>}
        
        {exercises.length > 0 && (
          <Pressable style={styles.startBtn} onPress={handleStartSession}>
            <Ionicons name="play" size={20} color="white" />
            <Text style={styles.startBtnText}>Iniciar Rutina</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ejercicios Planeados</Text>
        <Pressable style={styles.addButton} onPress={() => setPickerVisible(true)}>
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.addButtonText}>Añadir</Text>
        </Pressable>
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyList}>
          <Text style={styles.emptyText}>No hay ejercicios asignados.</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TemplateExerciseItem item={item} db={db} onRemove={() => handleRemoveExercise(item.id)} />
          )}
        />
      )}

      <ExercisePickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} onSelect={handleAddExercise} />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 20, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  desc: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#6366f1', borderRadius: theme.borderRadius.md, gap: 4 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  emptyList: { padding: 32, alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary, textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  loadingText: { color: theme.colors.textSecondary },
  
  startBtn: { backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: theme.borderRadius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  exerciseCard: { backgroundColor: theme.colors.card, padding: 16, marginHorizontal: 20, marginBottom: 16, borderRadius: theme.borderRadius.md, elevation: 2 },
  exHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  orderBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6366f120', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  exOrder: { fontSize: 16, fontWeight: 'bold', color: '#6366f1' },
  exInfo: { flex: 1 },
  exName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  exMuscle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  
  setsContainer: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.sm, padding: 12 },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  setIndex: { color: theme.colors.textSecondary, fontWeight: 'bold', width: 24, textAlign: 'center', marginRight: 8 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 6, paddingHorizontal: 8, height: 36, width: 80 },
  input: { flex: 1, color: theme.colors.text, fontSize: 16, textAlign: 'center' },
  inputLabel: { color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 },
  setDivider: { color: theme.colors.border, marginHorizontal: 8 },
  removeSetBtn: { padding: 8, marginLeft: 4 },
  
  addSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, marginTop: 4, borderRadius: 6, backgroundColor: theme.colors.primary + '15' },
  addSetText: { color: theme.colors.primary, fontWeight: 'bold', marginLeft: 6 }
});
