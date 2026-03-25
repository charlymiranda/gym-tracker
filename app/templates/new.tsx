import { View, Text, TextInput, StyleSheet, Button, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { TemplateRepository } from '../../src/repositories/template-repository';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templateSchema, TemplateFormData } from '../../src/domain/validators/template-schema';

export default function NewTemplateScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  
  const { control, handleSubmit, formState: { errors } } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema) as any,
    defaultValues: { name: '', description: '' }
  });

  const onSubmit = async (data: TemplateFormData) => {
    try {
      const repo = new TemplateRepository(db);
      await repo.createTemplate(data);
      router.back();
    } catch (e) {
      console.error('Error saving template', e);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Nombre de la Rutina</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Ej: Empuje / Push Day" />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <Text style={styles.label}>Descripción (opcional)</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput style={[styles.input, { height: 80 }]} onChangeText={onChange} value={value} multiline textAlignVertical="top" placeholder="Ej: Enfocado en hipertrofia" />
        )}
      />

      <View style={styles.buttonContainer}>
        <Button title="Guardar Rutina" onPress={() => handleSubmit(onSubmit)()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  error: { color: 'red', marginTop: 4, fontSize: 12 },
  buttonContainer: { marginTop: 24, marginBottom: 40 }
});
