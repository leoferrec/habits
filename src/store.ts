import { create } from 'zustand';
import { format } from 'date-fns';
import type { Habit, RoutineBlock, Completion, TimerSession, Relapse, ThemeName, ColorMode, HabitWithStats, XPInfo } from './types';
import { habitRepo, routineRepo, completionRepo, timerRepo, relapseRepo, db } from './db';
import { calculateStrength, calculateStreak, getXPInfo, getTodayStr, isHabitScheduledForDate } from './logic';
import { applyTheme } from './theme';

interface AppState {
  // Data
  habits: Habit[];
  routineBlocks: RoutineBlock[];
  completions: Completion[];
  relapses: Relapse[];
  timerSessions: TimerSession[];

  // Derived
  todayHabits: HabitWithStats[];
  xpInfo: XPInfo;

  // UI
  theme: ThemeName;
  colorMode: ColorMode;
  toasts: Array<{ id: string; message: string; type: 'xp' | 'info' | 'success' | 'warning' }>;
  showConfetti: boolean;
  stackedPromptHabitId: string | null;
  isLoading: boolean;
  breakPanelOpen: boolean;
  breakPanelPinned: boolean;

  // Actions
  loadAll: () => Promise<void>;
  setTheme: (theme: ThemeName) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  toggleBreakPanel: () => void;
  setBreakPanelOpen: (open: boolean) => void;
  toggleBreakPanelPinned: () => void;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (id: string, changes: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  addRoutineBlock: (block: RoutineBlock) => Promise<void>;
  updateRoutineBlock: (id: string, changes: Partial<RoutineBlock>) => Promise<void>;
  deleteRoutineBlock: (id: string) => Promise<void>;
  linkHabitToBlock: (habitId: string, blockId: string) => Promise<void>;
  unlinkHabitFromBlock: (habitId: string, blockId: string) => Promise<void>;
  reorderHabitInBlock: (habitId: string, blockId: string, direction: 'up' | 'down') => Promise<void>;
  toggleHabitDone: (habitId: string) => Promise<void>;
  logRelapse: (relapse: Relapse) => Promise<void>;
  startTimer: (habitId: string) => Promise<void>;
  pauseTimer: (habitId: string) => Promise<void>;
  resumeTimer: (habitId: string) => Promise<void>;
  stopTimer: (habitId: string) => Promise<void>;
  addToast: (message: string, type?: 'xp' | 'info' | 'success' | 'warning') => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;
  setStackedPrompt: (habitId: string | null) => void;
  refreshTodayHabits: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  habits: [],
  routineBlocks: [],
  completions: [],
  relapses: [],
  timerSessions: [],
  todayHabits: [],
  xpInfo: { totalXP: 0, todayXP: 0, level: 1, levelProgress: 0, xpToNextLevel: 100 },
  theme: (localStorage.getItem('theme') as ThemeName) || 'mint',
  colorMode: (localStorage.getItem('colorMode') as ColorMode) || 'light',
  toasts: [],
  showConfetti: false,
  stackedPromptHabitId: null,
  isLoading: true,
  breakPanelOpen: false,
  breakPanelPinned: localStorage.getItem('breakPanelPinned') === 'true',

  loadAll: async () => {
    const [habits, routineBlocks] = await Promise.all([
      habitRepo.getAll(),
      routineRepo.getAll(),
    ]);

    // Load all completions and relapses
    const allCompletions = await db.completions.filter(c => !c.deletedAt).toArray();
    const allRelapses = await db.relapses.filter(r => !r.deletedAt).toArray();

    const today = getTodayStr();
    const xpInfo = getXPInfo(allCompletions, today);

    // Apply saved theme
    const savedTheme = (localStorage.getItem('theme') as ThemeName) || 'mint';
    const savedColorMode = (localStorage.getItem('colorMode') as ColorMode) || 'light';
    applyTheme(savedTheme, savedColorMode);

    set({
      habits,
      routineBlocks,
      completions: allCompletions,
      relapses: allRelapses,
      xpInfo,
      theme: savedTheme,
      colorMode: savedColorMode,
      isLoading: false,
    });

    // Refresh today's habits with stats
    await get().refreshTodayHabits();
  },

  refreshTodayHabits: async () => {
    const { habits, completions, relapses } = get();
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    const todayHabits: HabitWithStats[] = [];

    for (const habit of habits) {
      if (!isHabitScheduledForDate(habit, today)) continue;

      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      const habitRelapses = relapses.filter(r => r.habitId === habit.id);
      const todayCompletion = habitCompletions.find(c => c.date === todayStr);
      const todayTimer = await timerRepo.getByHabitAndDate(habit.id, todayStr);

      const strength = calculateStrength(habitCompletions, habitRelapses, habit.type, today);
      const streak = calculateStreak(habitCompletions, habitRelapses, habit.type, today);

      todayHabits.push({
        ...habit,
        strength,
        streak,
        todayCompletion,
        todayTimer: todayTimer || undefined,
      });
    }

    // Sort by routine block order then sort order
    todayHabits.sort((a, b) => a.sortOrder - b.sortOrder);

    const xpInfo = getXPInfo(completions, todayStr);
    set({ todayHabits, xpInfo });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme, get().colorMode);
    set({ theme });
  },

