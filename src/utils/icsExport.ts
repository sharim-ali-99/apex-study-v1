/**
 * iCalendar (.ics) Generator for ApexStudy
 * Generates RFC 5545 compliant calendar files for Google Calendar, Apple Calendar, and Outlook.
 */

import { TimetableSlot, Task } from '../types';

function formatICSDate(dateStr: string, timeStr: string): string {
  // dateStr is YYYY-MM-DD, timeStr is HH:MM
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

export function exportTimetableToICS(slots: TimetableSlot[], accountName: string = 'Student'): void {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ApexStudy//Academic Timetable//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:ApexStudy - ${accountName}`,
    'X-WR-TIMEZONE:UTC'
  ];

  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Day mapping for recurring RRULE
  const dayRRuleMap: Record<string, string> = {
    'Monday': 'MO',
    'Tuesday': 'TU',
    'Wednesday': 'WE',
    'Thursday': 'TH',
    'Friday': 'FR',
    'Saturday': 'SA',
    'Sunday': 'SU'
  };

  slots.forEach((slot, index) => {
    // Determine start date
    let targetDateStr = slot.date;
    if (!targetDateStr) {
      // Find upcoming day of week
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = dayNames.indexOf(slot.dayOfWeek);
      const currentDayIndex = now.getDay();
      let diff = targetDayIndex - currentDayIndex;
      if (diff < 0) diff += 7;
      const targetDate = new Date(now.getTime() + diff * 86400000);
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      targetDateStr = `${y}-${m}-${d}`;
    }

    const dtStart = formatICSDate(targetDateStr, slot.startTime || '09:00');
    const dtEnd = formatICSDate(targetDateStr, slot.endTime || '10:30');
    const uid = `apexstudy-${slot.id || index}-${dtStart}@apexstudy.app`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${slot.subject} (${slot.type || 'Class'})`);
    
    if (slot.location) {
      lines.push(`LOCATION:${slot.location.replace(/,/g, '\\,')}`);
    }

    let description = `Type: ${slot.type || 'Lecture'}`;
    if (slot.instructor) description += `\\nInstructor: ${slot.instructor}`;
    if (slot.notes) description += `\\nNotes: ${slot.notes}`;
    lines.push(`DESCRIPTION:${description.replace(/\n/g, '\\n')}`);

    // If it's a recurring slot without a fixed single date, repeat weekly for current term
    if (!slot.date && dayRRuleMap[slot.dayOfWeek]) {
      lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${dayRRuleMap[slot.dayOfWeek]};COUNT=16`);
    }

    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `apexstudy_timetable_${accountName.toLowerCase().replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
