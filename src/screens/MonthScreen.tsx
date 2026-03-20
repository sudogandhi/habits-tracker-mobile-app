import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MonthChips } from '@/components/MonthChips';
import { SurfaceCard } from '@/components/SurfaceCard';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';
import { monthSummary } from '@/utils/calculations';
import { monthLabel } from '@/utils/date';

export const MonthScreen = () => {
  const theme = useAppTheme();
  const { settings, profile, habits, entries, selectedMonth, setSelectedMonth } = useHabitStore();
  const today = new Date();
  const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const summary = monthSummary(settings, habits, entries, selectedMonth, profile.onboardedAt, todayDateKey);
  const winningDays = summary.daily.filter((day) => day.net > 0).length;
  const perfectDays = summary.daily.filter((day) => day.badHappened === 0 && day.goodCompletion === 1).length;
  const maxAbsNet = Math.max(1, ...summary.daily.map((day) => Math.abs(day.net)));
  const goodShare = summary.goodDone + summary.badHappened === 0 ? 0 : summary.goodDone / (summary.goodDone + summary.badHappened);
  const completionPeak = Math.max(0.01, ...summary.daily.map((day) => day.goodCompletion ?? 0));

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
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Daily Net Momentum</Text>
          <Text style={[styles.cardHint, { color: theme.colors.textSecondary }]}>How each day scored</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
          <View style={styles.netChartRow}>
            {summary.daily.map((day) => {
              const barHeight = Math.max(12, Math.round((Math.abs(day.net) / maxAbsNet) * 100));
              const positive = day.net >= 0;

              return (
                <View key={day.day} style={styles.netBarWrap}>
                  <View style={styles.netBarTrack}>
                    <View
                      style={[
                        styles.netBar,
                        {
                          height: barHeight,
                          backgroundColor: positive ? theme.colors.chartPositive : theme.colors.chartNegative,
                          alignSelf: positive ? 'flex-end' : 'flex-start',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.netBarLabel, { color: theme.colors.textSecondary }]}>{day.day}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Completion Trend</Text>
          <Text style={[styles.cardHint, { color: theme.colors.textSecondary }]}>Good-habit follow-through</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
          <View style={styles.completionRow}>
            {summary.daily.map((day) => {
              const completion = day.goodCompletion ?? 0;
              const height = Math.max(8, Math.round((completion / completionPeak) * 92));

              return (
                <View key={day.day} style={styles.completionBarWrap}>
                  <View style={[styles.completionBarTrack, { backgroundColor: theme.colors.card }]}>
                    <View style={[styles.completionBar, { height, backgroundColor: theme.colors.accent }]} />
                  </View>
                  <Text style={[styles.netBarLabel, { color: theme.colors.textSecondary }]}>{day.day}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SurfaceCard>

      <SurfaceCard>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Good vs Bad Mix</Text>
          <Text style={[styles.cardHint, { color: theme.colors.textSecondary }]}>Monthly action split</Text>
        </View>
        <View style={[styles.mixTrack, { backgroundColor: theme.colors.cardSecondary }]}>
          <View style={[styles.mixGood, { width: `${goodShare * 100}%`, backgroundColor: theme.colors.success }]} />
        </View>
        <View style={styles.mixLegendRow}>
          <View style={styles.mixLegendItem}>
            <View style={[styles.mixDot, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.mixLegendText, { color: theme.colors.textSecondary }]}>Good {summary.goodDone}</Text>
          </View>
          <View style={styles.mixLegendItem}>
            <View style={[styles.mixDot, { backgroundColor: theme.colors.danger }]} />
            <Text style={[styles.mixLegendText, { color: theme.colors.textSecondary }]}>Bad {summary.badHappened}</Text>
          </View>
        </View>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  cardHint: {
    fontSize: 12,
    fontWeight: '700',
  },
  chartScroll: {
    paddingVertical: 4,
  },
  netChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  netBarWrap: {
    alignItems: 'center',
    gap: 6,
  },
  netBarTrack: {
    width: 16,
    height: 110,
    justifyContent: 'center',
  },
  netBar: {
    width: '100%',
    borderRadius: 999,
  },
  netBarLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  completionBarWrap: {
    alignItems: 'center',
    gap: 6,
  },
  completionBarTrack: {
    width: 14,
    height: 100,
    borderRadius: 999,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  completionBar: {
    width: '100%',
    borderRadius: 999,
  },
  mixTrack: {
    height: 16,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mixGood: {
    height: '100%',
    borderRadius: 999,
  },
  mixLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  mixLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mixDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  mixLegendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rollupText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
});
