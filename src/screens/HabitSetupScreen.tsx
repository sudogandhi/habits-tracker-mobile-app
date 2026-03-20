import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Habit, HabitType } from '@/types/models';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';

const buildHabit = (name: string, type: HabitType): Habit => ({
  id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: name.trim(),
  type,
  category: 'Custom',
  active: true,
});

export const HabitSetupScreen = () => {
  const theme = useAppTheme();
  const { profile, settings, habits, setHabits, completeOnboarding } = useHabitStore();
  const [habitName, setHabitName] = useState('');
  const [habitType, setHabitType] = useState<HabitType>('Good');

  const trimmedHabitName = habitName.trim();

  const addHabit = () => {
    if (!trimmedHabitName) {
      return;
    }

    setHabits([buildHabit(trimmedHabitName, habitType), ...habits]);
    setHabitName('');
    setHabitType('Good');
  };

  const removeHabit = (habitId: string) => {
    setHabits(habits.filter((habit) => habit.id !== habitId));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.contentWrap}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
        >
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {profile.name ? `${profile.name}, add your habits` : 'Add your habits'}
          </Text>
          <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
            Pick what you want to do more of, and what you want to avoid. You can always adjust this later.
          </Text>

          <View style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TextInput
              value={habitName}
              onChangeText={setHabitName}
              placeholder="Add a habit"
              placeholderTextColor={theme.colors.textSecondary}
              returnKeyType="done"
              onSubmitEditing={addHabit}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                },
              ]}
            />

            <View style={styles.typeHeader}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Type</Text>
              <Text style={[styles.typeHint, { color: theme.colors.textSecondary }]}>Tap to switch</Text>
            </View>
            <View style={styles.typeRow}>
              <Pressable
                onPress={() => setHabitType('Good')}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: habitType === 'Good' ? theme.colors.success : theme.colors.surface,
                    borderColor: habitType === 'Good' ? theme.colors.success : theme.colors.border,
                  },
                ]}
              >
                <Ionicons name="arrow-up-circle" size={18} color={habitType === 'Good' ? '#FFFFFF' : theme.colors.success} />
                <Text style={[styles.typeButtonText, { color: habitType === 'Good' ? '#FFFFFF' : theme.colors.textPrimary }]}>Good</Text>
              </Pressable>
              <Pressable
                onPress={() => setHabitType('Bad')}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: habitType === 'Bad' ? theme.colors.danger : theme.colors.surface,
                    borderColor: habitType === 'Bad' ? theme.colors.danger : theme.colors.border,
                  },
                ]}
              >
                <Ionicons name="arrow-down-circle" size={18} color={habitType === 'Bad' ? '#FFFFFF' : theme.colors.danger} />
                <Text style={[styles.typeButtonText, { color: habitType === 'Bad' ? '#FFFFFF' : theme.colors.textPrimary }]}>Bad</Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.selectionHintCard,
                {
                  backgroundColor: habitType === 'Good' ? theme.colors.accentSoft : theme.colors.cardSecondary,
                  borderColor: habitType === 'Good' ? theme.colors.success : theme.colors.danger,
                },
              ]}
            >
              <Ionicons
                name={habitType === 'Good' ? 'sparkles' : 'alert-circle'}
                size={16}
                color={habitType === 'Good' ? theme.colors.success : theme.colors.danger}
              />
              <Text style={[styles.selectionHintText, { color: theme.colors.textPrimary }]}>
                {habitType === 'Good'
                  ? `This habit earns +${settings.goodPoints} when you complete it.`
                  : `This habit costs ${settings.badPenalty} when it happens.`}
              </Text>
            </View>

            <Pressable
              onPress={addHabit}
              disabled={!trimmedHabitName}
              style={[
                styles.addButton,
                {
                  backgroundColor: trimmedHabitName ? theme.colors.accent : theme.colors.card,
                  opacity: trimmedHabitName ? 1 : 0.7,
                },
              ]}
            >
              <Ionicons name="add" size={18} color={trimmedHabitName ? '#FFFFFF' : theme.colors.textSecondary} />
              <Text style={[styles.addButtonText, { color: trimmedHabitName ? '#FFFFFF' : theme.colors.textSecondary }]}>
                Add Habit
              </Text>
            </Pressable>
          </View>

          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Your habit list</Text>
            <Text style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>{habits.length} added</Text>
          </View>

          {habits.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No habits added yet</Text>
              <Text style={[styles.emptyCopy, { color: theme.colors.textSecondary }]}>
                Add at least one habit to finish setup and start tracking daily progress.
              </Text>
            </View>
          ) : (
            habits.map((habit) => {
              const score = habit.type === 'Good' ? `+${settings.goodPoints}` : `${settings.badPenalty}`;
              const scoreColor = habit.type === 'Good' ? theme.colors.success : theme.colors.danger;

              return (
                <View key={habit.id} style={[styles.habitCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.habitName, { color: theme.colors.textPrimary }]}>{habit.name}</Text>
                    <Text style={[styles.habitMeta, { color: theme.colors.textSecondary }]}>
                      {habit.type === 'Good' ? 'Build this' : 'Avoid this'} • {score}
                    </Text>
                  </View>

                  <View style={[styles.scoreChip, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.scoreChipText, { color: scoreColor }]}>{score}</Text>
                  </View>

                  <Pressable onPress={() => removeHabit(habit.id)} hitSlop={10} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.textSecondary} />
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <Pressable
          onPress={completeOnboarding}
          disabled={habits.length === 0}
          style={[
            styles.continueButton,
            {
              backgroundColor: habits.length > 0 ? theme.colors.accent : theme.colors.card,
              opacity: habits.length > 0 ? 1 : 0.7,
            },
          ]}
        >
          <Text style={[styles.continueButtonText, { color: habits.length > 0 ? '#FFFFFF' : theme.colors.textSecondary }]}>
            Start Tracking
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    marginBottom: 12,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 24,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeHint: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  selectionHintCard: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  selectionHintText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  addButton: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHint: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  habitMeta: {
    fontSize: 13,
    fontWeight: '600',
  },
  scoreChip: {
    minWidth: 56,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  scoreChipText: {
    fontSize: 14,
    fontWeight: '900',
  },
  deleteButton: {
    padding: 2,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 20,
  },
  continueButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
