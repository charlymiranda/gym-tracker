import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { GoalsRepository, Goal } from '../../src/repositories/goals-repository';
import { useTheme } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function GoalsScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const db = useSQLiteContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState('');

  const loadGoals = useCallback(() => {
    const repo = new GoalsRepository(db);
    repo.getGoals().then(
      (res) => setGoals(res.filter(g => g.status !== 'completed'))
    ).catch(console.error);
  }, [db]);

  useFocusEffect(loadGoals);

  const handleAddGoal = async () => {
    if (!title.trim()) return;
    try {
      const repo = new GoalsRepository(db);
      await repo.addGoal(title.trim());
      setTitle('');
      loadGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const repo = new GoalsRepository(db);
      await repo.completeGoal(id);
      loadGoals();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.addCard}>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Levantar 100kg en Press de Banca" 
          value={title} 
          onChangeText={setTitle}
          placeholderTextColor={theme.colors.border}
        />
        <Pressable style={styles.addBtn} onPress={handleAddGoal}>
          <Text style={styles.addBtnText}>Añadir</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Objetivos Activos</Text>
      
      {goals.length === 0 ? (
        <View style={styles.empty}>
            <Ionicons name="flag-outline" size={48} color={theme.colors.border} />
            <Text style={styles.emptyText}>No tienes objetivos activos.</Text>
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.goalCard}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>{item.goal_type}</Text>
                <Text style={styles.goalDate}>Creado: {new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <Pressable style={styles.checkBtn} onPress={() => handleComplete(item.id)}>
                <Ionicons name="checkmark" size={20} color="white" />
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  addCard: { flexDirection: 'row', marginBottom: 24 },
  input: { flex: 1, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: 12, marginRight: 8, color: theme.colors.text },
  addBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, justifyContent: 'center', borderRadius: theme.borderRadius.md },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: theme.colors.text },
  goalCard: { flexDirection: 'row', backgroundColor: theme.colors.card, padding: 16, borderRadius: theme.borderRadius.md, marginBottom: 12, alignItems: 'center', elevation: 2 },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  goalDate: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  checkBtn: { backgroundColor: theme.colors.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary, marginTop: 16 }
});
