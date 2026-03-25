import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function BackupScreen() {
  
  const exportDatabase = async () => {
    try {
      // The sqlite database is stored in the documents directory under 'SQLite'
      const dbDir = ((FileSystem as any).documentDirectory || '') + 'SQLite/';
      const dbPath = dbDir + 'gymtracker.db';
      
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      if (!fileInfo.exists) {
        Alert.alert('Error', 'No se encontró la base de datos local.');
        return;
      }

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo.');
        return;
      }

      await Sharing.shareAsync(dbPath, {
        mimeType: 'application/x-sqlite3',
        dialogTitle: 'Exportar Base de Datos GymTracker',
        UTI: 'public.database'
      });
      
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error al exportar.');
    }
  };

  const importDatabase = () => {
    Alert.alert('Próximamente', 'La importación de bases de datos se habilitará en la versión final.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Copias de Seguridad</Text>
      
      <View style={styles.card}>
        <Text style={styles.description}>
          Gym Tracker es una aplicación "Offline-First". TUS datos viven en TU teléfono. 
          Genera copias de seguridad de tu base de datos y guárdalas en Google Drive o envíatelas por email para no perder nunca tu historial.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button title="Exportar Datos (.db)" onPress={exportDatabase} color="#10b981" />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Importar Datos" onPress={importDatabase} color="#6366f1" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, elevation: 1 },
  description: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 24 },
  buttonContainer: { marginBottom: 16 }
});
