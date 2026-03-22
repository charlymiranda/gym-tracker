import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { SessionRepository, WorkoutSession } from '../../src/repositories/session-repository';

export default function HistoryScreen() {
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
      const id = await repo.createSession(\`Entrenamiento de \${dateStr}\`);
      router.push(\`/sessions/\${id}\`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.startBtn} onPress={startEmptySession}>
        <Text style={styles.startBtnText}>+ Iniciar Entrenamiento Libre</Text>
      </Pressable>
      
      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No tienes entrenamientos registrados.</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <Link href={\`/sessions/\${item.id}\`} asChild>
              <Pressable style={styles.card}>
                <View style={styles.header}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={[styles.status, item.status === 'completed' ? styles.statusCompleted : styles.statusActive]}>
                    {item.status === 'completed' ? 'Completado' : 'En Curso'}
                  </Text>
                </View>
                <Text style={styles.meta}>
                  {new Date(item.started_at).toLocaleString()}
                  {item.duration_seconds ? \` • \${Math.floor(item.duration_seconds / 60)} min\` : ''}
                </Text>
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
  startBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  startBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: 'bold' },
  status: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  statusCompleted: { backgroundColor: '#dcfce7', color: '#166534' },
  statusActive: { backgroundColor: '#fef08a', color: '#854d0e' },
  meta: { fontSize: 14, color: '#666', marginTop: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' }
});
