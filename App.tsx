import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useHabitStore } from './src/store/useHabitStore';
import { buildNavigationTheme } from './src/theme/navigationTheme';
import { cancelHabitReminderNotifications, syncHabitReminderNotifications } from './src/notifications/habitReminders';
import { getTheme } from './src/theme/tokens';

export default function App() {
  const mode = useHabitStore((s) => s.settings.themeMode);
  const hasHydrated = useHabitStore((s) => s.hasHydrated);
  const hasCompletedOnboarding = useHabitStore((s) => s.profile.hasCompletedOnboarding);
  const habits = useHabitStore((s) => s.habits);
  const entries = useHabitStore((s) => s.entries);
  const navTheme = useMemo(() => buildNavigationTheme(mode === 'dark' ? DarkTheme : DefaultTheme, mode), [mode]);
  const appTheme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    if (!hasHydrated || !hasCompletedOnboarding) {
      return;
    }

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const hasActiveHabits = habits.some((habit) => habit.active);
    const hasUpdatedToday = entries.some((entry) => entry.dateKey === todayKey);

    void syncHabitReminderNotifications(hasActiveHabits && !hasUpdatedToday);
  }, [entries, habits, hasCompletedOnboarding, hasHydrated]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !hasHydrated || !hasCompletedOnboarding) {
        return;
      }

      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const hasActiveHabits = habits.some((habit) => habit.active);
      const hasUpdatedToday = entries.some((entry) => entry.dateKey === todayKey);

      void syncHabitReminderNotifications(hasActiveHabits && !hasUpdatedToday);
    });

    return () => {
      subscription.remove();
    };
  }, [entries, habits, hasCompletedOnboarding, hasHydrated]);

  useEffect(() => {
    if (hasCompletedOnboarding) {
      return;
    }

    void cancelHabitReminderNotifications();
  }, [hasCompletedOnboarding]);

  if (!hasHydrated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: appTheme.colors.background }} edges={['top', 'left', 'right']}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: appTheme.colors.background,
              }}
            >
              <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
              <ActivityIndicator size="large" color={appTheme.colors.accent} />
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: appTheme.colors.background }} edges={['top', 'left', 'right']}>
          <NavigationContainer theme={navTheme}>
            <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
