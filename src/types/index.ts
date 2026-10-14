export type TaskCategory = 'Homework' | 'Project' | 'Exam Prep' | 'Personal Goal' | 'Club / Activity';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  subject?: string;
  subtasks: Subtask[];
  estimatedMinutes?: number;
  tags: string[];
  createdAt: string;
  isOccasional?: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type SlotType = 'Lecture' | 'Lab' | 'Tutorial' | 'Study Block' | 'Exam' | 'Sports' | 'Workshop' | 'Occasional' | 'Other';

export interface TimetableSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  date?: string;     // Specific YYYY-MM-DD if scheduled on a specific calendar date (like a test on Oct 14)
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  subject: string;
  type: SlotType;
  location?: string;
  instructor?: string;
  color: string; // Solid color identifier (blue, emerald, amber, rose, indigo, violet, slate, etc.)
  notes?: string;
  isOccasional?: boolean;
}

export interface SubjectDefinition {
  id: string;
  name: string;        // e.g. "Physics", "Maths", "Chemistry", "Computer Science"
  color: string;       // Color ID from PROFESSIONAL_COLORS
  code?: string;       // e.g. "PHY-101"
  room?: string;
  instructor?: string;
  isOccasional?: boolean;
}

export interface OccasionalActivity {
  id: string;
  title: string;
  subject?: string;
  color: string;
  category: 'Workshop' | 'Seminar' | 'Study Group' | 'Appointment' | 'Project Sprint' | 'Exam / Quiz' | 'Other';
  notes?: string;
  estimatedHours?: number;
}

export type ProblemSeverity = 'High Priority' | 'Moderate' | 'Minor Issue';
export type ProblemStatus = 'Active' | 'Under Review' | 'Resolved';
export type ProblemCategory = 'Academic Difficulty' | 'Schedule Clash' | 'Time Management' | 'Exam Prep' | 'Concept Blocker' | 'Personal / Routine';

export interface ProblemReview {
  id: string;
  title: string;
  subject?: string;
  category: ProblemCategory;
  severity: ProblemSeverity;
  status: ProblemStatus;
  description: string;
  actionPlan: string;
  reflectionNotes: string;
  createdDate: string;
  updatedDate: string;
  resolutionNotes?: string;
}

export interface AIActionItem {
  type: 
    | 'ADD_TASK' 
    | 'UPDATE_TASK' 
    | 'DELETE_TASK' 
    | 'ADD_SLOT' 
    | 'DELETE_SLOT' 
    | 'CLEAR_COMPLETED' 
    | 'ADD_PROBLEM_REVIEW' 
    | 'UPDATE_PROBLEM_REVIEW'
    | 'ADD_OCCASIONAL'
    | 'SUGGESTION';
  summary: string;
  data?: any;
}

export interface StudentAccount {
  id: string;
  name: string;
  username?: string;
  password?: string;        // Stored credential (min 6 chars)
  domain: string;           // e.g. "Science & Engineering", "Pre-Med", "High School", etc.
  termOrSubtitle: string;   // e.g. "Fall 2026", "Semester 1", "Grade 11"
  avatarLetter: string;
  subjects: SubjectDefinition[];
  occasionalActivities?: OccasionalActivity[];
  createdAt?: string;
  lastLoginAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionsPerformed?: AIActionItem[];
  attachment?: {
    name: string;
    type: string;
    dataUrl: string;
  };
}

export interface FocusSession {
  id: string;
  timestamp: string;
  durationMinutes: number;
  taskTitle?: string;
  mode: 'pomodoro' | 'short_break' | 'long_break';
}

export interface DailyCheckmark {
  id: string;
  title: string;
  category: 'Study' | 'Fitness' | 'Routine' | 'Mindset' | 'Custom';
  streak: number;
  completedDates: string[]; // YYYY-MM-DD
  targetDaysPerWeek: number;
  createdAt: string;
}

export interface ProgressMilestone {
  id: string;
  title: string;
  subjectOrCategory: string;
  completed: boolean;
  notes?: string;
  targetDate?: string;
}
