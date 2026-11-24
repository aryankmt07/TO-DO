import { ArrowUpDown, Search, X } from 'lucide-react';
import { SortOption, TaskFilter } from '../types/task';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const FILTER_OPTIONS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'high-priority', label: 'High Priority' },
];

export function Toolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
}: ToolbarProps) {
  return (
    <section
      aria-label="Filter, search, and sort tasks"
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between"
    >
      {/* Search by title */}
      <div className="relative flex-1 lg:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks by title..."
          aria-label="Search tasks by title"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-blue-600 focus:bg-white focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search query"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
        {/* Segmented Filter Tabs */}
        <div
          role="group"
          aria-label="Filter tasks"
          className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1"
        >
          {FILTER_OPTIONS.map((option) => {
            const isActive = activeFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFilterChange(option.id)}
                aria-pressed={isActive}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="relative flex items-center shrink-0">
          <ArrowUpDown
            className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-500"
            aria-hidden="true"
          />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort tasks"
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-8 text-xs font-medium text-slate-700 transition-colors duration-150 hover:border-slate-300 focus:border-blue-600 focus:outline-none sm:w-auto"
          >
            <option value="due-asc">Due Date: Soonest First</option>
            <option value="due-desc">Due Date: Latest First</option>
            <option value="priority-desc">Priority: High to Low</option>
            <option value="priority-asc">Priority: Low to High</option>
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
