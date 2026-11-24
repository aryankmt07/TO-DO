/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Menu, Plus, RotateCcw } from 'lucide-react';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Sidebar } from './components/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { TaskCard } from './components/TaskCard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskFormModal } from './components/TaskFormModal';
import { ToastContainer } from './components/ToastContainer';
import { Toolbar } from './components/Toolbar';
import {
  SortOption,
  Task,
  TaskFilter,
  TaskFormData,
  TaskStatus,
  ToastMessage,
} from './types/task';
import {
  computeTaskStats,
  filterAndSortTasks,
  generateTaskId,
  loadTasksFromStorage,
  saveTasksToStorage,
} from './utils/taskStorage';

const FILTER_TITLES: Record<TaskFilter, { title: string; subtitle: string }> = {
  all: {
    title: 'All Tasks',
    subtitle: 'Overview of everything scheduled across your workspace.',
  },
  pending: {
    title: 'Pending Tasks',
    subtitle: 'Active work items waiting to be completed.',
  },
  completed: {
    title: 'Completed Tasks',
    subtitle: 'Finished work kept for your records.',
  },
  'high-priority': {
    title: 'High Priority',
    subtitle: 'Critical tasks requiring immediate attention.',
  },
  overdue: {
    title: 'Overdue Tasks',
    subtitle: 'Pending items whose due date has passed.',
  },
};

export default function App() {
  const [{ initialTasks, loadError }] = useState(() => {
    const result = loadTasksFromStorage();
    return { initialTasks: result.tasks, loadError: result.error };
  });

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('due-asc');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isClearCompletedOpen, setIsClearCompletedOpen] = useState(false);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (type: 'success' | 'error', title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    if (loadError) {
      pushToast(
        'error',
        'Storage Warning',
        'Could not read previously saved tasks from browser storage.'
      );
    }
  }, [loadError, pushToast]);

  // Persist tasks to localStorage on every change
  const persistTasks = useCallback(
    (nextTasks: Task[]) => {
      setTasks(nextTasks);
      const saved = saveTasksToStorage(nextTasks);
      if (!saved) {
        pushToast(
          'error',
          'Save Failed',
          'Unable to persist changes to local browser storage.'
        );
      }
    },
    [pushToast]
  );

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);

  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, activeFilter, searchQuery, sortBy),
    [tasks, activeFilter, searchQuery, sortBy]
  );

  const viewingTask = useMemo(
    () => (viewingTaskId ? tasks.find((t) => t.id === viewingTaskId) ?? null : null),
    [tasks, viewingTaskId]
  );

  // CRUD Handlers
  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (formData: TaskFormData) => {
    const now = new Date().toISOString();

    if (editingTask) {
      const updatedTasks = tasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: formData.title,
              description: formData.description,
              dueDate: formData.dueDate,
              priority: formData.priority,
              status: formData.status,
              updatedAt: now,
            }
          : task
      );
      persistTasks(updatedTasks);
      setIsFormOpen(false);
      setEditingTask(null);
      pushToast('success', 'Task Updated', `"${formData.title}" has been updated.`);
    } else {
      const newTask: Task = {
        id: generateTaskId(),
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
        createdAt: now,
        updatedAt: now,
      };
      persistTasks([newTask, ...tasks]);
      setIsFormOpen(false);
      pushToast('success', 'Task Created', `"${formData.title}" added to your list.`);
    }
  };

  const handleToggleStatus = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const nextStatus: TaskStatus =
      target.status === 'completed' ? 'pending' : 'completed';
    const now = new Date().toISOString();
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, status: nextStatus, updatedAt: now }
        : task
    );

    persistTasks(updatedTasks);
    pushToast(
      'success',
      nextStatus === 'completed' ? 'Task Completed' : 'Task Reopened',
      `"${target.title}" marked as ${nextStatus}.`
    );
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    const deletedTitle = taskToDelete.title;
    const nextTasks = tasks.filter((task) => task.id !== taskToDelete.id);
    if (viewingTaskId === taskToDelete.id) {
      setViewingTaskId(null);
    }
    persistTasks(nextTasks);
    setTaskToDelete(null);
    pushToast('success', 'Task Deleted', `"${deletedTitle}" was removed.`);
  };

  const handleConfirmClearCompleted = () => {
    const completedCount = tasks.filter((t) => t.status === 'completed').length;
    const nextTasks = tasks.filter((t) => t.status !== 'completed');
    persistTasks(nextTasks);
    setIsClearCompletedOpen(false);
    pushToast(
      'success',
      'Completed Tasks Cleared',
      `Removed ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}.`
    );
  };

  const handleResetFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
  };

  const viewInfo = FILTER_TITLES[activeFilter];
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        stats={stats}
        onOpenCreate={handleOpenCreate}
        onRequestClearCompleted={() => setIsClearCompletedOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Viewport */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Workspace</span>
                  <span aria-hidden="true">/</span>
                  <span className="truncate">{viewInfo.title}</span>
                  <span className="hidden sm:inline" aria-hidden="true">
                    ·
                  </span>
                  <span className="hidden sm:inline tabular-nums">{todayFormatted}</span>
                </div>
                <h1 className="font-display truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {viewInfo.title}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors duration-150 hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Add Task</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Task Statistics */}
          <StatsGrid
            stats={stats}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
          />

          {/* Search, Filter & Sort Controls */}
          <Toolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Task List Header & Count */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-slate-600">{viewInfo.subtitle}</p>
            </div>
            <p className="font-mono text-xs font-medium text-slate-500 tabular-nums">
              Showing {visibleTasks.length} of {tasks.length}{' '}
              {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>

          {/* Task Cards Grid or Empty States */}
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardList className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-slate-900">
                No tasks yet
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                Your task board is clear. Add your first task with a due date and
                priority level to start organizing your day.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Create First Task</span>
              </button>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <ClipboardList className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-slate-900">
                No matching tasks found
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                {searchQuery.trim()
                  ? `No tasks matched "${searchQuery.trim()}" in the ${viewInfo.title.toLowerCase()} view.`
                  : `There are currently no tasks in the ${viewInfo.title.toLowerCase()} view.`}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onView={(selected) => setViewingTaskId(selected.id)}
                  onEdit={handleOpenEdit}
                  onDelete={setTaskToDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Task Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        initialTask={editingTask}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        onValidationError={(msg) => pushToast('error', 'Validation Error', msg)}
      />

      {/* Task Detail Read Modal */}
      <TaskDetailModal
        task={viewingTask}
        onClose={() => setViewingTaskId(null)}
        onToggleStatus={handleToggleStatus}
        onEdit={handleOpenEdit}
        onDelete={setTaskToDelete}
      />

      {/* Delete Single Task Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete this task?"
        description={
          taskToDelete
            ? `Are you sure you want to permanently delete "${taskToDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Task"
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Clear Completed Tasks Confirmation */}
      <DeleteConfirmModal
        isOpen={isClearCompletedOpen}
        title="Clear all completed tasks?"
        description={`This will permanently remove ${stats.completed} completed ${
          stats.completed === 1 ? 'task' : 'tasks'
        } from your workspace.`}
        confirmLabel="Clear Completed"
        onCancel={() => setIsClearCompletedOpen(false)}
        onConfirm={handleConfirmClearCompleted}
      />

      {/* Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
