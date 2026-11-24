import { useEffect } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { Priority, Task } from '../types/task';
import {
  formatDateTime,
  formatDisplayDate,
  isTaskOverdue,
} from '../utils/taskStorage';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onToggleStatus: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_TEXT: Record<Priority, { label: string; className: string }> = {
  high: { label: 'High Priority', className: 'text-red-600 font-semibold' },
  medium: { label: 'Medium Priority', className: 'text-amber-600 font-semibold' },
  low: { label: 'Low Priority', className: 'text-teal-700 font-semibold' },
};

export function TaskDetailModal({
  task,
  onClose,
  onToggleStatus,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  useEffect(() => {
    if (!task) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [task, onClose]);

  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const overdue = isTaskOverdue(task);
  const priorityInfo = PRIORITY_TEXT[task.priority];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Top semantic bar */}
        <div
          className={`h-1.5 w-full ${
            isCompleted
              ? 'bg-emerald-600'
              : task.priority === 'high'
                ? 'bg-red-500'
                : task.priority === 'medium'
                  ? 'bg-amber-500'
                  : 'bg-teal-500'
          }`}
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
            <span className={`inline-flex items-center gap-1 ${priorityInfo.className}`}>
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{priorityInfo.label}</span>
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span
              className={`inline-flex items-center gap-1 font-medium ${
                isCompleted ? 'text-emerald-700' : 'text-slate-600'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{isCompleted ? 'Completed' : 'Pending'}</span>
            </span>
            {overdue && (
              <>
                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Overdue</span>
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="-mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          <div>
            <h2
              id="task-detail-title"
              className={`font-display text-xl font-bold leading-snug ${
                isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h2>
          </div>

          <div>
            <h3 className="text-xs font-medium text-slate-400">Description</h3>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {task.description ? (
                task.description
              ) : (
                <span className="italic text-slate-400">
                  No description was added for this task.
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div>
              <span className="text-xs font-medium text-slate-400">Due Date</span>
              <p
                className={`mt-1 flex items-center gap-1.5 text-sm font-medium tabular-nums ${
                  overdue ? 'text-red-600' : 'text-slate-800'
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {formatDisplayDate(task.dueDate)} ({task.dueDate})
                </span>
              </p>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400">Last Updated</span>
              <p className="mt-1 text-sm text-slate-600 tabular-nums">
                {formatDateTime(task.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <button
            type="button"
            onClick={() => onToggleStatus(task.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              isCompleted
                ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{isCompleted ? 'Mark as Pending' : 'Mark as Completed'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(task);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
