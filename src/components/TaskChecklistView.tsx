import React, { useState } from 'react';
import { Task, TaskPriority, TaskCategory, StudentAccount } from '../types';
import { 
  Check, 
  Plus, 
  Trash2, 
  Search, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import { getColorById, getSubjectColorId } from '../utils/colorPalette';

interface TaskChecklistViewProps {
  tasks: Task[];
  account: StudentAccount;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskChecklistView: React.FC<TaskChecklistViewProps> = ({
  tasks,
  account,
  onToggleTask,
  onAddTask,
  onDeleteTask
}) => {
  const [filter, setFilter] = useState<'active' | 'all' | 'completed'>('active');
  const [search, setSearch] = useState('');

  // Quick add form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(account.subjects?.[0]?.name || 'Physics');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [category, setCategory] = useState<TaskCategory>('Homework');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      subject: subject.trim(),
      priority,
      category,
      status: 'todo',
      dueDate,
      subtasks: [],
      tags: [subject],
      createdAt: new Date().toISOString()
    });

    setTitle('');
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = filter === 'all' ? true :
      filter === 'completed' ? t.status === 'completed' :
      t.status !== 'completed';

    return matchesSearch && matchesStatus;
  });

  const activeCount = tasks.filter(t => t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fade-in">
      {/* Top Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filter === 'active'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or subjects..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white outline-none w-48 sm:w-64"
          />
        </div>
      </div>

      {/* Quick Add Form Row */}
      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-center gap-2 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs"
      >
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task (e.g. Physics Problem Set 4, Solve Calculus proofs)..."
          className="flex-1 min-w-[200px] px-2.5 py-1.5 text-xs bg-transparent text-slate-900 dark:text-white outline-none font-medium"
        />

        {/* Subject Select from Account Courses */}
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none cursor-pointer border border-slate-200 dark:border-slate-700 font-semibold"
        >
          {(account.subjects || []).map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
          <option value="General">General / Routine</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="text-xs px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="text-xs px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <option value="Homework">Homework</option>
          <option value="Project">Project</option>
          <option value="Exam Prep">Exam Prep</option>
          <option value="Personal Goal">Personal Goal</option>
          <option value="Club / Activity">Club / Activity</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="text-xs font-mono px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none cursor-pointer border border-slate-200 dark:border-slate-700"
        />

        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 disabled:opacity-30 cursor-pointer shadow-xs"
        >
          Add Task
        </button>
      </form>

      {/* Checklist Items */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            {tasks.length === 0 
              ? 'No tasks yet. Type above to add your first checklist item, or ask the AI copilot.'
              : 'No tasks matching current filter.'}
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            const subjectColorId = getSubjectColorId(task.subject || '', account.subjects);
            const colorObj = getColorById(subjectColorId);

            return (
              <div
                key={task.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Clean Checkbox */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-bold ${
                      isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                    }`}>
                      {task.title}
                    </div>

                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2 mt-0.5">
                      {task.subject && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                          {task.subject}
                        </span>
                      )}
                      <span>{task.category}</span>
                      <span>·</span>
                      <span className={task.priority === 'High' ? 'text-rose-600 font-bold' : ''}>{task.priority} Priority</span>
                      <span>·</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
