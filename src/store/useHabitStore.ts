import { create } from 'zustand';
import type { Habit, HabitEntry, Settings } from '@/types/models';
import { dateKey, getDaysInMonth } from '@/utils/date';

type HabitState = {
  settings: Settings;
  habits: Habit[];
  entries: HabitEntry[];
  selectedMonth: number;
  setThemeMode: (mode: Settings['themeMode']) => void;
  setSelectedMonth: (month: number) => void;
  toggleEntry: (habitId: string, month: number, day: number) => void;
  upsertHabit: (habit: Habit) => void;
};

const year = new Date().getFullYear();

const defaultSettings: Settings = {
  year,
  goodPoints: 1,
  badPenalty: -4,
  themeMode: 'dark',
};

const defaultHabits: Habit[] = [
  { id: 'h1', name: 'Exercise', type: 'Good', category: 'Health', active: true },
  { id: 'h2', name: 'Deep Work (2h)', type: 'Good', category: 'Work', active: true },
  { id: 'h3', name: 'Junk Food', type: 'Bad', category: 'Health', active: true },
  { id: 'h4', name: 'Social Media > 1h', type: 'Bad', category: 'Distraction', active: true },
];

const seedEntries = (): HabitEntry[] => {
  const out: HabitEntry[] = [];
  const month = new Date().getMonth() + 1;
  const days = getDaysInMonth(year, month);

  for (let d = 1; d <= Math.min(16, days); d += 1) {
    out.push({ habitId: 'h1', dateKey: dateKey(year, month, d), value: d % 2 === 0 ? 1 : 0 });
    out.push({ habitId: 'h2', dateKey: dateKey(year, month, d), value: d % 3 === 0 ? 1 : 0 });
    out.push({ habitId: 'h3', dateKey: dateKey(year, month, d), value: d % 4 === 0 ? 1 : 0 });
    out.push({ habitId: 'h4', dateKey: dateKey(year, month, d), value: d % 5 === 0 ? 1 : 0 });
  }

  return out;
};

export const useHabitStore = create<HabitState>((set, get) => ({
  settings: defaultSettings,
  habits: defaultHabits,
  entries: seedEntries(),
  selectedMonth: new Date().getMonth() + 1,
  setThemeMode: (mode) => set((state) => ({ settings: { ...state.settings, themeMode: mode } })),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  toggleEntry: (habitId, month, day) => {
    const { settings, entries } = get();
    const dk = dateKey(settings.year, month, day);
    const idx = entries.findIndex((e) => e.habitId === habitId && e.dateKey === dk);

    if (idx === -1) {
      set({ entries: [...entries, { habitId, dateKey: dk, value: 1 }] });
      return;
    }

    const current = entries[idx];
    const next = [...entries];
    next[idx] = { ...current, value: current.value === 1 ? 0 : 1 };
    set({ entries: next });
  },
  upsertHabit: (habit) => {
    const { habits } = get();
    const idx = habits.findIndex((h) => h.id === habit.id);
    if (idx === -1) {
      set({ habits: [...habits, habit] });
      return;
    }
    const next = [...habits];
    next[idx] = habit;
    set({ habits: next });
  },
}));
