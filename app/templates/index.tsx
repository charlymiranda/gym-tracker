import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { TemplateRepository, WorkoutTemplate } from '../../src/repositories/template-repository';
import { useTheme } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function TemplatesListScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
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
          <Ionicons name="add" size={32} color="white" />
        </Pressable>
      </Link>
      
      {templates.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="list" size={64} color={theme.colors.border} />
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
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </View>
                {item.description && <Text style={styles.desc}>{item.description}</Text>}
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  card: { backgroundColor: theme.colors.card, padding: 20, borderRadius: theme.borderRadius.lg, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  desc: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 16 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 64, height: 64, borderRadius: 32, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 6, shadowColor: '#6366f1', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
});
