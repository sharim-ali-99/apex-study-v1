import React, { useState } from 'react';
import { 
  TimetableSlot, 
  Task, 
  DayOfWeek, 
  TaskCategory, 
  TaskPriority 
} from '../types';
import { PROFESSIONAL_COLORS, getColorById } from '../utils/colorPalette';
import { 
  Plus, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Layers,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface MainScheduleAreaProps {
  slots: TimetableSlot[];
  tasks: Task[];
  onAddSlot: (slot: Partial<TimetableSlot>) => void;
  onEditSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  activeAccountName: string;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday', 
  'Tuesday', 
  'Wednesday', 
  'Thursday', 
  'Friday', 
  'Saturday', 
  'Sunday'
];

export const MainScheduleArea: React.FC<MainScheduleAreaProps> = ({
  slots,
  tasks,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  activeAccountName
}) => {
  const [activeView, setActiveView] = useState<'schedule' | 'tasks'>('schedule');
  const [showWeekend, setShowWeekend] = useState(false);

  // Manual Add Form states
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [slotDay, setSlotDay] = useState<DayOfWeek>('Monday');
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:30');
  const [slotSubject, setSlotSubject] = useState('');
  const [slotType, setSlotType] = useState<any>('Lecture');
  const [slotLocation, setSlotLocation] = useState('');
  const [slotInstructor, setSlotInstructor] = useState('');
  const [slotColor, setSlotColor] = useState('blue');

  // Manual Add Task states
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Homework');
  const [taskDueDate, setTaskDueDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  const displayedDays = showWeekend ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);
  const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  // Task checkmark progress math
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = tasks.length > 0 
    ? Math.round((completedTasksCount / tasks.length) * 100) 
    : 0;

  const handleManualSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotSubject.trim()) return;

    onAddSlot({
      dayOfWeek: slotDay,
      startTime: slotStartTime,
      endTime: slotEndTime,
      subject: slotSubject.trim(),
      type: slotType,
      location: slotLocation.trim(),
      instructor: slotInstructor.trim(),
      color: slotColor,
      notes: ''
    });

    setSlotSubject('');
    setSlotLocation('');
    setSlotInstructor('');
    setIsAddingPeriod(false);
  };

  const handleManualTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onAddTask({
      title: taskTitle.trim(),
      subject: taskSubject.trim(),
      category: taskCategory,
      priority: taskPriority,
      status: 'todo',
      dueDate: taskDueDate,
      dueTime: '23:59',
      subtasks: [],
      tags: [],
      createdAt: new Date().toISOString()
    });

    setTaskTitle('');
    setTaskSubject('');
    setIsAddingTask(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Color Code Legend Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>{activeAccountName}</span>
              <span className="text-[11px] font-normal text-slate-400">
                · {slots.length} periods · {tasks.length} checkmarks
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Review your timetable and track progress. You can add items manually or ask the permanent AI companion in the corner!
            </p>
          </div>

          {/* View Toggles */}
          <div className="flex items-center space-x-2">
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setActiveView('schedule')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeView === 'schedule'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Weekly Timetable
              </button>
              <button
                onClick={() => setActiveView('tasks')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeView === 'tasks'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Checkmark Progress ({completedTasksCount}/{tasks.length})
              </button>
            </div>

            <button
              onClick={() => setShowWeekend(!showWeekend)}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 cursor-pointer"
            >
              {showWeekend ? 'Hide Weekend' : '+ Weekend'}
            </button>
          </div>
        </div>

        {/* Professional Solid Color Code Legend */}
        <div className="pt-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Subject Color Codes:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PROFESSIONAL_COLORS.map(c => (
              <div 
                key={c.id} 
                className="flex items-center space-x-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800"
              >
                <span className={`w-2.5 h-2.5 rounded-sm ${c.badgeBg}`}></span>
                <span className="text-[11px]">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BIG "ADD AREA" (MANUAL CREATION CONSOLE) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
              +
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Quick Add Console
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Add periods or tasks manually below, or tell the AI in the corner to do it hands-free!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsAddingPeriod(!isAddingPeriod);
                setIsAddingTask(false);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                isAddingPeriod
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isAddingPeriod ? 'Close Period Form' : '+ Add Class Period'}
            </button>

            <button
              onClick={() => {
                setIsAddingTask(!isAddingTask);
                setIsAddingPeriod(false);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                isAddingTask
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isAddingTask ? 'Close Task Form' : '+ Add Progress Task'}
            </button>
          </div>
        </div>

        {/* Expandable Manual Period Form */}
        {isAddingPeriod && (
          <form onSubmit={handleManualSlotSubmit} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Subject / Course Name *</label>
                <input
                  type="text"
                  required
                  value={slotSubject}
                  onChange={(e) => setSlotSubject(e.target.value)}
                  placeholder="e.g. Advanced Calculus"
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Day of Week</label>
                <select
                  value={slotDay}
                  onChange={(e) => setSlotDay(e.target.value as DayOfWeek)}
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Color Code Tag</label>
                <select
                  value={slotColor}
                  onChange={(e) => setSlotColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  {PROFESSIONAL_COLORS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={slotStartTime}
                  onChange={(e) => setSlotStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={slotEndTime}
                  onChange={(e) => setSlotEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Room / Hall</label>
                <input
                  type="text"
                  value={slotLocation}
                  onChange={(e) => setSlotLocation(e.target.value)}
                  placeholder="e.g. Hall B-104"
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Professor</label>
                <input
                  type="text"
                  value={slotInstructor}
                  onChange={(e) => setSlotInstructor(e.target.value)}
                  placeholder="e.g. Dr. Reynolds"
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingPeriod(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 cursor-pointer"
              >
                Save Class Period
              </button>
            </div>
          </form>
        )}

        {/* Expandable Manual Task Form */}
        {isAddingTask && (
          <form onSubmit={handleManualTaskSubmit} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Problem Set 5 Stokes Theorem"
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Subject / Course</label>
                <input
                  type="text"
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
                  placeholder="e.g. Calculus, Physics"
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="Homework">Homework</option>
                  <option value="Project">Project</option>
                  <option value="Exam Prep">Exam Prep</option>
                  <option value="Personal Goal">Personal Goal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 cursor-pointer"
              >
                Save Task
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION 1: TIMETABLE VIEW */}
      {activeView === 'schedule' && (
        <div className="space-y-4">
          <div className="overflow-x-auto pb-4">
            <div className={`grid gap-3 min-w-[720px] ${showWeekend ? 'grid-cols-7' : 'grid-cols-5'}`}>
              {displayedDays.map(day => {
                const daySlots = slots
                  .filter(s => s.dayOfWeek === day)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
                const isToday = day === currentDayName;

                return (
                  <div
                    key={day}
                    className={`border rounded-xl bg-white dark:bg-slate-900 min-h-[460px] flex flex-col transition-all shadow-xs ${
                      isToday
                        ? 'border-slate-400 dark:border-slate-600 ring-1 ring-slate-400/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Day Header */}
                    <div className={`p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${
                      isToday ? 'bg-slate-50/80 dark:bg-slate-800/40' : ''
                    }`}>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {day}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {daySlots.length === 0 ? 'No classes' : `${daySlots.length} periods`}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSlotDay(day);
                          setIsAddingPeriod(true);
                        }}
                        title={`Add class to ${day}`}
                        className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Periods List */}
                    <div className="p-2 space-y-2 flex-1">
                      {daySlots.length === 0 ? (
                        <div className="h-44 flex flex-col items-center justify-center text-center p-3">
                          <span className="text-[11px] text-slate-400">Empty</span>
                          <button
                            onClick={() => {
                              setSlotDay(day);
                              setIsAddingPeriod(true);
                            }}
                            className="mt-2 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            + Add period
                          </button>
                        </div>
                      ) : (
                        daySlots.map(slot => {
                          const colorScheme = getColorById(slot.color);

                          return (
                            <div
                              key={slot.id}
                              className={`rounded-lg p-2.5 text-xs transition-all relative group shadow-xs ${colorScheme.cardClasses}`}
                            >
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <span className="font-mono text-[11px] font-bold">
                                  {slot.startTime}–{slot.endTime}
                                </span>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                  <button
                                    onClick={() => onEditSlot(slot)}
                                    className="p-0.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteSlot(slot.id)}
                                    className="p-0.5 rounded text-slate-500 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="font-bold text-xs leading-snug">
                                {slot.subject}
                              </div>

                              <div className="mt-1 text-[11px] opacity-80 flex flex-wrap items-center gap-x-1.5">
                                <span>{slot.type}</span>
                                {slot.location && (
                                  <>
                                    <span>·</span>
                                    <span>{slot.location}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CHECKMARK PROGRESS TRACKER */}
      {activeView === 'tasks' && (
        <div className="space-y-4">
          {/* Progress Header Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Overall Deliverables & Checklist Progress:</span>
                <span className="font-mono text-emerald-600 font-extrabold">
                  {completedTasksCount} of {tasks.length} Completed
                </span>
              </div>
              <span className="font-mono">{progressPercentage}%</span>
            </div>

            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Tasks Checklist */}
          {tasks.length === 0 ? (
            <div className="py-16 text-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-8">
              <CheckSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No tasks added yet.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Use the Quick Add Console above or tell the AI Companion in the corner: "Add Calculus homework due Friday".
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map(task => {
                const isCompleted = task.status === 'completed';

                return (
                  <div key={task.id} className="p-3.5 flex items-start justify-between gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* Checkmark Button */}
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div>
                        <div className={`text-xs font-bold ${
                          isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                        }`}>
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                          {task.subject && (
                            <>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{task.subject}</span>
                              <span>·</span>
                            </>
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
    </div>
  );
};
