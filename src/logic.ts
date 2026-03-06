import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns';
import type { Completion, Relapse, HabitType, StreakInfo, XPInfo } from './types';

// ---- Habit Strength Score ----
// 28-day weighted window: recent days count more
const WINDOW_DAYS = 28;
const WEIGHTS: Record<string, number> = {
  '0-6': 1.0,   // days 1-7
  '7-13': 0.7,  // days 8-14
  '14-20': 0.4, // days 15-21
  '21-27': 0.2, // days 22-28
};

function getWeight(dayIndex: number): number {
  if (dayIndex <= 6) return 1.0;
  if (dayIndex <= 13) return 0.7;
  if (dayIndex <= 20) return 0.4;
  return 0.2;
}

export function calculateStrength(
  completions: Completion[],
  relapses: Relapse[],
  habitType: HabitType,
  today: Date = new Date()
): number {
  const todayStr = format(today, 'yyyy-MM-dd');
  const completionMap = new Map<string, Completion>();
  completions.forEach((c) => completionMap.set(c.date, c));

  const relapseMap = new Map<string, boolean>();
  relapses.forEach((r) => relapseMap.set(r.date, true));

  let weightedSuccess = 0;
  let totalWeight = 0;

  for (let i = 0; i < WINDOW_DAYS; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    const weight = getWeight(i);
    totalWeight += weight;

    if (habitType === 'build') {
      const completion = completionMap.get(date);
      if (completion?.done) {
        weightedSuccess += weight;
      }
    } else {
      // break habit: success = no relapse that day
      if (!relapseMap.has(date)) {
        weightedSuccess += weight;
      }
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((100 * weightedSuccess) / totalWeight);
}

// ---- Streak Calculation ----
export function calculateStreak(
  completions: Completion[],
  relapses: Relapse[],
  habitType: HabitType,
  today: Date = new Date()
): StreakInfo {
  if (habitType === 'build') {
    return calculateBuildStreak(completions, today);
  }
  return calculateBreakStreak(relapses, today);
}

function calculateBuildStreak(completions: Completion[], today: Date): StreakInfo {
  const doneSet = new Set(
    completions.filter((c) => c.done).map((c) => c.date)
  );

  // Current streak: count consecutive days ending today or yesterday
  let current = 0;
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

  // Start from today, walk backwards
  let startDay = doneSet.has(todayStr) ? 0 : (doneSet.has(yesterdayStr) ? 1 : -1);
  if (startDay >= 0) {
    for (let i = startDay; ; i++) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
      if (doneSet.has(dateStr)) {
        current++;
      } else {
        break;
      }
    }
  }

  // Best streak: walk through all completions sorted by date
  const sortedDates = Array.from(doneSet).sort();
  let best = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const date = parseISO(dateStr);
    if (prevDate && differenceInCalendarDays(date, prevDate) === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    best = Math.max(best, tempStreak);
    prevDate = date;
  }

  return { current, best };
}

function calculateBreakStreak(relapses: Relapse[], today: Date): StreakInfo {
  const relapseDates = new Set(relapses.map((r) => r.date));

  // Current streak: days since last relapse
  let current = 0;
  for (let i = 0; i < 365; i++) {
    const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
    if (relapseDates.has(dateStr)) {
      break;
    }
    current++;
  }

  // Best streak: find longest gap between relapse dates
  const sortedRelapseDates = Array.from(relapseDates).sort();
  let best = current; // Current streak might be the best

  if (sortedRelapseDates.length === 0) {
    return { current, best: current };
  }

  for (let i = 0; i < sortedRelapseDates.length - 1; i++) {
    const gap = differenceInCalendarDays(
      parseISO(sortedRelapseDates[i + 1]),
      parseISO(sortedRelapseDates[i])
    ) - 1;
    best = Math.max(best, gap);
  }

  return { current, best };
}

// ---- XP System ----
export function calculateTotalXP(completions: Completion[]): number {
  return completions
    .filter((c) => c.done && !c.deletedAt)
    .reduce((sum, c) => sum + c.xpEarned, 0);
}

export function calculateTodayXP(completions: Completion[], today: string): number {
  return completions
    .filter((c) => c.done && c.date === today && !c.deletedAt)
    .reduce((sum, c) => sum + c.xpEarned, 0);
}

export function getXPInfo(completions: Completion[], today: string): XPInfo {
  const totalXP = calculateTotalXP(completions);
  const todayXP = calculateTodayXP(completions, today);
  const level = Math.floor(totalXP / 100) + 1;
  const xpInCurrentLevel = totalXP % 100;
  const levelProgress = xpInCurrentLevel;
  const xpToNextLevel = 100 - xpInCurrentLevel;

  return { totalXP, todayXP, level, levelProgress, xpToNextLevel };
}

// ---- Date Helpers ----
export function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isHabitScheduledForDate(
  habit: { frequency: string; customDays?: number[] },
  date: Date
): boolean {
  const dayOfWeek = date.getDay(); // 0=Sun
  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom':
      return habit.customDays?.includes(dayOfWeek) ?? false;
    default:
      return true;
  }
}

// ---- Strength Label ----
export function getStrengthLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Growing';
  if (score >= 40) return 'Building';
  if (score >= 20) return 'Starting';
  return 'New';
}

export function getStrengthColor(score: number): string {
  if (score >= 80) return 'var(--color-success)';
  if (score >= 60) return 'var(--color-primary)';
  if (score >= 40) return 'var(--color-warning)';
  if (score >= 20) return 'var(--color-secondary)';
  return 'var(--color-text-muted)';
}
