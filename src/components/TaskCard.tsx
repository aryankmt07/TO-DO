import {
  AlertCircle,
  Calendar,
  Check,
  Eye,
  Flag,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Priority, Task } from '../types/task';
import { formatDisplayDate, isTaskOverdue } from '../utils/taskStorage';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_STYLES: Record<
  Priority,
  { label: string; textClass: string; topBarClass: string }
> = {
  high: {
    label: 'High Priority',
    textClass: 'text-red-600 font-semibold',
    topBarClass: 'bg-red-500',
  },
  medium: {
    label: 'Medium Priority',
    textClass: 'text-amber-600 font-medium',
    topBarClass: 'bg-amber-500',
  },
  low: {
    label: 'Low Priority',
    textClass: 'text-teal-700 font-medium',
    topBarClass: 'bg-teal-500',
  },
};

export function TaskCard({
  task,
  onToggleStatus,
  onView,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const overdue = isTaskOverdue(task);
  const priorityStyle = PRIORITY_STYLES[task.priority];

  return (
    <article
      className={`group flex flex-col justify-between overflow-hidden rounded-xl border bg-white transition-all duration-150 ${
        isCompleted
          ? 'border-slate-200/80 bg-slate-50/50'
          : overdue
            ? 'border-red-200 hover:border-red-300 hover:shadow-sm'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Subtle top priority color bar */}
      <div
        className={`h-1 w-full transition-opacity duration-150 ${
          isCompleted ? 'bg-slate-200' : priorityStyle.topBarClass
        }`}
        aria-hidden="true"
      />

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Card Header: Checkbox + Title */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => onToggleStatus(task.id)}
              aria-label={
                isCompleted
                  ? `Mark "${task.title}" as pending`
                  : `Mark "${task.title}" as completed`
              }
              aria-pressed={isCompleted}
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 ${
                  isCompleted
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 bg-white text-transparent group-hover:border-blue-500'
                }`}
              >
                <Check className="h-3.5 w-3.5 stroke-[2.75]" aria-hidden="true" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onView(task)}
              className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
            >
              <h3
                className={`font-display text-base font-semibold leading-snug transition-colors duration-150 ${
                  isCompleted
                    ? 'text-slate-400 line-through'
                    : 'text-slate-900 group-hover:text-blue-700'
                }`}
              >
                {task.title}
              </h3>
            </button>
          </div>

          {/* Description */}
          <p
            className={`mt-2.5 pl-9 text-sm leading-relaxed line-clamp-2 ${
              isCompleted ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {task.description ? (
              task.description
            ) : (
              <span className="italic text-slate-400">No description provided</span>
            )}
          </p>
        </div>

        {/* Footer Metadata + Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
          {/* Unboxed clean metadata with typographic separators */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className={`inline-flex items-center gap-1 ${isCompleted ? 'text-slate-400 font-medium' : priorityStyle.textClass}`}>
              <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{priorityStyle.label}</span>
            </span>

            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>

            <span
              className={`inline-flex items-center gap-1 tabular-nums ${
                overdue
                  ? 'font-semibold text-red-600'
                  : isCompleted
                    ? 'text-slate-400'
                    : 'text-slate-600'
              }`}
            >
              {overdue ? (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>
                {formatDisplayDate(task.dueDate)}
                {overdue ? ' (Overdue)' : ''}
              </span>
            </span>

            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>

            <span
              className={
                isCompleted
                  ? 'font-medium text-emerald-700'
                  : 'font-medium text-slate-500'
              }
            >
              {isCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onView(task)}
              aria-label={`View details for "${task.title}"`}
              title="View details"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit "${task.title}"`}
              title="Edit task"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Delete "${task.title}"`}
              title="Delete task"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
