import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { TemplateRepository, WorkoutTemplate } from '../../src/repositories/template-repository';

export default function TemplatesListScreen() {
  const db = useSQLiteContext();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  useFocusEffect(
    useCallback(() => {
      const repo = new TemplateRepository(db);
      repo.getAllTemplates().then(setTemplates);
    }, [db])
  );

  return (
    <View style={styles.container}>
      <Link href="/templates/new" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Link>
      
      {templates.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No tienes rutinas creadas.</Text>
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <Link href={`/templates/${item.id}`} asChild>
              <Pressable style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                {item.description && <Text style={styles.desc}>{item.description}</Text>}
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  name: { fontSize: 18, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#666', marginTop: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 4 },
  fabText: { fontSize: 32, color: 'white', fontWeight: 'bold', marginTop: -2 }
});
