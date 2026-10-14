import React, { useState } from 'react';
import { DailyCheckmark, ProgressMilestone } from '../types';
import { 
  Check, 
  Plus, 
  Trash2, 
  Sparkles
} from 'lucide-react';

interface CheckmarkTrackerProps {
  checkmarks: DailyCheckmark[];
  milestones: ProgressMilestone[];
  onToggleCheckmarkForDate: (id: string, dateStr: string) => void;
  onAddCheckmark: (checkmark: Omit<DailyCheckmark, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => void;
  onDeleteCheckmark: (id: string) => void;
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (milestone: Omit<ProgressMilestone, 'id'>) => void;
  onDeleteMilestone: (id: string) => void;
  onLoadStarterHabits: () => void;
}

export const CheckmarkTracker: React.FC<CheckmarkTrackerProps> = ({
  checkmarks,
  milestones,
  onToggleCheckmarkForDate,
  onAddCheckmark,
  onDeleteCheckmark,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
  onLoadStarterHabits
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DailyCheckmark['category']>('Study');
  const [activeSubTab, setActiveSubTab] = useState<'habits' | 'milestones'>('habits');

  // Milestone input
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneSubject, setNewMilestoneSubject] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Current week (Monday to Sunday)
  const getWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const week: { name: string; dateStr: string; isToday: boolean }[] = [];
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + mondayOffset + i);
      const dateStr = d.toISOString().split('T')[0];
      week.push({
        name: dayLabels[i],
        dateStr,
        isToday: dateStr === todayStr
      });
    }
    return week;
  };

  const weekDates = getWeekDates();
  const completedTodayCount = checkmarks.filter(c => c.completedDates.includes(todayStr)).length;
  const todayPercentage = checkmarks.length > 0 
    ? Math.round((completedTodayCount / checkmarks.length) * 100) 
    : 0;

  const handleCreateCheckmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddCheckmark({
      title: newTitle.trim(),
      category: newCategory,
      targetDaysPerWeek: 7
    });

    setNewTitle('');
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    onAddMilestone({
      title: newMilestoneTitle.trim(),
      subjectOrCategory: newMilestoneSubject.trim() || 'General',
      completed: false
    });

    setNewMilestoneTitle('');
    setNewMilestoneSubject('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Sub Tabs: Habits vs Course Milestones */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('habits')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'habits'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Daily Habits ({completedTodayCount}/{checkmarks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('milestones')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'milestones'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Syllabus Milestones ({milestones.filter(m => m.completed).length}/{milestones.length})
          </button>
        </div>

        {checkmarks.length > 0 && activeSubTab === 'habits' && (
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {todayPercentage}% completed today
          </div>
        )}
      </div>

      {/* SUB TAB 1: DAILY HABITS */}
      {activeSubTab === 'habits' && (
        <div className="space-y-4">
          {/* Inline Fast Add Habit */}
          <form
            onSubmit={handleCreateCheckmark}
            className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 focus-within:border-slate-400 dark:focus-within:border-slate-600 transition-colors"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new daily habit (e.g. 30m Problem Set Review, Workout)..."
              className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-medium"
            />

            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="text-xs px-2 py-1 rounded bg-transparent text-slate-600 dark:text-slate-300 outline-none cursor-pointer border-none"
            >
              <option value="Study">Study</option>
              <option value="Fitness">Fitness</option>
              <option value="Routine">Routine</option>
              <option value="Mindset">Mindset</option>
            </select>

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1 text-xs font-medium rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-30 transition-opacity cursor-pointer shrink-0"
            >
              Add
            </button>
          </form>

          {checkmarks.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No daily habits yet. Add a routine above to start tracking consistency.
              </p>
              <button
                onClick={onLoadStarterHabits}
                className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                + Load starter study habits
              </button>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {/* Table Header */}
              <div className="flex items-center justify-between p-3 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex-1">Habit</span>
                <div className="flex items-center space-x-2 text-center mr-8">
                  {weekDates.map(w => (
                    <span key={w.dateStr} className={`w-6 text-center font-mono ${w.isToday ? 'text-slate-900 dark:text-white font-bold' : ''}`}>
                      {w.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {checkmarks.map(chk => {
                const isCompletedToday = chk.completedDates.includes(todayStr);

                return (
                  <div key={chk.id} className="flex items-center justify-between p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
                      {/* Today quick toggle */}
                      <button
                        onClick={() => onToggleCheckmarkForDate(chk.id, todayStr)}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isCompletedToday
                            ? 'bg-slate-900 border-slate-900 dark:bg-slate-100 dark:border-slate-100 text-white dark:text-slate-900'
                            : 'border-slate-300 dark:border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        {isCompletedToday && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <div className={`text-xs font-semibold truncate ${
                          isCompletedToday ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                        }`}>
                          {chk.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {chk.category} · {chk.streak} day streak
                        </div>
                      </div>
                    </div>

                    {/* 7 Days of Week Dots */}
                    <div className="flex items-center space-x-2 mr-2">
                      {weekDates.map(w => {
                        const isDone = chk.completedDates.includes(w.dateStr);

                        return (
                          <button
                            key={w.dateStr}
                            onClick={() => onToggleCheckmarkForDate(chk.id, w.dateStr)}
                            title={`${w.name} (${w.dateStr})`}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                              isDone
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            } ${w.isToday ? 'ring-1 ring-slate-400 dark:ring-slate-500' : ''}`}
                          >
                            {isDone ? '✓' : ''}
                          </button>
                        );
                      })}
                    </div>

                    {/* Delete icon */}
                    <button
                      onClick={() => onDeleteCheckmark(chk.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 2: SYLLABUS MILESTONES */}
      {activeSubTab === 'milestones' && (
        <div className="space-y-4">
          <form
            onSubmit={handleCreateMilestone}
            className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 focus-within:border-slate-400 dark:focus-within:border-slate-600 transition-colors"
          >
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder="Add syllabus milestone (e.g. Chapter 4 Electromagnetism practice)..."
              className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-medium"
            />

            <input
              type="text"
              value={newMilestoneSubject}
              onChange={(e) => setNewMilestoneSubject(e.target.value)}
              placeholder="Subject (e.g. Physics)"
              className="w-32 bg-transparent px-2 py-1 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            />

            <button
              type="submit"
              disabled={!newMilestoneTitle.trim()}
              className="px-3 py-1 text-xs font-medium rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-30 transition-opacity cursor-pointer shrink-0"
            >
              Add
            </button>
          </form>

          {milestones.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No syllabus milestones yet. Add core topics or exam targets above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {milestones.map(m => (
                <div key={m.id} className="py-2.5 flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onToggleMilestone(m.id)}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        m.completed
                          ? 'bg-slate-900 border-slate-900 dark:bg-slate-100 dark:border-slate-100 text-white dark:text-slate-900'
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {m.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>

                    <div>
                      <span className={`text-xs font-medium ${m.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {m.title}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        {m.subjectOrCategory}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMilestone(m.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
