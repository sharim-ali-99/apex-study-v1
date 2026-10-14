import { 
  Task, 
  TimetableSlot, 
  DailyCheckmark, 
  ProgressMilestone, 
  StudentAccount, 
  ProblemReview,
  SubjectDefinition 
} from '../types';

export const DEFAULT_SUBJECTS: SubjectDefinition[] = [
  {
    id: 'sub-physics',
    name: 'Physics',
    color: 'blue',
    code: 'PHY',
    instructor: 'Dr. Kowalski',
    room: 'Lab 201'
  },
  {
    id: 'sub-maths',
    name: 'Maths',
    color: 'crimson',
    code: 'MATH',
    instructor: 'Prof. Harrison',
    room: 'Hall B'
  },
  {
    id: 'sub-chem',
    name: 'Chemistry',
    color: 'emerald',
    code: 'CHEM',
    instructor: 'Dr. Patel',
    room: 'Science Lab 3'
  },
  {
    id: 'sub-cs',
    name: 'Computer Science',
    color: 'indigo',
    code: 'CS',
    instructor: 'Prof. Vance',
    room: 'Tech Hub'
  },
  {
    id: 'sub-eng',
    name: 'English Literature',
    color: 'amber',
    code: 'ENG',
    instructor: 'Ms. Carter',
    room: 'Room 105'
  }
];

export const INITIAL_ACCOUNTS: StudentAccount[] = [
  {
    id: 'acc-1',
    name: 'Sharim',
    domain: 'Science & Pre-Engineering',
    termOrSubtitle: 'Academic Year 2026-2027',
    avatarLetter: 'S',
    subjects: DEFAULT_SUBJECTS,
    occasionalActivities: [
      {
        id: 'occ-1',
        title: 'Physics Practical Exam / Lab Demo',
        subject: 'Physics',
        color: 'blue',
        category: 'Workshop',
        notes: 'Occasional hands-on lab workshop in building 2',
        estimatedHours: 2
      },
      {
        id: 'occ-2',
        title: 'Math Olympiad Problem Sprint',
        subject: 'Maths',
        color: 'crimson',
        category: 'Study Group',
        notes: 'Occasional weekend competition problem solving',
        estimatedHours: 3
      },
      {
        id: 'occ-3',
        title: 'Academic Advisor Review Meeting',
        subject: 'General',
        color: 'slate',
        category: 'Appointment',
        notes: 'One-off checkup on semester progress and grades',
        estimatedHours: 1
      }
    ]
  }
];

// Tasks & Timetable start completely clean, or ready for student entry
export const INITIAL_TIMETABLE: TimetableSlot[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_CHECKMARKS: DailyCheckmark[] = [];
export const INITIAL_MILESTONES: ProgressMilestone[] = [];

// Initial Problem Reviews (user requested the review thing to track any problems, save and update later)
export const INITIAL_PROBLEMS: ProblemReview[] = [];
