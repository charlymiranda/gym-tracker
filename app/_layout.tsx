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
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Gym Tracker' }} />
        <Stack.Screen name="exercises/index" options={{ title: 'Exercises' }} />
        <Stack.Screen name="exercises/new" options={{ title: 'New Exercise', presentation: 'modal' }} />
        <Stack.Screen name="exercises/[id]" options={{ title: 'Exercise Detail' }} />
        <Stack.Screen name="templates/index" options={{ title: 'Routines' }} />
        <Stack.Screen name="sessions/[id]" options={{ title: 'Active Session' }} />
        <Stack.Screen name="history/index" options={{ title: 'History' }} />
      </Stack>
    </SQLiteProvider>
  );
}
