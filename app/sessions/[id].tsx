import { View, Text, StyleSheet, FlatList, Pressable, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useCallback, useEffect } from 'react';
import { SessionRepository, WorkoutSession, SessionExercise, WorkoutSet } from '../../src/repositories/session-repository';
import { ExercisePickerModal } from '../../src/components/ExercisePickerModal';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/themes/colors';

function ExerciseSetsCard({ sessionExercise, isCompleted }: { sessionExercise: SessionExercise, isCompleted: boolean }) {
  const db = useSQLiteContext();
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const loadSets = useCallback(() => {
    const repo = new SessionRepository(db);
    repo.getSetsForExercise(sessionExercise.id).then(setSets).catch(console.error);
  }, [sessionExercise.id, db]);

  useEffect(() => { loadSets(); }, [loadSets]);

  const handleAddSet = async () => {
    const r = parseInt(reps) || 0;
    const w = parseFloat(weight.replace(',', '.')) || 0;
    if (r === 0 && w === 0) return;
    
    try {
      const repo = new SessionRepository(db);
      const nextSetNum = sets.length + 1;
      await repo.addSet(sessionExercise.id, nextSetNum, r, w);
      setReps('');
      setWeight('');
      loadSets();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.exerciseCard}>
      <Text style={styles.exName}>{sessionExercise.name}</Text>
      
      {sets.length > 0 && (
        <View style={styles.setsContainer}>
          <View style={styles.setRowHeader}>
            <Text style={styles.setColHeader}>Set</Text>
            <Text style={styles.setColHeader}>kg</Text>
            <Text style={styles.setColHeader}>Reps</Text>
            <Text style={styles.setColTick}>✓</Text>
          </View>
          {sets.map(s => (
            <View key={s.id} style={styles.setRow}>
              <Text style={styles.setCol}>{s.set_number}</Text>
              <Text style={styles.setCol}>{s.weight}</Text>
              <Text style={styles.setCol}>{s.reps}</Text>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} style={styles.setColTick} />
            </View>
          ))}
        </View>
      )}

      {!isCompleted && (
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="kg" placeholderTextColor={theme.colors.border} keyboardType="numeric" value={weight} onChangeText={setWeight} />
          <TextInput style={styles.input} placeholder="reps" placeholderTextColor={theme.colors.border} keyboardType="numeric" value={reps} onChangeText={setReps} />
          <Pressable style={styles.addSetBtn} onPress={handleAddSet}>
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function ActiveSessionScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  const loadData = useCallback(() => {
    if (typeof id !== 'string') return;
    const repo = new SessionRepository(db);
    repo.getSessionById(id).then(setSession).catch(console.error);
    repo.getSessionExercises(id).then(setExercises).catch(console.error);
  }, [id, db]);

  useFocusEffect(loadData);

  const handleAddExercise = async (exerciseId: string) => {
    if (typeof id !== 'string') return;
    try {
      const repo = new SessionRepository(db);
      const nextOrder = exercises.length + 1;
      await repo.addExerciseToSession(id, exerciseId, nextOrder);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const finishSession = async () => {
    if (typeof id !== 'string' || !session) return;
    try {
      const repo = new SessionRepository(db);
      const start = new Date(session.started_at).getTime();
      const durationSeconds = Math.floor((Date.now() - start) / 1000);
      await repo.completeSession(id, durationSeconds);
      Alert.alert("¡Entrenamiento completado!", "Buen trabajo.", [
        { text: "Ver Historial", onPress: () => router.back() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo completar la sesión");
    }
  };

  if (!session) return <View style={styles.empty}><Text style={styles.emptyText}>Cargando sesión...</Text></View>;

  const isCompleted = session.status === 'completed';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.name}</Text>
        <View style={[styles.statusBadge, isCompleted ? styles.statusBadgeCompleted : styles.statusBadgeActive]}>
          <Text style={[styles.statusText, isCompleted ? styles.statusTextCompleted : styles.statusTextActive]}>
            {isCompleted ? 'Completado' : 'En Curso'}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ejercicios ({exercises.length})</Text>
        {!isCompleted && (
          <Pressable style={styles.addButton} onPress={() => setPickerVisible(true)}>
            <Ionicons name="add" size={16} color="white" />
            <Text style={styles.addButtonText}> Añadir</Text>
          </Pressable>
        )}
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyList}>
          <Ionicons name="barbell-outline" size={48} color={theme.colors.border} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>Inicia agregando tu primer ejercicio con el botón "Añadir".</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
             <ExerciseSetsCard sessionExercise={item} isCompleted={isCompleted} />
          )}
        />
      )}

      {!isCompleted && (
        <View style={styles.footer}>
          <Pressable style={styles.finishSessionBtn} onPress={finishSession}>
            <Text style={styles.finishSessionBtnText}>Terminar Entrenamiento</Text>
          </Pressable>
        </View>
      )}

      <ExercisePickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} onSelect={handleAddExercise} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 20, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginTop: 8 },
  statusBadgeCompleted: { backgroundColor: theme.colors.badgeBg },
  statusBadgeActive: { backgroundColor: '#fef08a' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  statusTextCompleted: { color: theme.colors.badgeText },
  statusTextActive: { color: '#854d0e' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  
  exerciseCard: { backgroundColor: theme.colors.card, marginHorizontal: 16, marginBottom: 16, borderRadius: theme.borderRadius.md, elevation: 3, overflow: 'hidden' },
  exName: { fontSize: 18, fontWeight: 'bold', padding: 16, color: theme.colors.text, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  
  setsContainer: { paddingBottom: 8 },
  setRowHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 },
  setColHeader: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, textTransform: 'uppercase' },
  setRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  setCol: { flex: 1, textAlign: 'center', fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  setColTick: { width: 40, textAlign: 'center' },
  
  inputRow: { flexDirection: 'row', padding: 16, paddingTop: 8, alignItems: 'center' },
  input: { flex: 1, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: 12, marginRight: 8, textAlign: 'center', color: theme.colors.text, fontSize: 16 },
  addSetBtn: { backgroundColor: theme.colors.primary, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  emptyList: { padding: 32, alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 16 },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border },
  finishSessionBtn: { backgroundColor: theme.colors.danger, padding: 16, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  finishSessionBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
