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
  const name = path.basename(file, '.tsx').replace(/\\[|\\]/g, '');
  const dir = path.basename(path.dirname(file));
  
  if (!fs.existsSync(p)) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    
    const content = "import { View, Text } from 'react-native';\\n" +
                    "import { Link } from 'expo-router';\\n" +
                    "\\n" +
                    "export default function Screen() {\\n" +
                    "  return (\\n" +
                    "    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>\\n" +
                    "      <Text style={{ fontSize: 24, marginBottom: 20 }}>" + (dir === 'app' ? 'Home' : dir) + "</Text>\\n" +
                    "      <Text>Stub for " + file + "</Text>\\n" +
                    "    </View>\\n" +
                    "  );\\n" +
                    "}\\n";
    
    fs.writeFileSync(p, content);
  }
});

const homeContent = "import { View, Text, StyleSheet } from 'react-native';\\n" +
                    "import { Link } from 'expo-router';\\n" +
                    "\\n" +
                    "export default function Home() {\\n" +
                    "  return (\\n" +
                    "    <View style={styles.container}>\\n" +
                    "      <Text style={styles.title}>Gym Tracker</Text>\\n" +
                    "      <Link href=\\"/exercises\\" style={styles.link}>Ejercicios</Link>\\n" +
                    "      <Link href=\\"/templates\\" style={styles.link}>Rutinas</Link>\\n" +
                    "      <Link href=\\"/history\\" style={styles.link}>Historial</Link>\\n" +
                    "      <Link href=\\"/stats\\" style={styles.link}>Estadísticas</Link>\\n" +
                    "    </View>\\n" +
                    "  );\\n" +
                    "}\\n" +
                    "\\n" +
                    "const styles = StyleSheet.create({\\n" +
                    "  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },\\n" +
                    "  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40 },\\n" +
                    "  link: { fontSize: 18, color: '#007AFF', marginVertical: 10 }\\n" +
                    "});\\n";

fs.writeFileSync(path.join(__dirname, 'app/index.tsx'), homeContent);
