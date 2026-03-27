import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { BodyRepository, BodyMeasurement } from '../../src/repositories/body-repository';
import { useTheme } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function BodyMetricsScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const db = useSQLiteContext();
  const router = useRouter();
  const [records, setRecords] = useState<BodyMeasurement[]>([]);

  useFocusEffect(
    useCallback(() => {
      const repo = new BodyRepository(db);
      repo.getMeasurements().then(setRecords).catch(console.error);
    }, [db])
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.addBtn} onPress={() => router.push('/body/new')}>
        <Ionicons name="add" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.addBtnText}>Registrar Peso Corporal</Text>
      </Pressable>

      {records.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="scale-outline" size={48} color={theme.colors.border} />
          <Text style={styles.emptyText}>No hay registros de peso corporal recientes.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.weight}>{item.body_weight} kg</Text>
              </View>
              <Text style={styles.date}>{new Date(item.measured_at).toLocaleDateString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  addBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginBottom: 20 },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  card: { flexDirection: 'row', backgroundColor: theme.colors.card, padding: 16, borderRadius: theme.borderRadius.md, marginBottom: 12, justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  weight: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  notes: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  date: { fontSize: 14, color: theme.colors.textSecondary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary, marginTop: 16 }
});
