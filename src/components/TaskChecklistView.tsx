import React, { useState } from 'react';
import { Task, TaskPriority, TaskCategory, StudentAccount } from '../types';
import { 
  Check, 
  Plus, 
  Trash2, 
  Search, 
  Calendar, 
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Tag,
  BookOpen
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
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date(Date.now() + 86400000);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  });

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

    if (!matchesSearch) return false;
    if (filter === 'active') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const activeCount = tasks.filter(t => t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5 max-w-4xl mx-auto animate-fade-in">
      {/* Top Inspiring Progress & Metrics Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-100 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Task Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Daily Tasks & Milestones
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            {activeCount} pending tasks • {completedCount} completed ({completionPercentage}% progress)
          </p>
        </div>

        {/* Mini Radial / Bar Progress Capsule */}
        <div className="relative z-10 flex items-center space-x-3 bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-xs">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-100">Completion</div>
            <div className="text-lg font-black font-mono text-white leading-none">{completionPercentage}%</div>
          </div>
          <div className="w-10 h-10 rounded-full border-3 border-white/30 border-t-white flex items-center justify-center font-mono text-xs font-bold">
            {completedCount}/{totalCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'active'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tasks or course..."
            className="pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none w-full sm:w-64 focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* Modern High-End Add Task Composer */}
      <form
        onSubmit={handleAdd}
        className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm space-y-3"
      >
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Quick Add Academic Task</span>
        </div>

        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to complete? (e.g. Physics Formula Derivations, Calculus Problem Set 3)..."
          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500/30"
        />

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Select */}
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              {(account.subjects || []).map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
              <option value="Physics">Physics</option>
              <option value="Maths">Maths</option>
              <option value="General Study">General Study</option>
            </select>

            {/* Priority */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <option value="High">● High Priority</option>
              <option value="Medium">● Medium</option>
              <option value="Low">● Low</option>
            </select>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <option value="Homework">Homework</option>
              <option value="Project">Project</option>
              <option value="Exam Prep">Exam Prep</option>
              <option value="Personal Goal">Personal Goal</option>
            </select>

            {/* Due Date */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs font-mono font-bold bg-transparent text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 cursor-pointer shadow-sm transition-all"
          >
            Create Task
          </button>
        </div>
      </form>

      {/* Task Cards Stream */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-6">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {tasks.length === 0 
                ? 'Your checklist is clean. Type above to add your first academic task!'
                : 'No tasks matching current filter.'}
            </p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            const subjectColorId = getSubjectColorId(task.subject || '', account.subjects);
            const colorObj = getColorById(subjectColorId);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
                  isCompleted
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                  {/* Clean Checkbox Button */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs'
                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-extrabold ${
                      isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                    }`}>
                      {task.title}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                      {task.subject && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                          {task.subject}
                        </span>
                      )}

                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {task.category}
                      </span>

                      <span>•</span>

                      <span className={`font-mono text-[10px] font-bold flex items-center space-x-1 ${
                        task.priority === 'High' 
                          ? 'text-rose-600 dark:text-rose-400' 
                          : task.priority === 'Medium'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-rose-500 animate-pulse' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        <span>{task.priority} Priority</span>
                      </span>

                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-500 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Due: {task.dueDate}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
