import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useCallback } from 'react';
import { ProgressRepository } from '../../src/repositories/stats-repository';
import { ExerciseRepository, Exercise } from '../../src/repositories/exercise-repository';
import { theme } from '../../src/themes/colors';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [maxWeight, setMaxWeight] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      if (typeof id !== 'string') return;
      const exRepo = new ExerciseRepository(db);
      const prRepo = new ProgressRepository(db);
      
      exRepo.getAllExercises().then(list => {
        const found = list.find(e => e.id === id);
        if (found) setExercise(found);
      });
      
      prRepo.getMaxWeightForExercise(id).then(setMaxWeight);
    }, [id, db])
  );
  
  if (!exercise) {
    return <View style={styles.center}><Text style={styles.loadingText}>Cargando ejercicio...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise.name}</Text>
      
      <View style={styles.card}>
        <Text style={styles.metaLabel}>Músculo Principal</Text>
        <Text style={styles.metaValue}>{exercise.primary_muscle_group}</Text>
        
        <Text style={styles.metaLabel}>Equipamiento</Text>
        <Text style={styles.metaValue}>{exercise.equipment_type}</Text>
      </View>

      <View style={styles.recordCard}>
        <Text style={styles.recordTitle}>Récord Personal (Max Peso)</Text>
        <Text style={styles.recordValue}>{maxWeight > 0 ? `${maxWeight} kg` : 'Sin registros'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
  loadingText: { color: theme.colors.textSecondary },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: theme.colors.text },
  card: { backgroundColor: theme.colors.card, padding: 20, borderRadius: theme.borderRadius.lg, marginBottom: 16, elevation: 1 },
  metaLabel: { fontSize: 12, color: theme.colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 },
  metaValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: theme.colors.text },
  recordCard: { backgroundColor: theme.colors.badgeBg, padding: 24, borderRadius: theme.borderRadius.lg, alignItems: 'center', marginTop: 8 },
  recordTitle: { fontSize: 14, color: theme.colors.badgeText, textTransform: 'uppercase', fontWeight: 'bold' },
  recordValue: { fontSize: 36, fontWeight: 'bold', color: theme.colors.primary, marginTop: 8 }
});
