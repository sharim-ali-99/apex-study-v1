import React, { useState } from 'react';
import { 
  Task, 
  TaskCategory, 
  TaskPriority, 
  TaskStatus 
} from '../types';
import { 
  Check, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Edit3
} from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onClearCompleted: () => void;
  onQuickAddTask?: (title: string, category: TaskCategory, priority: TaskPriority, dueDate: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onToggleTask,
  onToggleSubtask,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onClearCompleted,
  onQuickAddTask
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  // Inline fast task creation
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<TaskCategory>('Homework');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('Medium');
  const [quickDueDate, setQuickDueDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    if (onQuickAddTask) {
      onQuickAddTask(quickTitle.trim(), quickCategory, quickPriority, quickDueDate);
    }
    setQuickTitle('');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.subject && task.subject.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || task.category === selectedCategory;

    const matchesStatus = 
      selectedFilter === 'all' ? true :
      selectedFilter === 'completed' ? task.status === 'completed' :
      task.status !== 'completed';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = tasks.filter(t => t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'High':
        return <span className="text-rose-600 dark:text-rose-400 font-semibold">High</span>;
      case 'Medium':
        return <span className="text-amber-600 dark:text-amber-400 font-medium">Medium</span>;
      case 'Low':
      default:
        return <span className="text-slate-400 font-normal">Low</span>;
    }
  };

  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return null;
    const now = new Date();
    const target = new Date(dateStr + 'T23:59:59');
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="text-rose-600 dark:text-rose-400 font-medium">Overdue ({dateStr})</span>;
    } else if (diffDays === 0) {
      return <span className="text-amber-600 dark:text-amber-400 font-medium">Due today</span>;
    } else if (diffDays === 1) {
      return <span className="text-slate-700 dark:text-slate-300">Due tomorrow</span>;
    }
    return <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{dateStr}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        {/* Segmented Filter */}
        <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-medium">
          <button
            onClick={() => setSelectedFilter('active')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              selectedFilter === 'active'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setSelectedFilter('completed')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              selectedFilter === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 border-none text-slate-900 dark:text-white placeholder:text-slate-400 outline-none w-36 sm:w-48"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 outline-none cursor-pointer border-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Homework">Homework</option>
            <option value="Project">Project</option>
            <option value="Exam Prep">Exam Prep</option>
            <option value="Personal Goal">Personal Goal</option>
            <option value="Club / Activity">Club / Activity</option>
          </select>

          {completedCount > 0 && selectedFilter !== 'active' && (
            <button
              onClick={onClearCompleted}
              className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 transition-colors cursor-pointer"
            >
              Clear Done
            </button>
          )}
        </div>
      </div>

      {/* Inline Fast Add Task (Things 3 / Linear style) */}
      <form
        onSubmit={handleQuickSubmit}
        className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 focus-within:border-slate-400 dark:focus-within:border-slate-600 transition-colors"
      >
        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 ml-2 shrink-0"></div>
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Add a new task (e.g. Physics Problem Set 4)... Press Enter"
          className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-medium"
        />

        <select
          value={quickCategory}
          onChange={(e) => setQuickCategory(e.target.value as any)}
          className="text-xs px-2 py-1 rounded bg-transparent text-slate-600 dark:text-slate-300 outline-none cursor-pointer border-none"
        >
          <option value="Homework">Homework</option>
          <option value="Project">Project</option>
          <option value="Exam Prep">Exam Prep</option>
          <option value="Personal Goal">Personal Goal</option>
        </select>

        <select
          value={quickPriority}
          onChange={(e) => setQuickPriority(e.target.value as any)}
          className="text-xs px-2 py-1 rounded bg-transparent text-slate-600 dark:text-slate-300 outline-none cursor-pointer border-none"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <input
          type="date"
          value={quickDueDate}
          onChange={(e) => setQuickDueDate(e.target.value)}
          className="text-xs font-mono px-2 py-1 rounded bg-transparent text-slate-600 dark:text-slate-300 outline-none cursor-pointer border-none"
        />

        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-3 py-1 text-xs font-medium rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-30 transition-opacity cursor-pointer shrink-0"
        >
          Add
        </button>
      </form>

      {/* Clean Tasks List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {tasks.length === 0 
                ? 'No tasks yet. Type above and press Enter to add your first assignment.'
                : 'No tasks matching your current filter.'}
            </p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            const isExpanded = !!expandedTaskIds[task.id];
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;

            return (
              <div
                key={task.id}
                className="group py-3 px-1 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  {/* Subtle Circular Checkbox */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-slate-900 border-slate-900 dark:bg-slate-100 dark:border-slate-100 text-white dark:text-slate-900'
                        : 'border-slate-300 dark:border-slate-600 hover:border-blue-600'
                    }`}
                  >
                    {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-xs font-semibold text-slate-900 dark:text-white leading-relaxed ${
                        isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}>
                        {task.title}
                      </span>

                      {/* Hover action buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Unboxed Editorial Metadata (NO PILLS) */}
                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {task.subject && (
                        <>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{task.subject}</span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span>{task.category}</span>
                      <span aria-hidden="true">·</span>
                      {getPriorityLabel(task.priority)}

                      {task.dueDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          {formatDueDate(task.dueDate)}
                        </>
                      )}

                      {hasSubtasks && (
                        <>
                          <span aria-hidden="true">·</span>
                          <button
                            onClick={() => toggleExpand(task.id)}
                            className="hover:text-blue-600 dark:hover:text-blue-400 font-medium inline-flex items-center space-x-0.5 cursor-pointer"
                          >
                            <span>{completedSubtasks}/{task.subtasks.length} subtasks</span>
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Description if any */}
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Subtasks Expanded View */}
                    {isExpanded && hasSubtasks && (
                      <div className="mt-2.5 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-1.5">
                        {task.subtasks.map(subtask => (
                          <label
                            key={subtask.id}
                            className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => onToggleSubtask(task.id, subtask.id)}
                              className="rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-0 h-3 w-3"
                            />
                            <span className={subtask.completed ? 'line-through text-slate-400' : ''}>
                              {subtask.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
