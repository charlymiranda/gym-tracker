import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StatsRepository, GeneralStats } from '../../src/repositories/stats-repository';
import { useTheme } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

export default function StatsScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const db = useSQLiteContext();
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [monthlyVols, setMonthlyVols] = useState<{ month: string, volume: number }[]>([]);

  useFocusEffect(
    useCallback(() => {
      const repo = new StatsRepository(db);
      repo.getGeneralStats().then(setStats).catch(console.error);
      repo.getMonthlyVolume().then(setMonthlyVols).catch(console.error);
    }, [db])
  );

  const screenWidth = Dimensions.get('window').width;

  // Si no hay data para gráfica (ej app nueva vacía), montamos un placeholder de ceros
  const labels = monthlyVols.length > 0 ? monthlyVols.map(m => m.month.split('-')[1]) : ['N/A'];
  const dataset = monthlyVols.length > 0 ? monthlyVols.map(m => m.volume) : [0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
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

      <Text style={styles.chartTitle}>Volumen Mensual (Progreso)</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: dataset }]
          }}
          width={screenWidth - 40} // from padding
          height={220}
          yAxisSuffix="k"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: theme.colors.card,
            backgroundGradientFrom: theme.colors.card,
            backgroundGradientTo: theme.colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => theme.colors.primary,
            labelColor: (opacity = 1) => theme.colors.textSecondary,
            style: { borderRadius: 16 },
            propsForDots: { r: "6", strokeWidth: "2", stroke: theme.colors.primary }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: theme.colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: theme.colors.card, padding: 20, borderRadius: theme.borderRadius.lg, alignItems: 'center', marginBottom: 16, elevation: 2 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text, marginTop: 12 },
  statLabel: { fontSize: 12, color: theme.colors.textSecondary, textTransform: 'uppercase', marginTop: 4, textAlign: 'center' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginVertical: 16, marginTop: 32 },
  chartWrapper: { alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: 16, padding: 8, elevation: 2 }
});
