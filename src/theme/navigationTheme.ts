import type { Theme } from '@react-navigation/native';
import type { ThemeMode } from './tokens';
import { getTheme } from './tokens';

export const buildNavigationTheme = (base: Theme, mode: ThemeMode): Theme => {
  const appTheme = getTheme(mode);
  return {
    ...base,
    colors: {
      ...base.colors,
      background: appTheme.colors.background,
      card: appTheme.colors.surface,
      border: appTheme.colors.border,
      text: appTheme.colors.textPrimary,
      primary: appTheme.colors.accent,
    },
  };
};
