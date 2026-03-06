import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Sprout,
  Shield,
  Flame,
  Trophy,
  Trash2,
  ChevronRight,
  Search,
  X,
  Zap,
  Link,
  Timer,
  CheckCircle,
  ShieldAlert,
  TrendingUp,
  ArrowRight,
  Bell,
  Gift,
} from 'lucide-react';
import type { Habit } from '../types';
import { useStore } from '../store';
import { getStrengthLabel } from '../logic';
import HabitWizard from '../components/HabitWizard';

export default function Habits() {
  const { habits, deleteHabit } = useStore();
  const [showWizard, setShowWizard] = useState(false);
  const [filter, setFilter] = useState<'all' | 'build' | 'break'>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = habits
    .filter(h => filter === 'all' || h.type === filter)
    .filter(h => h.name.toLowerCase().includes(search.toLowerCase()));

  const buildHabits = filtered.filter(h => h.type === 'build');
  const breakHabits = filtered.filter(h => h.type === 'break');

  const buildCount = habits.filter(h => h.type === 'build').length;
  const breakCount = habits.filter(h => h.type === 'break').length;

  const showGrouped = filter === 'all' && !search;

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            All Habits
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {buildCount} build · {breakCount} break
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform"
          style={{ background: 'var(--color-gradient)' }}
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)' }}
      >
        <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          placeholder="Search habits..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--color-text)' }}
        />
        {search && (
          <button onClick={() => setSearch('')}>
            <X size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(['all', 'build', 'break'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
            style={{
              backgroundColor: filter === f
                ? f === 'break' ? 'var(--color-secondary)' : 'var(--color-primary)'
                : 'var(--color-bg-secondary)',
              color: filter === f ? '#fff' : 'var(--color-text-secondary)',
              border: `1px solid ${
                filter === f
                  ? f === 'break' ? 'var(--color-secondary)' : 'var(--color-primary)'
                  : 'var(--color-border-light)'
              }`,
            }}
          >
            {f === 'build' && '🌱 '}{f === 'break' && '🛡️ '}{f}
          </button>
        ))}
      </div>

      {/* ─── BUILD SECTION ─── */}
      {(showGrouped ? buildHabits : filter !== 'break' ? buildHabits : []).length > 0 && (
        <div className="space-y-2.5">
          {showGrouped && (
            <div className="flex items-center gap-2 px-1">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary-faded)', color: 'var(--color-primary)' }}
              >
                <Sprout size={14} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                Build Habits
              </h3>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-faded)', color: 'var(--color-primary)' }}>
                {buildHabits.length}
              </span>
            </div>
          )}

          <AnimatePresence>
            {(showGrouped || filter !== 'break' ? buildHabits : []).map((habit, index) => (
              <BuildHabitCard
                key={habit.id}
                habit={habit}
                index={index}
                expanded={expandedId === habit.id}
                onToggleExpand={() => setExpandedId(expandedId === habit.id ? null : habit.id)}
                onDelete={deleteHabit}
                allHabits={habits}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ─── BREAK SECTION ─── */}
      {(showGrouped ? breakHabits : filter !== 'build' ? breakHabits : []).length > 0 && (
        <div className="space-y-2.5">
          {showGrouped && (
            <div className="flex items-center gap-2 px-1 mt-3">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-secondary-faded)', color: 'var(--color-secondary)' }}
              >
                <ShieldAlert size={14} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-secondary)' }}>
                Break Habits
              </h3>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-secondary-faded)', color: 'var(--color-secondary)' }}>
                {breakHabits.length}
              </span>
            </div>
          )}

          <AnimatePresence>
            {(showGrouped || filter !== 'build' ? breakHabits : []).map((habit, index) => (
              <BreakHabitCard
                key={habit.id}
                habit={habit}
                index={index}
                expanded={expandedId === habit.id}
                onToggleExpand={() => setExpandedId(expandedId === habit.id ? null : habit.id)}
                onDelete={deleteHabit}
                allHabits={habits}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {search ? 'No habits match your search' : 'No habits yet. Tap + to add one!'}
          </p>
        </div>
      )}

      {/* Wizard modal */}
      <AnimatePresence>
        {showWizard && <HabitWizard onClose={() => setShowWizard(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BUILD HABIT CARD — teal/green tinted design
   ═══════════════════════════════════════════════ */

interface HabitCardProps {
  habit: Habit;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onDelete: (id: string) => Promise<void>;
  allHabits: Habit[];
}

function BuildHabitCard({ habit, index, expanded, onToggleExpand, onDelete, allHabits }: HabitCardProps) {
  return (
    <motion.div
      key={habit.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--color-gradient-subtle)',
        borderTop: '1px solid var(--color-border-light)',
        borderRight: '1px solid var(--color-border-light)',
        borderBottom: '1px solid var(--color-border-light)',
        borderLeft: '4px solid var(--color-primary)',
        boxShadow: '0 2px 12px var(--color-shadow)',
      }}
    >
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex items-center gap-3 tap-highlight"
      >
        {/* Big emoji circle */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-primary-faded)' }}
        >
          <span className="text-xl">{habit.emoji}</span>
        </div>

        <div className="flex-1 text-left min-w-0">
          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {habit.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: 'var(--color-primary-faded)', color: 'var(--color-primary)' }}
            >
              <Sprout size={10} />
              BUILD
            </span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {habit.frequency}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>·</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {habit.completionMethod === 'duration' ? <Timer size={9} /> : <CheckCircle size={9} />}
              {habit.completionMethod}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
            <Zap size={13} />
            <span className="text-xs font-bold tabular-nums">+{habit.xpPerCompletion}</span>
          </div>
          {habit.anchorHabitId && (
            <div className="flex items-center gap-0.5" style={{ color: 'var(--color-accent)' }}>
              <Link size={9} />
              <span className="text-[9px] font-semibold">Stacked</span>
            </div>
          )}
        </div>

        <ChevronRight
          size={16}
          style={{ color: 'var(--color-text-muted)' }}
          className={`transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-2 space-y-3"
              style={{ borderTop: '1px solid var(--color-border-light)' }}
            >
              {habit.lawTag && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Law:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ backgroundColor: 'var(--color-primary-faded)', color: 'var(--color-primary)' }}>
                    Make it {habit.lawTag}
                  </span>
                </div>
              )}
              {habit.anchorHabitId && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Stacked after:</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                    {allHabits.find(h => h.id === habit.anchorHabitId)?.name || 'Unknown'}
                  </span>
                </div>
              )}
              {habit.completionMethod === 'duration' && habit.targetDurationMin && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Target:</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {habit.targetDurationMin} minutes
                  </span>
                </div>
              )}

              {/* Trigger → Habit → Reward flow */}
              {(habit.trigger || habit.reward) && (
                <div
                  className="rounded-xl p-3 flex items-center gap-2 flex-wrap"
                  style={{ backgroundColor: 'var(--color-primary-faded)', border: '1px solid var(--color-border-light)' }}
                >
                  {habit.trigger && (
                    <div className="flex items-center gap-1.5">
                      <Bell size={11} style={{ color: 'var(--color-secondary)' }} />
                      <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {habit.trigger}
                      </span>
                    </div>
                  )}
                  {habit.trigger && <ArrowRight size={10} style={{ color: 'var(--color-text-muted)' }} />}
                  <span className="text-[11px] font-bold" style={{ color: 'var(--color-primary)' }}>
                    {habit.emoji} {habit.name}
                  </span>
                  {habit.reward && <ArrowRight size={10} style={{ color: 'var(--color-text-muted)' }} />}
                  {habit.reward && (
                    <div className="flex items-center gap-1.5">
                      <Gift size={11} style={{ color: 'var(--color-accent)' }} />
                      <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {habit.reward}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => { if (confirm(`Delete "${habit.name}"?`)) onDelete(habit.id); }}
                className="flex items-center gap-1.5 text-xs font-medium mt-2 px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
              >
                <Trash2 size={12} />
                Delete Habit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   BREAK HABIT CARD — orange/amber warm design
   ═══════════════════════════════════════════════ */

function BreakHabitCard({ habit, index, expanded, onToggleExpand, onDelete, allHabits }: HabitCardProps) {
  return (
    <motion.div
      key={habit.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--color-secondary-faded)',
        borderTop: '1px solid var(--color-border-light)',
        borderRight: '1px solid var(--color-border-light)',
        borderBottom: '1px solid var(--color-border-light)',
        borderLeft: '4px solid var(--color-secondary)',
        boxShadow: '0 2px 12px var(--color-shadow)',
      }}
    >
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex items-center gap-3 tap-highlight"
      >
        {/* Big emoji circle — warm tint */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-secondary-faded)' }}
        >
          <span className="text-xl">{habit.emoji}</span>
        </div>

        <div className="flex-1 text-left min-w-0">
          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {habit.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: 'var(--color-secondary-faded)', color: 'var(--color-secondary)' }}
            >
              <Shield size={10} />
              BREAK
            </span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {habit.frequency}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1" style={{ color: 'var(--color-secondary)' }}>
            <Zap size={13} />
            <span className="text-xs font-bold tabular-nums">+{habit.xpPerCompletion}</span>
          </div>
        </div>

        <ChevronRight
          size={16}
          style={{ color: 'var(--color-text-muted)' }}
          className={`transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Habit Loop preview — always visible on break cards */}
      {habit.habitLoop && !expanded && (
        <div className="px-4 pb-3 -mt-1">
          <div
            className="flex items-center gap-2 text-[10px] font-medium rounded-lg px-2.5 py-1.5"
            style={{ backgroundColor: 'var(--color-secondary-faded)', color: 'var(--color-text-muted)' }}
          >
            <span style={{ color: 'var(--color-secondary)' }}>{habit.habitLoop.cue}</span>
            <ArrowRight size={8} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <span>{habit.habitLoop.craving}</span>
            <ArrowRight size={8} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <span>{habit.habitLoop.response}</span>
          </div>
        </div>
      )}

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-2 space-y-3"
              style={{ borderTop: '1px solid var(--color-border-light)' }}
            >
              {habit.lawTag && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Law:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ backgroundColor: 'var(--color-secondary-faded)', color: 'var(--color-secondary)' }}>
                    Make it {habit.lawTag}
                  </span>
                </div>
              )}

              {/* Full habit loop breakdown */}
              {habit.habitLoop && (
                <div
                  className="rounded-xl p-3 space-y-2"
                  style={{ backgroundColor: 'var(--color-secondary-faded)', border: '1px solid var(--color-border-light)' }}
                >
                  <p className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: 'var(--color-secondary)' }}>
                    <ShieldAlert size={12} />
                    Habit Loop
                  </p>
                  {(['cue', 'craving', 'response', 'reward'] as const).map((key, i) => (
                    <div key={key} className="flex gap-2 items-start">
                      <span
                        className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: 'var(--color-secondary-faded)', color: 'var(--color-secondary)' }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold capitalize block" style={{ color: 'var(--color-text-secondary)' }}>
                          {key}
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--color-text)' }}>
                          {habit.habitLoop![key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => { if (confirm(`Delete "${habit.name}"?`)) onDelete(habit.id); }}
                className="flex items-center gap-1.5 text-xs font-medium mt-2 px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
              >
                <Trash2 size={12} />
                Delete Habit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
