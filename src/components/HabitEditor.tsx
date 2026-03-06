import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Check,
  Zap,
  Timer,
  CheckCircle,
  Link,
  Bell,
  ArrowRight,
  Gift,
} from 'lucide-react';
import type { Habit, HabitType, FrequencyType, CompletionMethod } from '../types';
import { useStore } from '../store';

interface Props {
  habit: Habit;
  onClose: () => void;
}

const EMOJIS_BUILD = ['🌱', '💪', '📚', '🧘', '🏃', '💧', '📝', '🎯', '🔬', '🎨', '🎵', '👨‍💻'];
const EMOJIS_BREAK = ['🛡️', '📵', '🍎', '🚭', '🛑', '⛔', '🔇', '🚫', '💤', '🧊'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HabitEditor({ habit, onClose }: Props) {
  const { habits, routineBlocks, updateHabit, addToast } = useStore();

  // Form state — pre-populated from existing habit
  const [name, setName] = useState(habit.name);
  const [emoji, setEmoji] = useState(habit.emoji);
  const [frequency, setFrequency] = useState<FrequencyType>(habit.frequency);
  const [customDays, setCustomDays] = useState<number[]>(habit.customDays || []);
  const [completionMethod, setCompletionMethod] = useState<CompletionMethod>(habit.completionMethod);
  const [targetDuration, setTargetDuration] = useState(habit.targetDurationMin || 10);
  const [xpPerCompletion, setXpPerCompletion] = useState(habit.xpPerCompletion);
  const [anchorHabitId, setAnchorHabitId] = useState(habit.anchorHabitId || '');
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>(habit.routineBlockIds);
  const [lawTag, setLawTag] = useState(habit.lawTag || '');

  // Build habit trigger/reward
  const [trigger, setTrigger] = useState(habit.trigger || '');
  const [habitReward, setHabitReward] = useState(habit.reward || '');

  // Break habit loop
  const [cue, setCue] = useState(habit.habitLoop?.cue || '');
  const [craving, setCraving] = useState(habit.habitLoop?.craving || '');
  const [response, setResponse] = useState(habit.habitLoop?.response || '');
  const [reward, setReward] = useState(habit.habitLoop?.reward || '');

  const type = habit.type;
  const emojiSet = type === 'build' ? EMOJIS_BUILD : EMOJIS_BREAK;
  const buildLaws = ['obvious', 'attractive', 'easy', 'satisfying'];
  const breakLaws = ['invisible', 'unattractive', 'difficult', 'unsatisfying'];
  const laws = type === 'build' ? buildLaws : breakLaws;

  const handleSave = async () => {
    if (!name.trim()) return;

    const now = new Date().toISOString();
    const changes: Partial<Habit> = {
      name: name.trim(),
      emoji,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      completionMethod,
      targetDurationMin: completionMethod === 'duration' ? targetDuration : undefined,
      xpPerCompletion,
      anchorHabitId: anchorHabitId || undefined,
      lawTag: lawTag || undefined,
      routineBlockIds: selectedBlocks,
      trigger: type === 'build' && trigger.trim() ? trigger.trim() : undefined,
      reward: type === 'build' && habitReward.trim() ? habitReward.trim() : undefined,
      habitLoop: type === 'break' && cue ? { cue, craving, response, reward } : undefined,
      updatedAt: now,
    };

    await updateHabit(habit.id, changes);
    addToast(`${emoji} ${name} updated!`, 'success');
    onClose();
  };

  const otherBuildHabits = habits.filter(h => h.type === 'build' && h.id !== habit.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            Edit Habit
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <X size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
          {/* Name & Emoji */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Habit Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-light)',
                  color: 'var(--color-text)',
                }}
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Emoji
              </label>
              <div className="flex flex-wrap gap-2">
                {emojiSet.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className="w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: emoji === e ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                      border: `2px solid ${emoji === e ? 'var(--color-primary)' : 'transparent'}`,
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Completion Method & XP */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Completion Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCompletionMethod('check')}
                  className="p-3 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: completionMethod === 'check' ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                    border: `2px solid ${completionMethod === 'check' ? 'var(--color-primary)' : 'transparent'}`,
                    color: completionMethod === 'check' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  <CheckCircle size={14} /> Check off
                </button>
                <button
                  onClick={() => setCompletionMethod('duration')}
                  className="p-3 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: completionMethod === 'duration' ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                    border: `2px solid ${completionMethod === 'duration' ? 'var(--color-primary)' : 'transparent'}`,
                    color: completionMethod === 'duration' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  <Timer size={14} /> Duration
                </button>
              </div>
            </div>

            {completionMethod === 'duration' && (
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Target Duration: {targetDuration} min
                </label>
                <input
                  type="range"
                  min={1}
                  max={120}
                  value={targetDuration}
                  onChange={e => setTargetDuration(Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                XP per completion
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(xp => (
                  <button
                    key={xp}
                    onClick={() => setXpPerCompletion(xp)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: xpPerCompletion === xp ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                      border: `2px solid ${xpPerCompletion === xp ? 'var(--color-primary)' : 'transparent'}`,
                      color: xpPerCompletion === xp ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    <Zap size={12} /> {xp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Frequency & Schedule (build habits) */}
          {type === 'build' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Frequency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['daily', 'weekdays', 'weekends', 'custom'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className="p-2.5 rounded-xl text-xs font-semibold capitalize text-center transition-all"
                      style={{
                        backgroundColor: frequency === f ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                        border: `2px solid ${frequency === f ? 'var(--color-primary)' : 'transparent'}`,
                        color: frequency === f ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {frequency === 'custom' && (
                <div className="flex gap-2">
                  {dayNames.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCustomDays(prev =>
                          prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                        );
                      }}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold text-center transition-all"
                      style={{
                        backgroundColor: customDays.includes(i) ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                        color: customDays.includes(i) ? '#fff' : 'var(--color-text-secondary)',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Routine Block
                </label>
                <div className="space-y-2">
                  {routineBlocks.map(block => (
                    <button
                      key={block.id}
                      onClick={() => {
                        setSelectedBlocks(prev =>
                          prev.includes(block.id) ? prev.filter(x => x !== block.id) : [...prev, block.id]
                        );
                      }}
                      className="w-full flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: selectedBlocks.includes(block.id) ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                        border: `2px solid ${selectedBlocks.includes(block.id) ? 'var(--color-primary)' : 'transparent'}`,
                      }}
                    >
                      <span>{block.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{block.name}</span>
                      <span className="text-[10px] ml-auto" style={{ color: 'var(--color-text-muted)' }}>
                        {block.startTime}–{block.endTime}
                      </span>
                    </button>
                  ))}
                  {routineBlocks.length === 0 && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No routine blocks created yet</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Law (Atomic Habits)
                </label>
                <div className="flex flex-wrap gap-2">
                  {laws.map(l => (
                    <button
                      key={l}
                      onClick={() => setLawTag(lawTag === l ? '' : l)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                      style={{
                        backgroundColor: lawTag === l ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                        border: `2px solid ${lawTag === l ? 'var(--color-primary)' : 'transparent'}`,
                        color: lawTag === l ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger & Reward */}
              <div
                className="rounded-xl p-3 space-y-3"
                style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)' }}
              >
                <p className="text-[11px] font-bold" style={{ color: 'var(--color-primary)' }}>
                  Habit Group (optional)
                </p>
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Trigger
                  </label>
                  <input
                    type="text"
                    value={trigger}
                    onChange={e => setTrigger(e.target.value)}
                    placeholder="e.g., After I wake up..."
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border-light)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Reward
                  </label>
                  <input
                    type="text"
                    value={habitReward}
                    onChange={e => setHabitReward(e.target.value)}
                    placeholder="e.g., I'll feel energized"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border-light)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                {(trigger || habitReward) && (
                  <div className="flex items-center gap-2 text-[10px] pt-1">
                    {trigger && (
                      <span className="font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-secondary-faded)', color: 'var(--color-secondary)' }}>
                        {trigger}
                      </span>
                    )}
                    {trigger && <ArrowRight size={10} style={{ color: 'var(--color-text-muted)' }} />}
                    <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                      {emoji} {name}
                    </span>
                    {habitReward && <ArrowRight size={10} style={{ color: 'var(--color-text-muted)' }} />}
                    {habitReward && (
                      <span className="font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-accent-faded)', color: 'var(--color-accent)' }}>
                        {habitReward}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stacking */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  <Link size={12} className="inline mr-1" style={{ color: 'var(--color-accent)' }} />
                  Habit Stacking (optional)
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setAnchorHabitId('')}
                    className="w-full p-2.5 rounded-xl text-left text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: !anchorHabitId ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                      border: `2px solid ${!anchorHabitId ? 'var(--color-primary)' : 'transparent'}`,
                      color: !anchorHabitId ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    No stacking
                  </button>
                  {otherBuildHabits.map(h => (
                    <button
                      key={h.id}
                      onClick={() => setAnchorHabitId(h.id)}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: anchorHabitId === h.id ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                        border: `2px solid ${anchorHabitId === h.id ? 'var(--color-primary)' : 'transparent'}`,
                      }}
                    >
                      <span>{h.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{h.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Break habit: frequency & habit loop */}
          {type === 'break' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Frequency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['daily', 'weekdays', 'weekends', 'custom'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className="p-2.5 rounded-xl text-xs font-semibold capitalize text-center transition-all"
                      style={{
                        backgroundColor: frequency === f ? 'var(--color-secondary-faded)' : 'var(--color-bg-secondary)',
                        border: `2px solid ${frequency === f ? 'var(--color-secondary)' : 'transparent'}`,
                        color: frequency === f ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {frequency === 'custom' && (
                <div className="flex gap-2">
                  {dayNames.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCustomDays(prev =>
                          prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                        );
                      }}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold text-center transition-all"
                      style={{
                        backgroundColor: customDays.includes(i) ? 'var(--color-secondary)' : 'var(--color-bg-secondary)',
                        color: customDays.includes(i) ? '#fff' : 'var(--color-text-secondary)',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Law (Atomic Habits)
                </label>
                <div className="flex flex-wrap gap-2">
                  {laws.map(l => (
                    <button
                      key={l}
                      onClick={() => setLawTag(lawTag === l ? '' : l)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                      style={{
                        backgroundColor: lawTag === l ? 'var(--color-secondary-faded)' : 'var(--color-bg-secondary)',
                        border: `2px solid ${lawTag === l ? 'var(--color-secondary)' : 'transparent'}`,
                        color: lawTag === l ? 'var(--color-secondary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Habit loop fields */}
              <div
                className="rounded-xl p-3 space-y-3"
                style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)' }}
              >
                <p className="text-[11px] font-bold" style={{ color: 'var(--color-secondary)' }}>
                  Habit Loop
                </p>
                {[
                  { label: 'Cue (What triggers it?)', value: cue, setter: setCue, placeholder: 'e.g., Feeling bored after dinner' },
                  { label: 'Craving (What do you crave?)', value: craving, setter: setCraving, placeholder: 'e.g., Want something sweet' },
                  { label: 'Response (What do you do?)', value: response, setter: setResponse, placeholder: 'e.g., Eat candy or dessert' },
                  { label: 'Reward (What do you get?)', value: reward, setter: setReward, placeholder: 'e.g., Sugar rush, comfort' },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label}>
                    <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {label}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={e => setter(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border-light)',
                        color: 'var(--color-text)',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Save button */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderTop: '1px solid var(--color-border-light)' }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
          >
            Cancel
          </button>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-40"
            style={{ background: name.trim() ? 'var(--color-gradient)' : 'var(--color-text-muted)' }}
          >
            <Check size={14} /> Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
