import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { MonthScreen } from '@/screens/MonthScreen';
import { TrackScreen } from '@/screens/TrackScreen';
import { HabitsScreen } from '@/screens/HabitsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { NameEntryScreen } from '@/screens/NameEntryScreen';
import { HabitSetupScreen } from '@/screens/HabitSetupScreen';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid',
  Month: 'calendar',
  Track: 'add',
  Habits: 'checkmark-circle',
  Settings: 'settings',
};

const MainTabs = () => {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: route.name !== 'Track',
        tabBarStyle: {
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          height: 78,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color }) =>
          route.name === 'Track' ? (
            <View />
          ) : (
            <Ionicons
              name={tabIcons[route.name] ?? 'ellipse'}
              size={focused ? 22 : 20}
              color={color}
              style={{ opacity: focused ? 1 : 0.8 }}
            />
          ),
        tabBarButton: (props) => {
          if (route.name !== 'Track') {
            const { children, style, onPress, accessibilityState, accessibilityLabel, testID } = props;

            return (
              <Pressable
                onPress={onPress}
                style={style}
                accessibilityRole="button"
                accessibilityState={accessibilityState}
                accessibilityLabel={accessibilityLabel}
                testID={testID}
              >
                {children}
              </Pressable>
            );
          }

          const { onPress, accessibilityState } = props;
          const selected = accessibilityState?.selected;

          return (
            <Pressable
              onPress={onPress}
              style={styles.centerTabWrap}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              accessibilityLabel="Track habits"
            >
              <View
                style={[
                  styles.centerTabButton,
                  {
                    backgroundColor: theme.colors.accent,
                    borderColor: theme.colors.surface,
                    transform: [{ scale: selected ? 1.04 : 1 }],
                  },
                ]}
              >
                <Ionicons name="flash" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.centerTabLabel, { color: theme.colors.textPrimary }]}>Track</Text>
            </Pressable>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Month" component={MonthScreen} />
      <Tab.Screen name="Track" component={TrackScreen} options={{ title: 'Track' }} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const profile = useHabitStore((s) => s.profile);

  if (profile.hasCompletedOnboarding) {
    return <MainTabs />;
  }

  return (
    <Stack.Navigator
      initialRouteName={profile.name ? 'HabitSetup' : 'Welcome'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen
        name="Welcome"
        children={({ navigation }) => <WelcomeScreen onProceed={() => navigation.navigate('NameEntry')} />}
      />
      <Stack.Screen
        name="NameEntry"
        children={({ navigation }) => <NameEntryScreen onContinue={() => navigation.navigate('HabitSetup')} />}
      />
      <Stack.Screen name="HabitSetup" component={HabitSetupScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  centerTabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  centerTabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: -24,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  centerTabLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '800',
  },
});
