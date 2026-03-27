import { View, Text, StyleSheet, Pressable, Vibration } from 'react-native';
import { useWorkoutStore } from '../store/workout-store';
import { useEffect, useState } from 'react';
import { useTheme } from '../themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function RestTimer() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { restTimerEndTimestamp, clearRestTimer } = useWorkoutStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!restTimerEndTimestamp) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.ceil((restTimerEndTimestamp - Date.now()) / 1000);
      
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        Vibration.vibrate([1000, 500, 1000]); // Vibrate when done!
        setTimeout(clearRestTimer, 3000); // Auto-hide after 3s
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimerEndTimestamp, clearRestTimer]);

  if (!restTimerEndTimestamp || timeLeft === null) return null;

  const mins = Math.floor(Math.max(0, timeLeft) / 60);
  const secs = Math.max(0, timeLeft) % 60;
  const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.timerBox}>
        <Ionicons name="timer-outline" size={24} color={timeLeft === 0 ? theme.colors.danger : theme.colors.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.label}>{timeLeft === 0 ? '¡Tiempo de Descanso Terminado!' : 'Descanso'}</Text>
          <Text style={[styles.time, timeLeft === 0 && { color: theme.colors.danger }]}>{formatted}</Text>
        </View>
        <Pressable onPress={clearRestTimer} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  timerBox: {
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.round,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 250,
  },
  textContainer: { flex: 1, marginLeft: 12 },
  label: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  time: { color: theme.colors.text, fontSize: 20, fontWeight: 'bold' },
  closeBtn: { padding: 4 }
});
