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
  badAvoidReward: 2,
  themeMode: 'dark',
};

const defaultProfile: UserProfile = {
  name: '',
  hasCompletedOnboarding: false,
  onboardedAt: null,
};

const defaultHabits: Habit[] = [];

const todayDateKey = () => {
  const today = new Date();
  return dateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
};

const deriveOnboardedAt = (profile: Partial<UserProfile> | undefined, entries: HabitEntry[] | undefined) => {
  if (profile?.onboardedAt) {
    return profile.onboardedAt;
  }

  if (!profile?.hasCompletedOnboarding) {
    return null;
  }

  if (entries && entries.length > 0) {
    return [...entries].sort((a, b) => a.dateKey.localeCompare(b.dateKey))[0]?.dateKey ?? todayDateKey();
  }

  return todayDateKey();
};

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
            onboardedAt: state.profile.onboardedAt ?? todayDateKey(),
          },
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'habit-tracker-store',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<HabitState> | undefined;

        return {
          ...currentState,
          ...typedPersistedState,
          settings: {
            ...defaultSettings,
            ...(typedPersistedState?.settings ?? {}),
          },
          profile: {
            ...defaultProfile,
            ...(typedPersistedState?.profile ?? {}),
            onboardedAt: deriveOnboardedAt(typedPersistedState?.profile, typedPersistedState?.entries),
          },
          habits: typedPersistedState?.habits ?? currentState.habits,
          entries: typedPersistedState?.entries ?? currentState.entries,
          selectedMonth: typedPersistedState?.selectedMonth ?? currentState.selectedMonth,
        };
      },
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
