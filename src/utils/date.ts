export const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const dateKey = (year: number, month: number, day: number): string =>
  `${year}-${pad2(month)}-${pad2(day)}`;

export const getDaysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();

export const monthLabel = (month: number): string =>
  new Date(2026, month - 1, 1).toLocaleString('en-US', { month: 'short' });

export const dayShort = (year: number, month: number, day: number): string =>
  new Date(year, month - 1, day).toLocaleString('en-US', { weekday: 'short' });
