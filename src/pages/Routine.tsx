import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Clock,
  Trash2,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  LinkIcon,
  Unlink,
  Sprout,
  Shield,
} from 'lucide-react';
import type { RoutineBlock } from '../types';
import { useStore } from '../store';

export default function Routine() {
  const {
    routineBlocks,
    habits,
    addRoutineBlock,
    deleteRoutineBlock,
    linkHabitToBlock,
    unlinkHabitFromBlock,
    reorderHabitInBlock,
    addToast,
  } = useStore();

  const [showCreate, setShowCreate] = useState(false);
  const [addingToBlockId, setAddingToBlockId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🌅');
  const [newStart, setNewStart] = useState('06:00');
  const [newEnd, setNewEnd] = useState('08:00');

  const emojis = ['🌅', '☀️', '🌙', '🌤️', '⭐', '🎯', '💼', '🏠', '🧘', '📖'];

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const block: RoutineBlock = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      emoji: newEmoji,
      startTime: newStart,
      endTime: newEnd,
      sortOrder: routineBlocks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addRoutineBlock(block);
    addToast(`${newEmoji} ${newName} created!`, 'success');
    setShowCreate(false);
    setNewName('');
  };

  const getBlockHabits = (blockId: string) =>
    habits
      .filter(h => h.routineBlockIds.includes(blockId))
      .sort((a, b) => a.sortOrder - b.sortOrder);

  const getAvailableHabits = (blockId: string) =>
    habits.filter(h => !h.routineBlockIds.includes(blockId));

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Daily Routine
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {routineBlocks.length} time blocks
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform"
          style={{ background: 'var(--color-gradient)' }}
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div
          className="absolute left-5 top-0 bottom-0 w-0.5 rounded-full"
          style={{ backgroundColor: 'var(--color-border-light)' }}
        />

        <div className="space-y-4">
          {routineBlocks.map((block, index) => {
            const blockHabits = getBlockHabits(block.id);
            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                className="relative pl-12"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-3 top-4 w-5 h-5 rounded-full flex items-center justify-center z-10"
                  style={{
                    background: 'var(--color-gradient)',
                    boxShadow: '0 0 0 3px var(--color-bg)',
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* Block card */}
                <div
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border-light)',
                    boxShadow: '0 2px 8px var(--color-shadow)',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{block.emoji}</span>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                          {block.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={11} style={{ color: 'var(--color-text-muted)' }} />
                          <span className="text-[11px] font-medium tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                            {block.startTime} – {block.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${block.name}"?`)) {
                          deleteRoutineBlock(block.id);
                        }
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Habits in this block */}
                  {blockHabits.length > 0 && (
                    <div className="space-y-1.5 mt-3">
                      {blockHabits.map((habit, hIdx) => (
                        <div
                          key={habit.id}
                          className="group flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        >
                          {/* Reorder arrows */}
                          <div className="flex flex-col gap-px opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => reorderHabitInBlock(habit.id, block.id, 'up')}
                              disabled={hIdx === 0}
                              className="w-4 h-4 flex items-center justify-center rounded disabled:opacity-20"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              onClick={() => reorderHabitInBlock(habit.id, block.id, 'down')}
                              disabled={hIdx === blockHabits.length - 1}
                              className="w-4 h-4 flex items-center justify-center rounded disabled:opacity-20"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>

                          <span className="text-sm">{habit.emoji}</span>
                          <span className="text-xs font-medium flex-1" style={{ color: 'var(--color-text)' }}>
                            {habit.name}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: habit.type === 'break' ? 'rgba(245, 158, 11, 0.1)' : 'var(--color-primary-faded)',
                              color: habit.type === 'break' ? 'var(--color-secondary)' : 'var(--color-primary)',
                            }}
                          >
                            {habit.type}
                          </span>

                          {/* Remove from block */}
                          <button
                            onClick={() => unlinkHabitFromBlock(habit.id, block.id)}
                            className="w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                            style={{ color: 'var(--color-danger)' }}
                            title="Remove from block"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {blockHabits.length === 0 && (
                    <p className="text-[11px] mt-2 italic" style={{ color: 'var(--color-text-muted)' }}>
                      No habits linked yet
                    </p>
                  )}

                  {/* Add habit button */}
                  <button
                    onClick={() => setAddingToBlockId(addingToBlockId === block.id ? null : block.id)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
                    style={{
                      border: '1px dashed var(--color-border)',
                      color: 'var(--color-primary)',
                      backgroundColor: addingToBlockId === block.id ? 'var(--color-primary-faded)' : 'transparent',
                    }}
                  >
                    <Plus size={13} />
                    Add Habit
                  </button>

                  {/* Habit picker dropdown */}
                  <AnimatePresence>
                    {addingToBlockId === block.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                          {getAvailableHabits(block.id).length > 0 ? (
                            getAvailableHabits(block.id).map(habit => (
                              <button
                                key={habit.id}
                                onClick={async () => {
                                  await linkHabitToBlock(habit.id, block.id);
                                  addToast(`${habit.emoji} added to ${block.name}`, 'success');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all hover:scale-[0.99] active:scale-[0.97]"
                                style={{
                                  backgroundColor: 'var(--color-surface)',
                                  border: '1px solid var(--color-border-light)',
                                }}
                              >
                                <span className="text-sm">{habit.emoji}</span>
                                <span className="text-xs font-medium flex-1" style={{ color: 'var(--color-text)' }}>
                                  {habit.name}
                                </span>
                                <div
                                  className="flex items-center gap-0.5"
                                  style={{ color: habit.type === 'break' ? 'var(--color-secondary)' : 'var(--color-primary)' }}
                                >
                                  {habit.type === 'break' ? <Shield size={10} /> : <Sprout size={10} />}
                                  <span className="text-[10px] font-medium">{habit.type}</span>
                                </div>
                                <Plus size={14} style={{ color: 'var(--color-primary)' }} />
                              </button>
                            ))
                          ) : (
                            <p className="text-[11px] text-center py-2 italic" style={{ color: 'var(--color-text-muted)' }}>
                              All habits are already linked
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {routineBlocks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">⏰</div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            No routine blocks yet
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Create time blocks to organize your daily habits
          </p>
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-lg rounded-t-3xl p-5 pb-8"
              style={{ backgroundColor: 'var(--color-surface)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  New Time Block
                </h3>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  <X size={16} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g., Morning Ritual"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)', color: 'var(--color-text)' }}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Emoji</label>
                  <div className="flex flex-wrap gap-2">
                    {emojis.map(e => (
                      <button
                        key={e}
                        onClick={() => setNewEmoji(e)}
                        className="w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: newEmoji === e ? 'var(--color-primary-faded)' : 'var(--color-bg-secondary)',
                          border: `2px solid ${newEmoji === e ? 'var(--color-primary)' : 'transparent'}`,
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Start</label>
                    <input
                      type="time"
                      value={newStart}
                      onChange={e => setNewStart(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)', color: 'var(--color-text)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>End</label>
                    <input
                      type="time"
                      value={newEnd}
                      onChange={e => setNewEnd(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)', color: 'var(--color-text)' }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-40"
                  style={{ background: 'var(--color-gradient)' }}
                >
                  <Check size={16} /> Create Block
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
