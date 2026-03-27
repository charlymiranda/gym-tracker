import { View, Text, StyleSheet } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StatsRepository, GeneralStats } from '../../src/repositories/stats-repository';
import { useTheme } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function StatsScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
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
      <Text style={styles.headerTitle}>Resumen General</Text>
      
      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={32} color={theme.colors.primary} />
          <Text style={styles.statValue}>{stats?.totalSessions || 0}</Text>
          <Text style={styles.statLabel}>Entrenamientos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="barbell" size={32} color={'#6366f1'} />
          <Text style={styles.statValue}>{stats?.totalSets || 0}</Text>
          <Text style={styles.statLabel}>Series (Sets)</Text>
        </View>

        <View style={[styles.statCard, { width: '100%' }]}>
          <Ionicons name="trending-up" size={32} color={'#f59e0b'} />
          <Text style={styles.statValue}>{stats?.totalVolume.toLocaleString() || 0} kg</Text>
          <Text style={styles.statLabel}>Volumen Total Levantado</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: theme.colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: theme.colors.card, padding: 20, borderRadius: theme.borderRadius.lg, alignItems: 'center', marginBottom: 16, elevation: 2 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text, marginTop: 12 },
  statLabel: { fontSize: 12, color: theme.colors.textSecondary, textTransform: 'uppercase', marginTop: 4, textAlign: 'center' }
});
