import type { Habit, HabitEntry, MonthSummary, Settings } from '@/types/models';
import { dateKey, getDaysInMonth } from './date';

const entryMap = (entries: HabitEntry[]) => {
  const map = new Map<string, 0 | 1>();
  entries.forEach((e) => map.set(`${e.habitId}|${e.dateKey}`, e.value));
  return map;
};

const pointsForHabit = (habit: Habit, settings: Settings): number => {
  if (habit.points !== undefined) return habit.points;
  return habit.type === 'Good' ? settings.goodPoints : settings.badPenalty;
};

const dailyContribution = (habit: Habit, value: 0 | 1, settings: Settings): number => {
  if (habit.type === 'Good') {
    return value * pointsForHabit(habit, settings);
  }

  return value === 1 ? pointsForHabit(habit, settings) : settings.badAvoidReward;
};

export const monthSummary = (
  settings: Settings,
  habits: Habit[],
  entries: HabitEntry[],
  month: number,
): MonthSummary => {
  const activeHabits = habits.filter((h) => h.active);
  const days = getDaysInMonth(settings.year, month);
  const map = entryMap(entries);

  const activeGoodCount = activeHabits.filter((h) => h.type === 'Good').length;
  let goodDoneTotal = 0;
  let badTotal = 0;
  let netTotal = 0;
  let completionAccumulator = 0;

  const daily = Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    const dk = dateKey(settings.year, month, day);

    let goodDone = 0;
    let badHappened = 0;
    let net = 0;

    for (const habit of activeHabits) {
      const val = map.get(`${habit.id}|${dk}`) ?? 0;
      if (habit.type === 'Good') goodDone += val;
      if (habit.type === 'Bad') badHappened += val;
      net += dailyContribution(habit, val, settings);
    }

    goodDoneTotal += goodDone;
    badTotal += badHappened;
    netTotal += net;

    const completion = activeGoodCount === 0 ? null : goodDone / activeGoodCount;
    if (completion !== null) completionAccumulator += completion;

    return { day, goodDone, badHappened, net, goodCompletion: completion };
  });

  return {
    month,
    goodDone: goodDoneTotal,
    badHappened: badTotal,
    netScore: netTotal,
    avgCompletionGood: activeGoodCount === 0 ? 0 : completionAccumulator / days,
    daily,
  };
};

export const yearlySummaries = (settings: Settings, habits: Habit[], entries: HabitEntry[]) =>
  Array.from({ length: 12 }, (_, i) => monthSummary(settings, habits, entries, i + 1));

export const badHabitAvoidanceStreaks = (
  settings: Settings,
  habits: Habit[],
  entries: HabitEntry[],
  referenceDate = new Date(),
) => {
  const map = entryMap(entries);
  const badHabits = habits.filter((habit) => habit.active && habit.type === 'Bad');
  const endDate =
    referenceDate.getFullYear() === settings.year
      ? referenceDate
      : referenceDate.getFullYear() > settings.year
        ? new Date(settings.year, 11, 31)
        : new Date(settings.year, 0, 1);

  return badHabits.map((habit) => {
    let streak = 0;
    const cursor = new Date(endDate);

    while (cursor.getFullYear() === settings.year) {
      const value = map.get(`${habit.id}|${dateKey(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate())}`) ?? 0;
      if (value === 1) {
        break;
      }

      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      habitId: habit.id,
      habitName: habit.name,
      streak,
    };
  });
};
