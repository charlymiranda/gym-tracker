import { View, Text, StyleSheet, Switch } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { PreferencesRepository } from '../../src/repositories/extra-repositories';
import { theme } from '../../src/themes/colors';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [useLbs, setUseLbs] = useState(false);

  useEffect(() => {
    const repo = new PreferencesRepository(db);
    repo.getPreferences().then((prefs: any) => {
      setUseLbs(prefs?.weight_unit === 'lbs');
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

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Preferencias de Visualización</Text>
      
      <View style={styles.settingRow}>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 16, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.card, padding: 16, borderRadius: theme.borderRadius.md, elevation: 1 },
  settingLabel: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  settingDesc: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 }
});
