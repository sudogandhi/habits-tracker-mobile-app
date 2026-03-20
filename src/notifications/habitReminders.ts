import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_IDS_KEY = 'habit-reminder-notification-ids';
const REMINDER_HOURS = [18, 19, 20, 21, 22, 23];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const loadReminderIds = async (): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(REMINDER_IDS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
};

const saveReminderIds = async (ids: string[]) => {
  await AsyncStorage.setItem(REMINDER_IDS_KEY, JSON.stringify(ids));
};

export const cancelHabitReminderNotifications = async () => {
  const ids = await loadReminderIds();
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  await saveReminderIds([]);
};

const ensureNotificationPermissions = async (): Promise<boolean> => {
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
    status = requested.status;
  }

  if (status !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  return true;
};

export const syncHabitReminderNotifications = async (shouldRemind: boolean) => {
  await cancelHabitReminderNotifications();

  if (!shouldRemind) {
    return;
  }

  const allowed = await ensureNotificationPermissions();
  if (!allowed) {
    return;
  }

  const now = new Date();
  const reminderTimes = REMINDER_HOURS
    .map((hour) => {
      const date = new Date(now);
      date.setHours(hour, 0, 0, 0);
      return date;
    })
    .filter((date) => date.getTime() > now.getTime());

  const ids: string[] = [];

  for (const date of reminderTimes) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Update your habits',
        body: 'You still have not updated today’s habits. Take a quick minute to log them.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: Platform.OS === 'android' ? 'habit-reminders' : undefined,
      },
    });

    ids.push(id);
  }

  await saveReminderIds(ids);
};
