import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, parseISO } from 'date-fns';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Trophy,
  Zap,
  Target,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useStore } from '../store';
import { calculateStrength, calculateStreak } from '../logic';

export default function Analytics() {
  const { habits, completions, relapses, xpInfo } = useStore();
  const today = new Date();

  // --- XP over last 14 days ---
  const xpData = useMemo(() => {
    const data: { date: string; label: string; xp: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayXP = completions
        .filter(c => c.date === dateStr && c.done)
        .reduce((sum, c) => sum + c.xpEarned, 0);
      data.push({ date: dateStr, label: format(d, 'dd'), xp: dayXP });
    }
    return data;
  }, [completions]);

  // --- Completion rate over 14 days ---
  const completionRateData = useMemo(() => {
    const data: { label: string; rate: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const scheduledHabits = habits.filter(h => h.type === 'build');
      const doneCount = completions.filter(c => c.date === dateStr && c.done).length;
      const rate = scheduledHabits.length > 0 ? Math.round((doneCount / scheduledHabits.length) * 100) : 0;
      data.push({ label: format(d, 'dd'), rate: Math.min(rate, 100) });
    }
    return data;
  }, [habits, completions]);

  // --- Habit strength rankings ---
  const habitStrengths = useMemo(() => {
    return habits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      const habitRelapses = relapses.filter(r => r.habitId === habit.id);
      const strength = calculateStrength(habitCompletions, habitRelapses, habit.type, today);
      const streak = calculateStreak(habitCompletions, habitRelapses, habit.type, today);
      return { ...habit, strength, streak };
    }).sort((a, b) => b.strength - a.strength);
  }, [habits, completions, relapses]);

  // --- Overall stats ---
  const totalCompletions = completions.filter(c => c.done).length;
  const totalRelapses = relapses.length;
  const avgStrength = habitStrengths.length > 0
    ? Math.round(habitStrengths.reduce((s, h) => s + h.strength, 0) / habitStrengths.length)
    : 0;
  const longestStreak = Math.max(0, ...habitStrengths.map(h => h.streak.best));

  // Heatmap data for last 28 days
  const heatmapData = useMemo(() => {
    const data: { date: string; count: number; day: string }[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const count = completions.filter(c => c.date === dateStr && c.done).length;
      data.push({ date: dateStr, count, day: format(d, 'EEE') });
    }
    return data;
  }, [completions]);

  const maxHeatCount = Math.max(1, ...heatmapData.map(d => d.count));

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Analytics
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Track your progress and patterns
        </p>
      </div>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { icon: Zap, label: 'Total XP', value: xpInfo.totalXP, color: 'var(--color-primary)' },
          { icon: Target, label: 'Completions', value: totalCompletions, color: 'var(--color-success)' },
          { icon: TrendingUp, label: 'Avg Strength', value: `${avgStrength}%`, color: 'var(--color-accent)' },
          { icon: Trophy, label: 'Best Streak', value: `${longestStreak}d`, color: 'var(--color-secondary)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-3.5"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border-light)',
              boxShadow: '0 2px 8px var(--color-shadow)',
            }}
          >
            <stat.icon size={18} style={{ color: stat.color }} className="mb-1" />
            <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
              {stat.value}
            </p>
            <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* XP Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 2px 8px var(--color-shadow)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>XP Earned (14 days)</h3>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={xpData}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="var(--color-primary)"
                fill="url(#xpGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Completion Rate */}
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
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={14} style={{ color: 'var(--color-accent)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Completion Rate (14 days)</h3>
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}%`, 'Rate']}
              />
              <Bar dataKey="rate" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl p-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 2px 8px var(--color-shadow)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} style={{ color: 'var(--color-success)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Activity (28 days)</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {heatmapData.map((d, i) => {
            const intensity = d.count / maxHeatCount;
            return (
              <div
                key={d.date}
                className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold"
                style={{
                  backgroundColor: d.count === 0
                    ? 'var(--color-border-light)'
                    : `color-mix(in srgb, var(--color-primary) ${Math.max(20, intensity * 100)}%, var(--color-primary-faded))`,
                  color: intensity > 0.4 ? '#fff' : 'var(--color-text-muted)',
                }}
                title={`${d.date}: ${d.count} completions`}
              >
                {d.count > 0 ? d.count : ''}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Habit Strength Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 2px 8px var(--color-shadow)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} style={{ color: 'var(--color-secondary)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Habit Strength</h3>
        </div>
        <p className="text-[10px] mb-3 italic" style={{ color: 'var(--color-text-muted)' }}>
          More recent wins count more (28-day weighted window)
        </p>
        <div className="space-y-2.5">
          {habitStrengths.map((habit, i) => (
            <div key={habit.id} className="flex items-center gap-3">
              <span className="text-sm w-6 text-center">{habit.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {habit.name}
                  </span>
                  <span className="text-xs font-bold tabular-nums ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {habit.strength}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-border-light)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${habit.strength}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: habit.strength >= 60
                        ? 'var(--color-primary)'
                        : habit.strength >= 30
                          ? 'var(--color-warning)'
                          : 'var(--color-text-muted)',
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-0.5" style={{ color: 'var(--color-secondary)' }}>
                <Flame size={11} />
                <span className="text-[10px] font-bold tabular-nums">{habit.streak.current}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
