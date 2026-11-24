import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { TaskFilter, TaskStats } from '../types/task';

interface SidebarProps {
  activeFilter: TaskFilter;
  onSelectFilter: (filter: TaskFilter) => void;
  stats: TaskStats;
  onOpenCreate: () => void;
  onRequestClearCompleted: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: TaskFilter;
  label: string;
  count: number;
  icon: typeof Layers;
  highlightOverdue?: boolean;
}

export function Sidebar({
  activeFilter,
  onSelectFilter,
  stats,
  onOpenCreate,
  onRequestClearCompleted,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'all', label: 'All Tasks', count: stats.total, icon: Layers },
    { id: 'pending', label: 'Pending', count: stats.pending, icon: Clock },
    { id: 'completed', label: 'Completed', count: stats.completed, icon: CheckCircle2 },
    { id: 'high-priority', label: 'High Priority', count: stats.highPriority, icon: Flame },
    {
      id: 'overdue',
      label: 'Overdue',
      count: stats.overdue,
      icon: AlertCircle,
      highlightOverdue: stats.overdue > 0,
    },
  ];

  const completionPercentage =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleNavClick = (filter: TaskFilter) => {
    onSelectFilter(filter);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200 px-4 py-6">
      <div className="space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Cadence
            </span>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Primary CTA */}
        <div>
          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              onOpenCreate();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>New Task</span>
          </button>
        </div>

        {/* Navigation Views */}
        <nav aria-label="Task views" className="space-y-1">
          <p className="px-2 pb-1.5 text-xs font-medium text-slate-400">
            Workspace Views
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? 'text-white'
                        : item.highlightOverdue
                          ? 'text-red-600'
                          : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    isActive
                      ? 'text-slate-200'
                      : item.highlightOverdue
                        ? 'font-semibold text-red-600'
                        : 'text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Progress Summary & Clear Completed */}
      <div className="space-y-4 border-t border-slate-200 pt-5">
        <div className="px-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Completion</span>
            <span className="font-mono font-medium text-slate-900 tabular-nums">
              {completionPercentage}%
            </span>
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Task completion progress"
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-200"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 tabular-nums">
            {stats.completed} of {stats.total} tasks completed
          </p>
        </div>

        {stats.completed > 0 && (
          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              onRequestClearCompleted();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors duration-150 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 whitespace-nowrap"
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            <span>Clear Completed ({stats.completed})</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile slide-over drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full w-72 max-w-[85vw] shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
