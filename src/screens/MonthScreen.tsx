import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { MonthChips } from '@/components/MonthChips';
import { SurfaceCard } from '@/components/SurfaceCard';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';
import { monthSummary } from '@/utils/calculations';
import { dayShort, getDaysInMonth, monthLabel } from '@/utils/date';

export const MonthScreen = () => {
  const theme = useAppTheme();
  const { settings, habits, entries, selectedMonth, setSelectedMonth, toggleEntry } = useHabitStore();
  const summary = monthSummary(settings, habits, entries, selectedMonth);
  const days = getDaysInMonth(settings.year, selectedMonth);
  const activeHabits = habits.filter((h) => h.active);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{monthLabel(selectedMonth)} Habit Grid</Text>
      <MonthChips selectedMonth={selectedMonth} onSelect={setSelectedMonth} />

      <SurfaceCard>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <View style={[styles.habitCell, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.headerText, { color: theme.colors.textPrimary }]}>Habit</Text>
              </View>
              {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                <View key={`h-${d}`} style={[styles.dayCell, { backgroundColor: theme.colors.card }]}> 
                  <Text style={[styles.headerText, { color: theme.colors.textPrimary }]}>{d}</Text>
                  <Text style={[styles.small, { color: theme.colors.textSecondary }]}>{dayShort(settings.year, selectedMonth, d)}</Text>
                </View>
              ))}
            </View>

            {activeHabits.map((habit) => (
              <View key={habit.id} style={styles.gridRow}>
                <View style={[styles.habitCell, { borderColor: theme.colors.border }]}> 
                  <Text style={[styles.habitName, { color: theme.colors.textPrimary }]}>{habit.name}</Text>
                  <Text style={[styles.small, { color: theme.colors.textSecondary }]}>{habit.type}</Text>
                </View>
                {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                  const value = entries.find((e) => e.habitId === habit.id && e.dateKey === `${settings.year}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`)?.value ?? 0;
                  return (
                    <Pressable
                      key={`${habit.id}-${day}`}
                      onPress={() => toggleEntry(habit.id, selectedMonth, day)}
                      style={[
                        styles.dayCell,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor: value ? theme.colors.accentSoft : theme.colors.surface,
                        },
                      ]}
                    >
                      <Text style={{ color: value ? theme.colors.accent : theme.colors.textSecondary, fontWeight: '800' }}>{value}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Monthly Rollup</Text>
        <Text style={[styles.rollupText, { color: theme.colors.textSecondary }]}>Good done: {summary.goodDone}</Text>
        <Text style={[styles.rollupText, { color: theme.colors.textSecondary }]}>Bad happened: {summary.badHappened}</Text>
        <Text style={[styles.rollupText, { color: theme.colors.textSecondary }]}>Net score: {summary.netScore}</Text>
        <Text style={[styles.rollupText, { color: theme.colors.textSecondary }]}>Avg completion: {Math.round(summary.avgCompletionGood * 100)}%</Text>
      </SurfaceCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
  },
  gridRow: {
    flexDirection: 'row',
  },
  habitCell: {
    width: 164,
    minHeight: 54,
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  dayCell: {
    width: 48,
    minHeight: 54,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '800',
  },
  habitName: {
    fontSize: 12,
    fontWeight: '700',
  },
  small: {
    fontSize: 10,
    fontWeight: '600',
  },
  rollupText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
});
