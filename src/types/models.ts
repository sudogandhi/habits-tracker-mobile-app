import type { ThemeMode } from '@/theme/tokens';

export type HabitType = 'Good' | 'Bad';

export type Habit = {
  id: string;
  name: string;
  type: HabitType;
  category: string;
  active: boolean;
  points?: number;
};

export type HabitEntry = {
  habitId: string;
  dateKey: string;
  value: 0 | 1;
};

export type Settings = {
  year: number;
  goodPoints: number;
  badPenalty: number;
  badAvoidReward: number;
  themeMode: ThemeMode;
};

export type UserProfile = {
  name: string;
  hasCompletedOnboarding: boolean;
  onboardedAt: string | null;
};

export type DaySummary = {
  day: number;
  goodDone: number;
  badHappened: number;
  net: number;
  goodCompletion: number | null;
};

export type MonthSummary = {
  month: number;
  goodDone: number;
  badHappened: number;
  netScore: number;
  avgCompletionGood: number;
  daily: DaySummary[];
};
