import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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

const sparkleVectors = [
  { x: -18, y: -16, scale: 1 },
  { x: 20, y: -18, scale: 0.85 },
  { x: -10, y: -28, scale: 0.72 },
  { x: 12, y: -34, scale: 0.95 },
];

type SparkleTabButtonProps = BottomTabBarButtonProps & {
  children: React.ReactNode;
  theme: ReturnType<typeof useAppTheme>;
  isTrack?: boolean;
};

const SparkleTabButton = ({
  children,
  onPress,
  style,
  accessibilityState,
  accessibilityLabel,
  testID,
  theme,
  isTrack = false,
}: SparkleTabButtonProps) => {
  const progress = useRef(sparkleVectors.map(() => new Animated.Value(0))).current;
  const opacity = useRef(sparkleVectors.map(() => new Animated.Value(0))).current;

  const triggerSparkles = () => {
    progress.forEach((value) => value.setValue(0));
    opacity.forEach((value) => value.setValue(0));

    Animated.parallel(
      sparkleVectors.flatMap((_, index) => [
        Animated.timing(progress[index], {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity[index], {
            toValue: 1,
            duration: 90,
            delay: index * 18,
            useNativeDriver: true,
          }),
          Animated.timing(opacity[index], {
            toValue: 0,
            duration: 360,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  };

  return (
    <Pressable
      onPress={(event) => {
        triggerSparkles();
        onPress?.(event);
      }}
      style={[style, isTrack ? styles.centerTabWrap : styles.defaultTabWrap]}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel ?? 'Navigation tab'}
      testID={testID}
    >
      {children}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {sparkleVectors.map((sparkle, index) => (
          <Animated.View
            key={`${isTrack ? 'track' : 'tab'}-${index}`}
            style={[
              styles.sparkle,
              isTrack ? styles.trackSparkleOrigin : styles.defaultSparkleOrigin,
              {
                opacity: opacity[index],
                transform: [
                  {
                    translateX: progress[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, sparkle.x],
                    }),
                  },
                  {
                    translateY: progress[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, sparkle.y],
                    }),
                  },
                  {
                    scale: progress[index].interpolate({
                      inputRange: [0, 0.35, 1],
                      outputRange: [0.2, sparkle.scale, 0.45],
                    }),
                  },
                  {
                    rotate: progress[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', index % 2 === 0 ? '18deg' : '-18deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="sparkles" size={12} color={theme.colors.accent} />
          </Animated.View>
        ))}
      </View>
    </Pressable>
  );
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
            return (
              <SparkleTabButton {...props} theme={theme}>
                {props.children}
              </SparkleTabButton>
            );
          }

          const { accessibilityState } = props;
          const selected = accessibilityState?.selected;

          return (
            <SparkleTabButton {...props} theme={theme} isTrack>
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
            </SparkleTabButton>
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
  defaultTabWrap: {
    overflow: 'visible',
  },
  centerTabWrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    overflow: 'visible',
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
  sparkle: {
    position: 'absolute',
  },
  defaultSparkleOrigin: {
    top: 10,
    left: '50%',
    marginLeft: -6,
  },
  trackSparkleOrigin: {
    top: -2,
    left: '50%',
    marginLeft: -6,
  },
});
