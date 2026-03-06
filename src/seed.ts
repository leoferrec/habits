import { format, subDays } from 'date-fns';
import { db } from './db';
import type { Habit, RoutineBlock, Completion, Relapse } from './types';

export async function seedIfEmpty(): Promise<void> {
  const habitCount = await db.habits.count();
  if (habitCount > 0) return;

  const now = new Date().toISOString();
  const today = new Date();

  // --- Routine Blocks ---
  const morningBlock: RoutineBlock = {
    id: 'rb-morning',
    name: 'Morning Ritual',
    emoji: '🌅',
    startTime: '06:00',
    endTime: '08:00',
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  };

  const afternoonBlock: RoutineBlock = {
    id: 'rb-afternoon',
    name: 'Afternoon Focus',
    emoji: '☀️',
    startTime: '14:00',
    endTime: '16:00',
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  };

  const eveningBlock: RoutineBlock = {
    id: 'rb-evening',
    name: 'Evening Wind Down',
    emoji: '🌙',
    startTime: '20:00',
    endTime: '22:00',
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  };

  // --- Habits ---
  const habits: Habit[] = [
    {
      id: 'h-meditate',
      name: 'Morning Meditation',
      type: 'build',
      emoji: '🧘',
      frequency: 'daily',
      completionMethod: 'duration',
      targetDurationMin: 10,
      xpPerCompletion: 10,
      routineBlockIds: ['rb-morning'],
      lawTag: 'easy',
      trigger: 'Alarm goes off, sit on cushion',
      reward: 'Feel calm and centered',
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'h-water',
      name: 'Drink Water',
      type: 'build',
      emoji: '💧',
      frequency: 'daily',
      completionMethod: 'check',
      xpPerCompletion: 5,
      anchorHabitId: 'h-meditate',
      routineBlockIds: ['rb-morning'],
      lawTag: 'obvious',
      trigger: 'After meditation, go to kitchen',
      reward: 'Refreshed and hydrated',
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'h-read',
      name: 'Read 20 Pages',
      type: 'build',
      emoji: '📚',
      frequency: 'daily',
      completionMethod: 'check',
      xpPerCompletion: 10,
      anchorHabitId: 'h-water',
      routineBlockIds: ['rb-evening'],
      lawTag: 'attractive',
      trigger: 'After dinner, sit in reading chair',
      reward: 'Learn something new every day',
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'h-exercise',
      name: 'Exercise',
      type: 'build',
      emoji: '🏋️',
      frequency: 'weekdays',
      completionMethod: 'duration',
      targetDurationMin: 30,
      xpPerCompletion: 15,
      routineBlockIds: ['rb-afternoon'],
      lawTag: 'satisfying',
      trigger: 'Put on workout clothes',
      reward: 'Listen to favorite music',
      sortOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'h-journal',
      name: 'Evening Journal',
      type: 'build',
      emoji: '📝',
      frequency: 'daily',
      completionMethod: 'check',
      xpPerCompletion: 5,
      routineBlockIds: ['rb-evening'],
      lawTag: 'satisfying',
      trigger: 'Get into bed, grab journal',
      reward: 'Clear mind before sleep',
      sortOrder: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'h-no-social',
      name: 'No Social Media Before 12pm',
      type: 'break',
      emoji: '📵',
      frequency: 'daily',
      completionMethod: 'check',
      xpPerCompletion: 10,
      routineBlockIds: ['rb-morning'],
      habitLoop: {
        cue: 'Waking up and reaching for phone',
        craving: 'Want to check notifications',
        response: 'Open social media apps',
        reward: 'Dopamine from scrolling',
      },
      lawTag: 'invisible',
      sortOrder: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'h-no-junk',
      name: 'No Junk Food',
      type: 'break',
      emoji: '🍎',
      frequency: 'daily',
      completionMethod: 'check',
      xpPerCompletion: 10,
      routineBlockIds: [],
      habitLoop: {
        cue: 'Feeling stressed or bored',
        craving: 'Want comfort food',
        response: 'Eat chips or candy',
        reward: 'Temporary pleasure',
      },
      lawTag: 'difficult',
      sortOrder: 6,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // --- Seed historical completions (past 14 days, randomized) ---
  const completions: Completion[] = [];
  const relapses: Relapse[] = [];

  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = format(subDays(today, dayOffset), 'yyyy-MM-dd');

    for (const habit of habits) {
      // Skip if not scheduled
      const dayDate = subDays(today, dayOffset);
      const dow = dayDate.getDay();
      if (habit.frequency === 'weekdays' && (dow === 0 || dow === 6)) continue;
      if (habit.frequency === 'weekends' && dow >= 1 && dow <= 5) continue;

      if (habit.type === 'build') {
        // ~75% completion rate for build habits
        const done = Math.random() < 0.75;
        if (done) {
          completions.push({
            id: crypto.randomUUID(),
            habitId: habit.id,
            date,
            done: true,
            skipped: false,
            durationSec: habit.completionMethod === 'duration'
              ? (habit.targetDurationMin || 10) * 60
              : undefined,
            xpEarned: habit.xpPerCompletion,
            completedAt: `${date}T08:00:00.000Z`,
            createdAt: now,
            updatedAt: now,
          });
        }
      } else {
        // Break habits: ~85% success rate (no relapse)
        const relapsed = Math.random() < 0.15;
        if (relapsed) {
          relapses.push({
            id: crypto.randomUUID(),
            habitId: habit.id,
            date,
            time: '14:30',
            cue: habit.habitLoop?.cue || 'Unknown trigger',
            craving: habit.habitLoop?.craving || 'Strong urge',
            response: habit.habitLoop?.response || 'Gave in',
            reward: habit.habitLoop?.reward || 'Temporary relief',
            intensity: Math.floor(Math.random() * 3) + 2,
            notes: 'Logged automatically for demo',
            createdAt: now,
            updatedAt: now,
          });
        } else {
          // Log a "no relapse" completion for break habits
          completions.push({
            id: crypto.randomUUID(),
            habitId: habit.id,
            date,
            done: true,
            skipped: false,
            xpEarned: habit.xpPerCompletion,
            completedAt: `${date}T23:00:00.000Z`,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }
  }

  // Bulk insert
  await db.transaction('rw', [db.routineBlocks, db.habits, db.completions, db.relapses], async () => {
    await db.routineBlocks.bulkAdd([morningBlock, afternoonBlock, eveningBlock]);
    await db.habits.bulkAdd(habits);
    await db.completions.bulkAdd(completions);
    if (relapses.length > 0) {
      await db.relapses.bulkAdd(relapses);
    }
  });
}
