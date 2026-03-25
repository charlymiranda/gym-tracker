import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { TemplateRepository } from '../../src/repositories/template-repository';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { templateSchema, TemplateFormData } from '../../src/domain/validators/template-schema';
import { theme } from '../../src/themes/colors';

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
      <Text style={styles.label}>Nombre de Rutina</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Ej: Empuje pesado" placeholderTextColor={theme.colors.border} />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <Text style={styles.label}>Descripción (opcional)</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput style={[styles.input, { height: 100 }]} onChangeText={onChange} value={value || ''} placeholder="Día de fuerza pura..." placeholderTextColor={theme.colors.border} multiline textAlignVertical="top" />
        )}
      />
      {errors.description && <Text style={styles.error}>{errors.description.message}</Text>}

      <Pressable style={styles.saveBtn} onPress={() => handleSubmit(onSubmit)()}>
        <Text style={styles.saveBtnText}>Crear Rutina</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: theme.colors.textSecondary, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: 16, fontSize: 16, color: theme.colors.text },
  error: { color: theme.colors.danger, marginTop: 4, fontSize: 12 },
  saveBtn: { backgroundColor: '#6366f1', padding: 18, borderRadius: theme.borderRadius.md, alignItems: 'center', marginTop: 40 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
