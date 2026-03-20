import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Habit, HabitEntry, Settings, UserProfile } from '@/types/models';
import { dateKey } from '@/utils/date';

type HabitState = {
  hasHydrated: boolean;
  settings: Settings;
  profile: UserProfile;
  habits: Habit[];
  entries: HabitEntry[];
  selectedMonth: number;
  setThemeMode: (mode: Settings['themeMode']) => void;
  setProfileName: (name: string) => void;
  setSelectedMonth: (month: number) => void;
  toggleEntry: (habitId: string, month: number, day: number) => void;
  upsertHabit: (habit: Habit) => void;
  setHabits: (habits: Habit[]) => void;
  completeOnboarding: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

const year = new Date().getFullYear();

const defaultSettings: Settings = {
  year,
  goodPoints: 1,
  badPenalty: -4,
  themeMode: 'dark',
};

const defaultProfile: UserProfile = {
  name: '',
  hasCompletedOnboarding: false,
};

const defaultHabits: Habit[] = [];

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      settings: defaultSettings,
      profile: defaultProfile,
      habits: defaultHabits,
      entries: [],
      selectedMonth: new Date().getMonth() + 1,
      setThemeMode: (mode) => set((state) => ({ settings: { ...state.settings, themeMode: mode } })),
      setProfileName: (name) => set((state) => ({ profile: { ...state.profile, name: name.trim() } })),
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
      setHabits: (habits) => set({ habits }),
      completeOnboarding: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            hasCompletedOnboarding: true,
          },
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'habit-tracker-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        profile: state.profile,
        habits: state.habits,
        entries: state.entries,
        selectedMonth: state.selectedMonth,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
