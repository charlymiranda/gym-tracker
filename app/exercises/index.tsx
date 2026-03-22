import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ExerciseRepository, Exercise } from '../../src/repositories/exercise-repository';

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
          <Text style={styles.fabText}>+</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  badge: { backgroundColor: '#e0f2fe', color: '#0284c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 12, overflow: 'hidden' },
  meta: { fontSize: 14, color: '#666', marginTop: 8 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 4 },
  fabText: { fontSize: 32, color: 'white', fontWeight: 'bold', marginTop: -2 }
});
