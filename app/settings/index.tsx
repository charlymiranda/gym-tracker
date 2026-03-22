import { View, Text, StyleSheet, Switch } from 'react-native';
import { useState } from 'react';

export default function SettingsScreen() {
  const [isKg, setIsKg] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Ajustes</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Unidad de Peso Base</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.unitText}>lbs</Text>
            <Switch value={isKg} onValueChange={setIsKg} />
            <Text style={styles.unitText}>kg</Text>
          </View>
        </View>
        <Text style={styles.hint}>Nota: La conversión de unidades se implementará en la v2.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Acerca de Gym Tracker</Text>
        <Text style={styles.version}>Versión 1.0.0 (Offline-First MVP)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '500' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitText: { fontSize: 14, color: '#666' },
  hint: { fontSize: 12, color: '#999', marginTop: 12, fontStyle: 'italic' },
  version: { fontSize: 14, color: '#666', marginTop: 8 }
});
