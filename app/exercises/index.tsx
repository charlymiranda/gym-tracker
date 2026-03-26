import { View, Text, FlatList, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState, useMemo } from 'react';
import { ExerciseRepository, Exercise } from '../../src/repositories/exercise-repository';
import { theme } from '../../src/themes/colors';
import { Ionicons } from '@expo/vector-icons';

const MUSCLES = [
  'Pecho', 'Hombros', 'Dorsales', 'Espalda Media', 'Espalda Baja',
  'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas', 
  'Tríceps', 'Bíceps', 'Abdominales', 'Antebrazos'
];

export default function ExercisesListScreen() {
  const db = useSQLiteContext();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const repo = new ExerciseRepository(db);
      repo.getAllExercises().then(setExercises);
    }, [db])
  );

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchSearch = search ? ex.name.toLowerCase().includes(search.toLowerCase()) : true;
      const matchMuscle = muscle ? ex.primary_muscle_group === muscle : true;
      return matchSearch && matchMuscle;
    });
  }, [exercises, search, muscle]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={theme.colors.border} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Buscar..." 
            placeholderTextColor={theme.colors.border}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={{ height: 50, marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Pressable 
            style={[styles.chip, !muscle && styles.chipActive]} 
            onPress={() => setMuscle(null)}
          >
            <Text style={[styles.chipText, !muscle && styles.chipTextActive]}>Todos</Text>
          </Pressable>
          {MUSCLES.map(m => (
            <Pressable 
              key={m} 
              style={[styles.chip, muscle === m && styles.chipActive]} 
              onPress={() => setMuscle(muscle === m ? null : m)}
            >
              <Text style={[styles.chipText, muscle === m && styles.chipTextActive]}>{m}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Link href="/exercises/new" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={32} color="white" />
        </Pressable>
      </Link>
      
      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        initialNumToRender={15}
        windowSize={5}
        renderItem={({ item }) => (
          <Link href={`/exercises/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <View style={styles.cardHeader}>
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  searchBox: { flexDirection: 'row', backgroundColor: theme.colors.surface, padding: 12, borderRadius: 12, alignItems: 'center' },
  searchInput: { flex: 1, marginLeft: 12, color: theme.colors.text, fontSize: 16 },
  filterScroll: { paddingHorizontal: 16, alignItems: 'center' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.surface, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.textSecondary, fontWeight: 'bold' },
  chipTextActive: { color: 'white' },
  card: { backgroundColor: theme.colors.card, marginHorizontal: 16, padding: 16, borderRadius: theme.borderRadius.lg, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: 'bold', flex: 1, color: theme.colors.text },
  badge: { backgroundColor: theme.colors.badgeBg, color: theme.colors.badgeText, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 12, overflow: 'hidden' },
  meta: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 8 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 4 }
});
