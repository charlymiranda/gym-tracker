import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { TemplateRepository, WorkoutTemplate, TemplateExercise } from '../../src/repositories/template-repository';
import { ExercisePickerModal } from '../../src/components/ExercisePickerModal';

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams();
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

  if (!template) return <View style={styles.empty}><Text>Cargando...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{template.name}</Text>
        {template.description && <Text style={styles.desc}>{template.description}</Text>}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ejercicios de la Rutina</Text>
        <Pressable style={styles.addButton} onPress={() => setPickerVisible(true)}>
          <Text style={styles.addButtonText}>+ Añadir</Text>
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
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <Text style={styles.exOrder}>{item.sort_order}</Text>
              <View style={styles.exInfo}>
                <Text style={styles.exName}>{item.name}</Text>
                <Text style={styles.exMuscle}>{item.primary_muscle_group}</Text>
              </View>
            </View>
          )}
        />
      )}

      <ExercisePickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} onSelect={handleAddExercise} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold' },
  desc: { fontSize: 16, color: '#666', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  addButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#007AFF', borderRadius: 8 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  exerciseCard: { flexDirection: 'row', backgroundColor: 'white', padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 8, alignItems: 'center', elevation: 1 },
  exOrder: { fontSize: 18, fontWeight: 'bold', width: 30, color: '#007AFF' },
  exInfo: { flex: 1 },
  exName: { fontSize: 16, fontWeight: 'bold' },
  exMuscle: { fontSize: 12, color: '#666' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyList: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#999', textAlign: 'center' }
});
