import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const winningDays = summary.daily.filter((day) => day.net > 0).length;
  const perfectDays = summary.daily.filter((day) => day.badHappened === 0 && day.goodCompletion === 1).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{monthLabel(selectedMonth)} Daily Arena</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Clear your habit quests one day at a time.</Text>
      <MonthChips selectedMonth={selectedMonth} onSelect={setSelectedMonth} />

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="flame" size={18} color={theme.colors.warning} />
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{winningDays}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Winning Days</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.cardSecondary, borderColor: theme.colors.border }]}>
          <Ionicons name="sparkles" size={18} color={theme.colors.success} />
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{perfectDays}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Perfect Days</Text>
        </View>
      </View>

      <SurfaceCard>
        <View style={styles.gridHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Quest Grid</Text>
          <Text style={[styles.gridHint, { color: theme.colors.textSecondary }]}>Tap cells to score the day</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <View style={[styles.habitCell, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.headerText, { color: theme.colors.textPrimary }]}>Quest</Text>
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
                  <Text
                    style={[
                      styles.small,
                      {
                        color: habit.type === 'Good' ? theme.colors.success : theme.colors.danger,
                      },
                    ]}
                  >
                    {habit.type === 'Good' ? `+${settings.goodPoints} boost` : `${settings.badPenalty} trap`}
                  </Text>
                </View>
                {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                  const value = entries.find((e) => e.habitId === habit.id && e.dateKey === `${settings.year}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`)?.value ?? 0;
                  const activeColor = habit.type === 'Good' ? theme.colors.success : theme.colors.danger;
                  const idleBg = habit.type === 'Good' ? theme.colors.surface : theme.colors.cardSecondary;
                  return (
                    <Pressable
                      key={`${habit.id}-${day}`}
                      onPress={() => toggleEntry(habit.id, selectedMonth, day)}
                      style={[
                        styles.dayCell,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor: value ? activeColor : idleBg,
                        },
                      ]}
                    >
                      <Ionicons
                        name={value ? (habit.type === 'Good' ? 'checkmark' : 'close') : 'add'}
                        size={16}
                        color={value ? '#FFFFFF' : theme.colors.textSecondary}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Mission Debrief</Text>
        <Text style={[styles.rollupText, { color: theme.colors.textSecondary }]}>Boosts collected: {summary.goodDone}</Text>
        <Text style={[styles.rollupText, { color: theme.colors.textSecondary }]}>Traps triggered: {summary.badHappened}</Text>
        <Text style={[styles.rollupText, { color: summary.netScore >= 0 ? theme.colors.success : theme.colors.danger }]}>
          Net score: {summary.netScore}
        </Text>
        <Text style={[styles.rollupText, { color: theme.colors.textSecondary }]}>Quest completion: {Math.round(summary.avgCompletionGood * 100)}%</Text>
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
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: -4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridHint: {
    fontSize: 12,
    fontWeight: '700',
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
    lineHeight: 20,
  },
});
