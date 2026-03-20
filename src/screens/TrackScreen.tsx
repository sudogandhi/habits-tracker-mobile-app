import { useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';
import { dayShort, monthLabel } from '@/utils/date';

export const TrackScreen = () => {
  const theme = useAppTheme();
  const { settings, habits, entries, toggleEntry } = useHabitStore();
  const rootRef = useRef<View | null>(null);
  const goodStatRef = useRef<View | null>(null);
  const badStatRef = useRef<View | null>(null);
  const scoreStatRef = useRef<View | null>(null);
  const habitCardRefs = useRef<Record<string, View | null>>({});
  const flightX = useRef(new Animated.Value(0)).current;
  const flightY = useRef(new Animated.Value(0)).current;
  const flightScale = useRef(new Animated.Value(0.8)).current;
  const flightOpacity = useRef(new Animated.Value(0)).current;
  const goodPulse = useRef(new Animated.Value(1)).current;
  const badPulse = useRef(new Animated.Value(1)).current;
  const scorePulse = useRef(new Animated.Value(1)).current;
  const [flightLabel, setFlightLabel] = useState('');
  const [flightColor, setFlightColor] = useState('#FFFFFF');
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  const todayYear = settings.year;
  const activeHabits = habits.filter((habit) => habit.active);
  const todayDateKey = `${todayYear}-${String(todayMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;

  const goodTrackedToday = activeHabits.filter((habit) => {
    if (habit.type !== 'Good') return false;
    return entries.find((entry) => entry.habitId === habit.id && entry.dateKey === todayDateKey)?.value === 1;
  }).length;

  const badTrackedToday = activeHabits.filter((habit) => {
    if (habit.type !== 'Bad') return false;
    return entries.find((entry) => entry.habitId === habit.id && entry.dateKey === todayDateKey)?.value === 1;
  }).length;

  const badAvoidedToday = activeHabits.filter((habit) => {
    if (habit.type !== 'Bad') return false;
    return (entries.find((entry) => entry.habitId === habit.id && entry.dateKey === todayDateKey)?.value ?? 0) === 0;
  }).length;

  const todayScore =
    goodTrackedToday * settings.goodPoints +
    badTrackedToday * settings.badPenalty +
    badAvoidedToday * settings.badAvoidReward;

  const pulseValue = (value: Animated.Value) => {
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1.12,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0.96,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: 160,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const runScoreFlight = (habitId: string, habitType: 'Good' | 'Bad', scoreDelta: number) => {
    const rootNode = rootRef.current;
    const cardNode = habitCardRefs.current[habitId];
    const targetNode = habitType === 'Good' ? goodStatRef.current : badStatRef.current;

    if (!rootNode || !cardNode || !targetNode || scoreDelta === 0) {
      return;
    }

    rootNode.measureInWindow((rootX, rootY) => {
      cardNode.measureInWindow((cardX, cardY, cardWidth, cardHeight) => {
        targetNode.measureInWindow((targetX, targetY, targetWidth, targetHeight) => {
          const startX = cardX - rootX + cardWidth - 56;
          const startY = cardY - rootY + cardHeight / 2 - 14;
          const endX = targetX - rootX + targetWidth / 2 - 26;
          const endY = targetY - rootY + targetHeight / 2 - 18;

          setFlightLabel(scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`);
          setFlightColor(scoreDelta > 0 ? theme.colors.success : theme.colors.danger);
          flightX.setValue(startX);
          flightY.setValue(startY);
          flightScale.setValue(0.8);
          flightOpacity.setValue(0);

          Animated.parallel([
            Animated.timing(flightOpacity, {
              toValue: 1,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.timing(flightScale, {
              toValue: 1,
              duration: 180,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
            Animated.timing(flightX, {
              toValue: endX,
              duration: 520,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(flightY, {
              toValue: endY,
              duration: 520,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start(() => {
            Animated.timing(flightOpacity, {
              toValue: 0,
              duration: 120,
              useNativeDriver: true,
            }).start();
            pulseValue(habitType === 'Good' ? goodPulse : badPulse);
            pulseValue(scorePulse);
          });
        });
      });
    });
  };

  return (
    <View ref={rootRef} style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.heroCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>TODAY'S TRACKER</Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Track habits for today</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {dayShort(todayYear, todayMonth, todayDay)}, {monthLabel(todayMonth)} {todayDay}
        </Text>

        <View style={styles.heroStatsRow}>
          <View ref={goodStatRef} style={styles.heroStatWrap}>
            <Animated.View style={[styles.heroStatCard, { backgroundColor: theme.colors.card, transform: [{ scale: goodPulse }] }]}>
              <View style={styles.heroStatLeft}>
                <Ionicons name="arrow-up-circle" size={24} color={theme.colors.success} />
                <Text style={[styles.heroStatLabel, { color: theme.colors.textSecondary }]}>Good</Text>
              </View>
              <Text style={[styles.heroStatValue, { color: theme.colors.textPrimary }]}>{goodTrackedToday}</Text>
            </Animated.View>
          </View>
          <View ref={badStatRef} style={styles.heroStatWrap}>
            <Animated.View style={[styles.heroStatCard, { backgroundColor: theme.colors.cardSecondary, transform: [{ scale: badPulse }] }]}>
              <View style={styles.heroStatLeft}>
                <Ionicons name="arrow-down-circle" size={24} color={theme.colors.danger} />
                <Text style={[styles.heroStatLabel, { color: theme.colors.textSecondary }]}>Bad</Text>
              </View>
              <Text style={[styles.heroStatValue, { color: theme.colors.textPrimary }]}>{badTrackedToday}</Text>
            </Animated.View>
          </View>
          <View ref={scoreStatRef} style={styles.heroStatWrap}>
            <Animated.View style={[styles.heroStatCard, { backgroundColor: theme.colors.card, transform: [{ scale: scorePulse }] }]}>
              <View style={styles.heroStatLeft}>
                <Ionicons name="flash" size={24} color={todayScore >= 0 ? theme.colors.warning : theme.colors.danger} />
                <Text style={[styles.heroStatLabel, { color: theme.colors.textSecondary }]}>Score</Text>
              </View>
              <Text style={[styles.heroStatValue, { color: todayScore >= 0 ? theme.colors.success : theme.colors.danger }]}>
                {todayScore > 0 ? `+${todayScore}` : todayScore}
              </Text>
            </Animated.View>
          </View>
        </View>
      </View>

      <View style={styles.listWrap}>
        <ScrollView style={styles.list} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {activeHabits.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No active habits to track</Text>
              <Text style={[styles.emptyCopy, { color: theme.colors.textSecondary }]}>
                Add or enable habits in the Habits tab to start tracking today.
              </Text>
            </View>
          ) : (
            activeHabits.map((habit) => {
              const value = entries.find((entry) => entry.habitId === habit.id && entry.dateKey === todayDateKey)?.value ?? 0;
              const activeColor = habit.type === 'Good' ? theme.colors.success : theme.colors.danger;
              const typeCopy = habit.type === 'Good' ? 'Do today' : 'Avoid today';

              return (
                <View
                  key={habit.id}
                  ref={(node) => {
                    habitCardRefs.current[habit.id] = node;
                  }}
                >
                  <Pressable
                  onPress={() => {
                    const nextValue = value === 1 ? 0 : 1;
                    const scoreDelta =
                      habit.type === 'Good'
                        ? nextValue === 1
                          ? settings.goodPoints
                          : -settings.goodPoints
                        : nextValue === 1
                          ? settings.badPenalty - settings.badAvoidReward
                          : settings.badAvoidReward - settings.badPenalty;
                    runScoreFlight(habit.id, habit.type, scoreDelta);
                    toggleEntry(habit.id, todayMonth, todayDay);
                  }}
                    style={[
                      styles.habitCard,
                      {
                        backgroundColor: value ? activeColor : theme.colors.surface,
                        borderColor: value ? activeColor : theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.habitMainRow}>
                      <View
                        style={[
                          styles.iconWrap,
                          {
                            backgroundColor: value
                              ? 'rgba(255,255,255,0.18)'
                              : habit.type === 'Good'
                                ? theme.colors.card
                                : theme.colors.cardSecondary,
                          },
                        ]}
                      >
                        <Ionicons
                          name={habit.type === 'Good' ? 'arrow-up-circle' : 'arrow-down-circle'}
                          size={18}
                          color={value ? '#FFFFFF' : activeColor}
                        />
                      </View>

                      <View style={styles.habitContent}>
                        <Text style={[styles.habitName, { color: value ? '#FFFFFF' : theme.colors.textPrimary }]} numberOfLines={1}>
                          {habit.name}
                        </Text>
                        <View style={styles.metaRow}>
                          <View
                            style={[
                              styles.metaChip,
                              {
                                backgroundColor: value
                                  ? 'rgba(255,255,255,0.18)'
                                  : habit.type === 'Good'
                                    ? theme.colors.card
                                    : theme.colors.cardSecondary,
                              },
                            ]}
                          >
                            <Text style={[styles.metaChipText, { color: value ? '#FFFFFF' : activeColor }]}>{typeCopy}</Text>
                          </View>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.statusIconWrap,
                          {
                            backgroundColor: value ? 'rgba(255,255,255,0.18)' : theme.colors.card,
                          },
                        ]}
                      >
                        <Ionicons
                          name={value ? 'checkmark-circle' : 'ellipse-outline'}
                          size={20}
                          color={value ? '#FFFFFF' : theme.colors.textSecondary}
                        />
                      </View>
                    </View>
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.flightBadge,
          {
            opacity: flightOpacity,
            backgroundColor: theme.colors.surface,
            borderColor: flightColor,
            transform: [{ translateX: flightX }, { translateY: flightY }, { scale: flightScale }],
          },
        ]}
      >
        <Text style={[styles.flightText, { color: flightColor }]}>{flightLabel}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 12,
    paddingTop: 0,
    paddingBottom: 40,
  },
  listWrap: {
    flex: 1,
    marginTop: 12,
  },
  list: {
    flex: 1,
  },
  heroCard: {
    margin: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    overflow: 'hidden',
    zIndex: 2,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  heroStatWrap: {
    width: '31.5%',
    overflow: 'hidden',
  },
  heroStatCard: {
    minHeight: 62,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroStatLeft: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginLeft: 10,
  },
  heroStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'left',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  habitCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  habitMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitContent: {
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flightBadge: {
    position: 'absolute',
    minWidth: 52,
    height: 32,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  flightText: {
    fontSize: 14,
    fontWeight: '900',
  },
});
