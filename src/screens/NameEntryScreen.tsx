import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useHabitStore } from '@/store/useHabitStore';
import { useAppTheme } from '@/theme/useAppTheme';

type NameEntryScreenProps = {
  onContinue: () => void;
};

export const NameEntryScreen = ({ onContinue }: NameEntryScreenProps) => {
  const theme = useAppTheme();
  const setProfileName = useHabitStore((s) => s.setProfileName);
  const [name, setName] = useState('');

  const trimmedName = name.trim();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>What should we call you?</Text>
        <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
          Your name helps make the dashboard feel a little more personal from the start.
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="words"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => {
            if (trimmedName) {
              setProfileName(trimmedName);
              onContinue();
            }
          }}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.textPrimary,
            },
          ]}
        />

        <Pressable
          onPress={() => {
            setProfileName(trimmedName);
            onContinue();
          }}
          disabled={!trimmedName}
          style={[
            styles.button,
            {
              backgroundColor: trimmedName ? theme.colors.accent : theme.colors.card,
              opacity: trimmedName ? 1 : 0.7,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: trimmedName ? '#FFFFFF' : theme.colors.textSecondary }]}>Next</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 96,
    paddingBottom: 42,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    marginBottom: 12,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 28,
    maxWidth: 320,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 18,
  },
  button: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
