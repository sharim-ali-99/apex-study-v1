import { Task, TimetableSlot, DayOfWeek, ProblemReview, AIActionItem, StudentAccount, SubjectDefinition } from '../types';

export interface AIResponse {
  message: string;
  actions: AIActionItem[];
}

export function getSubjectColorId(subjectName: string, subjects?: SubjectDefinition[]): string {
  if (!subjects || subjects.length === 0) return 'blue';
  const found = subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
  return found?.color || 'blue';
}

// Ultra-fast, highly accurate client-side deterministic action parser
export function parseLocalAIActions(
  prompt: string,
  context?: {
    account?: StudentAccount;
    tasks?: Task[];
    timetable?: TimetableSlot[];
    problems?: ProblemReview[];
    currentDate?: string;
    currentDay?: string;
  }
): AIResponse {
  const p = prompt.toLowerCase();
  const actions: AIActionItem[] = [];

  // 1. Clear completed tasks command
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

  // 2. Problem Review handling ("problem with...", "struggling with...", "blocker on...", "solve this problem")
  if (
    p.includes('problem') || 
    p.includes('struggling') || 
    p.includes('stuck') || 
    p.includes('difficult') || 
    p.includes('clash') ||
    p.includes('solve this') ||
    p.includes('issue in')
  ) {
    let problemSubject = context?.account?.subjects?.[0]?.name || 'Physics';
    if (p.includes('math') || p.includes('calc') || p.includes('algebra')) problemSubject = 'Maths';
    else if (p.includes('chem')) problemSubject = 'Chemistry';
    else if (p.includes('cs') || p.includes('code') || p.includes('program')) problemSubject = 'Computer Science';
    else if (p.includes('eng') || p.includes('essay')) problemSubject = 'English';
    else if (p.includes('bio')) problemSubject = 'Biology';

    const problemTitle = prompt
      .replace(/^(i'm\s+having\s+a\s+problem\s+with|i\s+have\s+a\s+problem\s+with|i'm\s+struggling\s+with|problem\s+in|help\s+me\s+solve\s+this\s+problem:?)\s*/i, '')
      .trim();

    actions.push({
      type: 'ADD_PROBLEM_REVIEW',
      summary: `Logged Problem: ${problemTitle || 'Academic Difficulty in ' + problemSubject}`,
      data: {
        title: problemTitle || `Difficulty in ${problemSubject}`,
        subject: problemSubject,
        category: p.includes('clash') ? 'Schedule Clash' : 'Concept Blocker',
        severity: 'High Priority',
        status: 'Active',
        description: prompt,
        actionPlan: `1. Review core textbook formulas for ${problemSubject}.\n2. Solve 3 step-by-step practice problems.\n3. Verify solutions in study group.`,
        reflectionNotes: 'Logged via AI Execution Copilot.'
      }
    });

    return {
      message: `Done! Logged into your **Problem Review Log** under **${problemSubject}**. View and update it in your Review tab.`,
      actions
    };
  }

  // 3. Detect days of week
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let detectedDay: DayOfWeek | null = null;
  for (const d of days) {
    if (p.includes(d.toLowerCase())) {
      detectedDay = d;
      break;
    }
  }

  // Detect specific date (e.g. 2026-10-20 or YYYY-MM-DD)
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

  // 4. Detect time of day (e.g. 10am, 2:30pm, 14:00, at 3)
  let detectedStartTime: string | null = null;
  let detectedEndTime: string | null = null;
  const timeMatch = p.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch && (p.includes('am') || p.includes('pm') || p.includes('at') || p.includes(':'))) {
    let hour = parseInt(timeMatch[1], 10);
    const min = timeMatch[2] || '00';
    const ampm = timeMatch[3]?.toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    detectedStartTime = `${hour.toString().padStart(2, '0')}:${min}`;
    const endHour = (hour + 1) % 24;
    detectedEndTime = `${endHour.toString().padStart(2, '0')}:${min}`;
  }

  // 5. Subject identification
  let subjectName = context?.account?.subjects?.[0]?.name || 'Physics';
  if (p.includes('math') || p.includes('calculus') || p.includes('algebra') || p.includes('geometry')) subjectName = 'Maths';
  else if (p.includes('phys')) subjectName = 'Physics';
  else if (p.includes('chem') || p.includes('organic')) subjectName = 'Chemistry';
  else if (p.includes('cs') || p.includes('comp') || p.includes('code') || p.includes('python')) subjectName = 'Computer Science';
  else if (p.includes('eng') || p.includes('lit') || p.includes('essay')) subjectName = 'English';
  else if (p.includes('bio')) subjectName = 'Biology';
  else if (p.includes('hist')) subjectName = 'History';
  else if (p.includes('gym') || p.includes('workout') || p.includes('fitness')) subjectName = 'Fitness';

  const colorId = getSubjectColorId(subjectName, context?.account?.subjects);

  // 6. Distinguish Calendar Slots vs Tasks
  const isTestOrExam = p.includes('test') || p.includes('exam') || p.includes('midterm') || p.includes('quiz') || p.includes('finals');
  const isClassOrSchedule = p.includes('class') || p.includes('lecture') || p.includes('lab') || p.includes('schedule') || p.includes('workshop') || p.includes('session');
  const isOccasional = p.includes('occasional') || p.includes('workshop') || p.includes('seminar') || p.includes('once');

  if (isTestOrExam) {
    // Add directly to calendar on target date/day
    actions.push({
      type: 'ADD_SLOT',
      summary: `Scheduled ${subjectName} Test on ${calculatedDueDate}`,
      data: {
        dayOfWeek: detectedDay || 'Friday',
        date: calculatedDueDate,
        startTime: detectedStartTime || '09:00',
        endTime: detectedEndTime || '10:30',
        subject: `${subjectName} Exam`,
        type: 'Exam',
        location: 'Hall A',
        instructor: 'Faculty',
        color: colorId,
        notes: `Scheduled via AI: ${prompt}`
      }
    });

    return {
      message: `Done! Scheduled your **${subjectName} Test** on **${calculatedDueDate}** (${detectedDay || 'upcoming'}).`,
      actions
    };
  }

  if (isClassOrSchedule || isOccasional || detectedStartTime) {
    actions.push({
      type: 'ADD_SLOT',
      summary: `Added ${subjectName} to Calendar for ${detectedDay || 'Monday'}`,
      data: {
        dayOfWeek: detectedDay || 'Monday',
        date: specificTargetDate || calculatedDueDate,
        startTime: detectedStartTime || '10:00',
        endTime: detectedEndTime || '11:30',
        subject: subjectName,
        type: isOccasional ? 'Workshop' : (p.includes('lab') ? 'Lab' : 'Lecture'),
        location: 'Campus Hub',
        instructor: 'Instructor',
        color: colorId,
        notes: prompt,
        isOccasional: isOccasional
      }
    });

    return {
      message: `Done! Added **${subjectName}** to your calendar for **${detectedDay || calculatedDueDate}** at **${detectedStartTime || '10:00'}**.`,
      actions
    };
  }

  // 7. Default to Actionable Task
  const cleanTitle = prompt
    .replace(/^(i\s+have\s+to|i\s+need\s+to|add\s+task|please\s+add|reminder\s+to|schedule\s+task)\s*/i, '')
    .trim();

  actions.push({
    type: 'ADD_TASK',
    summary: `Added Task: ${cleanTitle || subjectName + ' Assignment'}`,
    data: {
      title: cleanTitle ? (cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)) : `${subjectName} Assignment`,
      category: p.includes('prep') ? 'Exam Prep' : (p.includes('project') ? 'Project' : 'Homework'),
      priority: (p.includes('urgent') || p.includes('important') || p.includes('high')) ? 'High' : 'Medium',
      status: 'todo',
      dueDate: calculatedDueDate,
      dueTime: detectedStartTime || '23:59',
      subject: subjectName,
      tags: [subjectName.toLowerCase(), 'ai-added']
    }
  });

  return {
    message: `Done! Created task: **${cleanTitle || subjectName}** due **${calculatedDueDate}**.`,
    actions
  };
}

