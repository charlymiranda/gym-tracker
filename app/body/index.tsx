import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { BodyRepository, BodyMeasurement } from '../../src/repositories/body-repository';

export default function BodyLogScreen() {
  const db = useSQLiteContext();
  const [logs, setLogs] = useState<BodyMeasurement[]>([]);

  useFocusEffect(
    useCallback(() => {
      const repo = new BodyRepository(db);
      repo.getMeasurements().then(setLogs).catch(console.error);
    }, [db])
  );

  return (
    <View style={styles.container}>
      <Link href="/body/new" asChild>
        <Pressable style={styles.addBtn}><Text style={styles.addBtnText}>+ Nuevo Registro</Text></Pressable>
      </Link>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{new Date(item.measured_at).toLocaleDateString()}</Text>
            <Text style={styles.weight}>{item.body_weight} kg</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  addBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  date: { fontSize: 16 },
  weight: { fontSize: 18, fontWeight: 'bold', color: '#0284c7' }
});
