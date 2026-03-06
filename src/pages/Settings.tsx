import { motion } from 'framer-motion';
import {
  Palette,
  Database,
  Trash2,
  Download,
  Info,
  ExternalLink,
  Moon,
  Sun,
  Grape,
  Check,
} from 'lucide-react';
import type { ThemeName } from '../types';
import { useStore } from '../store';
import { db } from '../db';

const themeOptions: { name: ThemeName; label: string; emoji: string; colors: string[] }[] = [
  {
    name: 'mint',
    label: 'Mint',
    emoji: '🌿',
    colors: ['#0d9488', '#5eead4', '#f0fdfa'],
  },
  {
    name: 'sunset',
    label: 'Sunset',
    emoji: '🌅',
    colors: ['#ea580c', '#fdba74', '#fff7ed'],
  },
  {
    name: 'grape',
    label: 'Grape',
    emoji: '🍇',
    colors: ['#7c3aed', '#c4b5fd', '#faf5ff'],
  },
];

export default function Settings() {
  const { theme, setTheme, xpInfo, habits, completions, relapses } = useStore();

  const handleExportData = async () => {
    const data = {
      habits: await db.habits.toArray(),
      routineBlocks: await db.routineBlocks.toArray(),
      completions: await db.completions.toArray(),
      timerSessions: await db.timerSessions.toArray(),
      relapses: await db.relapses.toArray(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atomic-habits-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure? This will delete ALL your data. This cannot be undone.')) return;
    if (!confirm('Really? All habits, completions, and relapses will be permanently deleted.')) return;

    await db.delete();
    window.location.reload();
  };

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Settings</h2>
      </div>

      {/* Profile summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 text-center"
        style={{
          background: 'var(--color-gradient)',
          boxShadow: '0 4px 20px var(--color-shadow)',
        }}
      >
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-white/90 bg-white/20 backdrop-blur-sm">
          {xpInfo.level}
        </div>
        <h3 className="text-white font-bold text-lg">Level {xpInfo.level}</h3>
        <p className="text-white/70 text-xs mt-0.5">
          {xpInfo.totalXP} total XP · {xpInfo.xpToNextLevel} to next level
        </p>
        {/* Level progress */}
        <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden mx-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpInfo.levelProgress}%` }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-full rounded-full bg-white/80"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-white">
          <div>
            <p className="text-xl font-bold">{habits.length}</p>
            <p className="text-[10px] text-white/60">Habits</p>
          </div>
          <div>
            <p className="text-xl font-bold">{completions.filter(c => c.done).length}</p>
            <p className="text-[10px] text-white/60">Completions</p>
          </div>
          <div>
            <p className="text-xl font-bold">{relapses.length}</p>
            <p className="text-[10px] text-white/60">Relapses</p>
          </div>
        </div>
      </motion.div>

      {/* Theme selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 2px 8px var(--color-shadow)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Theme</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(opt => (
            <button
              key={opt.name}
              onClick={() => setTheme(opt.name)}
              className="relative rounded-2xl p-3 transition-all"
              style={{
                border: `2px solid ${theme === opt.name ? opt.colors[0] : 'var(--color-border-light)'}`,
                backgroundColor: theme === opt.name ? `${opt.colors[0]}08` : 'var(--color-bg-secondary)',
              }}
            >
              {theme === opt.name && (
                <div
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: opt.colors[0] }}
                >
                  <Check size={12} className="text-white" />
                </div>
              )}
              <div className="flex gap-1 mb-2 justify-center">
                {opt.colors.map((c, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: c, border: i === 2 ? '1px solid #e5e7eb' : 'none' }}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-center" style={{ color: 'var(--color-text)' }}>
                {opt.emoji} {opt.label}
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Data management */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-4 space-y-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 2px 8px var(--color-shadow)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Database size={16} style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Data</h3>
        </div>

        <button
          onClick={handleExportData}
          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all tap-highlight"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <Download size={16} style={{ color: 'var(--color-primary)' }} />
          <div className="text-left">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Export Data</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Download all data as JSON</p>
          </div>
        </button>

        <button
          onClick={handleClearData}
          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all tap-highlight"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.04)' }}
        >
          <Trash2 size={16} style={{ color: 'var(--color-danger)' }} />
          <div className="text-left">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>Clear All Data</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Permanently delete everything</p>
          </div>
        </button>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 2px 8px var(--color-shadow)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Info size={16} style={{ color: 'var(--color-accent)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>About</h3>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Atomic Habits Tracker is an offline-first habit tracking app inspired by James Clear's Atomic Habits.
          Build good habits, break bad ones, and track your progress with gamification elements.
        </p>
        <div className="flex items-center gap-4 mt-3 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          <span>v1.0.0</span>
          <span>Offline-first</span>
          <span>IndexedDB</span>
        </div>
      </motion.div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}
