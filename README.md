# Habits Tracker Mobile (React Native)

Starter architecture generated from `Habit_Tracker_Dashboard.xlsx` feature set.

## Features implemented
- Setup-equivalent habits model (`Good/Bad`, category, active toggle)
- Daily binary tracking (`0/1`) per habit
- Month summaries (good done, bad happened, net score, avg completion)
- Yearly dashboard summaries and monthly net chart
- Light and dark mode with themed tokens

## Tech
- Expo + React Native + TypeScript
- Zustand for state
- React Navigation (bottom tabs)

## Run
1. `npm install`
2. `npm run start`
3. Open in Android/iOS simulator or Expo Go

## Structure
- `src/store/useHabitStore.ts`: state + actions
- `src/utils/calculations.ts`: Excel-parity scoring logic
- `src/screens/`: Dashboard, Month, Habits, Settings
- `src/theme/`: design tokens + navigation theme bridge
