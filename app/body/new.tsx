import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { BodyRepository } from '../../src/repositories/body-repository';
import { useTheme } from '../../src/themes/ThemeContext';

export default function NewBodyRecordScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const db = useSQLiteContext();
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    const w = parseFloat(weight.replace(',', '.'));
    if (!w || isNaN(w)) return;
    try {
      const repo = new BodyRepository(db);
      await repo.addMeasurement(w);
      router.back();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Peso (kg)</Text>
      <TextInput 
        style={styles.input} 
        keyboardType="numeric" 
        value={weight} 
        onChangeText={setWeight} 
        placeholder="Ej: 75.5"
        placeholderTextColor={theme.colors.border}
      />

      <Text style={styles.label}>Notas (Opcional)</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={notes} 
        onChangeText={setNotes} 
        placeholder="Ej: En ayunas"
        placeholderTextColor={theme.colors.border}
        multiline
      />

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Guardar Registro</Text>
      </Pressable>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  label: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 8, marginTop: 16, textTransform: 'uppercase' },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: 16, fontSize: 16, color: theme.colors.text },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: 32 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
