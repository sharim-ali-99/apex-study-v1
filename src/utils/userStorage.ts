import { StudentAccount, TimetableSlot, Task, ProblemReview, SubjectDefinition } from '../types';
import { DEFAULT_SUBJECTS } from '../data/mockData';

const USERS_STORAGE_KEY = 'apexstudy_registered_users';
const ACTIVE_USER_ID_KEY = 'apexstudy_active_user_id';

// Clean helper to hash/encode passwords simply in client storage
export function hashPassword(password: string): string {
  // Simple deterministic obfuscation for client-side storage
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}_${password.length}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  return hashPassword(password) === storedHash;
}

// Retrieve all registered accounts
export function getRegisteredUsers(): StudentAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse registered users', e);
    return [];
  }
}

// Save all registered accounts
export function saveRegisteredUsers(users: StudentAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save registered users', e);
  }
}

// Get active logged in user ID
export function getActiveUserId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  } catch {
    return null;
  }
}

// Set active logged in user ID
export function setActiveUserId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_USER_ID_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_USER_ID_KEY);
    }
  } catch (e) {
    console.error('Failed to update active user id', e);
  }
}

// Get the full active user account object
export function getActiveUser(): StudentAccount | null {
  const activeId = getActiveUserId();
  if (!activeId) return null;
  const users = getRegisteredUsers();
  return users.find(u => u.id === activeId) || null;
}

// USER SPECIFIC DATA ISOLATION (No old progress of other users is ever leaked!)
export function getUserTimetable(userId: string): TimetableSlot[] {
  try {
    const key = `apexstudy_user_${userId}_timetable`;
    const raw = localStorage.getItem(key);
    if (!raw) return []; // Brand new empty timetable
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserTimetable(userId: string, slots: TimetableSlot[]): void {
  try {
    const key = `apexstudy_user_${userId}_timetable`;
    localStorage.setItem(key, JSON.stringify(slots));
  } catch (e) {
    console.error('Failed to save user timetable', e);
  }
}

export function getUserTasks(userId: string): Task[] {
  try {
    const key = `apexstudy_user_${userId}_tasks`;
    const raw = localStorage.getItem(key);
    if (!raw) return []; // Brand new clean task checklist
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserTasks(userId: string, tasks: Task[]): void {
  try {
    const key = `apexstudy_user_${userId}_tasks`;
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save user tasks', e);
  }
}

export function getUserProblems(userId: string): ProblemReview[] {
  try {
    const key = `apexstudy_user_${userId}_problems`;
    const raw = localStorage.getItem(key);
    if (!raw) return []; // Brand new problem review log
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserProblems(userId: string, problems: ProblemReview[]): void {
  try {
    const key = `apexstudy_user_${userId}_problems`;
    localStorage.setItem(key, JSON.stringify(problems));
  } catch (e) {
    console.error('Failed to save user problems', e);
  }
}

export interface RegisterParams {
  username: string;
  password: string; // 6+ chars
  name: string;
  domain?: string;
  term?: string;
  subjects?: SubjectDefinition[];
}

export interface AuthResult {
  success: boolean;
  user?: StudentAccount;
  error?: string;
}

// Register a brand new user with fresh workspace
export function registerUser(params: RegisterParams): AuthResult {
  const cleanUsername = params.username.trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
    return { success: false, error: 'Username can only contain letters, numbers, dots, and underscores.' };
  }

  // Exact constraint: "A six-letter password is enough, I think so"
  if (!params.password || params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const existingUsers = getRegisteredUsers();
  const duplicate = existingUsers.find(u => (u.username || '').toLowerCase() === cleanUsername);
  if (duplicate) {
    return { success: false, error: `Username "${cleanUsername}" is already taken. Please choose another or log in.` };
  }

  const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const displayName = params.name.trim() || params.username.trim();

  // Pick or assign default subject list with distinct colors
  const userSubjects: SubjectDefinition[] = params.subjects && params.subjects.length > 0 
    ? params.subjects 
    : [
        { id: `sub-${Date.now()}-1`, name: 'Physics', color: 'blue', code: 'PHY' },
        { id: `sub-${Date.now()}-2`, name: 'Maths', color: 'crimson', code: 'MATH' },
        { id: `sub-${Date.now()}-3`, name: 'Chemistry', color: 'emerald', code: 'CHEM' }
      ];

  const newUser: StudentAccount = {
    id: userId,
    username: cleanUsername,
    password: hashPassword(params.password),
    name: displayName,
    domain: params.domain || 'Science & Pre-Engineering',
    termOrSubtitle: params.term || 'Academic Year 2026-2027',
    avatarLetter: displayName.charAt(0).toUpperCase() || 'S',
    subjects: userSubjects,
    occasionalActivities: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  const updatedUsers = [...existingUsers, newUser];
  saveRegisteredUsers(updatedUsers);

  // Initialize pristine empty data for this new user
  saveUserTimetable(userId, []);
  saveUserTasks(userId, []);
  saveUserProblems(userId, []);

  // Set as active session
  setActiveUserId(userId);

  return { success: true, user: newUser };
}

// Log in existing user
export function loginUser(username: string, password: string): AuthResult {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) {
    return { success: false, error: 'Please enter your username.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const existingUsers = getRegisteredUsers();
  const user = existingUsers.find(u => (u.username || '').toLowerCase() === cleanUsername);

  if (!user) {
    return { success: false, error: `No account found for "${cleanUsername}". Create a new account to get started!` };
  }

  // Validate password
  if (user.password && !verifyPassword(password, user.password)) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  saveRegisteredUsers(existingUsers.map(u => u.id === user.id ? user : u));

  setActiveUserId(user.id);
  return { success: true, user };
}

// Create or switch to a demo account if requested
export function createDemoUser(): StudentAccount {
  const existingUsers = getRegisteredUsers();
  const demoUser = existingUsers.find(u => u.username === 'demo_student');
  if (demoUser) {
    setActiveUserId(demoUser.id);
    return demoUser;
  }

  const demoId = `demo-${Date.now()}`;
  const newDemo: StudentAccount = {
    id: demoId,
    username: 'demo_student',
    password: hashPassword('demo1234'),
    name: 'Sample Student',
    domain: 'Science & Pre-Engineering',
    termOrSubtitle: 'Sample Semester',
    avatarLetter: 'S',
    subjects: DEFAULT_SUBJECTS,
    occasionalActivities: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  saveRegisteredUsers([...existingUsers, newDemo]);
  setActiveUserId(demoId);
  return newDemo;
}
