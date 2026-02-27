import 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useHabitStore } from './src/store/useHabitStore';
import { buildNavigationTheme } from './src/theme/navigationTheme';

export default function App() {
  const mode = useHabitStore((s) => s.settings.themeMode);
  const navTheme = useMemo(() => buildNavigationTheme(mode === 'dark' ? DarkTheme : DefaultTheme, mode), [mode]);

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
}
