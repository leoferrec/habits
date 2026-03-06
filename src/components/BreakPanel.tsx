import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Shield,
  Check,
  AlertTriangle,
  Flame,
  ArrowRight,
  Pin,
  PinOff,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { calculateStrength, calculateStreak, getTodayStr } from '../logic';

interface Props {
  isDesktop: boolean;
}

export default function BreakPanel({ isDesktop }: Props) {
  const {
    habits,
    completions,
    relapses,
    todayHabits,
    toggleHabitDone,
    setBreakPanelOpen,
    breakPanelPinned,
    toggleBreakPanelPinned,
  } = useStore();
  const navigate = useNavigate();

  const todayStr = getTodayStr();

  // Get break habits scheduled for today
  const breakHabitsToday = todayHabits.filter(h => h.type === 'break');

  // Count unchecked break habits
  const uncheckedCount = breakHabitsToday.filter(h => !h.todayCompletion?.done).length;

  const handleClose = () => {
    setBreakPanelOpen(false);
  };

  const handleGoToBreak = () => {
    handleClose();
    navigate('/break');
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {!isDesktop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55]"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="fixed top-0 right-0 bottom-0 z-[60] flex flex-col overflow-hidden"
        style={{
          width: isDesktop ? '320px' : 'calc(100% - 60px)',
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border-light)',
          boxShadow: '-4px 0 24px var(--color-shadow)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--color-border-light)' }}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: 'var(--color-secondary)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              Break Habits
            </h3>
            {uncheckedCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-secondary-faded)', color: 'var(--color-secondary)' }}
              >
                {uncheckedCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isDesktop && (
              <button
                onClick={toggleBreakPanelPinned}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: breakPanelPinned ? 'var(--color-secondary-faded)' : 'var(--color-bg-secondary)',
                  color: breakPanelPinned ? 'var(--color-secondary)' : 'var(--color-text-muted)',
                }}
                title={breakPanelPinned ? 'Unpin panel' : 'Pin panel'}
              >
                {breakPanelPinned ? <Pin size={13} /> : <PinOff size={13} />}
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
              <X size={14} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {breakHabitsToday.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🛡️</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                No break habits for today
              </p>
            </div>
          ) : (
            breakHabitsToday.map((habit) => {
              const isDone = habit.todayCompletion?.done ?? false;
              const habitRelapses = relapses.filter(r => r.habitId === habit.id);
              const todayRelapse = habitRelapses.find(r => r.date === todayStr);

              return (
                <div
                  key={habit.id}
                  className="rounded-xl p-3 transition-all"
                  style={{
                    backgroundColor: isDone ? 'var(--color-bg-secondary)' : 'var(--color-surface)',
                    border: `1px solid ${isDone ? 'var(--color-success)' : 'var(--color-border-light)'}`,
                    borderLeft: `3px solid ${isDone ? 'var(--color-success)' : todayRelapse ? 'var(--color-danger)' : 'var(--color-secondary)'}`,
                    opacity: isDone ? 0.75 : 1,
                  }}
                >
                  {/* Habit header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{habit.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-xs font-semibold truncate ${isDone ? 'line-through' : ''}`}
                        style={{ color: isDone ? 'var(--color-text-muted)' : 'var(--color-text)' }}
                      >
                        {habit.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--color-secondary)' }}>
                          <Flame size={9} />
                          <span className="tabular-nums">{habit.streak.current}d</span>
                        </div>
                        <span className="text-[10px] tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                          {habit.strength}% strength
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Habit loop preview */}
                  {habit.habitLoop && (
                    <div
                      className="flex items-center gap-1.5 text-[9px] font-medium rounded-lg px-2 py-1 mb-2 overflow-hidden"
                      style={{ backgroundColor: 'var(--color-secondary-faded)', color: 'var(--color-text-muted)' }}
                    >
                      <span className="truncate" style={{ color: 'var(--color-secondary)' }}>{habit.habitLoop.cue}</span>
                      <ArrowRight size={7} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                      <span className="truncate">{habit.habitLoop.response}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!isDone && !todayRelapse && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleHabitDone(habit.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                        style={{
                          backgroundColor: 'var(--color-success)',
                          color: '#fff',
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                        Avoided
                      </button>
                      <button
                        onClick={handleGoToBreak}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--color-danger)',
                        }}
                      >
                        <AlertTriangle size={12} />
                        Failed
                      </button>
                    </div>
                  )}

                  {isDone && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--color-success)' }}>
                      <Check size={13} strokeWidth={3} />
                      Avoided today
                    </div>
                  )}

                  {todayRelapse && !isDone && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--color-danger)' }}>
                      <AlertTriangle size={13} />
                      Relapse logged
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3"
          style={{ borderTop: '1px solid var(--color-border-light)' }}
        >
          <button
            onClick={handleGoToBreak}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
            style={{
              backgroundColor: 'var(--color-secondary-faded)',
              color: 'var(--color-secondary)',
            }}
          >
            View History & Log Relapse
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </>
  );
}
