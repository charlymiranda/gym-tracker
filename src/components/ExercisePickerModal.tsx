import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, Pressable, TextInput } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { ExerciseRepository, Exercise } from '../repositories/exercise-repository';

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
}

export function ExercisePickerModal({ visible, onClose, onSelect }: ExercisePickerModalProps) {
  const db = useSQLiteContext();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible) {
      const repo = new ExerciseRepository(db);
      repo.getAllExercises().then(setExercises).catch(console.error);
    }
  }, [visible, db]);

  const filteredExercises = exercises.filter(
    e => e.name.toLowerCase().includes(search.toLowerCase()) || 
         e.primary_muscle_group.toLowerCase().includes(search.toLowerCase())
  );

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
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o músculo..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredExercises}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
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
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 16, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { padding: 8 },
  closeBtnText: { color: '#007AFF', fontSize: 16 },
  searchContainer: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput: { backgroundColor: '#f1f1f1', padding: 12, borderRadius: 8, fontSize: 16 },
  item: { backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  badge: { backgroundColor: '#e0f2fe', color: '#0284c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, fontSize: 10, overflow: 'hidden' },
  itemMeta: { fontSize: 13, color: '#666', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 32 }
});
