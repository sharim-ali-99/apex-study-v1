import { TimetableSlot, Task } from '../types';

/**
 * Generates and downloads a standard RFC 5545 iCalendar (.ics) file
 * compatible with Apple Calendar, Google Calendar, and Microsoft Outlook.
 */
export function exportToICS(slots: TimetableSlot[], tasks: Task[], accountName: string = 'ApexStudy Student') {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ApexStudy//Student Academic Dashboard//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:ApexStudy - ${accountName}`,
    'X-WR-TIMEZONE:UTC'
  ];

  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Helper to format date + time into iCal format YYYYMMDDTHHMMSS
  const formatDateTime = (dateStr: string, timeStr: string) => {
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = (timeStr || '09:00').replace(':', '') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  // Export Timetable Slots
  slots.forEach((slot, idx) => {
    const eventDate = slot.date || now.toISOString().split('T')[0];
    const dtStart = formatDateTime(eventDate, slot.startTime || '09:00');
    const dtEnd = formatDateTime(eventDate, slot.endTime || '10:30');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:slot-${slot.id || idx}-${Date.now()}@apexstudy.app`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${escapeICS(slot.subject + ' (' + slot.type + ')')}`);
    if (slot.location) lines.push(`LOCATION:${escapeICS(slot.location)}`);
    
    let description = `Type: ${slot.type}`;
    if (slot.instructor) description += `\\nInstructor: ${slot.instructor}`;
    if (slot.notes) description += `\\nNotes: ${slot.notes}`;
    lines.push(`DESCRIPTION:${escapeICS(description)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  // Export Tasks as To-Dos (VTODO) or Deadlines
  tasks.forEach((task, idx) => {
    if (task.dueDate) {
      const taskDue = formatDateTime(task.dueDate, task.dueTime || '23:59');
      lines.push('BEGIN:VTODO');
      lines.push(`UID:task-${task.id || idx}-${Date.now()}@apexstudy.app`);
      lines.push(`DTSTAMP:${dtStamp}`);
      lines.push(`DUE:${taskDue}`);
      lines.push(`SUMMARY:${escapeICS('TASK: ' + task.title)}`);
      lines.push(`PRIORITY:${task.priority === 'High' ? '1' : task.priority === 'Medium' ? '5' : '9'}`);
      lines.push(`STATUS:${task.status === 'completed' ? 'COMPLETED' : 'NEEDS-ACTION'}`);
      if (task.description) lines.push(`DESCRIPTION:${escapeICS(task.description)}`);
      lines.push('END:VTODO');
    }
  });

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `apexstudy_schedule_${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeICS(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
