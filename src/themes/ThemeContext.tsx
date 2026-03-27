import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { PreferencesRepository } from '../repositories/extra-repositories';
import { useSQLiteContext } from 'expo-sqlite';
import { lightTheme, darkTheme, Theme } from './theme-data';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  themeMode: 'system',
  setThemeMode: async () => {},
  isDark: true,
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const repo = new PreferencesRepository(db);
        const prefs = await repo.getPreferences();
        if (prefs && prefs.theme) {
          setThemeModeState(prefs.theme as ThemeMode);
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, [db]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      const repo = new PreferencesRepository(db);
      await repo.setPreference('theme', mode);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const contextValue = useMemo(() => ({
    theme,
    themeMode,
    setThemeMode,
    isDark
  }), [theme, themeMode, isDark]);

  if (!isReady) return null;

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
