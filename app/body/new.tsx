import { View, Text, TextInput, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { BodyRepository } from '../../src/repositories/body-repository';
import { useState } from 'react';

export default function NewBodyLogScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [weight, setWeight] = useState('');

  const handleSave = async () => {
    const w = parseFloat(weight.replace(',', '.'));
    if (w > 0) {
      const repo = new BodyRepository(db);
      await repo.addMeasurement(w);
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Peso Corporal (kg)</Text>
      <TextInput 
        style={styles.input} 
        keyboardType="numeric" 
        value={weight} 
        onChangeText={setWeight} 
        placeholder="Ej: 75.5" 
        autoFocus
      />
      <View style={{ marginTop: 20 }}>
        <Button title="Guardar Registro" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 18 }
});
