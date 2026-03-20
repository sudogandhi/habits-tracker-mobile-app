import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Habit, HabitType } from '@/types/models';
import { SurfaceCard } from '@/components/SurfaceCard';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';

const buildHabit = (name: string, type: HabitType): Habit => ({
  id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: name.trim(),
  type,
  category: 'Custom',
  active: true,
});

export const HabitsScreen = () => {
  const theme = useAppTheme();
  const { settings, habits, upsertHabit, setHabits } = useHabitStore();
  const [habitName, setHabitName] = useState('');
  const [habitType, setHabitType] = useState<HabitType>('Good');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  const trimmedHabitName = habitName.trim();
  const isEditing = editingHabitId !== null;

  const resetForm = () => {
    setHabitName('');
    setHabitType('Good');
    setEditingHabitId(null);
  };

  const handleSubmit = () => {
    if (!trimmedHabitName) {
      return;
    }

    if (editingHabitId) {
      const existingHabit = habits.find((habit) => habit.id === editingHabitId);
      if (!existingHabit) {
        resetForm();
        return;
      }

      upsertHabit({
        ...existingHabit,
        name: trimmedHabitName,
      });
      resetForm();
      return;
    }

    setHabits([buildHabit(trimmedHabitName, habitType), ...habits]);
    resetForm();
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setHabitName(habit.name);
    setHabitType(habit.type);
  };

  const handleDelete = (habitId: string) => {
    setHabits(habits.filter((habit) => habit.id !== habitId));
    if (editingHabitId === habitId) {
      resetForm();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Manage Habits</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Create, update, pause, or delete the habits you track every day.
          </Text>
        </View>

        <SurfaceCard>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{isEditing ? 'Edit Habit' : 'Create Habit'}</Text>

          <TextInput
            value={habitName}
            onChangeText={setHabitName}
            placeholder="Habit name"
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              },
            ]}
          />

          {isEditing ? (
            <View style={[styles.lockedTypeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name={habitType === 'Good' ? 'lock-closed' : 'lock-closed'} size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.lockedTypeText, { color: theme.colors.textSecondary }]}>
                Habit type is locked while editing. Create a new habit if you want to change Good/Bad.
              </Text>
            </View>
          ) : (
            <View style={styles.typeRow}>
              <Pressable
                onPress={() => setHabitType('Good')}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: habitType === 'Good' ? theme.colors.success : theme.colors.card,
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
                    backgroundColor: habitType === 'Bad' ? theme.colors.danger : theme.colors.cardSecondary,
                    borderColor: habitType === 'Bad' ? theme.colors.danger : theme.colors.border,
                  },
                ]}
              >
                <Ionicons name="arrow-down-circle" size={18} color={habitType === 'Bad' ? '#FFFFFF' : theme.colors.danger} />
                <Text style={[styles.typeButtonText, { color: habitType === 'Bad' ? '#FFFFFF' : theme.colors.textPrimary }]}>Bad</Text>
              </Pressable>
            </View>
          )}

          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
            {habitType === 'Good'
              ? `Good habits add +${settings.goodPoints} to your score.`
              : `Bad habits add +${settings.badAvoidReward} when avoided and ${settings.badPenalty} when they happen.`}
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              onPress={handleSubmit}
              disabled={!trimmedHabitName}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: trimmedHabitName ? theme.colors.accent : theme.colors.card,
                  opacity: trimmedHabitName ? 1 : 0.7,
                },
              ]}
            >
              <Ionicons name={isEditing ? 'save-outline' : 'add'} size={18} color={trimmedHabitName ? '#FFFFFF' : theme.colors.textSecondary} />
              <Text style={[styles.primaryButtonText, { color: trimmedHabitName ? '#FFFFFF' : theme.colors.textSecondary }]}>
                {isEditing ? 'Save Changes' : 'Add Habit'}
              </Text>
            </Pressable>

            {isEditing ? (
              <Pressable onPress={resetForm} style={[styles.secondaryButton, { borderColor: theme.colors.border }]}>
                <Text style={[styles.secondaryButtonText, { color: theme.colors.textPrimary }]}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>
        </SurfaceCard>

        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Your Habits</Text>
          <Text style={[styles.listCount, { color: theme.colors.textSecondary }]}>{habits.length} total</Text>
        </View>

        {habits.length === 0 ? (
          <SurfaceCard>
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No habits added yet</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Create your first habit above to start tracking it daily.
            </Text>
          </SurfaceCard>
        ) : null}

        {habits.map((habit) => {
          const score = habit.type === 'Good' ? `+${settings.goodPoints}` : `+${settings.badAvoidReward} / ${settings.badPenalty}`;
          const accentColor = habit.type === 'Good' ? theme.colors.success : theme.colors.danger;

          return (
            <SurfaceCard key={habit.id}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{habit.name}</Text>
                    <View
                      style={[
                        styles.scoreChip,
                        { backgroundColor: habit.type === 'Good' ? theme.colors.card : theme.colors.cardSecondary },
                      ]}
                    >
                      <Text style={[styles.scoreChipText, { color: accentColor }]}>{score}</Text>
                    </View>
                  </View>
                  <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
                    {habit.type} habit • {habit.active ? 'Active' : 'Paused'}
                  </Text>
                </View>

                <Switch
                  value={habit.active}
                  onValueChange={(active) => upsertHabit({ ...habit, active })}
                  trackColor={{ true: theme.colors.accent, false: theme.colors.border }}
                />
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => handleEdit(habit)}
                  style={[styles.cardActionButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                >
                  <Ionicons name="create-outline" size={16} color={theme.colors.textPrimary} />
                  <Text style={[styles.cardActionText, { color: theme.colors.textPrimary }]}>Edit</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleDelete(habit.id)}
                  style={[styles.cardActionButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.cardSecondary }]}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                  <Text style={[styles.cardActionText, { color: theme.colors.danger }]}>Delete</Text>
                </Pressable>
              </View>
            </SurfaceCard>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  typeButton: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  lockedTypeCard: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  lockedTypeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    minWidth: 96,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  listCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    flexShrink: 1,
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scoreChipText: {
    fontSize: 12,
    fontWeight: '900',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cardActionButton: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
