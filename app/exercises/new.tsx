import { View, Text, TextInput, StyleSheet, Button, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ExerciseRepository } from '../../src/repositories/exercise-repository';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { exerciseSchema, ExerciseFormData } from '../../src/domain/validators/exercise-schema';

export default function NewExerciseScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  
  const { control, handleSubmit, formState: { errors } } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Nombre</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Ej: Press de Banca" />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <Text style={styles.label}>Grupo Muscular Principal</Text>
      <Controller
        control={control}
        name="primary_muscle_group"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Ej: Pecho" />
        )}
      />
      {errors.primary_muscle_group && <Text style={styles.error}>{errors.primary_muscle_group.message}</Text>}

      <Text style={styles.label}>Equipamiento</Text>
      <Controller
        control={control}
        name="equipment_type"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Ej: Barra, Mancuerna, Máquina" />
        )}
      />
      {errors.equipment_type && <Text style={styles.error}>{errors.equipment_type.message}</Text>}

      <View style={styles.switchRow}>
        <Text style={styles.label}>¿Es unilateral?</Text>
        <Controller
          control={control}
          name="is_unilateral"
          render={({ field: { onChange, value } }) => (
            <Switch onValueChange={onChange} value={value} />
          )}
        />
      </View>

      <Text style={styles.label}>Notas (opcional)</Text>
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <TextInput style={[styles.input, { height: 80 }]} onChangeText={onChange} value={value} multiline textAlignVertical="top" />
        )}
      />

      <View style={styles.buttonContainer}>
        <Button title="Guardar Ejercicio" onPress={handleSubmit(onSubmit)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  error: { color: 'red', marginTop: 4, fontSize: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 12 },
  buttonContainer: { marginTop: 24, marginBottom: 40 }
});
