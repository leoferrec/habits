import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  ShieldAlert,
  Plus,
  AlertTriangle,
  Clock,
  Flame,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';
import type { Relapse } from '../types';
import { useStore } from '../store';

export default function Break() {
  const { habits, relapses, logRelapse, addToast } = useStore();
  const [showLogger, setShowLogger] = useState(false);

  const breakHabits = habits.filter(h => h.type === 'break');

  // Form state
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [cue, setCue] = useState('');
  const [craving, setCraving] = useState('');
  const [response, setResponse] = useState('');
  const [reward, setReward] = useState('');
  const [notes, setNotes] = useState('');

  const selectedHabit = breakHabits.find(h => h.id === selectedHabitId);

  const handleSelectHabit = (id: string) => {
    const habit = breakHabits.find(h => h.id === id);
    setSelectedHabitId(id);
    if (habit?.habitLoop) {
      setCue(habit.habitLoop.cue);
      setCraving(habit.habitLoop.craving);
      setResponse(habit.habitLoop.response);
      setReward(habit.habitLoop.reward);
    }
  };

  const handleLog = async () => {
    if (!selectedHabitId) return;
    const now = new Date();
    const relapse: Relapse = {
      id: crypto.randomUUID(),
      habitId: selectedHabitId,
      date: format(now, 'yyyy-MM-dd'),
      time: format(now, 'HH:mm'),
      cue,
      craving,
      response,
      reward,
      intensity,
      notes,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    await logRelapse(relapse);
    addToast('Relapse logged. Keep going!', 'warning');
    setShowLogger(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedHabitId('');
    setIntensity(3);
    setCue('');
    setCraving('');
    setResponse('');
    setReward('');
    setNotes('');
  };

  // Group relapses by date
  const groupedRelapses = useMemo(() => {
    const groups: Record<string, Relapse[]> = {};
    const sorted = [...relapses].sort((a, b) => b.date.localeCompare(a.date));
    sorted.forEach(r => {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    });
    return groups;
  }, [relapses]);

  const intensityLabels = ['', 'Very Mild', 'Mild', 'Moderate', 'Strong', 'Very Strong'];
  const intensityColors = ['', '#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Break Habits
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {breakHabits.length} habits · {relapses.length} relapses logged
          </p>
        </div>
        <button
          onClick={() => setShowLogger(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white active:scale-90 transition-transform"
          style={{ background: 'var(--color-gradient)' }}
        >
          <Plus size={14} />
          Log Relapse
        </button>
      </div>

      {/* Break habits summary */}
      <div className="grid grid-cols-2 gap-3">
        {breakHabits.map((habit, i) => {
          const habitRelapses = relapses.filter(r => r.habitId === habit.id);
          const lastRelapse = habitRelapses.sort((a, b) => b.date.localeCompare(a.date))[0];
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border-light)',
                borderTop: '3px solid var(--color-secondary)',
                boxShadow: '0 2px 8px var(--color-shadow)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{habit.emoji}</span>
                <h3 className="text-xs font-bold truncate" style={{ color: 'var(--color-text)' }}>
                  {habit.name}
                </h3>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  <AlertTriangle size={10} />
                  <span>{habitRelapses.length} relapses</span>
                </div>
                {lastRelapse && (
                  <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    <Clock size={10} />
                    <span>Last: {format(parseISO(lastRelapse.date + 'T00:00:00'), 'MMM d')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {breakHabits.length === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">🛡️</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No break habits yet. Create one in the Habits tab.
          </p>
        </div>
      )}

      {/* Relapse history */}
      {Object.keys(groupedRelapses).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Relapse History
          </h3>
          {Object.entries(groupedRelapses).map(([date, dateRelapses]) => (
            <div key={date} className="space-y-2">
              <p className="text-xs font-medium px-1" style={{ color: 'var(--color-text-secondary)' }}>
                {format(parseISO(date + 'T00:00:00'), 'EEEE, MMMM d')}
              </p>
              {dateRelapses.map((relapse, i) => {
                const habit = habits.find(h => h.id === relapse.habitId);
                return (
                  <motion.div
                    key={relapse.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl p-3"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border-light)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span>{habit?.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                        {habit?.name}
                      </span>
                      <span className="text-[10px] ml-auto tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                        {relapse.time}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{
                          backgroundColor: `${intensityColors[relapse.intensity]}15`,
                          color: intensityColors[relapse.intensity],
                        }}
                      >
                        {intensityLabels[relapse.intensity]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      <div><strong>Cue:</strong> {relapse.cue}</div>
                      <div><strong>Craving:</strong> {relapse.craving}</div>
                      <div><strong>Response:</strong> {relapse.response}</div>
                      <div><strong>Reward:</strong> {relapse.reward}</div>
                    </div>
                    {relapse.notes && (
                      <p className="text-[10px] mt-1 italic" style={{ color: 'var(--color-text-muted)' }}>
                        "{relapse.notes}"
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Log Relapse Modal */}
      <AnimatePresence>
        {showLogger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowLogger(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-lg rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--color-surface)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Log Relapse</h3>
                <button onClick={() => { setShowLogger(false); resetForm(); }} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  <X size={16} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Habit selector */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Which habit?</label>
                  <div className="space-y-2">
                    {breakHabits.map(h => (
                      <button
                        key={h.id}
                        onClick={() => handleSelectHabit(h.id)}
                        className="w-full flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                        style={{
                          backgroundColor: selectedHabitId === h.id ? 'rgba(245, 158, 11, 0.08)' : 'var(--color-bg-secondary)',
                          border: `2px solid ${selectedHabitId === h.id ? 'var(--color-secondary)' : 'transparent'}`,
                        }}
                      >
                        <span>{h.emoji}</span>
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{h.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    Intensity: {intensityLabels[intensity]}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setIntensity(n)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                        style={{
                          backgroundColor: intensity === n ? `${intensityColors[n]}20` : 'var(--color-bg-secondary)',
                          color: intensity === n ? intensityColors[n] : 'var(--color-text-muted)',
                          border: `2px solid ${intensity === n ? intensityColors[n] : 'transparent'}`,
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Habit loop */}
                {[
                  { label: 'Cue', value: cue, setter: setCue },
                  { label: 'Craving', value: craving, setter: setCraving },
                  { label: 'Response', value: response, setter: setResponse },
                  { label: 'Reward', value: reward, setter: setReward },
                ].map(({ label, value, setter }) => (
                  <div key={label}>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={e => setter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)', color: 'var(--color-text)' }}
                    />
                  </div>
                ))}

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-secondary)' }}>Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)', color: 'var(--color-text)' }}
                  />
                </div>

                <button
                  onClick={handleLog}
                  disabled={!selectedHabitId}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-40"
                  style={{ background: 'var(--color-gradient)' }}
                >
                  <Check size={16} /> Log Relapse
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
