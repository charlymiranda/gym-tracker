import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ExerciseRepository, Exercise } from '../../src/repositories/exercise-repository';
import { theme } from '../../src/themes/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ExercisesListScreen() {
  const db = useSQLiteContext();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useFocusEffect(
    useCallback(() => {
      const repo = new ExerciseRepository(db);
      repo.getAllExercises().then(setExercises);
    }, [db])
  );

  return (
    <View style={styles.container}>
      <Link href="/exercises/new" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={32} color="white" />
        </Pressable>
      </Link>
      
      <FlatList
        data={exercises}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <Link href={`/exercises/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.name}>{item.name}</Text>
                {item.type === 'system' && <Text style={styles.badge}>Sistema</Text>}
              </View>
              <Text style={styles.meta}>{item.primary_muscle_group} • {item.equipment_type}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  card: { backgroundColor: theme.colors.card, padding: 16, borderRadius: theme.borderRadius.lg, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: 'bold', flex: 1, color: theme.colors.text },
  badge: { backgroundColor: theme.colors.badgeBg, color: theme.colors.badgeText, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 12, overflow: 'hidden' },
  meta: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 8 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 4 }
});
