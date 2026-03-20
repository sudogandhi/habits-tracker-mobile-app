import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SurfaceCard } from '@/components/SurfaceCard';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';

export const HabitsScreen = () => {
  const theme = useAppTheme();
  const { settings, habits, upsertHabit } = useHabitStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Habits Setup</Text>

      {habits.length === 0 ? (
        <SurfaceCard>
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No habits configured</Text>
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            Complete onboarding to create habits for daily tracking.
          </Text>
        </SurfaceCard>
      ) : null}

      {habits.map((habit) => {
        const score = habit.type === 'Good' ? `+${settings.goodPoints}` : `${settings.badPenalty}`;

        return (
          <SurfaceCard key={habit.id}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{habit.name}</Text>
                <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
                  {habit.type} • {score} • {habit.category}
                </Text>
              </View>
              <Switch
                value={habit.active}
                onValueChange={(active) => upsertHabit({ ...habit, active })}
                trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
              />
            </View>
          </SurfaceCard>
        );
      })}
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
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
});
