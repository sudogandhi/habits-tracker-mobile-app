import { useMemo } from 'react';
import { getTheme } from './tokens';
import { useHabitStore } from '@/store/useHabitStore';

export const useAppTheme = () => {
  const mode = useHabitStore((s) => s.settings.themeMode);
  return useMemo(() => getTheme(mode), [mode]);
};
