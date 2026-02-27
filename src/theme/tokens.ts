export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    card: string;
    cardSecondary: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
    accentSoft: string;
    success: string;
    danger: string;
    warning: string;
    chartPositive: string;
    chartNegative: string;
    gradientStart: string;
    gradientEnd: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
};

const shared = {
  spacing: { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 },
  radius: { sm: 10, md: 16, lg: 22, xl: 28 },
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: '#F5F7FB',
    surface: '#FFFFFF',
    card: '#EEF3FF',
    cardSecondary: '#FDF7EF',
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    border: '#D6DEED',
    accent: '#1E6BFF',
    accentSoft: '#DCE9FF',
    success: '#12A669',
    danger: '#D64545',
    warning: '#E59B1D',
    chartPositive: '#12A669',
    chartNegative: '#D64545',
    gradientStart: '#C7DAFF',
    gradientEnd: '#FFE4BF',
  },
  ...shared,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: '#090C14',
    surface: '#121826',
    card: '#1A2336',
    cardSecondary: '#2A1D1A',
    textPrimary: '#EEF2FF',
    textSecondary: '#A8B1C5',
    border: '#2A3348',
    accent: '#69A2FF',
    accentSoft: '#21365D',
    success: '#35C58A',
    danger: '#F26C6C',
    warning: '#F1B34C',
    chartPositive: '#35C58A',
    chartNegative: '#F26C6C',
    gradientStart: '#1B2B4B',
    gradientEnd: '#3A2B24',
  },
  ...shared,
};

export const getTheme = (mode: ThemeMode): AppTheme => (mode === 'dark' ? darkTheme : lightTheme);
