import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Flame,
  Trophy,
  Play,
  Pause,
  Square,
  Timer,
  Sprout,
  Shield,
  ChevronRight,
  AlertTriangle,
  Bell,
  ArrowRight,
  Gift,
} from 'lucide-react';
import type { HabitWithStats } from '../types';
import { useStore } from '../store';
import { getStrengthLabel } from '../logic';

interface Props {
  habit: HabitWithStats;
  index: number;
  onViewDetail?: (id: string) => void;
}

export default function HabitCard({ habit, index, onViewDetail }: Props) {
  const { toggleHabitDone, startTimer, pauseTimer, resumeTimer, stopTimer } = useStore();
  const isDone = habit.todayCompletion?.done ?? false;
  const isBreak = habit.type === 'break';

  // Never miss twice logic
  const showNeverMissTwice = !isDone && habit.streak.current === 0 && habit.strength > 0;

  // Timer state
  const timerSession = habit.todayTimer;
  const isTimerRunning = timerSession?.status === 'running';
  const isTimerPaused = timerSession?.status === 'paused';
  const isDurationHabit = habit.completionMethod === 'duration';

  // Live timer display
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isTimerRunning && timerSession) {
      const startTime = new Date(timerSession.resumedAt || timerSession.startedAt).getTime();
      const base = timerSession.totalSeconds;

      const update = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setDisplaySeconds(base + elapsed);
      };
      update();
      intervalRef.current = setInterval(update, 1000);
      return () => clearInterval(intervalRef.current);
    } else if (timerSession) {
      setDisplaySeconds(timerSession.totalSeconds);
    } else {
      setDisplaySeconds(0);
    }
  }, [isTimerRunning, timerSession]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const strengthPercent = habit.strength;
  const strengthLabel = getStrengthLabel(strengthPercent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
      className={`relative rounded-2xl p-4 tap-highlight transition-all duration-200 ${
        isDone ? 'opacity-80' : ''
      }`}
      style={{
        backgroundColor: isDone ? 'var(--color-bg-secondary)' : 'var(--color-surface)',
        borderTop: `1px solid ${isDone ? 'var(--color-primary-light)' : 'var(--color-border-light)'}`,
        borderRight: `1px solid ${isDone ? 'var(--color-primary-light)' : 'var(--color-border-light)'}`,
        borderBottom: `1px solid ${isDone ? 'var(--color-primary-light)' : 'var(--color-border-light)'}`,
        borderLeft: `4px solid ${isBreak ? 'var(--color-secondary)' : 'var(--color-primary)'}`,
        boxShadow: isDone
          ? 'none'
          : '0 2px 8px var(--color-shadow)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Completion button */}
        <button
          onClick={() => {
            if (isDurationHabit && !isDone) return; // Use timer instead
            toggleHabitDone(habit.id);
          }}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
            isDurationHabit && !isDone ? 'cursor-default' : 'cursor-pointer active:scale-90'
          }`}
          style={{
            backgroundColor: isDone
              ? isBreak ? 'var(--color-secondary)' : 'var(--color-primary)'
              : 'transparent',
            color: isDone ? '#fff' : isBreak ? 'var(--color-secondary)' : 'var(--color-primary)',
            border: isDone
              ? 'none'
              : isDurationHabit
                ? '2px dashed var(--color-border-light)'
                : `2px solid ${isBreak ? 'var(--color-secondary)' : 'var(--color-primary)'}`,
          }}
          title={isDurationHabit && !isDone ? 'Use the timer to complete' : isDone ? 'Undo completion' : 'Mark as done'}
        >
          {isDone ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Check size={20} strokeWidth={3} />
            </motion.div>
          ) : isDurationHabit ? (
            <Timer size={16} style={{ color: 'var(--color-text-muted)' }} />
          ) : (
            <motion.div
              className="rounded-md"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                border: `2px solid ${isBreak ? 'var(--color-secondary)' : 'var(--color-primary)'}`,
                backgroundColor: 'transparent',
              }}
            />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`text-sm font-semibold truncate ${isDone ? 'line-through' : ''}`}
              style={{ color: isDone ? 'var(--color-text-muted)' : 'var(--color-text)' }}
            >
              {habit.name}
            </h3>
            {showNeverMissTwice && (
              <span
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-danger)',
                }}
              >
                <AlertTriangle size={10} />
                Don't miss twice!
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-1.5">
            {/* Streak */}
            <div
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: habit.streak.current > 0 ? 'var(--color-secondary)' : 'var(--color-text-muted)' }}
            >
              <Flame size={12} />
              <span className="tabular-nums">{habit.streak.current}d</span>
            </div>

            {/* Best streak */}
            <div
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Trophy size={11} />
              <span className="tabular-nums">{habit.streak.best}d</span>
            </div>

            {/* Strength mini bar */}
            <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--color-border-light)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strengthPercent}%` }}
                  transition={{ delay: index * 0.05 + 0.3, duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: strengthPercent >= 60
                      ? 'var(--color-primary)'
                      : strengthPercent >= 30
                        ? 'var(--color-warning)'
                        : 'var(--color-text-muted)',
                  }}
                />
              </div>
              <span
                className="text-[10px] font-semibold tabular-nums w-7 text-right"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {strengthPercent}%
              </span>
            </div>
          </div>

          {/* Duration Timer */}
          {isDurationHabit && !isDone && (
            <div className="flex items-center gap-2 mt-2.5">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold tabular-nums ${
                  isTimerRunning ? 'timer-running' : ''
                }`}
                style={{
                  backgroundColor: isTimerRunning
                    ? 'var(--color-primary-faded)'
                    : 'var(--color-bg-secondary)',
                  color: isTimerRunning ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                }}
              >
                <Timer size={14} />
                <span>{formatTime(displaySeconds)}</span>
                {habit.targetDurationMin && (
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    / {habit.targetDurationMin}m
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {!isTimerRunning && !isTimerPaused && (
                  <button
                    onClick={() => startTimer(habit.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                )}
                {isTimerRunning && (
                  <button
                    onClick={() => pauseTimer(habit.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    style={{ backgroundColor: 'var(--color-warning)', color: '#fff' }}
                  >
                    <Pause size={14} fill="currentColor" />
                  </button>
                )}
                {isTimerPaused && (
                  <button
                    onClick={() => resumeTimer(habit.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                )}
                {(isTimerRunning || isTimerPaused) && (
                  <button
                    onClick={() => stopTimer(habit.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}
                  >
                    <Square size={12} fill="currentColor" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Type indicator & detail arrow */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: isBreak
                ? 'var(--color-secondary-faded)'
                : 'var(--color-primary-faded)',
              color: isBreak ? 'var(--color-secondary)' : 'var(--color-primary)',
            }}
          >
            {isBreak ? <Shield size={12} /> : <Sprout size={12} />}
          </div>
        </div>
      </div>

      {/* Law tag */}
      {habit.lawTag && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize"
            style={{
              backgroundColor: 'var(--color-primary-faded)',
              color: 'var(--color-primary)',
            }}
          >
            Make it {habit.lawTag}
          </span>
          {habit.anchorHabitId && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: 'var(--color-accent-faded)',
                color: 'var(--color-accent)',
              }}
            >
              Stacked
            </span>
          )}
        </div>
      )}

      {/* Trigger → Habit → Reward flow (3-card) */}
      {!isBreak && (habit.trigger || habit.reward) && (
        <div className="mt-3 flex items-stretch gap-1.5">
          {/* Trigger card */}
          {habit.trigger && (
            <>
              <div
                className="flex-1 rounded-xl px-2.5 py-2 flex flex-col items-center gap-1 min-w-0"
                style={{
                  backgroundColor: 'var(--color-secondary-faded)',
                  border: '1px solid var(--color-border-light)',
                }}
              >
                <Bell size={12} style={{ color: 'var(--color-secondary)' }} />
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-secondary)' }}
                >
                  Trigger
                </span>
                <span
                  className="text-[10px] text-center leading-tight font-medium truncate w-full"
                  style={{ color: 'var(--color-text-secondary)' }}
                  title={habit.trigger}
                >
                  {habit.trigger}
                </span>
              </div>
              <div className="flex items-center flex-shrink-0">
                <ArrowRight size={12} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </>
          )}

          {/* Habit card (center) */}
          <div
            className="flex-1 rounded-xl px-2.5 py-2 flex flex-col items-center gap-1 min-w-0"
            style={{
              backgroundColor: 'var(--color-primary-faded)',
              border: '1px solid var(--color-border-light)',
            }}
          >
            <span className="text-sm">{habit.emoji}</span>
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--color-primary)' }}
            >
              Habit
            </span>
            <span
              className="text-[10px] text-center leading-tight font-medium truncate w-full"
              style={{ color: 'var(--color-text-secondary)' }}
              title={habit.name}
            >
              {habit.name}
            </span>
          </div>

          {/* Reward card */}
          {habit.reward && (
            <>
              <div className="flex items-center flex-shrink-0">
                <ArrowRight size={12} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <div
                className="flex-1 rounded-xl px-2.5 py-2 flex flex-col items-center gap-1 min-w-0"
                style={{
                  backgroundColor: 'var(--color-accent-faded)',
                  border: '1px solid var(--color-border-light)',
                }}
              >
                <Gift size={12} style={{ color: 'var(--color-accent)' }} />
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Reward
                </span>
                <span
                  className="text-[10px] text-center leading-tight font-medium truncate w-full"
                  style={{ color: 'var(--color-text-secondary)' }}
                  title={habit.reward}
                >
                  {habit.reward}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
