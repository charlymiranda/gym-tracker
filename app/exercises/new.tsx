import { View, Text, TextInput, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ExerciseRepository } from '../../src/repositories/exercise-repository';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { exerciseSchema, ExerciseFormData } from '../../src/domain/validators/exercise-schema';
import { theme } from '../../src/themes/colors';

export default function NewExerciseScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  
  const { control, handleSubmit, formState: { errors } } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema) as any,
    defaultValues: { is_unilateral: false, primary_muscle_group: '', equipment_type: '', name: '', notes: '' }
  });

  const onSubmit = async (data: ExerciseFormData) => {
    try {
      const repo = new ExerciseRepository(db);
      await repo.createCustomExercise(data);
      router.back();
    } catch (e) {
      console.error('Error saving exercise', e);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>Nombre</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Ej: Press de Banca" placeholderTextColor={theme.colors.border} />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <Text style={styles.label}>Grupo Muscular Principal</Text>
      <Controller
        control={control}
        name="primary_muscle_group"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Ej: Pecho" placeholderTextColor={theme.colors.border} />
        )}
      />
      {errors.primary_muscle_group && <Text style={styles.error}>{errors.primary_muscle_group.message}</Text>}

      <Text style={styles.label}>Equipamiento</Text>
      <Controller
        control={control}
        name="equipment_type"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Ej: Barra, Mancuerna, Máquina" placeholderTextColor={theme.colors.border} />
        )}
      />
      {errors.equipment_type && <Text style={styles.error}>{errors.equipment_type.message}</Text>}

      <View style={styles.switchRow}>
        <Text style={styles.labelSwitch}>¿Es unilateral?</Text>
        <Controller
          control={control}
          name="is_unilateral"
          render={({ field: { onChange, value } }) => (
            <Switch onValueChange={onChange} value={value} trackColor={{ false: theme.colors.border, true: theme.colors.primaryDark }} thumbColor={value ? theme.colors.primary : "#f4f3f4"} />
          )}
        />
      </View>

      <Text style={styles.label}>Notas (opcional)</Text>
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <TextInput style={[styles.input, { height: 80 }]} onChangeText={onChange} value={value} multiline textAlignVertical="top" placeholderTextColor={theme.colors.border} />
        )}
      />

      <Pressable style={styles.saveBtn} onPress={() => handleSubmit(onSubmit)()}>
        <Text style={styles.saveBtnText}>Guardar Ejercicio</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: theme.colors.textSecondary, textTransform: 'uppercase' },
  labelSwitch: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  input: { borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: 14, fontSize: 16, color: theme.colors.text },
  error: { color: theme.colors.danger, marginTop: 4, fontSize: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12, backgroundColor: theme.colors.surface, padding: 16, borderRadius: theme.borderRadius.md },
  saveBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: 32 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
