import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { TemplateRepository, WorkoutTemplate, TemplateExercise } from '../../src/repositories/template-repository';
import { ExercisePickerModal } from '../../src/components/ExercisePickerModal';
import { theme } from '../../src/themes/colors';
import { Ionicons } from '@expo/vector-icons';

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

  if (!template) return <View style={styles.empty}><Text style={styles.loadingText}>Cargando...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{template.name}</Text>
        {template.description && <Text style={styles.desc}>{template.description}</Text>}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ejercicios de la Rutina</Text>
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
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <View style={styles.orderBadge}>
                <Text style={styles.exOrder}>{item.sort_order}</Text>
              </View>
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 20, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  desc: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#6366f1', borderRadius: theme.borderRadius.md, gap: 4 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  exerciseCard: { flexDirection: 'row', backgroundColor: theme.colors.card, padding: 16, marginHorizontal: 20, marginBottom: 12, borderRadius: theme.borderRadius.md, alignItems: 'center', elevation: 2 },
  orderBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6366f120', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  exOrder: { fontSize: 16, fontWeight: 'bold', color: '#6366f1' },
  exInfo: { flex: 1 },
  exName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  exMuscle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  emptyList: { padding: 32, alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary, textAlign: 'center' },
  loadingText: { color: theme.colors.textSecondary }
});
