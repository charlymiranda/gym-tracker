import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { theme } from '../../src/themes/colors';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../../src/repositories/exercise-repository';

export default function RunningDashboard() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useFocusEffect(
    useCallback(() => {
      db.getAllAsync<Exercise>(`SELECT * FROM exercises WHERE running_recommended = 1 ORDER BY name ASC LIMIT 5`)
        .then(setExercises)
        .catch(console.error);
    }, [db])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Ionicons name="barbell-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.heroTitle}>Fuerza para Corredores</Text>
        <Text style={styles.heroSub}>Módulo especializado para fortalecimiento, prevención de lesiones y eficiencia biomecánica.</Text>
      </View>

      <Text style={styles.sectionTitle}>Planes Prearmados</Text>
      <View style={styles.cardsRow}>
        <Pressable style={[styles.planCard, { borderColor: '#8b5cf6' }]} onPress={() => router.push('/running/routines?type=prevention')}>
          <Ionicons name="shield-checkmark" size={32} color="#8b5cf6" />
          <Text style={styles.planTitle}>Prevención</Text>
        </Pressable>
        <Pressable style={[styles.planCard, { borderColor: '#ec4899' }]} onPress={() => router.push('/running/routines?type=activation')}>
          <Ionicons name="flash" size={32} color="#ec4899" />
          <Text style={styles.planTitle}>Activación</Text>
        </Pressable>
      </View>
      <View style={styles.cardsRow}>
        <Pressable style={[styles.planCard, { borderColor: '#10b981' }]} onPress={() => router.push('/running/routines?type=strength')}>
          <Ionicons name="fitness" size={32} color="#10b981" />
          <Text style={styles.planTitle}>Fuerza General</Text>
        </Pressable>
        <Pressable style={[styles.planCard, { borderColor: '#3b82f6' }]} onPress={() => router.push('/running/routines?type=core')}>
          <Ionicons name="scan" size={32} color="#3b82f6" />
          <Text style={styles.planTitle}>Estabilidad Core</Text>
        </Pressable>
      </View>

      <View style={styles.catalogHeader}>
        <Text style={styles.sectionTitle}>Catálogo Específico</Text>
        <Pressable onPress={() => router.push('/running/catalog')}>
          <Text style={styles.seeAll}>Ver todos</Text>
        </Pressable>
      </View>
      
      {exercises.map(ex => (
        <View key={ex.id} style={styles.exCard}>
          <View>
            <Text style={styles.exName}>{ex.name}</Text>
            <Text style={styles.exFocus}>{ex.is_single_leg_focus ? 'Unilateral' : 'Bilateral'} • {ex.primary_muscle_group}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
        </View>
      ))}
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  hero: { alignItems: 'center', marginVertical: 32 },
  heroTitle: { color: theme.colors.text, fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  heroSub: { color: theme.colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 20, lineHeight: 22 },
  sectionTitle: { color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  planCard: { backgroundColor: theme.colors.card, flex: 1, marginHorizontal: 4, padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  planTitle: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold', marginTop: 12 },
  catalogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  seeAll: { color: theme.colors.primary, fontWeight: 'bold', marginRight: 8 },
  exCard: { backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  exName: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold' },
  exFocus: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, textTransform: 'capitalize' }
});
