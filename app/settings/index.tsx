import { View, Text, StyleSheet, Switch, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { PreferencesRepository } from '../../src/repositories/extra-repositories';
import { useTheme } from '../../src/themes/ThemeContext';
import type { ThemeMode } from '../../src/themes/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const styles = getStyles(theme);
  const db = useSQLiteContext();
  const [useLbs, setUseLbs] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState(false);

  useEffect(() => {
    const repo = new PreferencesRepository(db);
    repo.getPreferences().then((prefs: any) => {
      setUseLbs(prefs?.preferred_weight_unit === 'lbs');
      if (prefs?.gemini_api_key) {
        setApiKey(prefs.gemini_api_key);
        setSavedKey(true);
      }
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

  const handleSaveApiKey = async () => {
    try {
      const repo = new PreferencesRepository(db);
      await repo.setPreference('gemini_api_key', apiKey.trim());
      setSavedKey(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView>
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

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Inteligencia Artificial (Coach)</Text>
        <View style={[styles.settingRow, { flexDirection: 'column', alignItems: 'stretch' }]}>
          <Text style={styles.settingLabel}>Google Gemini API Key</Text>
          <Text style={styles.settingDesc}>
            Para habilitar el Coach de IA gratuito, pega tu API Key generada desde Google AI Studio.
          </Text>
          <View style={styles.apiInputContainer}>
            <Ionicons name="key-outline" size={20} color={theme.colors.textSecondary} />
            <TextInput 
              style={styles.apiInput}
              placeholder="AIzaSyA..."
              placeholderTextColor={theme.colors.border}
              value={apiKey}
              onChangeText={(text) => { setApiKey(text); setSavedKey(false); }}
              secureTextEntry
            />
          </View>
          <Pressable 
            style={[styles.saveApiBtn, savedKey && styles.saveApiBtnSuccess]} 
            onPress={handleSaveApiKey}
          >
            <Text style={styles.saveApiBtnText}>{savedKey ? 'Clave Guardada' : 'Guardar Clave API'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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

  apiInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, paddingHorizontal: 12, marginTop: 16, marginBottom: 12 },
  apiInput: { flex: 1, padding: 12, fontSize: 16, color: theme.colors.text },
  saveApiBtn: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  saveApiBtnSuccess: { backgroundColor: theme.colors.badgeBg },
  saveApiBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
