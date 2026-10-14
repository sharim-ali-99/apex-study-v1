/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Task, 
  TimetableSlot, 
  StudentAccount, 
  AIActionItem,
  ProblemReview,
  OccasionalActivity
} from './types';
import { AccountSwitcher } from './components/AccountSwitcher';
import { AccountSetupModal } from './components/AccountSetupModal';
import { SettingsModal } from './components/SettingsModal';
import { ProblemReviewView } from './components/ProblemReviewView';
import { CalendarScheduleView } from './components/CalendarScheduleView';
import { TaskChecklistView } from './components/TaskChecklistView';
import { AcademicReportView } from './components/AcademicReportView';
import { PermanentAIPanel } from './components/PermanentAIPanel';
import { TimetableModal } from './components/TimetableModal';
import { InstructionsModal } from './components/InstructionsModal';
import { UserAuthGate } from './components/UserAuthGate';
import { 
  getActiveUser, 
  setActiveUserId, 
  getRegisteredUsers, 
  saveRegisteredUsers, 
  getUserTimetable, 
  saveUserTimetable, 
  getUserTasks, 
  saveUserTasks, 
  getUserProblems, 
  saveUserProblems,
  registerUser
} from './utils/userStorage';
import { 
  Sun, 
  Moon, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  BarChart3,
  AlertCircle,
  Settings,
  Palette,
  LogOut,
  User
} from 'lucide-react';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('apexstudy_theme');
    return saved ? saved === 'dark' : false; // Default to clean bright mode
  });

  // Current authenticated user session (guarantees device and user data isolation)
  const [currentUser, setCurrentUser] = useState<StudentAccount | null>(() => {
    return getActiveUser();
  });

  // Registered accounts on this device
  const [accounts, setAccounts] = useState<StudentAccount[]>(() => {
    return getRegisteredUsers();
  });

  // Navigation tabs:
  // 'calendar' (Unified Month & Week views with detailed day inspector)
  // 'tasks' (Checklist & Checkmarks)
  // 'review' (Problem & Academic Review Log)
  // 'report' (Consolidated Analytics)
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks' | 'review' | 'report'>('calendar');

  // Schedule & Tasks state isolated strictly to currentUser
  const [slots, setSlots] = useState<TimetableSlot[]>(() => {
    const user = getActiveUser();
    return user ? getUserTimetable(user.id) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const user = getActiveUser();
    return user ? getUserTasks(user.id) : [];
  });

  const [problems, setProblems] = useState<ProblemReview[]>(() => {
    const user = getActiveUser();
    return user ? getUserProblems(user.id) : [];
  });

  // Modals state
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'profile' | 'colors' | 'tasks' | 'reviews' | 'occasional' | 'accounts' | 'data'>('profile');
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);

  // AI Direct Prompt linkage
  const [pendingAIPrompt, setPendingAIPrompt] = useState<string | null>(null);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('apexstudy_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('apexstudy_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist states strictly per active user
  useEffect(() => {
    if (currentUser) {
      saveUserTimetable(currentUser.id, slots);
    }
  }, [slots, currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveUserTasks(currentUser.id, tasks);
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (currentUser) {
      saveUserProblems(currentUser.id, problems);
    }
  }, [problems, currentUser]);

  // Handle successful login or account registration from User Area
  const handleAuthenticated = (user: StudentAccount) => {
    setCurrentUser(user);
    setAccounts(getRegisteredUsers());
    setSlots(getUserTimetable(user.id));
    setTasks(getUserTasks(user.id));
    setProblems(getUserProblems(user.id));
    showToast(`Welcome, ${user.name}! Workspace ready.`);
  };

  // Switch between existing accounts
  const handleSwitchAccount = (targetAccountId: string) => {
    // 1. Save current workspace first
    if (currentUser) {
      saveUserTimetable(currentUser.id, slots);
      saveUserTasks(currentUser.id, tasks);
      saveUserProblems(currentUser.id, problems);
    }

    const all = getRegisteredUsers();
    const target = all.find(a => a.id === targetAccountId);
    if (target) {
      setActiveUserId(target.id);
      setCurrentUser(target);
      setSlots(getUserTimetable(target.id));
      setTasks(getUserTasks(target.id));
      setProblems(getUserProblems(target.id));
      showToast(`Switched account to: ${target.name}`);
    }
  };

  // Log out of workspace (locks screen into User Area so next person starts fresh)
  const handleLogout = () => {
    if (currentUser) {
      saveUserTimetable(currentUser.id, slots);
      saveUserTasks(currentUser.id, tasks);
      saveUserProblems(currentUser.id, problems);
    }
    setActiveUserId(null);
    setCurrentUser(null);
    showToast('Logged out of workspace');
  };

  // Account Handlers
  const handleCreateAccount = (name: string, domain: string, term: string) => {
    const genUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);
    const result = registerUser({
      username: genUsername,
      password: 'password123',
      name,
      domain: domain || 'Science & Pre-Engineering',
      term: term || 'Active Semester'
    });

    if (result.success && result.user) {
      setAccounts(getRegisteredUsers());
      handleSwitchAccount(result.user.id);
      showToast(`Created account: ${name} (@${result.user.username})`);
    } else {
      showToast(result.error || 'Failed to create account');
    }
  };

  const handleUpdateActiveAccount = (updated: StudentAccount) => {
    const all = getRegisteredUsers();
    const updatedUsers = all.map(a => a.id === updated.id ? updated : a);
    saveRegisteredUsers(updatedUsers);
    setAccounts(updatedUsers);
    setCurrentUser(updated);
    showToast(`Updated profile & courses for ${updated.name}`);
  };

  const handleDeleteAccount = (accountId: string) => {
    if (accounts.length <= 1) {
      showToast('Cannot delete only account');
      return;
    }
    const remaining = accounts.filter(a => a.id !== accountId);
    saveRegisteredUsers(remaining);
    setAccounts(remaining);
    if (currentUser?.id === accountId) {
      handleSwitchAccount(remaining[0].id);
    }
    showToast('Account removed');
  };

  // Slot handlers
  const handleAddSlot = (slotData: Partial<TimetableSlot>) => {
    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}`,
      dayOfWeek: slotData.dayOfWeek || 'Monday',
      date: slotData.date,
      startTime: slotData.startTime || '09:00',
      endTime: slotData.endTime || '10:30',
      subject: slotData.subject || 'Class',
      type: slotData.type || 'Lecture',
      location: slotData.location || '',
      instructor: slotData.instructor || '',
      color: slotData.color || 'blue',
      notes: slotData.notes || '',
      isOccasional: slotData.isOccasional || false
    };
    setSlots(prev => [...prev, newSlot]);
    showToast(`Added ${newSlot.subject} (${newSlot.date ? newSlot.date : newSlot.dayOfWeek})`);
  };

  const handleUpdateSlot = (slotData: Partial<TimetableSlot>) => {
    if (slotData.id) {
      setSlots(prev => prev.map(s => s.id === slotData.id ? { ...s, ...slotData } as TimetableSlot : s));
      showToast('Calendar entry updated');
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots(prev => prev.filter(s => s.id !== slotId));
    showToast('Calendar entry deleted');
  };

  // Task handlers
  const handleAddTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      category: taskData.category || 'Homework',
      priority: taskData.priority || 'Medium',
      status: 'todo',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      dueTime: taskData.dueTime || '23:59',
      subject: taskData.subject || '',
      subtasks: [],
      tags: taskData.tags || [],
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    showToast(`Added task: ${newTask.title}`);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('Task deleted');
  };

  // Problem Review Handlers
  const handleAddProblem = (probData: Omit<ProblemReview, 'id' | 'createdDate' | 'updatedDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newProblem: ProblemReview = {
      id: `prob-${Date.now()}`,
      ...probData,
      createdDate: today,
      updatedDate: today
    };
    setProblems(prev => [newProblem, ...prev]);
    showToast(`Logged problem: ${newProblem.title}`);
  };

  const handleUpdateProblem = (updated: ProblemReview) => {
    setProblems(prev => prev.map(p => p.id === updated.id ? updated : p));
    showToast(`Updated problem: ${updated.title}`);
  };

  const handleDeleteProblem = (problemId: string) => {
    setProblems(prev => prev.filter(p => p.id !== problemId));
    showToast('Problem removed from log');
  };

  const handleAskAIToSolveProblem = (problem: ProblemReview) => {
    const promptText = `I am having a problem in ${problem.subject || 'my studies'}: "${problem.title}". Difficulty: ${problem.description || 'Stuck on concepts'}. Give me 3 direct solution steps and schedule a study block or task for tomorrow!`;
    setPendingAIPrompt(promptText);
    showToast('Sent problem to AI Copilot in the corner');
  };

  // Occasional Activity Handler
  const handleAddOccasionalToSchedule = (activity: OccasionalActivity) => {
    const currentDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][
      (new Date().getDay() + 6) % 7
    ] as any;
    const todayStr = new Date().toISOString().split('T')[0];

    const newSlot: TimetableSlot = {
      id: `slot-occ-${Date.now()}`,
      dayOfWeek: currentDay,
      date: todayStr,
      startTime: '14:00',
      endTime: '16:00',
      subject: activity.title,
      type: 'Workshop',
      color: activity.color || 'blue',
      location: 'Campus / Online',
      notes: activity.notes || 'Occasional activity',
      isOccasional: true
    };

    setSlots(prev => [...prev, newSlot]);
    showToast(`Added occasional event "${activity.title}" to ${todayStr}`);
  };

  // AI Actions dispatcher (Immediate execution)
  const handleExecuteAIActions = (actions: AIActionItem[]) => {
    actions.forEach(action => {
      if (action.type === 'ADD_SLOT' && action.data) {
        const newSlot: TimetableSlot = {
          id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          dayOfWeek: action.data.dayOfWeek || 'Monday',
          date: action.data.date,
          startTime: action.data.startTime || '09:00',
          endTime: action.data.endTime || '10:30',
          subject: action.data.subject || 'Class',
          type: action.data.type || 'Lecture',
          location: action.data.location || '',
          instructor: action.data.instructor || '',
          color: action.data.color || 'blue',
          notes: action.data.notes || '',
          isOccasional: action.data.isOccasional || false
        };
        setSlots(prev => [...prev, newSlot]);
      } else if (action.type === 'ADD_TASK' && action.data) {
        const newTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: action.data.title || 'New Task',
          description: action.data.description || '',
          category: action.data.category || 'Homework',
          priority: action.data.priority || 'Medium',
          status: 'todo',
          dueDate: action.data.dueDate || new Date().toISOString().split('T')[0],
          dueTime: action.data.dueTime || '23:59',
          subject: action.data.subject || '',
          subtasks: action.data.subtasks || [],
          tags: action.data.tags || [],
          createdAt: new Date().toISOString()
        };
        setTasks(prev => [newTask, ...prev]);
      } else if (action.type === 'ADD_PROBLEM_REVIEW' && action.data) {
        const today = new Date().toISOString().split('T')[0];
        const newProb: ProblemReview = {
          id: `prob-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: action.data.title || 'Academic Problem',
          subject: action.data.subject || currentUser?.subjects?.[0]?.name || 'Physics',
          category: action.data.category || 'Academic Difficulty',
          severity: action.data.severity || 'High Priority',
          status: action.data.status || 'Active',
          description: action.data.description || '',
          actionPlan: action.data.actionPlan || '',
          reflectionNotes: action.data.reflectionNotes || '',
          createdDate: today,
          updatedDate: today
        };
        setProblems(prev => [newProb, ...prev]);
      } else if (action.type === 'CLEAR_COMPLETED') {
        setTasks(prev => prev.filter(t => t.status !== 'completed'));
      }
    });

    if (actions.length > 0) {
      showToast(`Updated ${actions.length} item(s)`);
    }
  };

  const handleWipeToCompletelyEmpty = () => {
    if (window.confirm('Wipe calendar, tasks, and problem reviews for this account?')) {
      setSlots([]);
      setTasks([]);
      setProblems([]);
      showToast('Account workspace cleared to clean slate');
    }
  };

  const handleExportBackup = () => {
    if (!currentUser) return;
    const backupData = {
      account: currentUser,
      timetable: slots,
      tasks,
      problems,
      version: '3.0',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apexstudy_${currentUser.username || currentUser.name.toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded');
  };

  const handleImportBackup = (data: any) => {
    if (data.account && currentUser) {
      handleUpdateActiveAccount({ ...currentUser, ...data.account });
    }
    if (data.timetable) setSlots(data.timetable);
    if (data.tasks) setTasks(data.tasks);
    if (data.problems) setProblems(data.problems);
    showToast('Workspace backup restored');
  };

  // If no user is logged in (e.g. opened on a brand new device), show the User Area Auth Gate
  if (!currentUser) {
    return (
      <UserAuthGate 
        onAuthenticated={handleAuthenticated}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  const activeAccount = currentUser;
  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const activeProblemsCount = problems.filter(p => p.status === 'Active').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          {/* User Area Account Selector & Switcher */}
          <AccountSwitcher
            accounts={accounts}
            activeAccountId={activeAccount.id}
            onSelectAccount={handleSwitchAccount}
            onCreateAccount={handleCreateAccount}
            onOpenProfileSetup={() => {
              setSettingsInitialTab('profile');
              setIsSettingsOpen(true);
            }}
            onOpenSettings={() => {
              setSettingsInitialTab('profile');
              setIsSettingsOpen(true);
            }}
            onLogout={handleLogout}
            onOpenUserArea={handleLogout}
          />
        </div>

        {/* Primary 4 Clean Tabs in the Center */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold overflow-x-auto">
          {/* TAB 1: INTEGRATED CALENDAR (Month Overview & Week Detail with Day Inspector) */}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Calendar ({slots.length})</span>
          </button>

          {/* TAB 2: TASKS */}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Tasks ({pendingTasksCount})</span>
          </button>

          {/* TAB 3: PROBLEM REVIEW LOG */}
          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'review'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Problem Reviews {activeProblemsCount > 0 && <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono">{activeProblemsCount}</span>}</span>
          </button>

          {/* TAB 4: ACADEMIC REPORT */}
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Academic Report</span>
          </button>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Course Colors Trigger */}
          <button
            onClick={() => {
              setSettingsInitialTab('colors');
              setIsSettingsOpen(true);
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer hidden md:flex items-center space-x-1.5"
            title="Course Colors & Palette"
          >
            <Palette className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold">Colors</span>
          </button>

          {/* Comprehensive Settings Hub */}
          <button
            onClick={() => {
              setSettingsInitialTab('profile');
              setIsSettingsOpen(true);
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800/80 shadow-xs"
            title="Comprehensive Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Settings</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5"
            title={isDarkMode ? 'Bright Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            <span className="text-xs font-bold hidden sm:inline">{isDarkMode ? 'Bright' : 'Dark'}</span>
          </button>

          {/* Logout / Switch User */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors cursor-pointer flex items-center space-x-1"
            title="Log Out & Lock Workspace"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold hidden lg:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* MAIN STAGE (LEFT / CENTER) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB 1: INTEGRATED CALENDAR */}
          {activeTab === 'calendar' && (
            <CalendarScheduleView
              slots={slots}
              tasks={tasks}
              account={activeAccount}
              onAddSlot={handleAddSlot}
              onEditSlot={(slot) => {
                setEditingSlot(slot);
                setIsSlotModalOpen(true);
              }}
              onDeleteSlot={handleDeleteSlot}
              onToggleTask={handleToggleTask}
              onOpenSettings={() => {
                setSettingsInitialTab('occasional');
                setIsSettingsOpen(true);
              }}
            />
          )}

          {/* TAB 2: TASKS & CHECKMARKS */}
          {activeTab === 'tasks' && (
            <TaskChecklistView
              tasks={tasks}
              account={activeAccount}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {/* TAB 3: PROBLEM REVIEW LOG */}
          {activeTab === 'review' && (
            <ProblemReviewView
              problems={problems}
              account={activeAccount}
              onAddProblem={handleAddProblem}
              onUpdateProblem={handleUpdateProblem}
              onDeleteProblem={handleDeleteProblem}
              onAskAIToSolveProblem={handleAskAIToSolveProblem}
            />
          )}

          {/* TAB 4: DEDICATED REPORT */}
          {activeTab === 'report' && (
            <AcademicReportView
              slots={slots}
              tasks={tasks}
              account={activeAccount}
              problems={problems}
            />
          )}
        </main>

        {/* PERMANENT PROMINENT AI COPILOT IN THE CORNER */}
        <aside className="w-full lg:w-[380px] xl:w-[420px] h-[520px] lg:h-auto border-t lg:border-t-0 border-slate-200 dark:border-slate-800 shrink-0">
          <PermanentAIPanel
            tasks={tasks}
            timetable={slots}
            problems={problems}
            account={activeAccount}
            onExecuteActions={handleExecuteAIActions}
            activeAccountName={activeAccount.name}
            pendingAIPrompt={pendingAIPrompt}
            onClearPendingAIPrompt={() => setPendingAIPrompt(null)}
          />
        </aside>
      </div>

      {/* Account Setup Modal */}
      <AccountSetupModal
        isOpen={isProfileSetupOpen}
        onClose={() => setIsProfileSetupOpen(false)}
        account={activeAccount}
        onSaveAccount={handleUpdateActiveAccount}
      />

      {/* All-in-one Settings Hub Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        account={activeAccount}
        allAccounts={accounts}
        tasks={tasks}
        problems={problems}
        slots={slots}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onUpdateAccount={handleUpdateActiveAccount}
        onSelectAccount={handleSwitchAccount}
        onCreateNewAccount={handleCreateAccount}
        onDeleteAccount={handleDeleteAccount}
        onAddOccasionalToSchedule={handleAddOccasionalToSchedule}
        onUpdateProblem={handleUpdateProblem}
        onDeleteProblem={handleDeleteProblem}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearAllData={handleWipeToCompletelyEmpty}
        initialTab={settingsInitialTab}
      />

      {/* Edit Slot Modal */}
      <TimetableModal
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setEditingSlot(null);
        }}
        onSaveSlot={handleUpdateSlot}
        initialSlot={editingSlot}
      />

      {/* Instructions & Backup Modal */}
      <InstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
        tasks={tasks}
        timetable={slots}
        checkmarks={[]}
        milestones={[]}
        onImportData={(data) => {
          handleImportBackup(data);
        }}
        onClearAllData={handleWipeToCompletelyEmpty}
        onLoadSampleData={() => {
          showToast('You can add classes or drop a schedule image to AI!');
        }}
      />
    </div>
  );
}
