import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ROUTINES = {
  prevention: {
    title: 'Prevención de Lesiones',
    desc: 'Fortalece tendones y articulaciones clave para evitar las lesiones más comunes en corredores.',
    exercises: ['Calf Raise', 'Tibialis Raise', 'Glute Bridge', 'Banded Walk']
  },
  activation: {
    title: 'Activación Pre-Run',
    desc: 'Despierta el sistema nervioso y moviliza las caderas antes de salir a correr.',
    exercises: ['Leg Swings', 'Dynamic Lunges', 'High Knees', 'Hip Rotations']
  },
  strength: {
    title: 'Fuerza General Runner',
    desc: 'Rutina pesada para ganar potencia pura y mejorar la economía de carrera.',
    exercises: ['Barbell Squat', 'Romanian Deadlift', 'Bulgarian Split Squat', 'Weighted Calf Raise']
  },
  core: {
    title: 'Core y Estabilidad',
    desc: 'Tronco sólido para mantener la postura cuando llega la fatiga en los kilómetros finales.',
    exercises: ['Plank', 'Russian Twist', 'Dead Bug', 'Side Plank']
  }
};

export default function RunningRoutines() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: keyof typeof ROUTINES }>();
  const routine = ROUTINES[type || 'strength'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Ionicons name="list-circle" size={48} color={theme.colors.primary} />
        <Text style={styles.title}>{routine.title}</Text>
        <Text style={styles.desc}>{routine.desc}</Text>
      </View>

      <Text style={styles.sectionTitle}>Ejercicios Recomendados</Text>
      {routine.exercises.map((ex, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.index}>{i + 1}</Text>
          <Text style={styles.exName}>{ex}</Text>
        </View>
      ))}

      <Pressable style={styles.startBtn} onPress={() => router.push('/running/catalog')}>
        <Text style={styles.startBtnText}>Explorar en Catálogo</Text>
      </Pressable>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  hero: { alignItems: 'center', marginBottom: 32, marginTop: 24 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  desc: { color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 8, lineHeight: 24 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  index: { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold', width: 30 },
  exName: { color: theme.colors.text, fontSize: 16, fontWeight: '500' },
  startBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  startBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