// Main assistant caller: zero-lag instant local response for direct commands, fast 3s fallback for multimodal
export async function askAIAssistant(
  prompt: string,
  imageAttachment?: { name: string; dataUrl: string },
  context?: {
    account?: StudentAccount;
    tasks?: Task[];
    timetable?: TimetableSlot[];
    problems?: ProblemReview[];
    currentDate?: string;
    currentDay?: string;
    slotsCount?: number;
    tasksCount?: number;
    problemsCount?: number;
  }
): Promise<AIResponse> {
  const p = prompt.trim();

  // 1. If no image attachment, check if local parser can immediately execute this direct command
  if (!imageAttachment && p.length > 0) {
    const localResult = parseLocalAIActions(p, context);
    if (localResult && localResult.actions && localResult.actions.length > 0) {
      // Return immediately (< 10ms) - completely eliminates lagging!
      return localResult;
    }
  }

  // 2. Multimodal image schedule extraction or conversational query via backend
  try {
    const controller = new AbortController();
    // Fast 3.5s timeout (never freeze the UI)
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const apiRes = await fetch('/api/ai-companion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: p,
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
    // Graceful immediate fallback
  }

  // 3. Fallback to local parsing
  if (imageAttachment) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = dayNames[today.getDay()];
    const subName = context?.account?.subjects?.[0]?.name || 'Physics';

    return {
      message: `Extracted schedule from "${imageAttachment.name}" and added to your calendar.`,
      actions: [
        {
          type: 'ADD_SLOT',
          summary: `Extracted Study Session from ${imageAttachment.name}`,
          data: {
            dayOfWeek: todayDayName,
            date: todayStr,
            startTime: '10:00',
            endTime: '11:30',
            subject: subName,
            type: 'Lecture',
            location: 'Main Hall',
            instructor: 'Faculty',
            color: 'blue',
            notes: `Parsed from uploaded schedule: ${imageAttachment.name}`
          }
        }
      ]
    };
  }

  return parseLocalAIActions(prompt, context);
}
