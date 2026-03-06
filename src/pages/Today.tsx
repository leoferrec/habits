import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useStore } from '../store';
import HabitCard from '../components/HabitCard';
import StackedPrompt from '../components/StackedPrompt';

export default function Today() {
  const { todayHabits, xpInfo, routineBlocks } = useStore();
  const today = new Date();
  const dateLabel = format(today, 'EEEE, MMMM d');

  const completedCount = todayHabits.filter(h => h.todayCompletion?.done).length;
  const totalCount = todayHabits.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group habits by routine block
  const habitsByBlock: Record<string, typeof todayHabits> = {};
  const unblocked: typeof todayHabits = [];

  todayHabits.forEach(h => {
    if (h.routineBlockIds.length > 0) {
      const blockId = h.routineBlockIds[0];
      if (!habitsByBlock[blockId]) habitsByBlock[blockId] = [];
      habitsByBlock[blockId].push(h);
    } else {
      unblocked.push(h);
    }
  });

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Date & Progress header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          {dateLabel}
        </p>
        <h2 className="text-2xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>
          Today's Habits
        </h2>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid grid-cols-3 gap-3"
      >
        {/* Progress */}
        <div
          className="rounded-2xl p-3 text-center"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 2px 8px var(--color-shadow)',
          }}
        >
          <div className="relative w-12 h-12 mx-auto mb-1.5">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-border-light)" strokeWidth="4" />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - completionPercent / 100)}`}
                strokeLinecap="round"
                className="strength-ring"
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums"
              style={{ color: 'var(--color-primary)' }}
            >
              {completionPercent}%
            </span>
          </div>
          <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {completedCount}/{totalCount} Done
          </p>
        </div>

        {/* Today XP */}
        <div
          className="rounded-2xl p-3 text-center"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 2px 8px var(--color-shadow)',
          }}
        >
          <div
            className="w-12 h-12 mx-auto mb-1.5 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary-faded)' }}
          >
            <Zap size={22} style={{ color: 'var(--color-primary)' }} />
          </div>
          <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
            {xpInfo.todayXP}
          </p>
          <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
            XP Today
          </p>
        </div>

        {/* Level */}
        <div
          className="rounded-2xl p-3 text-center"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 2px 8px var(--color-shadow)',
          }}
        >
          <div
            className="w-12 h-12 mx-auto mb-1.5 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }}
          >
            <Sparkles size={22} style={{ color: 'var(--color-accent)' }} />
          </div>
          <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
            Lv {xpInfo.level}
          </p>
          <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {xpInfo.xpToNextLevel} XP to next
          </p>
        </div>
      </motion.div>

      {/* Habits by routine block */}
      {routineBlocks.map((block) => {
        const blockHabits = habitsByBlock[block.id];
        if (!blockHabits || blockHabits.length === 0) return null;

        return (
          <div key={block.id} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="text-base">{block.emoji}</span>
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                {block.name}
              </h3>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {block.startTime} – {block.endTime}
              </span>
            </div>
            <div className="space-y-2">
              {blockHabits.map((habit, i) => (
                <HabitCard key={habit.id} habit={habit} index={i} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Unblocked habits */}
      {unblocked.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <CalendarCheck size={14} style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Anytime
            </h3>
          </div>
          <div className="space-y-2">
            {unblocked.map((habit, i) => (
              <HabitCard key={habit.id} habit={habit} index={i + Object.keys(habitsByBlock).length} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayHabits.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            No habits yet
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Head to the Habits tab to create your first habit!
          </p>
        </motion.div>
      )}

      {/* Stacked habit prompt */}
      <StackedPrompt />
    </div>
  );
}
