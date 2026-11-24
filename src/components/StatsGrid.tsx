import { AlertTriangle, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { TaskFilter, TaskStats } from '../types/task';

interface StatsGridProps {
  stats: TaskStats;
  activeFilter: TaskFilter;
  onSelectFilter: (filter: TaskFilter) => void;
}

export function StatsGrid({ stats, activeFilter, onSelectFilter }: StatsGridProps) {
  const cards = [
    {
      id: 'all' as TaskFilter,
      label: 'Total Tasks',
      value: stats.total,
      subtitle: 'All tracked items',
      icon: ListTodo,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      valueColor: 'text-slate-900',
    },
    {
      id: 'completed' as TaskFilter,
      label: 'Completed Tasks',
      value: stats.completed,
      subtitle:
        stats.total > 0
          ? `${Math.round((stats.completed / stats.total) * 100)}% completion rate`
          : 'No tasks recorded',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      valueColor: 'text-slate-900',
    },
    {
      id: 'pending' as TaskFilter,
      label: 'Pending Tasks',
      value: stats.pending,
      subtitle: 'Remaining to finish',
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      valueColor: 'text-slate-900',
    },
    {
      id: 'overdue' as TaskFilter,
      label: 'Overdue Tasks',
      value: stats.overdue,
      subtitle: stats.overdue > 0 ? 'Past due date' : 'All on schedule',
      icon: AlertTriangle,
      iconColor: stats.overdue > 0 ? 'text-red-600' : 'text-slate-400',
      iconBg: stats.overdue > 0 ? 'bg-red-50' : 'bg-slate-100',
      valueColor: stats.overdue > 0 ? 'text-red-600' : 'text-slate-900',
    },
  ];

  return (
    <section aria-label="Task statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id)}
            className={`group flex flex-col justify-between rounded-xl border bg-white p-5 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              isSelected
                ? 'border-blue-600 ring-1 ring-blue-600/15'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex w-full items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-600">{card.label}</span>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg} ${card.iconColor}`}
              >
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
              <span
                className={`font-display text-3xl font-bold tracking-tight tabular-nums ${card.valueColor}`}
              >
                {card.value}
              </span>
              <span className="text-xs text-slate-500 truncate">{card.subtitle}</span>
            </div>
          </button>
        );
      })}
    </section>
  );
}
