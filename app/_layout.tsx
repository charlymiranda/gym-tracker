import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { runMigrations } from '../src/database/migrations';
import { runInitialSeed } from '../src/database/seed';
import { type SQLiteDatabase } from 'expo-sqlite';

async function initializeDatabase(db: SQLiteDatabase) {
  try {
    await runMigrations(db);
    await runInitialSeed(db);
  } catch (e) {
    console.error('Database initialization failed:', e);
  }
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="gymtracker.db" onInit={initializeDatabase} useSuspense>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1E1E1E' },
          headerTintColor: '#F9FAFB',
          contentStyle: { backgroundColor: '#121212' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Dashboard', headerShown: false }} />
        <Stack.Screen name="exercises/index" options={{ title: 'Ejercicios' }} />
        <Stack.Screen name="exercises/new" options={{ title: 'Nuevo Ejercicio', presentation: 'modal' }} />
        <Stack.Screen name="exercises/[id]" options={{ title: 'Detalles' }} />
        <Stack.Screen name="templates/index" options={{ title: 'Rutinas' }} />
        <Stack.Screen name="templates/new" options={{ title: 'Nueva Rutina', presentation: 'modal' }} />
        <Stack.Screen name="templates/[id]" options={{ title: 'Rutina' }} />
        <Stack.Screen name="sessions/[id]" options={{ title: 'Entrenamiento' }} />
        <Stack.Screen name="history/index" options={{ title: 'Historial' }} />
        <Stack.Screen name="stats/index" options={{ title: 'Estadísticas' }} />
        <Stack.Screen name="body/index" options={{ title: 'Peso Corporal' }} />
        <Stack.Screen name="body/new" options={{ title: 'Registrar Peso', presentation: 'modal' }} />
        <Stack.Screen name="goals/index" options={{ title: 'Objetivos' }} />
        <Stack.Screen name="backup/index" options={{ title: 'Copias de Seguridad' }} />
        <Stack.Screen name="settings/index" options={{ title: 'Ajustes' }} />
      </Stack>
    </SQLiteProvider>
  );
}
