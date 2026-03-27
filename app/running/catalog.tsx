import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../../src/repositories/exercise-repository';

export default function RunningCatalog() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const db = useSQLiteContext();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');

  const loadData = useCallback(() => {
    db.getAllAsync<Exercise>(`SELECT * FROM exercises WHERE running_recommended = 1 AND name LIKE '%${search}%' ORDER BY name ASC LIMIT 100`)
      .then(setExercises)
      .catch(console.error);
  }, [db, search]);

  useFocusEffect(loadData);

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={theme.colors.border} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Buscar ejercicio ej: Lunge..." 
          placeholderTextColor={theme.colors.border}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={exercises}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/exercises/${item.id}` as any)}>
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.tags}>{item.is_single_leg_focus ? 'Unilateral' : 'Bilateral'} • {item.primary_muscle_group}</Text>
            </View>
            <Ionicons name="footsteps" size={24} color={theme.colors.primary} />
          </Pressable>
        )}
      />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  searchBox: { flexDirection: 'row', backgroundColor: theme.colors.surface, padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 12, color: theme.colors.text, fontSize: 16 },
  card: { backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardContent: { flex: 1 },
  name: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold' },
  tags: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, textTransform: 'capitalize' }
});
