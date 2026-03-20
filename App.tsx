import 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useHabitStore } from './src/store/useHabitStore';
import { buildNavigationTheme } from './src/theme/navigationTheme';
import { getTheme } from './src/theme/tokens';

export default function App() {
  const mode = useHabitStore((s) => s.settings.themeMode);
  const hasHydrated = useHabitStore((s) => s.hasHydrated);
  const navTheme = useMemo(() => buildNavigationTheme(mode === 'dark' ? DarkTheme : DefaultTheme, mode), [mode]);
  const appTheme = useMemo(() => getTheme(mode), [mode]);

  if (!hasHydrated) {
    return (
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
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: appTheme.colors.background }} edges={['top', 'left', 'right']}>
        <NavigationContainer theme={navTheme}>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
