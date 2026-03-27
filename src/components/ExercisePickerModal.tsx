import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Pressable, TextInput, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { ExerciseRepository, Exercise } from '../repositories/exercise-repository';
import { theme } from '../themes/colors';
import { Ionicons } from '@expo/vector-icons';

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
}

const MUSCLES = [
  'Pecho', 'Hombros', 'Dorsales', 'Espalda Media', 'Espalda Baja',
  'Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Pantorrillas', 
  'Tríceps', 'Bíceps', 'Abdominales', 'Antebrazos'
];

export function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
  const db = useSQLiteContext();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      const repo = new ExerciseRepository(db);
      repo.getAllExercises().then(setExercises).catch(console.error);
    }
  }, [visible, db]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchSearch = search ? ex.name.toLowerCase().includes(search.toLowerCase()) : true;
      const matchMuscle = muscle ? ex.primary_muscle_group === muscle : true;
      return matchSearch && matchMuscle;
    });
  }, [exercises, search, muscle]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Seleccionar Ejercicio</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.border} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            placeholderTextColor={theme.colors.border}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={{ height: 50, marginBottom: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <Pressable 
              style={[styles.chip, !muscle && styles.chipActive]} 
              onPress={() => setMuscle(null)}
            >
              <Text style={[styles.chipText, !muscle && styles.chipTextActive]}>Todos</Text>
            </Pressable>
            {MUSCLES.map(m => (
              <Pressable 
                key={m} 
                style={[styles.chip, muscle === m && styles.chipActive]} 
                onPress={() => setMuscle(muscle === m ? null : m)}
              >
                <Text style={[styles.chipText, muscle === m && styles.chipTextActive]}>{m}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredExercises}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <Pressable 
              style={styles.item}
              onPress={() => {
                onSelect(item.id);
                onClose();
              }}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.type === 'system' && <Text style={styles.badge}>Sistema</Text>}
              </View>
              <Text style={styles.itemMeta}>{item.primary_muscle_group} • {item.equipment_type}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron ejercicios.</Text>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 16, backgroundColor: theme.colors.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  closeBtn: { padding: 8 },
  closeBtnText: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: theme.colors.background, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, fontSize: 16, color: theme.colors.text, marginLeft: 12 },
  filterScroll: { paddingHorizontal: 16, alignItems: 'center' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.surface, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.textSecondary, fontWeight: 'bold' },
  chipTextActive: { color: 'white' },
  item: { backgroundColor: theme.colors.card, padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: theme.borderRadius.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold', flex: 1, color: theme.colors.text },
  badge: { backgroundColor: theme.colors.badgeBg, color: theme.colors.badgeText, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, fontSize: 10, overflow: 'hidden' },
  itemMeta: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  emptyText: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: 32 }
});
