import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../src/themes/colors';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const router = useRouter();

  const MENU_ITEMS = [
    { id: 'running', title: 'Fuerza Running', icon: 'walk', color: '#f43f5e', href: '/running' },
    { id: 'exercises', title: 'Ejercicios', icon: 'barbell', color: '#10b981', href: '/exercises' },
    { id: 'templates', title: 'Mis Rutinas', icon: 'list', color: '#6366f1', href: '/templates' },
    { id: 'history', title: 'Historial', icon: 'time', color: '#f59e0b', href: '/history' },
    { id: 'stats', title: 'Estadísticas', icon: 'stats-chart', color: '#ec4899', href: '/stats' },
    { id: 'body', title: 'Peso Corporal', icon: 'body', color: '#0ea5e9', href: '/body' },
    { id: 'goals', title: 'Objetivos', icon: 'flag', color: '#eab308', href: '/goals' },
    { id: 'backup', title: 'Copias de Seg.', icon: 'cloud-download', color: '#8b5cf6', href: '/backup' },
    { id: 'settings', title: 'Ajustes', icon: 'settings', color: '#64748b', href: '/settings' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, Atleta 👋</Text>
        <Text style={styles.subtitle}>¿Qué vamos a entrenar hoy?</Text>
      </View>

      <Pressable style={styles.startHeroCard} onPress={() => router.push('/history')}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Empezar Entrenamiento</Text>
          <Text style={styles.heroSub}>Inicia una sesión libre o usa una rutina</Text>
        </View>
        <Ionicons name="play-circle" size={48} color="white" />
      </Pressable>

      <Text style={styles.sectionTitle}>Tu Gimnasio</Text>
      <View style={styles.grid}>
        {MENU_ITEMS.map(item => (
          <Pressable key={item.id} style={styles.card} onPress={() => router.push(item.href as any)}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 30 },
  greeting: { color: theme.colors.textSecondary, fontSize: 18, marginBottom: 4 },
  subtitle: { color: theme.colors.text, fontSize: 28, fontWeight: 'bold' },
  
  startHeroCard: { backgroundColor: theme.colors.primary, borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, elevation: 4, shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
  heroContent: { flex: 1 },
  heroTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  heroSub: { color: '#ecfdf5', fontSize: 14 },

  sectionTitle: { color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: theme.colors.card, width: '48%', padding: 20, borderRadius: 16, marginBottom: 16, alignItems: 'center', elevation: 2 },
  iconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold', textAlign: 'center' }
});
