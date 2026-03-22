import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { GoalsRepository, Goal } from '../../src/repositories/goals-repository';

export default function GoalsScreen() {
  const db = useSQLiteContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [text, setText] = useState('');

  const loadData = useCallback(() => {
    const repo = new GoalsRepository(db);
    repo.getGoals().then(setGoals).catch(console.error);
  }, [db]);

  useFocusEffect(loadData);

  const handleAdd = async () => {
    if (text.trim().length === 0) return;
    try {
      const repo = new GoalsRepository(db);
      await repo.addGoal(text);
      setText('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Mis Objetivos</Text>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Llegar a 100kg en Sentadilla" 
          value={text} 
          onChangeText={setText} 
        />
        <Button title="Añadir" onPress={handleAdd} color="#007AFF" />
      </View>
      
      {goals.length === 0 ? (
        <Text style={styles.emptyText}>No tienes objetivos activos.</Text>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.goalText}>🎯 {item.goal_type}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  inputContainer: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginRight: 8, backgroundColor: 'white' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 8, elevation: 1 },
  goalText: { fontSize: 16, fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 }
});
