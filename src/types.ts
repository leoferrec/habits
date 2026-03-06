export type HabitType = 'build' | 'break';
export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type CompletionMethod = 'check' | 'duration';

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  emoji: string;
  frequency: FrequencyType;
  customDays?: number[]; // 0=Sun ... 6=Sat
  completionMethod: CompletionMethod;
  targetDurationMin?: number; // for duration habits
  xpPerCompletion: number;
  /** Stacking: anchor habit id */
  anchorHabitId?: string;
  /** The four laws label */
  lawTag?: string;
  /** Trigger for the habit (Atomic Habits: cue/trigger) */
  trigger?: string;
  /** Reward after completing the habit */
  reward?: string;
  /** Routine blocks this habit belongs to */
  routineBlockIds: string[];
  /** For break habits: cue, craving, response, reward (habit loop) */
  habitLoop?: {
    cue: string;
    craving: string;
    response: string;
    reward: string;
  };
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface RoutineBlock {
  id: string;
  name: string;
  emoji: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Completion {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD"
  done: boolean;
  skipped: boolean;
  durationSec?: number;
  xpEarned: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface TimerSession {
  id: string;
  habitId: string;
  date: string;
  startedAt: string;
  pausedAt?: string;
  resumedAt?: string;
  endedAt?: string;
  totalSeconds: number;
  status: 'running' | 'paused' | 'stopped';
  createdAt: string;
  updatedAt: string;
}

export interface Relapse {
  id: string;
  habitId: string;
  date: string;
  time: string;
  cue: string;
  craving: string;
  response: string;
  reward: string;
  intensity: number; // 1-5
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type ThemeName = 'mint' | 'sunset' | 'grape';
export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  surface: string;
  surfaceHover: string;
  primary: string;
  primaryLight: string;
  primaryFaded: string;
  secondary: string;
  secondaryFaded: string;
  accent: string;
  accentFaded: string;
  danger: string;
  success: string;
  warning: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  shadow: string;
  gradient: string;
  gradientSubtle: string;
}

export interface StreakInfo {
  current: number;
  best: number;
}

export interface XPInfo {
  totalXP: number;
  todayXP: number;
  level: number;
  levelProgress: number; // 0-100 percentage within current level
  xpToNextLevel: number;
}

export interface HabitWithStats extends Habit {
  strength: number;
  streak: StreakInfo;
  todayCompletion?: Completion;
  todayTimer?: TimerSession;
}
