import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme/useAppTheme';

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'accent' | 'success' | 'danger' | 'warning';
};

export const MetricCard = ({ label, value, hint, icon = 'sparkles', tone = 'accent' }: Props) => {
  const theme = useAppTheme();
  const toneColor =
    tone === 'success'
      ? theme.colors.success
      : tone === 'danger'
        ? theme.colors.danger
        : tone === 'warning'
          ? theme.colors.warning
          : theme.colors.accent;

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name={icon} size={18} color={toneColor} />
        </View>
      </View>
      {!!hint && <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>{hint}</Text>}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 74,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
  },
  hint: {
    fontSize: 10,
    lineHeight: 13,
  },
});
