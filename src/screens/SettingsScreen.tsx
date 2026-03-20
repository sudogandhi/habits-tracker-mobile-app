import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SurfaceCard } from '@/components/SurfaceCard';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';

export const SettingsScreen = () => {
  const theme = useAppTheme();
  const { settings, profile, setThemeMode } = useHabitStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Settings</Text>

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Profile</Text>
        <Text style={[styles.item, { color: theme.colors.textSecondary }]}>Name: {profile.name || 'Not set'}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Theme</Text>
        <View style={styles.themeRow}>
          <Pressable
            onPress={() => setThemeMode('light')}
            style={[
              styles.modeBtn,
              { backgroundColor: settings.themeMode === 'light' ? theme.colors.accent : theme.colors.card },
            ]}
          >
            <Text style={{ color: settings.themeMode === 'light' ? '#FFFFFF' : theme.colors.textPrimary, fontWeight: '800' }}>Light</Text>
          </Pressable>
          <Pressable
            onPress={() => setThemeMode('dark')}
            style={[
              styles.modeBtn,
              { backgroundColor: settings.themeMode === 'dark' ? theme.colors.accent : theme.colors.card },
            ]}
          >
            <Text style={{ color: settings.themeMode === 'dark' ? '#FFFFFF' : theme.colors.textPrimary, fontWeight: '800' }}>Dark</Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Scoring</Text>
        <Text style={[styles.item, { color: theme.colors.textSecondary }]}>Year: {settings.year}</Text>
        <Text style={[styles.item, { color: theme.colors.textSecondary }]}>Good habit points: {settings.goodPoints}</Text>
        <Text style={[styles.item, { color: theme.colors.textSecondary }]}>Bad habit penalty: {settings.badPenalty}</Text>
        <Text style={[styles.item, { color: theme.colors.textSecondary }]}>Bad habit avoid reward: +{settings.badAvoidReward}</Text>
      </SurfaceCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  item: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
});
