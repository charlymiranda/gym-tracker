import { View, Text, StyleSheet, FlatList, Pressable, Button, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useCallback, useEffect } from 'react';
import { SessionRepository, WorkoutSession, SessionExercise, WorkoutSet } from '../../src/repositories/session-repository';
import { ExercisePickerModal } from '../../src/components/ExercisePickerModal';

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
            <Text style={styles.setCol}>Set</Text>
            <Text style={styles.setCol}>kg</Text>
            <Text style={styles.setCol}>Reps</Text>
            <Text style={styles.setColTick}>✓</Text>
          </View>
          {sets.map(s => (
            <View key={s.id} style={styles.setRow}>
              <Text style={styles.setCol}>{s.set_number}</Text>
              <Text style={styles.setCol}>{s.weight}</Text>
              <Text style={styles.setCol}>{s.reps}</Text>
              <Text style={styles.setColTick}>✓</Text>
            </View>
          ))}
        </View>
      )}

      {!isCompleted && (
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="kg" keyboardType="numeric" value={weight} onChangeText={setWeight} />
          <TextInput style={styles.input} placeholder="reps" keyboardType="numeric" value={reps} onChangeText={setReps} />
          <Pressable style={styles.addSetBtn} onPress={handleAddSet}>
            <Text style={styles.addSetBtnText}>+</Text>
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

  if (!session) return <View style={styles.empty}><Text>Cargando sesión...</Text></View>;

  const isCompleted = session.status === 'completed';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.name}</Text>
        <Text style={styles.status}>{isCompleted ? 'Completado' : 'En Curso'}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ejercicios ({exercises.length})</Text>
        {!isCompleted && (
          <Pressable style={styles.addButton} onPress={() => setPickerVisible(true)}>
            <Text style={styles.addButtonText}>+ Añadir</Text>
          </Pressable>
        )}
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyList}>
          <Text style={styles.emptyText}>Inicia agregando tu primer ejercicio con el botón "Añadir".</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
             <ExerciseSetsCard sessionExercise={item} isCompleted={isCompleted} />
          )}
        />
      )}

      {!isCompleted && (
        <View style={styles.footer}>
          <Button title="Terminar Entrenamiento" onPress={finishSession} color="#ef4444" />
        </View>
      )}

      <ExercisePickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} onSelect={handleAddExercise} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold' },
  status: { fontSize: 14, color: '#666', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  addButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#007AFF', borderRadius: 8 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  
  exerciseCard: { backgroundColor: 'white', marginHorizontal: 16, marginBottom: 12, borderRadius: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  exName: { fontSize: 16, fontWeight: 'bold', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  
  setsContainer: { paddingVertical: 8 },
  setRowHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 4 },
  setRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  setCol: { flex: 1, textAlign: 'center', fontSize: 14, color: '#333' },
  setColTick: { width: 40, textAlign: 'center', color: '#10b981', fontWeight: 'bold' },
  
  inputRow: { flexDirection: 'row', padding: 16, alignItems: 'center', backgroundColor: '#fff' },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginRight: 8, textAlign: 'center' },
  addSetBtn: { backgroundColor: '#e0f2fe', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  addSetBtnText: { color: '#0284c7', fontSize: 24, fontWeight: 'bold', marginTop: -2 },
  
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyList: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#999', textAlign: 'center' },
  footer: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' }
});
