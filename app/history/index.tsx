import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { SessionRepository, WorkoutSession } from '../../src/repositories/session-repository';
import { useTheme } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const db = useSQLiteContext();
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      const repo = new SessionRepository(db);
      repo.getSessions().then(setSessions);
    }, [db])
  );

  const startEmptySession = async () => {
    try {
      const repo = new SessionRepository(db);
      const dateStr = new Date().toLocaleDateString();
      const id = await repo.createSession(`Entrenamiento de ${dateStr}`);
      router.push(`/sessions/${id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.startBtn} onPress={startEmptySession}>
        <Ionicons name="flash" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.startBtnText}>+ Iniciar Entrenamiento Libre</Text>
      </Pressable>
      
      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={64} color={theme.colors.border} />
          <Text style={styles.emptyText}>No tienes entrenamientos registrados.</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <Link href={`/sessions/${item.id}`} asChild>
              <Pressable style={styles.card}>
                <View style={styles.header}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={[styles.status, item.status === 'completed' ? styles.statusCompleted : styles.statusActive]}>
                    {item.status === 'completed' ? 'Completado' : 'En Curso'}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.meta}>
                    {' ' + new Date(item.started_at).toLocaleString()}
                    {item.duration_seconds ? ` • ${Math.floor(item.duration_seconds / 60)} min` : ''}
                  </Text>
                </View>
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
  startBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginBottom: 20, elevation: 4, shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  startBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: theme.colors.card, padding: 16, borderRadius: theme.borderRadius.md, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  status: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  statusCompleted: { backgroundColor: theme.colors.badgeBg, color: theme.colors.badgeText },
  statusActive: { backgroundColor: '#fef08a', color: '#854d0e' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  meta: { fontSize: 14, color: theme.colors.textSecondary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 16 }
});
