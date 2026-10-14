import React, { useState } from 'react';
import { 
  TimetableSlot, 
  DayOfWeek 
} from '../types';
import { 
  MapPin, 
  User, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Layers, 
  Calendar as CalendarIcon,
  List
} from 'lucide-react';

interface TimetableGridProps {
  slots: TimetableSlot[];
  onAddSlot: () => void;
  onEditSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (slotId: string) => void;
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

import { SUBJECT_COLORS } from '../utils/themeColors';

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  slots,
  onAddSlot,
  onEditSlot,
  onDeleteSlot
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [showWeekend, setShowWeekend] = useState<boolean>(false);

  const displayedDays = showWeekend ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);
  const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  const getSortedDaySlots = (day: DayOfWeek) => {
    return slots
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getSlotColor = (colorName: string) => {
    return SUBJECT_COLORS[colorName] || SUBJECT_COLORS.blue;
  };

  return (
    <div className="space-y-6">
      {/* Schedule Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          {/* View switcher */}
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800/80 p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily Agenda
            </button>
          </div>

          <button
            onClick={() => setShowWeekend(!showWeekend)}
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 transition-colors cursor-pointer"
          >
            {showWeekend ? 'Hide Weekend' : '+ Weekend'}
          </button>
        </div>

        <button
          onClick={onAddSlot}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Period</span>
        </button>
      </div>

      {/* WEEKLY GRID VIEW (Clean calendar columns) */}
      {viewMode === 'grid' && (
        <div className="overflow-x-auto pb-4">
          <div className={`grid gap-3 min-w-[760px] ${showWeekend ? 'grid-cols-7' : 'grid-cols-5'}`}>
            {displayedDays.map(day => {
              const daySlots = getSortedDaySlots(day);
              const isToday = day === currentDayName;

              return (
                <div
                  key={day}
                  className={`border rounded-lg flex flex-col min-h-[460px] bg-white dark:bg-slate-900 transition-colors ${
                    isToday
                      ? 'border-slate-400 dark:border-slate-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Day Header */}
                  <div className={`p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${
                    isToday ? 'bg-slate-50 dark:bg-slate-800/40' : ''
                  }`}>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {day}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {daySlots.length === 0 ? 'Free' : `${daySlots.length} classes`}
                      </div>
                    </div>

                    <button
                      onClick={onAddSlot}
                      title={`Add class to ${day}`}
                      className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Day Slots List */}
                  <div className="p-2 space-y-2 flex-1">
                    {daySlots.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center text-center p-3">
                        <span className="text-[11px] text-slate-400">No scheduled classes</span>
                        <button
                          onClick={onAddSlot}
                          className="mt-2 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          + Add slot
                        </button>
                      </div>
                    ) : (
                      daySlots.map(slot => {
                        const colorDef = getSlotColor(slot.color);
                        return (
                          <div
                            key={slot.id}
                            style={{ borderLeftColor: colorDef.accentHex }}
                            className="rounded-md p-2.5 border-l-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all text-xs relative group shadow-2xs"
                          >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {slot.startTime}–{slot.endTime}
                            </span>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                              <button
                                onClick={() => onEditSlot(slot)}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => onDeleteSlot(slot.id)}
                                className="p-0.5 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          <div className="font-semibold text-xs leading-snug text-slate-900 dark:text-white">
                            {slot.subject}
                          </div>

                          {/* Unboxed Metadata (NO PILLS) */}
                          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5">
                            <span>{slot.type}</span>
                            {slot.location && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{slot.location}</span>
                              </>
                            )}
                            {slot.instructor && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{slot.instructor}</span>
                              </>
                            )}
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
      )}

      {/* AGENDA VIEW (Chronological list for single day) */}
      {viewMode === 'agenda' && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Day selection */}
          <div className="flex space-x-1 pb-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            {DAYS_OF_WEEK.map(day => {
              const count = slots.filter(s => s.dayOfWeek === day).length;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{day}</span>
                  {count > 0 && <span className="font-mono text-[10px] opacity-75">({count})</span>}
                </button>
              );
            })}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {getSortedDaySlots(selectedDay).length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No scheduled periods on {selectedDay}.
                </p>
                <button
                  onClick={onAddSlot}
                  className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  + Add class to {selectedDay}
                </button>
              </div>
            ) : (
              getSortedDaySlots(selectedDay).map(slot => {
                const colorDef = getSlotColor(slot.color);
                return (
                  <div key={slot.id} className="py-3.5 flex items-start justify-between gap-4 border-l-2 pl-3" style={{ borderLeftColor: colorDef.accentHex }}>
                    <div className="flex items-start space-x-4">
                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400 w-24 shrink-0 pt-0.5">
                        {slot.startTime}–{slot.endTime}
                      </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {slot.subject}
                      </h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                        <span>{slot.type}</span>
                        {slot.location && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{slot.location}</span>
                          </>
                        )}
                        {slot.instructor && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{slot.instructor}</span>
                          </>
                        )}
                      </div>
                      {slot.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                          "{slot.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => onEditSlot(slot)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSlot(slot.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
