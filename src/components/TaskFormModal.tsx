import { FormEvent, useEffect, useRef, useState } from 'react';
import { AlertCircle, Flag, X } from 'lucide-react';
import { Priority, Task, TaskFormData, TaskStatus } from '../types/task';
import { getTodayDateString, isValidDateString } from '../utils/taskStorage';

interface TaskFormModalProps {
  isOpen: boolean;
  initialTask: Task | null;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  onValidationError: (message: string) => void;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
  description?: string;
}

export function TaskFormModal({
  isOpen,
  initialTask,
  onClose,
  onSubmit,
  onValidationError,
}: TaskFormModalProps) {
  const isEditing = Boolean(initialTask);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) return;
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setDueDate(initialTask.dueDate);
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getTodayDateString());
      setPriority('medium');
      setStatus('pending');
    }
    setErrors({});
    const timer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(timer);
  }, [isOpen, initialTask]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      nextErrors.title = 'Task title cannot be empty.';
    } else if (trimmedTitle.length > 120) {
      nextErrors.title = 'Task title must be 120 characters or fewer.';
    }

    if (!dueDate || !isValidDateString(dueDate)) {
      nextErrors.dueDate = 'Please select a valid due date.';
    }

    if (description.trim().length > 1000) {
      nextErrors.description = 'Description must be 1,000 characters or fewer.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstError = nextErrors.title || nextErrors.dueDate || nextErrors.description;
      if (firstError) {
        onValidationError(firstError);
      }
      return false;
    }

    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      status,
    });
  };

  const priorityOptions: { value: Priority; label: string; activeClass: string }[] = [
    {
      value: 'low',
      label: 'Low',
      activeClass: 'border-teal-600 bg-teal-50 text-teal-800',
    },
    {
      value: 'medium',
      label: 'Medium',
      activeClass: 'border-amber-500 bg-amber-50 text-amber-800',
    },
    {
      value: 'high',
      label: 'High',
      activeClass: 'border-red-600 bg-red-50 text-red-700',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2
            id="task-form-title"
            className="font-display text-lg font-semibold text-slate-900"
          >
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="task-title"
                className="block text-sm font-medium text-slate-700"
              >
                Task Title <span className="text-red-600">*</span>
              </label>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {title.trim().length}/120
              </span>
            </div>
            <input
              ref={titleInputRef}
              id="task-title"
              type="text"
              value={title}
              maxLength={125}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g., Prepare weekly product review notes"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'task-title-error' : undefined}
              className={`mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none ${
                errors.title
                  ? 'border-red-500 bg-red-50/40 focus:border-red-600'
                  : 'border-slate-200 bg-white focus:border-blue-600'
              }`}
            />
            {errors.title && (
              <p
                id="task-title-error"
                className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="task-description"
                className="block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {description.trim().length}/1000
              </span>
            </div>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Add context, links, or key steps to complete..."
              className={`mt-1.5 w-full resize-y rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none ${
                errors.description
                  ? 'border-red-500 bg-red-50/40 focus:border-red-600'
                  : 'border-slate-200 bg-white focus:border-blue-600'
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Due Date & Status Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-due-date"
                className="block text-sm font-medium text-slate-700"
              >
                Due Date <span className="text-red-600">*</span>
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate)
                    setErrors((prev) => ({ ...prev, dueDate: undefined }));
                }}
                aria-invalid={Boolean(errors.dueDate)}
                className={`mt-1.5 w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 tabular-nums transition-colors focus:outline-none ${
                  errors.dueDate
                    ? 'border-red-500 bg-red-50/40 focus:border-red-600'
                    : 'border-slate-200 bg-white focus:border-blue-600'
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.dueDate}</span>
                </p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-700">Status</span>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(['pending', 'completed'] as TaskStatus[]).map((option) => {
                  const isActive = status === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatus(option)}
                      aria-pressed={isActive}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors duration-150 ${
                        isActive
                          ? option === 'completed'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-blue-600 bg-blue-50 text-blue-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Priority Selector */}
          <div>
            <span className="block text-sm font-medium text-slate-700">Priority</span>
            <div className="mt-1.5 grid grid-cols-3 gap-2.5">
              {priorityOptions.map((option) => {
                const isActive = priority === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    aria-pressed={isActive}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150 ${
                      isActive
                        ? option.activeClass
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