  setColorMode: (mode) => {
    localStorage.setItem('colorMode', mode);
    applyTheme(get().theme, mode);
    set({ colorMode: mode });
  },

  toggleColorMode: () => {
    const newMode = get().colorMode === 'light' ? 'dark' : 'light';
    get().setColorMode(newMode);
  },

  toggleBreakPanel: () => {
    set(s => ({ breakPanelOpen: !s.breakPanelOpen }));
  },

  setBreakPanelOpen: (open) => {
    set({ breakPanelOpen: open });
  },

  toggleBreakPanelPinned: () => {
    const newVal = !get().breakPanelPinned;
    localStorage.setItem('breakPanelPinned', String(newVal));
    set({ breakPanelPinned: newVal });
  },

  addHabit: async (habit) => {
    await habitRepo.create(habit);
    const habits = await habitRepo.getAll();
    set({ habits });
    await get().refreshTodayHabits();
  },

  updateHabit: async (id, changes) => {
    await habitRepo.update(id, changes);
    const habits = await habitRepo.getAll();
    set({ habits });
    await get().refreshTodayHabits();
  },

  deleteHabit: async (id) => {
    await habitRepo.softDelete(id);
    const habits = await habitRepo.getAll();
    set({ habits });
    await get().refreshTodayHabits();
  },

  addRoutineBlock: async (block) => {
    await routineRepo.create(block);
    const routineBlocks = await routineRepo.getAll();
    set({ routineBlocks });
  },

  updateRoutineBlock: async (id, changes) => {
    await routineRepo.update(id, changes);
    const routineBlocks = await routineRepo.getAll();
    set({ routineBlocks });
  },

  deleteRoutineBlock: async (id) => {
    await routineRepo.softDelete(id);
    const routineBlocks = await routineRepo.getAll();
    set({ routineBlocks });
  },

  linkHabitToBlock: async (habitId, blockId) => {
    const habit = get().habits.find(h => h.id === habitId);
    if (!habit) return;
    if (habit.routineBlockIds.includes(blockId)) return;
    await habitRepo.update(habitId, {
      routineBlockIds: [...habit.routineBlockIds, blockId],
    });
    const habits = await habitRepo.getAll();
    set({ habits });
    await get().refreshTodayHabits();
  },

  unlinkHabitFromBlock: async (habitId, blockId) => {
    const habit = get().habits.find(h => h.id === habitId);
    if (!habit) return;
    await habitRepo.update(habitId, {
      routineBlockIds: habit.routineBlockIds.filter(id => id !== blockId),
    });
    const habits = await habitRepo.getAll();
    set({ habits });
    await get().refreshTodayHabits();
  },

  reorderHabitInBlock: async (habitId, blockId, direction) => {
    const { habits } = get();
    const blockHabits = habits
      .filter(h => h.routineBlockIds.includes(blockId))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const idx = blockHabits.findIndex(h => h.id === habitId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= blockHabits.length) return;

    const current = blockHabits[idx];
    const swap = blockHabits[swapIdx];

    await Promise.all([
      habitRepo.update(current.id, { sortOrder: swap.sortOrder }),
      habitRepo.update(swap.id, { sortOrder: current.sortOrder }),
    ]);

    const updatedHabits = await habitRepo.getAll();
    set({ habits: updatedHabits });
    await get().refreshTodayHabits();
  },

