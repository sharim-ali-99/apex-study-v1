import React, { useState } from 'react';
import { 
  TimetableSlot, 
  Task, 
  DayOfWeek,
  StudentAccount,
  OccasionalActivity
} from '../types';
import { PROFESSIONAL_COLORS, getColorById, getSubjectColorId } from '../utils/colorPalette';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  User, 
  Check, 
  CalendarClock, 
  Sparkles, 
  Info,
  CalendarDays,
  X,
  FileText
} from 'lucide-react';

interface CalendarScheduleViewProps {
  slots: TimetableSlot[];
  tasks: Task[];
  account: StudentAccount;
  onAddSlot: (slot: Partial<TimetableSlot>) => void;
  onEditSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onToggleTask: (taskId: string) => void;
  onOpenSettings?: () => void;
}

const DAYS_FULL: DayOfWeek[] = [
  'Monday', 
  'Tuesday', 
  'Wednesday', 
  'Thursday', 
  'Friday', 
  'Saturday', 
  'Sunday'
];

export const CalendarScheduleView: React.FC<CalendarScheduleViewProps> = ({
  slots,
  tasks,
  account,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  onToggleTask,
  onOpenSettings
}) => {
  // Integrated Calendar View Mode:
  // 'month' (Macro bird's eye view)
  // 'week' (Micro deep dive view with box cards)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  // Current calendar anchor date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Selected Day state (for Day Detail Inspector)
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    dateStr: string;
    dayOfWeekName: DayOfWeek;
    dateNumber: number;
    monthName: string;
  } | null>(() => {
    const today = new Date();
    const dayIndex = (today.getDay() + 6) % 7;
    return {
      dateStr: today.toISOString().split('T')[0],
      dayOfWeekName: DAYS_FULL[dayIndex],
      dateNumber: today.getDate(),
      monthName: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(today)
    };
  });

  // Quick Manual Add popover state
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState<string>('');
  const [newSlotDay, setNewSlotDay] = useState<DayOfWeek>('Monday');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('10:30');
  const [newSlotSubject, setNewSlotSubject] = useState(account.subjects?.[0]?.name || 'Physics');
  const [newSlotColor, setNewSlotColor] = useState(account.subjects?.[0]?.color || 'blue');
  const [newSlotRoom, setNewSlotRoom] = useState('');
  const [newSlotInstructor, setNewSlotInstructor] = useState('');
  const [newSlotType, setNewSlotType] = useState<any>('Lecture');
  const [newSlotIsOccasional, setNewSlotIsOccasional] = useState(false);
  const [newSlotNotes, setNewSlotNotes] = useState('');

  // Year & Month helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const dayIndex = (today.getDay() + 6) % 7;
    setSelectedDayInfo({
      dateStr: today.toISOString().split('T')[0],
      dayOfWeekName: DAYS_FULL[dayIndex],
      dateNumber: today.getDate(),
      monthName: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(today)
    });
  };

  // Helper to get items for a specific date or weekday
  const getItemsForDay = (dateStr: string, dayOfWeekName: DayOfWeek) => {
    // 1. Slots matching this exact date OR matching this weekday without a conflicting specific date
    const daySlots = slots.filter(s => {
      if (s.date) {
        return s.date === dateStr;
      }
      return s.dayOfWeek === dayOfWeekName;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));

    // 2. Tasks with dueDate matching dateStr
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);

    return { daySlots, dayTasks };
  };

  // Compute 7 dates for the week view
  const getWeekDates = () => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(d.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      const fullDateStr = nextDay.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      const isToday = fullDateStr === todayStr;
      week.push({
        dayName: DAYS_FULL[i],
        dateNumber: nextDay.getDate(),
        fullDateStr,
        isToday,
        monthShort: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(nextDay)
      });
    }
    return week;
  };

  // Compute cells for Month View
  const getMonthMatrix = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 for Mon
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      dateNumber: number;
      isCurrentMonth: boolean;
      dateStr: string;
      dayOfWeekName: DayOfWeek;
      isToday: boolean;
      monthShort: string;
    }[] = [];

    // Leading days from previous month
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const dateNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dateNum);
      const dayIndex = (prevDate.getDay() + 6) % 7;
      cells.push({
        dateNumber: dateNum,
        isCurrentMonth: false,
        dateStr: prevDate.toISOString().split('T')[0],
        dayOfWeekName: DAYS_FULL[dayIndex],
        isToday: false,
        monthShort: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(prevDate)
      });
    }

    // Days in current month
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = 1; i <= daysInMonth; i++) {
      const thisDate = new Date(year, month, i);
      const dayIndex = (thisDate.getDay() + 6) % 7;
      const fullStr = thisDate.toISOString().split('T')[0];
      cells.push({
        dateNumber: i,
        isCurrentMonth: true,
        dateStr: fullStr,
        dayOfWeekName: DAYS_FULL[dayIndex],
        isToday: fullStr === todayStr,
        monthShort: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(thisDate)
      });
    }

    // Trailing days to complete grid
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dayIndex = (nextDate.getDay() + 6) % 7;
      cells.push({
        dateNumber: i,
        isCurrentMonth: false,
        dateStr: nextDate.toISOString().split('T')[0],
        dayOfWeekName: DAYS_FULL[dayIndex],
        isToday: false,
        monthShort: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(nextDate)
      });
    }

    return cells;
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotSubject.trim()) return;

    onAddSlot({
      dayOfWeek: newSlotDay,
      date: newSlotDate ? newSlotDate : undefined,
      startTime: newSlotStart,
      endTime: newSlotEnd,
      subject: newSlotSubject.trim(),
      color: newSlotColor,
      location: newSlotRoom.trim(),
      instructor: newSlotInstructor.trim(),
      type: newSlotType,
      isOccasional: newSlotIsOccasional,
      notes: newSlotNotes.trim()
    });

    setIsAddingPeriod(false);
    setNewSlotRoom('');
    setNewSlotInstructor('');
    setNewSlotIsOccasional(false);
    setNewSlotNotes('');
  };

  const handleQuickAddOccasional = (occ: OccasionalActivity) => {
    const currentDayName = DAYS_FULL[(new Date().getDay() + 6) % 7];
    const todayStr = new Date().toISOString().split('T')[0];
    onAddSlot({
      dayOfWeek: currentDayName,
      date: todayStr,
      startTime: '14:00',
      endTime: '16:00',
      subject: occ.title,
      color: occ.color || 'blue',
      location: 'Campus / Online',
      type: 'Workshop',
      notes: occ.notes || 'Occasional activity',
      isOccasional: true
    });
  };

  // Jump from month view directly into the week view of the selected day
  const handleDrillDownToWeek = (dateStr: string) => {
    const targetDate = new Date(dateStr + 'T00:00:00');
    setCurrentDate(targetDate);
    setViewMode('week');
  };

  const weekDays = getWeekDates();
  const monthMatrix = getMonthMatrix();

  // Selected Day Items for detailed inspector drawer
  const selectedDayItems = selectedDayInfo 
    ? getItemsForDay(selectedDayInfo.dateStr, selectedDayInfo.dayOfWeekName)
    : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ============================================================== */}
      {/* OCCASIONAL ACTIVITIES SHELF                                    */}
      {/* ============================================================== */}
      {account.occasionalActivities && account.occasionalActivities.length > 0 && (
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <CalendarClock className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Occasional & One-Off Activities
              </span>
              <span className="text-[10px] text-slate-400">
                (Click to add directly into calendar)
              </span>
            </div>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Manage in Settings →
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {account.occasionalActivities.map((occ) => {
              const col = getColorById(occ.color);
              return (
                <button
                  key={occ.id}
                  onClick={() => handleQuickAddOccasional(occ)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800 text-left transition-colors cursor-pointer shrink-0"
                  title={`Click to add ${occ.title} to calendar`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${col.previewBg}`}></span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {occ.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {occ.category} • ~{occ.estimatedHours || 1}h
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* INTEGRATED CALENDAR CONTROLS & DUAL VIEW SWITCHER               */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        {/* Navigation & Period Label */}
        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center space-x-1">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-sm font-bold text-slate-900 dark:text-white ml-2">
            {viewMode === 'month' ? monthName : `Week of ${weekDays[0].monthShort} ${weekDays[0].dateNumber} – ${weekDays[6].monthShort} ${weekDays[6].dateNumber}`}
          </span>
        </div>

        {/* Integrated Dual Views: Month (Bigger overview) ⇄ Week (Detailed drill-down) */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Month Overview</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Week Detail</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (selectedDayInfo) {
                setNewSlotDate(selectedDayInfo.dateStr);
                setNewSlotDay(selectedDayInfo.dayOfWeekName);
              }
              setIsAddingPeriod(!isAddingPeriod);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event / Class</span>
          </button>
        </div>
      </div>

      {/* Manual Add Period Form */}
      {isAddingPeriod && (
        <form onSubmit={handleManualAddSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Add Class, Test, or Calendar Event</span>
            <span className="text-[11px] text-slate-400">Attached directly to your calendar date/schedule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Subject / Title *</label>
              <div className="flex space-x-1">
                <input
                  type="text"
                  required
                  value={newSlotSubject}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewSlotSubject(val);
                    const matchingSub = account.subjects?.find(s => s.name.toLowerCase() === val.toLowerCase());
                    if (matchingSub) setNewSlotColor(matchingSub.color);
                  }}
                  placeholder="e.g. Physics, Calculus Test..."
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
                {account.subjects && account.subjects.length > 0 && (
                  <select
                    onChange={(e) => {
                      const sel = account.subjects?.find(s => s.id === e.target.value);
                      if (sel) {
                        setNewSlotSubject(sel.name);
                        setNewSlotColor(sel.color);
                      }
                    }}
                    className="px-2 py-1.5 text-xs rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
                    title="Select from courses"
                  >
                    <option value="">Courses</option>
                    {account.subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Calendar Date (Optional for one-off/test)</label>
              <input
                type="date"
                value={newSlotDate}
                onChange={(e) => {
                  setNewSlotDate(e.target.value);
                  if (e.target.value) {
                    const d = new Date(e.target.value + 'T00:00:00');
                    const dayIdx = (d.getDay() + 6) % 7;
                    setNewSlotDay(DAYS_FULL[dayIdx]);
                  }
                }}
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Day of Week</label>
              <select
                value={newSlotDay}
                onChange={(e) => setNewSlotDay(e.target.value as DayOfWeek)}
                className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                {DAYS_FULL.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Color Code</label>
              <select
                value={newSlotColor}
                onChange={(e) => setNewSlotColor(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                {PROFESSIONAL_COLORS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={newSlotStart}
                onChange={(e) => setNewSlotStart(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">End Time</label>
              <input
                type="time"
                required
                value={newSlotEnd}
                onChange={(e) => setNewSlotEnd(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Event / Period Type</label>
              <select
                value={newSlotType}
                onChange={(e) => setNewSlotType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="Lecture">Lecture</option>
                <option value="Exam">Exam / Test / Quiz</option>
                <option value="Lab">Lab</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Workshop">Workshop</option>
                <option value="Study Block">Study Block</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Room / Hall</label>
              <input
                type="text"
                value={newSlotRoom}
                onChange={(e) => setNewSlotRoom(e.target.value)}
                placeholder="e.g. Lab 201 or Hall B"
                className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={newSlotIsOccasional}
                onChange={(e) => setNewSlotIsOccasional(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
              />
              <span>Occasional / Non-recurring schedule entry</span>
            </label>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingPeriod(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
              >
                Save to Calendar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* 1. MONTH VIEW (Bigger View + Click any day for detail)          */}
      {/* ============================================================== */}
      {viewMode === 'month' && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          {/* Month Day Headers: Mon - Sun */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center text-xs font-bold py-2 text-slate-600 dark:text-slate-300">
            {DAYS_FULL.map(d => (
              <div key={d} className="hidden sm:block">{d}</div>
            ))}
            {DAYS_FULL.map(d => (
              <div key={d + '-short'} className="sm:hidden">{d.slice(0, 3)}</div>
            ))}
          </div>

          {/* 35/42 Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
            {monthMatrix.map((cell, idx) => {
              const { daySlots, dayTasks } = getItemsForDay(cell.dateStr, cell.dayOfWeekName);
              const isSelected = selectedDayInfo?.dateStr === cell.dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDayInfo({
                      dateStr: cell.dateStr,
                      dayOfWeekName: cell.dayOfWeekName,
                      dateNumber: cell.dateNumber,
                      monthName: cell.monthShort
                    });
                  }}
                  onDoubleClick={() => handleDrillDownToWeek(cell.dateStr)}
                  className={`min-h-[96px] sm:min-h-[115px] p-1.5 flex flex-col transition-all cursor-pointer relative group ${
                    cell.isCurrentMonth
                      ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-400'
                  } ${
                    isSelected ? 'ring-2 ring-inset ring-slate-900 dark:ring-white bg-slate-50/80 dark:bg-slate-800/40' : ''
                  } ${
                    cell.isToday && !isSelected ? 'ring-2 ring-inset ring-blue-500' : ''
                  }`}
                >
                  {/* Date badge */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                        cell.isToday
                          ? 'bg-blue-600 text-white font-black'
                          : isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                          : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dateNumber}
                    </span>

                    {(daySlots.length > 0 || dayTasks.length > 0) && (
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {daySlots.length + dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Micro list of periods and tasks inside month cell */}
                  <div className="space-y-1 overflow-y-auto max-h-[76px]">
                    {daySlots.slice(0, 3).map(slot => {
                      const colorObj = getColorById(slot.color);
                      return (
                        <div
                          key={slot.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate ${colorObj.badgeBg} ${colorObj.badgeText} flex items-center space-x-1`}
                          title={`${slot.subject} (${slot.startTime})`}
                        >
                          {slot.type === 'Exam' && <span className="font-bold">⚡</span>}
                          <span className="truncate">{slot.startTime} {slot.subject}</span>
                        </div>
                      );
                    })}

                    {dayTasks.slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center space-x-1 ${
                          task.status === 'completed'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                            : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        }`}
                        title={task.title}
                      >
                        <span className="truncate">✓ {task.title}</span>
                      </div>
                    ))}

                    {daySlots.length + dayTasks.length > 3 && (
                      <div className="text-[9px] text-slate-400 font-semibold pl-1">
                        +{daySlots.length + dayTasks.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Subtle drilldown indicator on hover */}
                  <div className="hidden group-hover:block absolute bottom-1 right-1 text-[9px] font-semibold text-slate-400">
                    Click detail
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. WEEK VIEW (DETAIL VIEW WITH BOX-CARD GRID FOR DESKTOP/MOBILE) */}
      {/* ============================================================== */}
      {viewMode === 'week' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Weekly Detailed Breakdown (7 Days)
            </span>
            <button
              onClick={() => setViewMode('month')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              ← Back to Month Overview
            </button>
          </div>

          {/* Responsive Box-Type Cards (Grid of cards rather than long stretched columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {weekDays.map(w => {
              const { daySlots, dayTasks } = getItemsForDay(w.fullDateStr, w.dayName);
              const isSelected = selectedDayInfo?.dateStr === w.fullDateStr;

              return (
                <div
                  key={w.dayName}
                  onClick={() => {
                    setSelectedDayInfo({
                      dateStr: w.fullDateStr,
                      dayOfWeekName: w.dayName,
                      dateNumber: w.dateNumber,
                      monthName: w.monthShort
                    });
                  }}
                  className={`border rounded-xl bg-white dark:bg-slate-900 flex flex-col p-3 shadow-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20'
                      : w.isToday
                      ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                        w.isToday 
                          ? 'bg-blue-600 text-white' 
                          : isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {w.dateNumber}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {w.dayName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {w.monthShort} {w.dateNumber}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                        {daySlots.length + dayTasks.length} items
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewSlotDate(w.fullDateStr);
                          setNewSlotDay(w.dayName);
                          setIsAddingPeriod(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        title="Add period to this day"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Box Cards List */}
                  <div className="space-y-2 flex-1 min-h-[140px]">
                    {daySlots.length === 0 && dayTasks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-400">
                        <span className="text-xs">No entries scheduled</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewSlotDate(w.fullDateStr);
                            setNewSlotDay(w.dayName);
                            setIsAddingPeriod(true);
                          }}
                          className="mt-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          + Add entry
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Timetable / Calendar Events */}
                        {daySlots.map(slot => {
                          const colorObj = getColorById(slot.color);
                          return (
                            <div
                              key={slot.id}
                              className={`p-2.5 rounded-lg border text-xs transition-shadow hover:shadow-xs group relative ${colorObj.cardClasses}`}
                            >
                              <div className="flex items-start justify-between">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                                  {slot.type}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditSlot(slot);
                                    }}
                                    className="p-0.5 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                    title="Edit slot"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSlot(slot.id);
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-red-600 cursor-pointer"
                                    title="Delete slot"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <div className="font-bold text-xs mt-1 text-slate-900 dark:text-white leading-tight">
                                {slot.subject}
                              </div>

                              <div className="flex items-center space-x-1 text-[10px] text-slate-600 dark:text-slate-300 mt-1 font-mono">
                                <Clock className="w-2.5 h-2.5 shrink-0" />
                                <span>{slot.startTime} - {slot.endTime}</span>
                              </div>

                              {slot.location && (
                                <div className="flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{slot.location}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Due Tasks on this Date */}
                        {dayTasks.map(task => (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            className={`p-2 rounded-lg border flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              task.status === 'completed'
                                ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                task.status === 'completed' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {task.status === 'completed' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </span>
                              <span className="truncate">{task.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono ml-1 shrink-0">
                              {task.dueTime || 'Due'}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. INTEGRATED DAY DETAIL INSPECTOR DRAWER                       */}
      {/* ("If you click the day you will have every detail about it")     */}
      {/* ============================================================== */}
      {selectedDayInfo && selectedDayItems && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex flex-col items-center justify-center font-mono font-bold">
                <span className="text-[10px] leading-tight font-sans uppercase">
                  {selectedDayInfo.dayOfWeekName.slice(0, 3)}
                </span>
                <span className="text-sm leading-tight">
                  {selectedDayInfo.dateNumber}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Day Inspector: {selectedDayInfo.dayOfWeekName}, {selectedDayInfo.monthName} {selectedDayInfo.dateNumber}</span>
                  <span className="text-xs font-mono font-normal text-slate-400">({selectedDayInfo.dateStr})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detailed itinerary: {selectedDayItems.daySlots.length} schedule periods, {selectedDayItems.dayTasks.length} tasks due
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDrillDownToWeek(selectedDayInfo.dateStr)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Go to this week →
              </button>
              <button
                onClick={() => {
                  setNewSlotDate(selectedDayInfo.dateStr);
                  setNewSlotDay(selectedDayInfo.dayOfWeekName);
                  setIsAddingPeriod(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
              >
                + Add item to this day
              </button>
            </div>
          </div>

          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Schedule Events */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Schedule & Classes ({selectedDayItems.daySlots.length})</span>
              </div>

              {selectedDayItems.daySlots.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                  No periods or classes scheduled on this day.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayItems.daySlots.map(slot => {
                    const colorObj = getColorById(slot.color);
                    return (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-xl border flex items-center justify-between ${colorObj.cardClasses}`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                              {slot.type}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              {slot.startTime} – {slot.endTime}
                            </span>
                            {slot.date && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                                Date-specific
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                            {slot.subject}
                          </div>
                          {slot.location && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{slot.location}</span>
                            </div>
                          )}
                          {slot.notes && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                              "{slot.notes}"
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onEditSlot(slot)}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteSlot(slot.id)}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-red-500 cursor-pointer"
                            title="Delete"
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

            {/* Right: Tasks Due on this Date */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Due Tasks & Deadlines ({selectedDayItems.dayTasks.length})</span>
              </div>

              {selectedDayItems.dayTasks.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                  No tasks or assignment deadlines due on this day.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayItems.dayTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(task.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          task.status === 'completed'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {task.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <div>
                          <div className="font-bold text-xs">{task.title}</div>
                          {task.subject && (
                            <div className="text-[10px] text-slate-400">{task.subject} • {task.category}</div>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {task.dueTime || 'All Day'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
