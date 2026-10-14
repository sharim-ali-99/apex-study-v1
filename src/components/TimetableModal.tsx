import React, { useState, useEffect } from 'react';
import { TimetableSlot, DayOfWeek, SlotType } from '../types';
import { X, Calendar, Clock, MapPin, User, Palette } from 'lucide-react';

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSlot: (slot: Partial<TimetableSlot>) => void;
  initialSlot?: TimetableSlot | null;
}

const SOLID_COLORS = [
  { id: 'blue', label: 'Cobalt (Mathematics & Tech)', hex: '#2A4CEB' },
  { id: 'emerald', label: 'Sage (Sciences & Labs)', hex: '#1E6F5C' },
  { id: 'amber', label: 'Ochre (Humanities & Social)', hex: '#B86508' },
  { id: 'rose', label: 'Terracotta (Arts & History)', hex: '#C04222' },
  { id: 'violet', label: 'Mulberry (Literature & Lang)', hex: '#7434B8' },
  { id: 'slate', label: 'Graphite (Study & Gym)', hex: '#48443E' },
];

export const TimetableModal: React.FC<TimetableModalProps> = ({
  isOpen,
  onClose,
  onSaveSlot,
  initialSlot
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<SlotType>('Lecture');
  const [location, setLocation] = useState('');
  const [instructor, setInstructor] = useState('');
  const [color, setColor] = useState('blue');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialSlot) {
      setDayOfWeek(initialSlot.dayOfWeek);
      setStartTime(initialSlot.startTime);
      setEndTime(initialSlot.endTime);
      setSubject(initialSlot.subject);
      setType(initialSlot.type);
      setLocation(initialSlot.location || '');
      setInstructor(initialSlot.instructor || '');
      setColor(initialSlot.color || 'blue');
      setNotes(initialSlot.notes || '');
    } else {
      setDayOfWeek('Monday');
      setStartTime('10:00');
      setEndTime('11:30');
      setSubject('');
      setType('Lecture');
      setLocation('');
      setInstructor('');
      setColor('blue');
      setNotes('');
    }
  }, [initialSlot, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    onSaveSlot({
      ...(initialSlot ? { id: initialSlot.id } : {}),
      dayOfWeek,
      startTime,
      endTime,
      subject: subject.trim(),
      type,
      location: location.trim(),
      instructor: instructor.trim(),
      color,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {initialSlot ? 'Edit Class / Period' : 'Add Timetable Slot'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set subject, time bounds, classroom, and instructor.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Subject Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Course / Subject Title *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics II: Electromagnetism"
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          {/* Day & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Period Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SlotType)}
                className="w-full px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab Session</option>
                <option value="Tutorial">Tutorial / Discussion</option>
                <option value="Study Block">Self-Study Block</option>
                <option value="Exam">Exam / Quiz</option>
                <option value="Sports">Gym / Sports</option>
                <option value="Other">Extracurricular / Club</option>
              </select>
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Location & Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location / Classroom
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hall B-201 or CS Lab 3"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Professor / Instructor
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. Dr. Vance"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Solid Color Picker - Strictly solid colors, NO gradients */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Course Color Tag (Human Pigment Codes)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {SOLID_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-lg transition-transform cursor-pointer ${
                    color === c.id ? 'ring-2 ring-slate-900 dark:ring-white ring-offset-2 scale-110' : 'hover:scale-105'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Reminders
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring scientific calculator and lecture notebook..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {initialSlot ? 'Update Slot' : 'Save Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
