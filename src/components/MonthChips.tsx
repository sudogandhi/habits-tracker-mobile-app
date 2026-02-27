import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '@/theme/useAppTheme';
import { monthLabel } from '@/utils/date';

type Props = {
  selectedMonth: number;
  onSelect: (month: number) => void;
};

export const MonthChips = ({ selectedMonth, onSelect }: Props) => {
  const theme = useAppTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
        const active = month === selectedMonth;
        return (
          <Pressable
            key={month}
            onPress={() => onSelect(month)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.colors.accent : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={{ color: active ? '#FFFFFF' : theme.colors.textPrimary, fontWeight: '700' }}>{monthLabel(month)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
