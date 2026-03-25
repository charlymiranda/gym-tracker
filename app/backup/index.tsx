import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { theme } from '../../src/themes/colors';
import { Ionicons } from '@expo/vector-icons';

export default function BackupScreen() {
  const exportDb = async () => {
    try {
      // @ts-ignore
      if (!FileSystem.documentDirectory) throw new Error("FileSystem root not found");
      // @ts-ignore
      const dbPath = FileSystem.documentDirectory + "SQLite/gymtracker.db";
      // @ts-ignore
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      
      if (!fileInfo.exists) {
        Alert.alert("Error", "No se encontró la base de datos.");
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dbPath, { mimeType: 'application/x-sqlite3', dialogTitle: 'Exportar Base de Datos' });
      } else {
        Alert.alert("Error", "Compartir no está disponible en este dispositivo.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error exportando", String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Copias de Seguridad</Text>
      <Text style={styles.desc}>
        Tus datos se guardan estrictamente de manera local en tu dispositivo (offline-first).
        Puedes exportar la base de datos completa para crear una copia de seguridad o transferir tus datos.
      </Text>
      
      <Pressable style={styles.exportBtn} onPress={exportDb}>
        <Ionicons name="cloud-download-outline" size={24} color="white" />
        <Text style={styles.exportBtnText}> Exportar Base de Datos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 },
  desc: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: 32, lineHeight: 24 },
  exportBtn: { flexDirection: 'row', backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  exportBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
