import React, { useState, useEffect } from 'react';
import { 
  TimetableSlot, 
  Task, 
  DayOfWeek, 
  StudentAccount 
} from '../types';
import { PROFESSIONAL_COLORS, getColorById, getSubjectColorId } from '../utils/colorPalette';
import { exportToICS } from '../utils/calendarExport';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  MapPin, 
  User, 
  Check, 
  Sparkles, 
  X, 
  CheckSquare, 
  ArrowLeft,
  AlertCircle,
  Tag,
  BookOpen,
  Filter,
  Download,
  LayoutGrid,
  List,
  Compass
} from 'lucide-react';

interface CalendarScheduleViewProps {
  slots: TimetableSlot[];
  tasks: Task[];
  account: StudentAccount;
  onAddSlot: (slot: Partial<TimetableSlot>) => void;
  onEditSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask?: (task: Partial<Task>) => void;
  onOpenSettings?: () => void;
}

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_FULL: DayOfWeek[] = [
  'Monday', 
  'Tuesday', 
  'Wednesday', 
  'Thursday', 
  'Friday', 
  'Saturday', 
  'Sunday'
];

const RULER_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

export const CalendarScheduleView: React.FC<CalendarScheduleViewProps> = ({
  slots,
  tasks,
  account,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  onToggleTask,
  onAddTask
}) => {
  // Current month anchor date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Selected Day state - when set to a date, opens in a LARGE EXPANSIVE AREA
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Active Subject Filter for month view
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('ALL');

  // Day Studio display mode: 'ruler' (Architectural Time-Ruler) vs 'cards' (Chronological list)
  const [dayStudioMode, setDayStudioMode] = useState<'ruler' | 'cards'>('ruler');

  // Adding item forms in Large Day Studio
  const [activeFormTab, setActiveFormTab] = useState<'none' | 'slot' | 'task'>('none');
  const [newSubject, setNewSubject] = useState(account.subjects?.[0]?.name || 'Physics');
  const [newColor, setNewColor] = useState(account.subjects?.[0]?.color || 'blue');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:30');
  const [newType, setNewType] = useState<any>('Lecture');
  const [newRoom, setNewRoom] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskDueTime, setNewTaskDueTime] = useState('23:59');

  // Current live clock for red indicator line in Day Timeline
  const [liveMinutesNow, setLiveMinutesNow] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setLiveMinutesNow(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Safe local YYYY-MM-DD formatter (avoids UTC timezone shift bugs)
  const formatLocalDate = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const now = new Date();
  const todayStr = formatLocalDate(now.getFullYear(), now.getMonth(), now.getDate());

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthTitle = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
  };

  // Build the 35 or 42 cells grid for the month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Monday = 0 index in ISO
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7; 
  const totalDays = lastDayOfMonth.getDate();
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  const cells: {
    dateStr: string;
    dateNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    dayOfWeekName: DayOfWeek;
  }[] = [];

  // Trailing previous month days
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const prevDate = new Date(year, month - 1, d);
    const dayIndex = (prevDate.getDay() + 6) % 7;
    const dStr = formatLocalDate(prevDate.getFullYear(), prevDate.getMonth(), d);
    cells.push({
      dateStr: dStr,
      dateNumber: d,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      dayOfWeekName: DAYS_FULL[dayIndex]
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    const dStr = formatLocalDate(year, month, d);
    const dayIndex = (dateObj.getDay() + 6) % 7;
    cells.push({
      dateStr: dStr,
      dateNumber: d,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
      dayOfWeekName: DAYS_FULL[dayIndex]
    });
  }

  // Trailing next month days to complete 35 or 42 grid
  const remaining = (cells.length > 35 ? 42 : 35) - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dayIndex = (nextDate.getDay() + 6) % 7;
    const dStr = formatLocalDate(nextDate.getFullYear(), nextDate.getMonth(), d);
    cells.push({
      dateStr: dStr,
      dateNumber: d,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      dayOfWeekName: DAYS_FULL[dayIndex]
    });
  }

  // Helper to extract slots and tasks for any date
  const getItemsForDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, (m || 1) - 1, d || 1);
    const dayIndex = (dateObj.getDay() + 6) % 7;
    const weekdayName = DAYS_FULL[dayIndex];

    const daySlots = slots.filter(s => {
      const matchesDate = s.date ? s.date === dateStr : s.dayOfWeek === weekdayName;
      if (!matchesDate) return false;
      if (activeSubjectFilter !== 'ALL' && s.subject.toLowerCase() !== activeSubjectFilter.toLowerCase()) {
        return false;
      }
      return true;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const dayTasks = tasks.filter(t => t.dueDate === dateStr);

    return { daySlots, dayTasks, weekdayName, dateObj };
  };

  // Step to previous / next day inside the large day studio
  const handleStepDay = (step: number) => {
    if (!selectedDateStr) return;
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d + step);
    const nextDateStr = formatLocalDate(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    setSelectedDateStr(nextDateStr);
    if (dateObj.getMonth() !== month) {
      setCurrentDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
    }
  };

  const handleCreateSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr || !newSubject.trim()) return;

    const { weekdayName } = getItemsForDate(selectedDateStr);

    onAddSlot({
      dayOfWeek: weekdayName,
      date: selectedDateStr,
      startTime: newStartTime,
      endTime: newEndTime,
      subject: newSubject.trim(),
      type: newType,
      location: newRoom.trim(),
      instructor: newInstructor.trim(),
      color: newColor,
      notes: newNotes.trim()
    });

    setActiveFormTab('none');
    setNewRoom('');
    setNewNotes('');
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr || !newTaskTitle.trim()) return;

    if (onAddTask) {
      onAddTask({
        title: newTaskTitle.trim(),
        subject: newSubject,
        dueDate: selectedDateStr,
        dueTime: newTaskDueTime,
        priority: newTaskPriority,
        category: 'Homework',
        status: 'todo'
      });
    }

    setActiveFormTab('none');
    setNewTaskTitle('');
  };

  // Helper to parse "HH:MM" into minutes from midnight
  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = (timeStr || '09:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Calculate unique subjects in user account
  const accountSubjects = account.subjects && account.subjects.length > 0 
    ? account.subjects 
    : [
        { id: 'sub-1', name: 'Physics', color: 'blue' },
        { id: 'sub-2', name: 'Maths', color: 'emerald' },
        { id: 'sub-3', name: 'Chemistry', color: 'amber' }
      ];

  // =========================================================================
  // VIEW MODE A: LARGE EXPANSIVE DAY AREA (Opened upon clicking any date)
  // =========================================================================
  if (selectedDateStr) {
    const { daySlots, dayTasks, weekdayName, dateObj } = getItemsForDate(selectedDateStr);
    const selectedDateFormatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj);

    // Compute live line position (08:00 = 480 min, 22:00 = 1320 min)
    const rulerStartMinutes = 8 * 60; // 480
    const rulerTotalMinutes = 14 * 60; // 840 (8am to 10pm)
    const livePercent = Math.max(0, Math.min(100, ((liveMinutesNow - rulerStartMinutes) / rulerTotalMinutes) * 100));

    return (
      <div className="space-y-5 animate-fade-in">
        {/* Large Day Area Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
          {/* Back to Month button */}
          <button
            onClick={() => setSelectedDateStr(null)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>← Back to Month Overview</span>
          </button>

          {/* Date Pagination Switcher */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStepDay(-1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="flex items-center space-x-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              <span className={`w-2 h-2 rounded-full ${selectedDateStr === todayStr ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span>{selectedDateStr === todayStr ? 'TODAY' : weekdayName.toUpperCase()}</span>
            </span>

            <button
              onClick={() => handleStepDay(1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Export to .ics + Quick Add Toolbar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportToICS(slots, tasks, account.name)}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Export this schedule to Google Calendar / Apple Calendar (.ics)"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Export .ics</span>
            </button>

            <button
              onClick={() => setActiveFormTab(activeFormTab === 'slot' ? 'none' : 'slot')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                activeFormTab === 'slot'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-500/30'
                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Period</span>
            </button>

            <button
              onClick={() => setActiveFormTab(activeFormTab === 'task' ? 'none' : 'task')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                activeFormTab === 'task'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>+ Task</span>
            </button>
          </div>
        </div>

        {/* Large Day Header Banner with Tactile Glass / Paper Layers */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute inset-0 paper-grain opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-200 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-300 animate-ping" />
              <span>{weekdayName} • Detailed Academic Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {selectedDateFormatted}
            </h1>
            <p className="text-xs text-blue-100 mt-1 flex items-center space-x-3">
              <span>● {daySlots.length} schedule periods</span>
              <span>● {dayTasks.length} pending deadlines</span>
              <span>● Term: {account.termOrSubtitle || 'Active Semester'}</span>
            </p>
          </div>

          <div className="relative z-10 flex items-center space-x-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-mono">
              {selectedDateStr}
            </span>
            {selectedDateStr === todayStr && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white shadow-sm font-extrabold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>Live Active Day</span>
              </span>
            )}
          </div>
        </div>

        {/* ADD PERIOD COMPOSER (Inline expander) */}
        {activeFormTab === 'slot' && (
          <form onSubmit={handleCreateSlotSubmit} className="p-5 bg-white dark:bg-slate-900 border-2 border-blue-500/40 rounded-2xl shadow-md space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Add New Class or Period to {selectedDateStr}
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveFormTab('none')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Subject *</label>
                <select
                  value={newSubject}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewSubject(val);
                    setNewColor(getSubjectColorId(val, accountSubjects));
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accountSubjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                  <option value="Physics">Physics</option>
                  <option value="Maths">Maths</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Exam / Test">Exam / Test</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Color Palette</label>
                <select
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PROFESSIONAL_COLORS.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Start Time</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">End Time</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Session Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab / Practical</option>
                  <option value="Tutorial">Tutorial / Discussion</option>
                  <option value="Study Block">Study Block</option>
                  <option value="Exam">Exam / Midterm</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Location / Room</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="e.g. Science Hall 302 or Online"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Professor / Notes</label>
                <input
                  type="text"
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  placeholder="e.g. Dr. Henderson"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveFormTab('none')}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm cursor-pointer"
              >
                Save Period to {selectedDateStr}
              </button>
            </div>
          </form>
        )}

        {/* ADD TASK COMPOSER (Inline expander) */}
        {activeFormTab === 'task' && (
          <form onSubmit={handleCreateTaskSubmit} className="p-5 bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-md space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Add Homework or Task Due on {selectedDateStr}
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveFormTab('none')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              required
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title (e.g. Complete chapter 4 formula derivations)..."
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                >
                  {accountSubjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                  <option value="Physics">Physics</option>
                  <option value="Maths">Maths</option>
                  <option value="General Study">General Study</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                >
                  <option value="High">● High Priority (Urgent)</option>
                  <option value="Medium">● Medium Priority</option>
                  <option value="Low">● Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Due Time</label>
                <input
                  type="time"
                  value={newTaskDueTime}
                  onChange={(e) => setNewTaskDueTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveFormTab('none')}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm cursor-pointer"
              >
                Create Task for {selectedDateStr}
              </button>
            </div>
          </form>
        )}

        {/* Large 2-Column Day Studio Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: ARCHITECTURAL TIMELINE & PERIODS (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Day Schedule ({daySlots.length})
                </h3>
              </div>

              {/* View Switcher: Architectural Ruler vs Cards */}
              <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDayStudioMode('ruler')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    dayStudioMode === 'ruler'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Architectural Time-Ruler View"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Time Ruler</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDayStudioMode('cards')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    dayStudioMode === 'cards'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Chronological Cards View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* SUBVIEW 1: ARCHITECTURAL HOURLY TIME-RULER (08:00 - 22:00)     */}
            {/* ============================================================== */}
            {dayStudioMode === 'ruler' && (
              <div className="relative border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-950/40 p-3 sm:p-4 overflow-hidden">
                {/* Live Current Time Red Hairline Indicator (If viewing today) */}
                {selectedDateStr === todayStr && livePercent >= 0 && livePercent <= 100 && (
                  <div 
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center transition-all duration-500"
                    style={{ top: `${livePercent}%` }}
                  >
                    <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20 shadow-md ml-1 -translate-y-1/2 shrink-0 animate-pulse" />
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-rose-500 to-rose-400/80 shadow-xs" />
                    <span className="text-[10px] font-mono font-black text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-900 shadow-xs mr-2 -translate-y-1/2">
                      NOW {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* 14 Hourly Horizontal Grid Rows */}
                <div className="space-y-4">
                  {RULER_HOURS.map((hour) => {
                    const hourPrefix = `${String(hour).padStart(2, '0')}:`;
                    const hourSlots = daySlots.filter(s => s.startTime.startsWith(hourPrefix));

                    return (
                      <div key={hour} className="relative flex items-start gap-3 min-h-[52px] group">
                        {/* Hour Timestamp Column */}
                        <div className="w-14 shrink-0 text-right font-mono text-xs font-bold text-slate-400 dark:text-slate-500 pt-0.5 select-none">
                          {String(hour).padStart(2, '0')}:00
                        </div>

                        {/* Visual Timeline Canvas Row */}
                        <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-800 pt-1 pb-2">
                          {hourSlots.length === 0 ? (
                            <div className="h-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-mono text-slate-400 italic">
                                Free time / Study block
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {hourSlots.map(slot => {
                                const colorObj = getColorById(slot.color);
                                return (
                                  <div
                                    key={slot.id}
                                    className={`p-3 rounded-xl border transition-all ${colorObj.cardClasses} shadow-xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                                  >
                                    <div className="flex items-center space-x-2.5">
                                      <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                                        {slot.startTime} - {slot.endTime}
                                      </span>
                                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                        {slot.subject}
                                      </span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {slot.type}
                                      </span>
                                    </div>

                                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                                      {slot.location && (
                                        <span className="flex items-center space-x-1">
                                          <MapPin className="w-3 h-3 text-slate-400" />
                                          <span className="text-[11px] font-medium">{slot.location}</span>
                                        </span>
                                      )}
                                      <button
                                        onClick={() => onDeleteSlot(slot.id)}
                                        className="p-1 hover:text-rose-500 text-slate-400 transition-colors"
                                        title="Delete period"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* SUBVIEW 2: CHRONOLOGICAL CARDS VIEW                             */}
            {/* ============================================================== */}
            {dayStudioMode === 'cards' && (
              <div>
                {daySlots.length === 0 ? (
                  <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No classes scheduled for this day</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Click below to add your lecture, lab, or exam block.</p>
                    <button
                      onClick={() => setActiveFormTab('slot')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Period</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {daySlots.map(slot => {
                      const colorObj = getColorById(slot.color);
                      return (
                        <div
                          key={slot.id}
                          className={`p-4 rounded-2xl border transition-all ${colorObj.cardClasses} hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 group`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold shrink-0 ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                  {slot.subject}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
                                  ● {slot.type}
                                </span>
                              </div>
                              {(slot.location || slot.instructor) && (
                                <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {slot.location && (
                                    <span className="flex items-center space-x-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>{slot.location}</span>
                                    </span>
                                  )}
                                  {slot.instructor && (
                                    <span className="flex items-center space-x-1">
                                      <User className="w-3 h-3" />
                                      <span>{slot.instructor}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                              {slot.notes && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 italic">
                                  "{slot.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 self-end sm:self-center opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditSlot(slot)}
                              className="p-1.5 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                              title="Edit details"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteSlot(slot.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Remove period"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TASKS DUE ON THIS DAY (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Day Deadlines ({dayTasks.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveFormTab('task')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {dayTasks.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tasks due on this date</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Add homework, problem sets, or study milestones.</p>
                  <button
                    onClick={() => setActiveFormTab('task')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day Task</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dayTasks.map(task => {
                    const isCompleted = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        onClick={() => onToggleTask(task.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isCompleted
                            ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-400 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}>
                            {isCompleted && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${
                              isCompleted
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}>
                              {task.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-500">
                              {task.subject && <span className="font-semibold text-blue-600 dark:text-blue-400">{task.subject}</span>}
                              {task.dueTime && <span>• Due {task.dueTime}</span>}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                          task.priority === 'High'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : task.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                          <span>{task.priority}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick footer action */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Isolated workspace</span>
              </span>
              <button
                onClick={() => setSelectedDateStr(null)}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Back to Month Grid →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE B: CLEAN, SPACIOUS MONTH VIEW ("make the month look only")
  // =========================================================================
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Month Architectural Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={goToToday}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center space-x-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight ml-2">
            {monthTitle}
          </h2>
        </div>

        {/* Quick subject filter pills + Export iCal */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => exportToICS(slots, tasks, account.name)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            title="Download iCalendar file (.ics) for Apple/Google Calendar"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">Sync iCal (.ics)</span>
          </button>

          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden md:inline">
            Filter:
          </span>
          <button
            onClick={() => setActiveSubjectFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubjectFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {accountSubjects.slice(0, 4).map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubjectFilter(activeSubjectFilter === sub.name ? 'ALL' : sub.name)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeSubjectFilter === sub.name
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Spacious Full-Width Month Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          {DAYS_SHORT.map(d => (
            <div key={d} className="text-center text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* 35 or 42 Month Date Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {cells.map((cell) => {
            const { daySlots, dayTasks } = getItemsForDate(cell.dateStr);
            const hasItems = daySlots.length > 0 || dayTasks.length > 0;

            return (
              <button
                type="button"
                key={cell.dateStr}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`min-h-[96px] sm:min-h-[120px] p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between text-left w-full group hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  cell.isToday
                    ? 'border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-500/20'
                    : cell.isCurrentMonth
                    ? 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500'
                    : 'border-transparent bg-slate-50/30 dark:bg-slate-950/30 opacity-35'
                }`}
              >
                {/* Top Row: Date Number and count badge */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-mono font-bold w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      cell.isToday
                        ? 'bg-blue-600 text-white font-black shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dateNumber}
                  </span>

                  {hasItems && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {daySlots.length + dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Micro preview pills with designer tag styling */}
                <div className="space-y-1 my-1 overflow-hidden w-full">
                  {daySlots.slice(0, 3).map(slot => {
                    const colorObj = getColorById(slot.color);
                    return (
                      <div
                        key={slot.id}
                        className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold flex items-center space-x-1.5 border border-slate-200/60 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 shadow-2xs group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors`}
                        title={`${slot.startTime} - ${slot.endTime} • ${slot.subject} (${slot.type})`}
                      >
                        <span className={`w-2 h-2 rounded-full ${colorObj.badgeBg} shrink-0 ring-1 ring-white dark:ring-slate-900`} />
                        <span className="font-mono text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 shrink-0">{slot.startTime}</span>
                        <span className="truncate text-slate-900 dark:text-slate-100 font-extrabold">{slot.subject}</span>
                      </div>
                    );
                  })}

                  {dayTasks.slice(0, 1).map(task => (
                    <div
                      key={task.id}
                      className="px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] truncate flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60"
                      title={task.title}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">✓ {task.title}</span>
                    </div>
                  ))}

                  {daySlots.length + dayTasks.length > 4 && (
                    <div className="text-[9px] font-mono text-blue-600 dark:text-blue-400 font-bold pl-1">
                      +{daySlots.length + dayTasks.length - 4} more
                    </div>
                  )}
                </div>

                {/* Bottom hint: Click to open large area */}
                <div className="text-[9px] font-black text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between w-full pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <span>Open Day Studio</span>
                  <span>→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
