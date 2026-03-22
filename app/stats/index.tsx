import { View, Text, StyleSheet } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StatsRepository, GeneralStats } from '../../src/repositories/stats-repository';

export default function StatsScreen() {
  const db = useSQLiteContext();
  const [stats, setStats] = useState<GeneralStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      const repo = new StatsRepository(db);
      repo.getGeneralStats().then(setStats).catch(console.error);
    }, [db])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Tu Progreso General</Text>
      
      {stats ? (
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.value}>{stats.totalSessions}</Text>
            <Text style={styles.label}>Sesiones Completadas</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.value}>{stats.totalSets}</Text>
            <Text style={styles.label}>Series Realizadas</Text>
          </View>
          <View style={[styles.card, styles.fullWidthCard]}>
            <Text style={styles.value}>{stats.totalVolume.toLocaleString()} kg</Text>
            <Text style={styles.label}>Volumen Total Movido</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.loading}>Calculando estadísticas...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginVertical: 24, textAlign: 'center', color: '#111' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: 'white', width: '48%', padding: 20, borderRadius: 12, marginBottom: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  fullWidthCard: { width: '100%' },
  value: { fontSize: 32, fontWeight: 'bold', color: '#007AFF' },
  label: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
  loading: { textAlign: 'center', marginTop: 40, color: '#999' }
});
