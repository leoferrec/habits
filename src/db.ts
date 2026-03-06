import Dexie, { type Table } from 'dexie';
import type { Habit, RoutineBlock, Completion, TimerSession, Relapse } from './types';

export class HabitsDB extends Dexie {
  habits!: Table<Habit, string>;
  routineBlocks!: Table<RoutineBlock, string>;
  completions!: Table<Completion, string>;
  timerSessions!: Table<TimerSession, string>;
  relapses!: Table<Relapse, string>;

  constructor() {
    super('AtomicHabitsTracker');

    this.version(1).stores({
      habits: 'id, type, &name, updatedAt, deletedAt',
      routineBlocks: 'id, sortOrder, updatedAt, deletedAt',
      completions: 'id, habitId, date, [habitId+date], updatedAt, deletedAt',
      timerSessions: 'id, habitId, date, [habitId+date], status, updatedAt',
      relapses: 'id, habitId, date, [habitId+date], updatedAt, deletedAt',
    });
  }
}

export const db = new HabitsDB();

// ---- Habit Repo ----
export const habitRepo = {
  async getAll(): Promise<Habit[]> {
    return db.habits.filter((h) => !h.deletedAt).sortBy('sortOrder');
  },

  async getById(id: string): Promise<Habit | undefined> {
    return db.habits.get(id);
  },

  async getByType(type: 'build' | 'break'): Promise<Habit[]> {
    return db.habits
      .where('type')
      .equals(type)
      .filter((h) => !h.deletedAt)
      .sortBy('sortOrder');
  },

  async create(habit: Habit): Promise<string> {
    return db.habits.add(habit);
  },

  async update(id: string, changes: Partial<Habit>): Promise<number> {
    return db.habits.update(id, { ...changes, updatedAt: new Date().toISOString() });
  },

  async softDelete(id: string): Promise<number> {
    return db.habits.update(id, { deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  },
};

// ---- RoutineBlock Repo ----
export const routineRepo = {
  async getAll(): Promise<RoutineBlock[]> {
    return db.routineBlocks.filter((r) => !r.deletedAt).sortBy('startTime');
  },

  async create(block: RoutineBlock): Promise<string> {
    return db.routineBlocks.add(block);
  },

  async update(id: string, changes: Partial<RoutineBlock>): Promise<number> {
    return db.routineBlocks.update(id, { ...changes, updatedAt: new Date().toISOString() });
  },

  async softDelete(id: string): Promise<number> {
    return db.routineBlocks.update(id, { deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  },
};

// ---- Completion Repo ----
export const completionRepo = {
  async getByDate(date: string): Promise<Completion[]> {
    return db.completions
      .where('date')
      .equals(date)
      .filter((c) => !c.deletedAt)
      .toArray();
  },

  async getByHabitAndDateRange(habitId: string, startDate: string, endDate: string): Promise<Completion[]> {
    return db.completions
      .where('habitId')
      .equals(habitId)
      .filter((c) => !c.deletedAt && c.date >= startDate && c.date <= endDate)
      .toArray();
  },

  async getByHabit(habitId: string): Promise<Completion[]> {
    return db.completions
      .where('habitId')
      .equals(habitId)
      .filter((c) => !c.deletedAt)
      .toArray();
  },

  async upsert(completion: Completion): Promise<string> {
    const existing = await db.completions
      .where('[habitId+date]')
      .equals([completion.habitId, completion.date])
      .first();
    if (existing) {
      await db.completions.update(existing.id, {
        ...completion,
        id: existing.id,
        updatedAt: new Date().toISOString(),
      });
      return existing.id;
    }
    return db.completions.add(completion);
  },

  async markDone(habitId: string, date: string, xp: number): Promise<Completion> {
    const now = new Date().toISOString();
    const completion: Completion = {
      id: crypto.randomUUID(),
      habitId,
      date,
      done: true,
      skipped: false,
      xpEarned: xp,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await completionRepo.upsert(completion);
    return completion;
  },

  async unmarkDone(habitId: string, date: string): Promise<void> {
    const existing = await db.completions
      .where('[habitId+date]')
      .equals([habitId, date])
      .first();
    if (existing) {
      await db.completions.update(existing.id, {
        done: false,
        skipped: false,
        xpEarned: 0,
        completedAt: undefined,
        updatedAt: new Date().toISOString(),
      });
    }
  },
};

// ---- Timer Repo ----
export const timerRepo = {
  async getByHabitAndDate(habitId: string, date: string): Promise<TimerSession | undefined> {
    return db.timerSessions
      .where('[habitId+date]')
      .equals([habitId, date])
      .first();
  },

  async upsert(session: TimerSession): Promise<string> {
    const existing = await db.timerSessions
      .where('[habitId+date]')
      .equals([session.habitId, session.date])
      .first();
    if (existing) {
      await db.timerSessions.update(existing.id, {
        ...session,
        id: existing.id,
        updatedAt: new Date().toISOString(),
      });
      return existing.id;
    }
    return db.timerSessions.add(session);
  },
};

// ---- Relapse Repo ----
export const relapseRepo = {
  async getByHabit(habitId: string): Promise<Relapse[]> {
    return db.relapses
      .where('habitId')
      .equals(habitId)
      .filter((r) => !r.deletedAt)
      .toArray();
  },

  async getByDate(date: string): Promise<Relapse[]> {
    return db.relapses
      .where('date')
      .equals(date)
      .filter((r) => !r.deletedAt)
      .toArray();
  },

  async getAll(): Promise<Relapse[]> {
    return db.relapses.filter((r) => !r.deletedAt).toArray();
  },

  async create(relapse: Relapse): Promise<string> {
    return db.relapses.add(relapse);
  },
};
