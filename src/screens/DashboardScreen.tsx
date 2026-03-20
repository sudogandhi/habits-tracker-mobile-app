import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MetricCard } from '@/components/MetricCard';
import { MonthChips } from '@/components/MonthChips';
import { SurfaceCard } from '@/components/SurfaceCard';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';
import { yearlySummaries } from '@/utils/calculations';
import { monthLabel } from '@/utils/date';

export const DashboardScreen = () => {
  const theme = useAppTheme();
  const { settings, profile, habits, entries, selectedMonth, setSelectedMonth } = useHabitStore();
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
  const currentMonth = months.find((m) => m.month === selectedMonth);
  const level = Math.max(1, Math.floor(Math.max(0, ytd.net) / 12) + 1);
  const xpIntoLevel = Math.max(0, ytd.net) % 12;
  const activeHabits = habits.filter((habit) => habit.active);
  const questCompletion = activeHabits.length === 0 ? 0 : Math.round(((currentMonth?.avgCompletionGood ?? 0) * 100));
  const monthlyWins = months.filter((month) => month.netScore > 0).length;
  const badges = [
    {
      icon: 'trophy',
      label: `${monthlyWins} winning months`,
      tint: theme.colors.warning,
    },
    {
      icon: 'flame',
      label: `${currentMonth?.goodDone ?? 0} positive moves`,
      tint: theme.colors.success,
    },
    {
      icon: 'shield-checkmark',
      label: `${Math.max(0, (currentMonth?.badHappened ?? 0) === 0 ? 1 : 0)} clean-slate month`,
      tint: theme.colors.accent,
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.background, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroCard, { borderColor: theme.colors.border }]}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopyWrap}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {profile.name ? `${profile.name}'s Quest Board` : 'Habit Quest Board'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Turn daily choices into points, streaks, and momentum.
            </Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.levelLabel, { color: theme.colors.textSecondary }]}>LEVEL</Text>
            <Text style={[styles.levelValue, { color: theme.colors.textPrimary }]}>{level}</Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.surface }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.accent,
                  width: `${Math.max(10, (xpIntoLevel / 12) * 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>{xpIntoLevel}/12 XP to next level</Text>
        </View>

        <View style={styles.badgesRow}>
          {badges.map((badge) => (
            <View key={badge.label} style={[styles.badgeChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name={badge.icon as keyof typeof Ionicons.glyphMap} size={14} color={badge.tint} />
              <Text style={[styles.badgeText, { color: theme.colors.textPrimary }]}>{badge.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.metricsGrid}>
        <MetricCard label="Power Score" value={`${ytd.net}`} hint="Every good move earns points. Every slip costs XP." icon="flash" tone="warning" />
        <MetricCard label="Quest Clears" value={`${ytd.good}`} hint="Total positive check-ins this year." icon="checkmark-done-circle" tone="success" />
        <MetricCard label="Trap Hits" value={`${ytd.bad}`} hint="Penalty-triggering moments to watch and reduce." icon="alert-circle" tone="danger" />
      </View>

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Current Mission</Text>
        <View style={styles.missionRow}>
          <View style={[styles.missionPill, { backgroundColor: theme.colors.accentSoft }]}>
            <Ionicons name="rocket" size={14} color={theme.colors.accent} />
            <Text style={[styles.missionPillText, { color: theme.colors.accent }]}>{monthLabel(selectedMonth)} sprint</Text>
          </View>
          <Text style={[styles.missionCopy, { color: theme.colors.textSecondary }]}>
            Reach at least 70% good-habit completion and keep the month net score above zero.
          </Text>
          <View style={styles.missionStatsRow}>
            <View style={[styles.missionStatCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.missionStatValue, { color: theme.colors.textPrimary }]}>{questCompletion}%</Text>
              <Text style={[styles.missionStatLabel, { color: theme.colors.textSecondary }]}>Completion</Text>
            </View>
            <View style={[styles.missionStatCard, { backgroundColor: theme.colors.cardSecondary }]}>
              <Text style={[styles.missionStatValue, { color: theme.colors.textPrimary }]}>{currentMonth?.netScore ?? 0}</Text>
              <Text style={[styles.missionStatLabel, { color: theme.colors.textSecondary }]}>Net Score</Text>
            </View>
          </View>
        </View>
      </SurfaceCard>

      <MonthChips selectedMonth={selectedMonth} onSelect={setSelectedMonth} />

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Season Scoreboard</Text>
        <View style={styles.chartRow}>
          {months.map((m) => {
            const h = Math.max(8, Math.round((Math.abs(m.netScore) / maxAbsNet) * 120));
            const positive = m.netScore >= 0;
            return (
              <View key={m.month} style={styles.barWrap}>
                <View
                  style={{
                    width: 16,
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
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Monthly League Table</Text>
        {months.map((m) => (
          <View key={m.month} style={[styles.row, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.cellMonth, { color: theme.colors.textPrimary }]}>{monthLabel(m.month)}</Text>
            <Text style={[styles.cell, { color: theme.colors.textSecondary }]}>+ {m.goodDone}</Text>
            <Text style={[styles.cell, { color: theme.colors.textSecondary }]}>- {m.badHappened}</Text>
            <Text style={[styles.cell, { color: m.netScore >= 0 ? theme.colors.success : theme.colors.danger }]}>{m.netScore}</Text>
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
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    gap: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  heroCopyWrap: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 20,
  },
  levelBadge: {
    minWidth: 82,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  levelValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  progressRow: {
    gap: 8,
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsGrid: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  missionRow: {
    gap: 12,
  },
  missionPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  missionPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  missionCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  missionStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  missionStatCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
  },
  missionStatValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  missionStatLabel: {
    fontSize: 12,
    fontWeight: '700',
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
