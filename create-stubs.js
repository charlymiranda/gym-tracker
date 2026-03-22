const fs = require('fs');
const path = require('path');

const screens = [
  'app/index.tsx',
  'app/exercises/index.tsx',
  'app/exercises/new.tsx',
  'app/exercises/[id].tsx',
  'app/templates/index.tsx',
  'app/templates/new.tsx',
  'app/templates/[id].tsx',
  'app/sessions/[id].tsx',
  'app/history/index.tsx',
  'app/history/[id].tsx',
  'app/progress/[exerciseId].tsx',
  'app/stats/index.tsx',
  'app/goals/index.tsx',
  'app/goals/new.tsx',
  'app/body/index.tsx',
  'app/body/new.tsx',
  'app/settings/index.tsx',
  'app/backup/index.tsx'
];

screens.forEach(file => {
  const p = path.join(__dirname, file);
  const name = path.basename(file, '.tsx').replace(/\[|\]/g, '');
  const dir = path.basename(path.dirname(file));
  
  if (!fs.existsSync(p)) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    
    const content = `import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Screen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>${dir === 'app' ? 'Home' : dir}</Text>
      <Text>Stub for ${file}</Text>
    </View>
  );
}
`;
    
    fs.writeFileSync(p, content);
  }
});

const homeContent = `import { View, Text, StyleSheet } from 'react-native';
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
`;

fs.writeFileSync(path.join(__dirname, 'app/index.tsx'), homeContent);
