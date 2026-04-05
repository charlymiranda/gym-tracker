import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { PreferencesRepository } from '../src/repositories/extra-repositories';
import { StatsRepository } from '../src/repositories/stats-repository';
import { ContributionGraph } from 'react-native-chart-kit';

const MOTIVATIONAL_QUOTES = [
  "El dolor de hoy es la fuerza de mañana.",
  "No cuentes los días, haz que los días cuenten.",
  "La disciplina es el puente entre metas y logros.",
  "Si quieres resultados distintos, no hagas lo mismo.",
  "El éxito empieza donde termina tu zona de confort.",
  "Cada repetición te acerca a tu mejor versión.",
  "No te detengas al cansarte, detente al terminar.",
  "El cuerpo logra lo que la mente cree.",
  "Sé más fuerte que tus excusas.",
  "La única mala sesión es la que no ocurrió.",
  "Tu única competencia es quien eras ayer.",
  "Suda, sonríe y repite.",
  "El sacrificio de hoy es el éxito de mañana.",
  "El respeto no se exige, se entrena.",
  "Hazlo por tu versión del futuro."
];

export default function Home() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const db = useSQLiteContext();

  const [userName, setUserName] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [tempName, setTempName] = useState('');
  const [dailyQuote, setDailyQuote] = useState('');
  const [consistencyDates, setConsistencyDates] = useState<string[]>([]);

  useEffect(() => {
    // Escoger frase aleatoria para la sesión
    const random = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setDailyQuote(MOTIVATIONAL_QUOTES[random]);

    // Cargar perfil y estadísticas
    const loadData = async () => {
      const prefsRepo = new PreferencesRepository(db);
      const statsRepo = new StatsRepository(db);
      
      const prefs = await prefsRepo.getPreferences();
      if (prefs && prefs.user_name) {
        setUserName(prefs.user_name);
      } else {
        setShowOnboarding(true);
      }

      const dates = await statsRepo.getConsistencyDates();
      setConsistencyDates(dates);
    };
    
    loadData();
  }, [db]);

  const handleSaveName = async () => {
    if (!tempName.trim()) return;
    const finalName = tempName.trim();
    setUserName(finalName);
    setShowOnboarding(false);
    
    try {
      const repo = new PreferencesRepository(db);
      await repo.setPreference('user_name', finalName);
    } catch (e) {
      console.error(e);
    }
  };

  const MENU_ITEMS = [
    { id: 'coach', title: 'IA Coach', icon: 'sparkles', color: '#8b5cf6', href: '/coach' },
    { id: 'running', title: 'Fuerza Running', icon: 'walk', color: '#f43f5e', href: '/running' },
    { id: 'exercises', title: 'Ejercicios', icon: 'barbell', color: '#10b981', href: '/exercises' },
    { id: 'templates', title: 'Mis Rutinas', icon: 'list', color: '#6366f1', href: '/templates' },
    { id: 'history', title: 'Historial', icon: 'time', color: '#f59e0b', href: '/history' },
    { id: 'stats', title: 'Estadísticas', icon: 'stats-chart', color: '#ec4899', href: '/stats' },
    { id: 'body', title: 'Peso Corporal', icon: 'body', color: '#0ea5e9', href: '/body' },
    { id: 'goals', title: 'Objetivos', icon: 'flag', color: '#eab308', href: '/goals' },
    { id: 'backup', title: 'Copias de Seg.', icon: 'cloud-download', color: '#3b82f6', href: '/backup' },
    { id: 'settings', title: 'Ajustes', icon: 'settings', color: '#64748b', href: '/settings' },
  ];

  const commitData = consistencyDates.map(dateStr => ({
    date: dateStr.split('T')[0], // Ensure just YYYY-MM-DD
    count: 1
  }));

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {userName || 'Atleta'} 👋</Text>
          <Text style={styles.subtitle}>¿Qué vamos a entrenar hoy?</Text>
          <View style={styles.quoteBox}>
            <Ionicons name="flame" size={16} color={theme.colors.primary} />
            <Text style={styles.quoteText}>"{dailyQuote}"</Text>
          </View>
        </View>

        <Pressable style={styles.startHeroCard} onPress={() => router.push('/history')}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Empezar Entrenamiento</Text>
            <Text style={styles.heroSub}>Inicia una sesión libre o usa una rutina</Text>
          </View>
          <Ionicons name="play-circle" size={48} color="white" />
        </Pressable>

        {commitData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Tu Constancia</Text>
            <View style={styles.chartWrapper}>
              <ContributionGraph
                values={commitData}
                endDate={new Date()}
                numDays={105}
                width={screenWidth - 80}
                height={220}
                chartConfig={{
                  backgroundColor: theme.colors.card,
                  backgroundGradientFrom: theme.colors.card,
                  backgroundGradientTo: theme.colors.card,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  labelColor: (opacity = 1) => theme.colors.textSecondary,
                  strokeWidth: 2,
                }}
                tooltipDataAttrs={() => ({})}
              />
            </View>
          </View>
        )}

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

      {/* ONBOARDING MODAL */}
      <Modal visible={showOnboarding} animationType="slide" transparent={false}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="fitness" size={64} color={theme.colors.primary} />
              <Text style={styles.modalTitle}>¡Bienvenido a Gym Tracker!</Text>
              <Text style={styles.modalDesc}>La app definitiva para llevar tu fuerza al siguiente nivel. ¿Cómo te llamas?</Text>
            </View>
            
            <TextInput
              style={styles.nameInput}
              placeholder="Escribe tu nombre..."
              placeholderTextColor={theme.colors.textSecondary}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
              maxLength={20}
              onSubmitEditing={handleSaveName}
            />
            
            <Pressable style={[styles.saveBtn, !tempName.trim() && styles.saveBtnDisabled]} onPress={handleSaveName} disabled={!tempName.trim()}>
              <Text style={styles.saveBtnText}>Comenzar mi Viaje</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 30 },
  greeting: { color: theme.colors.textSecondary, fontSize: 18, marginBottom: 4 },
  subtitle: { color: theme.colors.text, fontSize: 26, fontWeight: 'bold' },
  quoteBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 12, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.sm, borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  quoteText: { color: theme.colors.textSecondary, fontStyle: 'italic', fontSize: 13, marginLeft: 8, flex: 1 },
  
  startHeroCard: { backgroundColor: theme.colors.primary, borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, elevation: 4, shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
  heroContent: { flex: 1 },
  heroTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  heroSub: { color: '#ecfdf5', fontSize: 14 },

  chartContainer: { marginBottom: 32 },
  chartWrapper: { backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2 },

  sectionTitle: { color: theme.colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: theme.colors.card, width: '48%', padding: 20, borderRadius: 16, marginBottom: 16, alignItems: 'center', elevation: 2 },
  iconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold', textAlign: 'center' },

  // Modal Styles
  modalBg: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center' },
  modalContent: { padding: 32, alignItems: 'center' },
  modalHeader: { alignItems: 'center', marginBottom: 40 },
  modalTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text, marginTop: 24, textAlign: 'center' },
  modalDesc: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 24 },
  nameInput: { width: '100%', backgroundColor: theme.colors.surface, color: theme.colors.text, fontSize: 20, padding: 20, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, textAlign: 'center', marginBottom: 24 },
  saveBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: theme.borderRadius.md, width: '100%', gap: 12, elevation: 2 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
