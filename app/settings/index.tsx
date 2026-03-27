import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { PreferencesRepository } from '../../src/repositories/extra-repositories';
import { useTheme } from '../../src/themes/ThemeContext';
import type { ThemeMode } from '../../src/themes/ThemeContext';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const styles = getStyles(theme);
  const db = useSQLiteContext();
  const [useLbs, setUseLbs] = useState(false);

  useEffect(() => {
    const repo = new PreferencesRepository(db);
    repo.getPreferences().then((prefs: any) => {
      setUseLbs(prefs?.preferred_weight_unit === 'lbs');
    }).catch(console.error);
  }, [db]);

  const toggleUnit = async (val: boolean) => {
    setUseLbs(val);
    try {
      const repo = new PreferencesRepository(db);
      await repo.setPreference('preferred_weight_unit', val ? 'lbs' : 'kg');
    } catch (e) {
      console.error(e);
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Preferencias de Visualización</Text>
      
      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Tema de la Aplicación</Text>
          <Text style={styles.settingDesc}>
            {themeMode === 'system' ? 'Automático (Sistema)' : themeMode === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
          </Text>
        </View>
        <View style={styles.themeGroup}>
          <Pressable style={[styles.themeBtn, themeMode === 'light' && styles.themeBtnActive]} onPress={() => handleThemeChange('light')}>
            <Text style={[styles.themeBtnText, themeMode === 'light' && styles.themeBtnTextActive]}>Claro</Text>
          </Pressable>
          <Pressable style={[styles.themeBtn, themeMode === 'dark' && styles.themeBtnActive]} onPress={() => handleThemeChange('dark')}>
            <Text style={[styles.themeBtnText, themeMode === 'dark' && styles.themeBtnTextActive]}>Oscuro</Text>
          </Pressable>
          <Pressable style={[styles.themeBtn, themeMode === 'system' && styles.themeBtnActive]} onPress={() => handleThemeChange('system')}>
            <Text style={[styles.themeBtnText, themeMode === 'system' && styles.themeBtnTextActive]}>Auto</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.settingRow, { marginTop: 12 }]}>
        <View>
          <Text style={styles.settingLabel}>Unidad de Peso</Text>
          <Text style={styles.settingDesc}>
            {useLbs ? 'Usando Libras (lbs)' : 'Usando Kilogramos (kg)'}
          </Text>
        </View>
        <Switch 
          value={useLbs} 
          onValueChange={toggleUnit} 
          thumbColor={useLbs ? theme.colors.primary : '#f4f3f4'} 
          trackColor={{ false: theme.colors.border, true: theme.colors.primaryDark }}
        />
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 16, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.card, padding: 16, borderRadius: theme.borderRadius.md, elevation: 1 },
  settingLabel: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  settingDesc: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  
  themeGroup: { flexDirection: 'row', backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm, padding: 4 },
  themeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.sm },
  themeBtnActive: { backgroundColor: theme.colors.surface, elevation: 1 },
  themeBtnText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: 'bold' },
  themeBtnTextActive: { color: theme.colors.primary },
});
