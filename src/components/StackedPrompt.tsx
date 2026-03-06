import { motion, AnimatePresence } from 'framer-motion';
import { Link, Play, CheckCircle, Clock, X } from 'lucide-react';
import { useStore } from '../store';

export default function StackedPrompt() {
  const { stackedPromptHabitId, habits, toggleHabitDone, startTimer, setStackedPrompt } = useStore();

  const habit = habits.find(h => h.id === stackedPromptHabitId);
  const anchorHabit = habit?.anchorHabitId ? habits.find(h => h.id === habit.anchorHabitId) : null;

  if (!habit || !stackedPromptHabitId) return null;

  const isDuration = habit.completionMethod === 'duration';

  const handleDone = async () => {
    if (!isDuration) {
      await toggleHabitDone(habit.id);
    }
    setStackedPrompt(null);
  };

  const handleStart = async () => {
    if (isDuration) {
      await startTimer(habit.id);
    }
    setStackedPrompt(null);
  };

  const handleSnooze = () => {
    setStackedPrompt(null);
    // Re-show after 10 minutes
    setTimeout(() => {
      setStackedPrompt(habit.id);
    }, 10 * 60 * 1000);

    // Show snooze toast
    useStore.getState().addToast('Snoozed • back in 10m', 'info');
  };

  return (
    <AnimatePresence>
      {stackedPromptHabitId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          onClick={() => setStackedPrompt(null)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setStackedPrompt(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}
            >
              <X size={16} />
            </button>

            {/* Stacking icon */}
            <div className="flex items-center justify-center mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--color-gradient)' }}
              >
                <Link size={24} className="text-white" />
              </div>
            </div>

            {/* Stacking statement */}
            <p
              className="text-center text-sm mb-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Habit Stack Triggered
            </p>
            <p
              className="text-center text-base font-semibold mb-6"
              style={{ color: 'var(--color-text)' }}
            >
              After{' '}
              <span style={{ color: 'var(--color-primary)' }}>
                {anchorHabit?.name || 'previous habit'}
              </span>
              , now do{' '}
              <span style={{ color: 'var(--color-accent)' }}>
                {habit.emoji} {habit.name}
              </span>
            </p>

            {/* Action buttons */}
            <div className="flex gap-3">
              {isDuration ? (
                <button
                  onClick={handleStart}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-[0.97]"
                  style={{ background: 'var(--color-gradient)' }}
                >
                  <Play size={18} fill="currentColor" />
                  Start Timer
                </button>
              ) : (
                <button
                  onClick={handleDone}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-[0.97]"
                  style={{ background: 'var(--color-gradient)' }}
                >
                  <CheckCircle size={18} />
                  Done
                </button>
              )}

              <button
                onClick={handleSnooze}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.97]"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Clock size={16} />
                10m
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
