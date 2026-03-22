import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gym Tracker</Text>
      <Link href="/exercises" style={styles.link}>Ejercicios</Link>
      <Link href="/templates" style={styles.link}>Rutinas</Link>
      <Link href="/history" style={styles.link}>Historial</Link>
      <Link href="/stats" style={styles.link}>Estadísticas</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40 },
  link: { fontSize: 18, color: '#007AFF', marginVertical: 10 }
});
