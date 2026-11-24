import { Priority, SortOption, Task, TaskFilter, TaskStats } from '../types/task';

const STORAGE_KEY = 'cadence_tasks_v1';

export function formatLocalDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return formatLocalDateISO(new Date());
}

export function getRelativeDateString(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatLocalDateISO(date);
}

export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

export function isTaskOverdue(task: Task): boolean {
  if (task.status === 'completed' || !task.dueDate) return false;
  return task.dueDate < getTodayDateString();
}

export function formatDisplayDate(dateStr: string): string {
  if (!isValidDateString(dateStr)) return 'No due date';
  const today = getTodayDateString();
  const tomorrow = getRelativeDateString(1);
  const yesterday = getRelativeDateString(-1);

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  if (dateStr === yesterday) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function createInitialTasks(): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'task-seed-1',
      title: 'Finalize Q4 sprint roadmap and deliverables',
      description:
        'Review engineering capacity estimates, confirm milestone dates with design, and circulate the updated release schedule before the afternoon sync.',
      dueDate: getTodayDateString(),
      priority: 'high',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'task-seed-2',
      title: 'Submit quarterly vendor expense reconciliation',
      description:
        'Verify cloud infrastructure invoices against approved purchase orders and upload receipts to the finance portal.',
      dueDate: getRelativeDateString(-1),
      priority: 'high',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'task-seed-3',
      title: 'Prepare customer onboarding walkthrough deck',
      description:
        'Update product screenshots, refine step-by-step setup slides, and add FAQ notes for new workspace administrators.',
      dueDate: getRelativeDateString(2),
      priority: 'medium',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'task-seed-4',
      title: 'Archive completed October design review notes',
      description:
        'Move finalized Figma annotations and meeting summaries into the shared documentation folder for future reference.',
      dueDate: getRelativeDateString(-2),
      priority: 'low',
      status: 'completed',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function loadTasksFromStorage(): { tasks: Task[]; error: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const seeded = createInitialTasks();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return { tasks: seeded, error: false };
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { tasks: [], error: true };
    }
    const sanitized: Task[] = parsed.filter(
      (item): item is Task =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.dueDate === 'string' &&
        (item.priority === 'low' || item.priority === 'medium' || item.priority === 'high') &&
        (item.status === 'pending' || item.status === 'completed')
    );
    return { tasks: sanitized, error: false };
  } catch {
    return { tasks: [], error: true };
  }
}

export function saveTasksToStorage(tasks: Task[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

export function computeTaskStats(tasks: Task[]): TaskStats {
  let completed = 0;
  let pending = 0;
  let overdue = 0;
  let highPriority = 0;

  for (const task of tasks) {
    if (task.status === 'completed') {
      completed += 1;
    } else {
      pending += 1;
      if (isTaskOverdue(task)) {
        overdue += 1;
      }
    }
    if (task.priority === 'high') {
      highPriority += 1;
    }
  }

  return {
    total: tasks.length,
    completed,
    pending,
    overdue,
    highPriority,
  };
}

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function filterAndSortTasks(
  tasks: Task[],
  filter: TaskFilter,
  searchQuery: string,
  sortBy: SortOption
): Task[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (normalizedQuery && !task.title.toLowerCase().includes(normalizedQuery)) {
      return false;
    }

    switch (filter) {
      case 'completed':
        return task.status === 'completed';
      case 'pending':
        return task.status === 'pending';
      case 'high-priority':
        return task.priority === 'high';
      case 'overdue':
        return isTaskOverdue(task);
      case 'all':
      default:
        return true;
    }
  });

  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'due-asc': {
        const dateCompare = a.dueDate.localeCompare(b.dueDate);
        if (dateCompare !== 0) return dateCompare;
        return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      }
      case 'due-desc': {
        const dateCompare = b.dueDate.localeCompare(a.dueDate);
        if (dateCompare !== 0) return dateCompare;
        return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      }
      case 'priority-desc': {
        const weightDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (weightDiff !== 0) return weightDiff;
        return a.dueDate.localeCompare(b.dueDate);
      }
      case 'priority-asc': {
        const weightDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
        if (weightDiff !== 0) return weightDiff;
        return a.dueDate.localeCompare(b.dueDate);
      }
      default:
        return 0;
    }
  });
}

export function generateTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
