import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MetricCard } from '@/components/MetricCard';
import { MonthChips } from '@/components/MonthChips';
import { SurfaceCard } from '@/components/SurfaceCard';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';
import { yearlySummaries } from '@/utils/calculations';
import { monthLabel } from '@/utils/date';

export const DashboardScreen = () => {
  const theme = useAppTheme();
  const { settings, habits, entries, selectedMonth, setSelectedMonth } = useHabitStore();
  const months = yearlySummaries(settings, habits, entries);

  const ytd = months.reduce(
    (acc, m) => ({
      good: acc.good + m.goodDone,
      bad: acc.bad + m.badHappened,
      net: acc.net + m.netScore,
    }),
    { good: 0, bad: 0, net: 0 },
  );

  const maxAbsNet = Math.max(1, ...months.map((m) => Math.abs(m.netScore)));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Habit Pulse</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Track momentum, not just streaks</Text>

      <View style={styles.metricsGrid}>
        <MetricCard label="YTD Net Score" value={`${ytd.net}`} hint="Good points minus bad penalties" />
        <MetricCard label="Good Done" value={`${ytd.good}`} hint="Total positive check-ins" />
        <MetricCard label="Bad Happened" value={`${ytd.bad}`} hint="Penalty-triggering events" />
      </View>

      <MonthChips selectedMonth={selectedMonth} onSelect={setSelectedMonth} />

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Monthly Net Score</Text>
        <View style={styles.chartRow}>
          {months.map((m) => {
            const h = Math.max(8, Math.round((Math.abs(m.netScore) / maxAbsNet) * 120));
            const positive = m.netScore >= 0;
            return (
              <View key={m.month} style={styles.barWrap}>
                <View
                  style={{
                    width: 14,
                    height: h,
                    borderRadius: 8,
                    backgroundColor: positive ? theme.colors.chartPositive : theme.colors.chartNegative,
                  }}
                />
                <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>{monthLabel(m.month)}</Text>
              </View>
            );
          })}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Month Summary</Text>
        {months.map((m) => (
          <View key={m.month} style={[styles.row, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.cellMonth, { color: theme.colors.textPrimary }]}>{monthLabel(m.month)}</Text>
            <Text style={[styles.cell, { color: theme.colors.textSecondary }]}>G {m.goodDone}</Text>
            <Text style={[styles.cell, { color: theme.colors.textSecondary }]}>B {m.badHappened}</Text>
            <Text style={[styles.cell, { color: theme.colors.textSecondary }]}>N {m.netScore}</Text>
            <Text style={[styles.cell, { color: theme.colors.textSecondary }]}>{Math.round(m.avgCompletionGood * 100)}%</Text>
          </View>
        ))}
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
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricsGrid: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  chartRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  barWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cellMonth: {
    width: 44,
    fontWeight: '700',
  },
  cell: {
    width: 62,
    fontWeight: '600',
  },
});