  toggleHabitDone: async (habitId) => {
    const { habits, completions } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const todayStr = getTodayStr();
    const existing = completions.find(c => c.habitId === habitId && c.date === todayStr);

    if (existing?.done) {
      // Undo
      await completionRepo.unmarkDone(habitId, todayStr);
    } else {
      // Mark done
      const completion = await completionRepo.markDone(habitId, todayStr, habit.xpPerCompletion);

      // Show XP toast + confetti
      get().addToast(`+${habit.xpPerCompletion} XP`, 'xp');
      get().triggerConfetti();

      // Check for stacked habits (habits anchored to this one)
      const stackedHabits = habits.filter(h => h.anchorHabitId === habitId);
      if (stackedHabits.length > 0) {
        // Show stacked prompt for the first stacked habit
        setTimeout(() => {
          get().setStackedPrompt(stackedHabits[0].id);
        }, 800);
      }
    }

    // Reload completions
    const allCompletions = await db.completions.filter(c => !c.deletedAt).toArray();
    set({ completions: allCompletions });
    await get().refreshTodayHabits();
  },

  logRelapse: async (relapse) => {
    await relapseRepo.create(relapse);
    const allRelapses = await db.relapses.filter(r => !r.deletedAt).toArray();
    set({ relapses: allRelapses });
    await get().refreshTodayHabits();
  },

  startTimer: async (habitId) => {
    const todayStr = getTodayStr();
    const now = new Date().toISOString();
    const session: TimerSession = {
      id: crypto.randomUUID(),
      habitId,
      date: todayStr,
      startedAt: now,
      totalSeconds: 0,
      status: 'running',
      createdAt: now,
      updatedAt: now,
    };
    await timerRepo.upsert(session);
    await get().refreshTodayHabits();
  },

  pauseTimer: async (habitId) => {
    const todayStr = getTodayStr();
    const session = await timerRepo.getByHabitAndDate(habitId, todayStr);
    if (!session || session.status !== 'running') return;

    const now = new Date();
    const startedAt = new Date(session.pausedAt ? session.resumedAt! : session.startedAt);
    const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

    await timerRepo.upsert({
      ...session,
      pausedAt: now.toISOString(),
      totalSeconds: session.totalSeconds + elapsed,
      status: 'paused',
      updatedAt: now.toISOString(),
    });
    await get().refreshTodayHabits();
  },

  resumeTimer: async (habitId) => {
    const todayStr = getTodayStr();
    const session = await timerRepo.getByHabitAndDate(habitId, todayStr);
    if (!session || session.status !== 'paused') return;

    const now = new Date().toISOString();
    await timerRepo.upsert({
      ...session,
      resumedAt: now,
      status: 'running',
      updatedAt: now,
    });
    await get().refreshTodayHabits();
  },

  stopTimer: async (habitId) => {
    const todayStr = getTodayStr();
    const session = await timerRepo.getByHabitAndDate(habitId, todayStr);
    if (!session) return;

    const now = new Date();
    let finalSeconds = session.totalSeconds;

    if (session.status === 'running') {
      const startedAt = new Date(session.resumedAt || session.startedAt);
      finalSeconds += Math.floor((now.getTime() - startedAt.getTime()) / 1000);
    }

    await timerRepo.upsert({
      ...session,
      endedAt: now.toISOString(),
      totalSeconds: finalSeconds,
      status: 'stopped',
      updatedAt: now.toISOString(),
    });

    // Also mark completion with duration
    const habit = get().habits.find(h => h.id === habitId);
    if (habit) {
      const completion: Completion = {
        id: crypto.randomUUID(),
        habitId,
        date: todayStr,
        done: true,
        skipped: false,
        durationSec: finalSeconds,
        xpEarned: habit.xpPerCompletion,
        completedAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      await completionRepo.upsert(completion);
      get().addToast(`+${habit.xpPerCompletion} XP`, 'xp');
      get().triggerConfetti();

      // Check stacked
      const stackedHabits = get().habits.filter(h => h.anchorHabitId === habitId);
      if (stackedHabits.length > 0) {
        setTimeout(() => get().setStackedPrompt(stackedHabits[0].id), 800);
      }
    }

    const allCompletions = await db.completions.filter(c => !c.deletedAt).toArray();
    set({ completions: allCompletions });
    await get().refreshTodayHabits();
  },

  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 3000);
  },

  removeToast: (id) => {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
  },

  triggerConfetti: () => {
    set({ showConfetti: true });
    setTimeout(() => set({ showConfetti: false }), 1200);
  },

  setStackedPrompt: (habitId) => {
    set({ stackedPromptHabitId: habitId });
  },
}));
