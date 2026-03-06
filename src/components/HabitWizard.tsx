import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sprout,
  Shield,
  ChevronRight,
  ChevronLeft,
  Check,
  Link,
  Zap,
} from 'lucide-react';
import type { Habit, HabitType, FrequencyType, CompletionMethod } from '../types';
import { useStore } from '../store';

interface Props {
  onClose: () => void;
}

const EMOJIS_BUILD = ['🌱', '💪', '📚', '🧘', '🏃', '💧', '📝', '🎯', '🔬', '🎨', '🎵', '👨‍💻'];
const EMOJIS_BREAK = ['🛡️', '📵', '🍎', '🚭', '🛑', '⛔', '🔇', '🚫', '💤', '🧊'];

export default function HabitWizard({ onClose }: Props) {
  const { habits, routineBlocks, addHabit, addToast } = useStore();
  const [step, setStep] = useState(0);

  // Form state
  const [type, setType] = useState<HabitType>('build');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌱');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [completionMethod, setCompletionMethod] = useState<CompletionMethod>('check');
  const [targetDuration, setTargetDuration] = useState(10);
  const [xpPerCompletion, setXpPerCompletion] = useState(5);
  const [anchorHabitId, setAnchorHabitId] = useState<string>('');
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [lawTag, setLawTag] = useState('');

  // Break habit loop
  const [cue, setCue] = useState('');
  const [craving, setCraving] = useState('');
  const [response, setResponse] = useState('');
  const [reward, setReward] = useState('');

  const emojiSet = type === 'build' ? EMOJIS_BUILD : EMOJIS_BREAK;

  const steps = [
    'Type',
    'Details',
    type === 'break' ? 'Habit Loop' : 'Schedule',
    'Stacking',
    'Review',
  ];

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return true;
      case 1: return name.trim().length > 0;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      emoji,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      completionMethod,
      targetDurationMin: completionMethod === 'duration' ? targetDuration : undefined,
      xpPerCompletion,
      anchorHabitId: anchorHabitId || undefined,
      lawTag: lawTag || undefined,
      routineBlockIds: selectedBlocks,
      habitLoop: type === 'break' && cue ? { cue, craving, response, reward } : undefined,
      sortOrder: habits.length,
      createdAt: now,
      updatedAt: now,
    };

    await addHabit(habit);
    addToast(`${emoji} ${name} created!`, 'success');
    onClose();
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buildLaws = ['obvious', 'attractive', 'easy', 'satisfying'];
  const breakLaws = ['invisible', 'unattractive', 'difficult', 'unsatisfying'];
  const laws = type === 'build' ? buildLaws : breakLaws;

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
        className="w-full max-w-lg sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            New Habit
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <X size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 px-5 pb-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: i <= step ? 'var(--color-primary)' : 'var(--color-border)',
                  transform: i === step ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            </div>
          ))}
          <span className="text-[10px] ml-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {steps[step]}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 min-h-[280px]">
          {/* Step 0: Type */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                What kind of habit do you want to track?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setType('build'); setEmoji('🌱'); }}
                  className="p-4 rounded-2xl text-left transition-all"
                  style={{
                    backgroundColor: type === 'build' ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                    border: `2px solid ${type === 'build' ? 'var(--color-primary)' : 'transparent'}`,
                  }}
                >
                  <Sprout size={24} style={{ color: 'var(--color-primary)' }} className="mb-2" />
                  <h4 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Build</h4>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Start a positive habit
                  </p>
                </button>
                <button
                  onClick={() => { setType('break'); setEmoji('🛡️'); }}
                  className="p-4 rounded-2xl text-left transition-all"
                  style={{
                    backgroundColor: type === 'break' ? 'rgba(245, 158, 11, 0.08)' : 'var(--color-bg-secondary)',
                    border: `2px solid ${type === 'break' ? 'var(--color-secondary)' : 'transparent'}`,
                  }}
                >
                  <Shield size={24} style={{ color: 'var(--color-secondary)' }} className="mb-2" />
                  <h4 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Break</h4>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Stop a bad habit
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Habit Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={type === 'build' ? 'e.g., Morning Meditation' : 'e.g., No Social Media'}
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

              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Completion Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCompletionMethod('check')}
                    className="p-3 rounded-xl text-xs font-semibold text-center transition-all"
                    style={{
                      backgroundColor: completionMethod === 'check' ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                      border: `2px solid ${completionMethod === 'check' ? 'var(--color-primary)' : 'transparent'}`,
                      color: completionMethod === 'check' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    ✓ Check off
                  </button>
                  <button
                    onClick={() => setCompletionMethod('duration')}
                    className="p-3 rounded-xl text-xs font-semibold text-center transition-all"
                    style={{
                      backgroundColor: completionMethod === 'duration' ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                      border: `2px solid ${completionMethod === 'duration' ? 'var(--color-primary)' : 'transparent'}`,
                      color: completionMethod === 'duration' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    ⏱ Duration
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
          )}

          {/* Step 2: Schedule or Habit Loop */}
          {step === 2 && type === 'build' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  Frequency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['daily', 'weekdays', 'weekends', 'custom'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className="p-3 rounded-xl text-xs font-semibold capitalize text-center transition-all"
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
            </div>
          )}

          {step === 2 && type === 'break' && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Describe the habit loop you want to break:
              </p>
              {[
                { label: 'Cue (What triggers it?)', value: cue, setter: setCue, placeholder: 'e.g., Feeling bored after dinner' },
                { label: 'Craving (What do you crave?)', value: craving, setter: setCraving, placeholder: 'e.g., Want something sweet' },
                { label: 'Response (What do you do?)', value: response, setter: setResponse, placeholder: 'e.g., Eat candy or dessert' },
                { label: 'Reward (What do you get?)', value: reward, setter: setReward, placeholder: 'e.g., Sugar rush, comfort' },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={e => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-light)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Stacking */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Link size={16} style={{ color: 'var(--color-accent)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  Habit Stacking
                </p>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                "After I [Anchor Habit], I will [This Habit]."
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Select an anchor habit (optional):
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setAnchorHabitId('')}
                  className="w-full p-3 rounded-xl text-left text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: !anchorHabitId ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                    border: `2px solid ${!anchorHabitId ? 'var(--color-primary)' : 'transparent'}`,
                    color: !anchorHabitId ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  No stacking
                </button>
                {habits.filter(h => h.type === 'build').map(h => (
                  <button
                    key={h.id}
                    onClick={() => setAnchorHabitId(h.id)}
                    className="w-full flex items-center gap-2 p-3 rounded-xl text-left transition-all"
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
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-3">
              <div
                className="rounded-2xl p-4 space-y-2"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <h4 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{name || 'Untitled'}</h4>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{
                        backgroundColor: type === 'break' ? 'rgba(245, 158, 11, 0.1)' : 'var(--color-primary-faded)',
                        color: type === 'break' ? 'var(--color-secondary)' : 'var(--color-primary)',
                      }}
                    >
                      {type}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <div>Frequency: <strong className="capitalize">{frequency}</strong></div>
                  <div>Method: <strong className="capitalize">{completionMethod}</strong></div>
                  <div>XP: <strong>{xpPerCompletion}</strong></div>
                  {completionMethod === 'duration' && <div>Duration: <strong>{targetDuration}m</strong></div>}
                </div>
                {anchorHabitId && (
                  <p className="text-xs" style={{ color: 'var(--color-accent)' }}>
                    Stacked after: {habits.find(h => h.id === anchorHabitId)?.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderTop: '1px solid var(--color-border-light)' }}
        >
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          <div className="flex-1" />
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: canProceed() ? 'var(--color-gradient)' : 'var(--color-text-muted)' }}
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
              style={{ background: 'var(--color-gradient)' }}
            >
              <Check size={14} /> Create Habit
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
