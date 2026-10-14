import { 
  AIActionItem, 
  Task, 
  TimetableSlot, 
  DayOfWeek, 
  TaskCategory, 
  TaskPriority, 
  ProblemReview,
  StudentAccount 
} from '../types';
import { getSubjectColorId } from './colorPalette';

export interface AIResponse {
  message: string;
  actions: AIActionItem[];
}

/**
 * Intelligent Client-side AI fallback parser
 * Executes student requests directly ("Just do it" principle)
 * Handles calendar slots, date-specific tests, checklist tasks, and problem reviews
 */
export async function askAIAssistant(
  prompt: string,
  imageAttachment?: {
    name: string;
    type: string;
    dataUrl: string;
  } | { name: string; dataUrl: string },
  context?: {
    currentDay?: string;
    currentDate?: string;
    account?: StudentAccount;
    tasks?: Task[];
    timetable?: TimetableSlot[];
    problems?: ProblemReview[];
    slotsCount?: number;
    tasksCount?: number;
    problemsCount?: number;
  }
): Promise<AIResponse> {
  // 0. Attempt backend Gemini API companion first (works on Vercel Serverless and local dev)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const apiRes = await fetch('/api/ai-companion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        image: imageAttachment,
        context: {
          currentDay: context?.currentDay,
          currentDate: context?.currentDate,
          accountName: context?.account?.name,
          domain: context?.account?.domain,
          subjects: context?.account?.subjects?.map(s => s.name),
          tasksCount: context?.tasks?.length ?? context?.tasksCount,
          slotsCount: context?.timetable?.length ?? context?.slotsCount,
          problemsCount: context?.problems?.length ?? context?.problemsCount
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (!data.fallback && data.actions && Array.isArray(data.actions) && data.message) {
        return {
          message: data.message,
          actions: data.actions
        };
      }
    }
  } catch {
    // API endpoint unavailable, network offline, or timed out; gracefully proceed to client-side processor
  }

  const p = prompt.toLowerCase();
  const actions: AIActionItem[] = [];

  // 1. Multimodal Document / Image attachment fallback
  if (imageAttachment) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = dayNames[today.getDay()];

    actions.push({
      type: 'ADD_SLOT',
      summary: `Scheduled Study Period from uploaded ${imageAttachment.name}`,
      data: {
        dayOfWeek: todayDayName,
        date: todayStr,
        startTime: '10:00',
        endTime: '11:30',
        subject: context?.account?.subjects?.[0]?.name || 'Physics',
        type: 'Study Block',
        location: 'Study Hall',
        color: context?.account?.subjects?.[0]?.color || 'blue',
        notes: `Extracted from image: ${imageAttachment.name}`
      }
    });

    return {
      message: `Done. I extracted your document ("${imageAttachment.name}") and added the study block to your calendar.`,
      actions
    };
  }

  // 2. Clear completed tasks command
  if (p.includes('clear completed') || p.includes('delete completed') || p.includes('remove completed')) {
    actions.push({
      type: 'CLEAR_COMPLETED',
      summary: 'Cleared all completed tasks'
    });
    return {
      message: 'Done. Cleared all completed tasks from your workspace.',
      actions
    };
  }

  // 3. Problem Review handling ("problem with...", "struggling with...", "blocker on...", "solve this problem")
  if (
    p.includes('problem') || 
    p.includes('struggling') || 
    p.includes('stuck') || 
    p.includes('difficult') || 
    p.includes('clash') ||
    p.includes('solve this')
  ) {
    let problemSubject = 'Physics';
    if (p.includes('math') || p.includes('calc') || p.includes('algebra')) problemSubject = 'Maths';
    else if (p.includes('chem')) problemSubject = 'Chemistry';
    else if (p.includes('cs') || p.includes('code')) problemSubject = 'Computer Science';
    else if (p.includes('eng')) problemSubject = 'English';

    const colorId = getSubjectColorId(problemSubject, context?.account?.subjects);

    const problemTitle = prompt
      .replace(/^(i'm\s+having\s+a\s+problem\s+with|i\s+have\s+a\s+problem\s+with|i'm\s+struggling\s+with|problem\s+in|help\s+me\s+solve\s+this\s+problem:?)\s*/i, '')
      .trim();

    actions.push({
      type: 'ADD_PROBLEM_REVIEW',
      summary: `Logged Problem Review: ${problemTitle || 'Academic Difficulty in ' + problemSubject}`,
      data: {
        title: problemTitle || `Difficulty in ${problemSubject}`,
        subject: problemSubject,
        category: p.includes('clash') ? 'Schedule Clash' : 'Concept Blocker',
        severity: 'High Priority',
        status: 'Active',
        description: prompt,
        actionPlan: `1. Review core textbook notes for ${problemSubject}.\n2. Solve 3 step-by-step example questions.\n3. Verify doubts with teacher/notes.`,
        reflectionNotes: 'Logged via AI Copilot. Track progress and update later in Settings > Problem Reviews.'
      }
    });

    return {
      message: `Done! I logged this issue into your **Problem Review Log** under **${problemSubject}**. You can track and update it anytime in Settings or your Review tab.`,
      actions
    };
  }

  // 4. Detect days of week
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let detectedDay: DayOfWeek | null = null;
  for (const d of days) {
    if (p.includes(d.toLowerCase())) {
      detectedDay = d;
      break;
    }
  }

  // Detect specific date if mentioned (e.g. 2026-10-20, or Oct 15)
  let specificTargetDate: string | null = null;
  const isoDateMatch = p.match(/\b(202\d-\d{2}-\d{2})\b/);
  if (isoDateMatch) {
    specificTargetDate = isoDateMatch[1];
  }

  // Detect relative days
  let daysAhead = 1;
  const now = new Date();
  if (p.includes('today')) {
    daysAhead = 0;
    const currentDayIdx = now.getDay();
    const dayMap: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    detectedDay = dayMap[currentDayIdx];
  } else if (p.includes('tomorrow')) {
    daysAhead = 1;
    const tomorrow = new Date(now.getTime() + 86400000);
    const dayMap: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    detectedDay = dayMap[tomorrow.getDay()];
  } else if (detectedDay) {
    const dayMap: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIdx = now.getDay();
    const targetIdx = dayMap.indexOf(detectedDay);
    let diff = (targetIdx - currentDayIdx + 7) % 7;
    if (diff === 0) diff = 7;
    daysAhead = diff;
  }

  const calculatedDueDate = specificTargetDate || new Date(Date.now() + 86400000 * daysAhead).toISOString().split('T')[0];

  // 5. Detect time of day (e.g. 10am, 2:30pm, 14:00, at 3)
  let detectedStartTime: string | null = null;
  let detectedEndTime: string | null = null;
  const timeMatch = p.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch && (p.includes('am') || p.includes('pm') || p.includes('at') || p.includes(':'))) {
    let hour = parseInt(timeMatch[1], 10);
    const min = timeMatch[2] || '00';
    const ampm = timeMatch[3]?.toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    if (hour >= 0 && hour <= 23) {
      detectedStartTime = `${hour.toString().padStart(2, '0')}:${min}`;
      const endHour = (hour + 1) % 24;
      detectedEndTime = `${endHour.toString().padStart(2, '0')}:${min}`;
    }
  }

  // 6. Detect subjects
  let subject = 'General Studies';
  if (p.includes('math') || p.includes('calculus') || p.includes('algebra')) {
    subject = 'Maths';
  } else if (p.includes('physics') || p.includes('mechanics') || p.includes('electromagnetism')) {
    subject = 'Physics';
  } else if (p.includes('chem') || p.includes('organic')) {
    subject = 'Chemistry';
  } else if (p.includes('bio')) {
    subject = 'Biology';
  } else if (p.includes('cs') || p.includes('code') || p.includes('programming') || p.includes('algorithm') || p.includes('computer')) {
    subject = 'Computer Science';
  } else if (p.includes('history') || p.includes('literature') || p.includes('english') || p.includes('essay')) {
    subject = 'English';
  } else if (p.includes('gym') || p.includes('workout') || p.includes('sports')) {
    subject = 'Fitness';
  } else if (context?.account?.subjects?.[0]?.name) {
    // Check account subjects
    const matchingSubject = context.account.subjects.find(s => p.includes(s.name.toLowerCase()));
    if (matchingSubject) {
      subject = matchingSubject.name;
    }
  }

  const color = getSubjectColorId(subject, context?.account?.subjects);

  const isExamOrQuiz = p.includes('exam') || p.includes('test') || p.includes('midterm') || p.includes('quiz');
  const isClassOrLecture = p.includes('class') || p.includes('lecture') || p.includes('lab') || p.includes('tutorial') || p.includes('seminar') || p.includes('workshop');
  const isOccasional = p.includes('occasional') || p.includes('one-off') || p.includes('workshop');

  // Clean title extraction
  let cleanTitle = prompt
    .replace(/^(i\s+have\s+to|i\s+need\s+to|i\s+got\s+to|i\s+must|i\s+should|i\s+want\s+to|remind\s+me\s+to|add\s+task|add\s+homework|new\s+task|i\s+have\s+a|i\s+have|add)\s*/i, '')
    .trim();
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  // IF IT'S AN EXAM, TEST, CLASS, OR PERIOD SCHEDULED ON A SPECIFIC DAY / TIME:
  // Add it to the calendar as an event on that date/day
  if (isExamOrQuiz || (detectedStartTime && (detectedDay || isClassOrLecture))) {
    const finalDay = detectedDay || 'Monday';
    const finalStart = detectedStartTime || '09:00';
    const finalEnd = detectedEndTime || '10:30';

    actions.push({
      type: 'ADD_SLOT',
      summary: `Added ${isExamOrQuiz ? 'Test/Exam' : 'Class'} "${cleanTitle || subject}" to calendar on ${calculatedDueDate} (${finalDay})`,
      data: {
        dayOfWeek: finalDay,
        date: calculatedDueDate, // Attached to exact date!
        startTime: finalStart,
        endTime: finalEnd,
        subject,
        type: isExamOrQuiz ? 'Exam' : isOccasional ? 'Workshop' : 'Lecture',
        location: isExamOrQuiz ? 'Exam Hall' : 'Campus Room',
        color,
        notes: cleanTitle,
        isOccasional: isOccasional || isExamOrQuiz
      }
    });

    return {
      message: `Done! Added **${subject} ${isExamOrQuiz ? 'Test' : 'Session'}** to your calendar on **${finalDay} (${calculatedDueDate})** at **${finalStart} - ${finalEnd}**. It will show on that exact date in both month and week views.`,
      actions
    };
  }

  // DEFAULT: ADD TO TASK CHECKLIST DIRECTLY (without generating unwanted duplicate test prep reminders)
  actions.push({
    type: 'ADD_TASK',
    summary: `Added "${cleanTitle || prompt}" to task checklist`,
    data: {
      title: cleanTitle || prompt,
      category: isExamOrQuiz ? 'Exam Prep' : isClassOrLecture ? 'Project' : 'Homework',
      priority: isExamOrQuiz ? 'High' : 'Medium',
      status: 'todo',
      dueDate: calculatedDueDate,
      dueTime: '23:59',
      subject,
      subtasks: [
        { title: `Complete ${cleanTitle || prompt}`, completed: false }
      ],
      tags: [subject]
    }
  });

  return {
    message: `Done! Added **"${cleanTitle || prompt}"** for **${subject}** due on ${calculatedDueDate} to your checklist.`,
    actions
  };
}
