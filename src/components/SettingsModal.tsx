import React, { useState } from 'react';
import { 
  StudentAccount, 
  SubjectDefinition, 
  OccasionalActivity, 
  Task, 
  TimetableSlot,
  ProblemReview
} from '../types';
import { PROFESSIONAL_COLORS, getColorById } from '../utils/colorPalette';
import { 
  X, 
  Settings, 
  Palette, 
  User, 
  CalendarClock, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Check, 
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckSquare,
  Sun,
  Moon,
  Info,
  CalendarDays,
  Laptop,
  CheckCircle2,
  Sliders,
  Eye
} from 'lucide-react';

export interface ThemePaletteOption {
  id: string;
  name: string;
  description: string;
  accentHex: string;
  previewBgLight: string;
  previewBgDark: string;
}

export const THEME_PALETTES: ThemePaletteOption[] = [
  {
    id: 'default',
    name: 'Studio Cobalt',
    description: 'Crisp academic blue & indigo palette for deep clarity.',
    accentHex: '#2563EB',
    previewBgLight: '#EFF3FF',
    previewBgDark: '#141C36'
  },
  {
    id: 'nordic',
    name: 'Nordic Sage',
    description: 'Calming forest emerald & mint accents for prolonged study stamina.',
    accentHex: '#1E6F5C',
    previewBgLight: '#EEF7F4',
    previewBgDark: '#122922'
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    description: 'Warm paper & sepia library aesthetic for relaxed reading.',
    accentHex: '#B86208',
    previewBgLight: '#FEF7EE',
    previewBgDark: '#291A0B'
  },
  {
    id: 'swiss',
    name: 'Swiss Vermilion',
    description: 'High-contrast modern red and precision monochrome focus.',
    accentHex: '#E11D48',
    previewBgLight: '#FFF1F2',
    previewBgDark: '#2E1217'
  },
  {
    id: 'violet',
    name: 'Midnight Violet',
    description: 'Deep royal purple accents designed for creative night owls.',
    accentHex: '#7C3AED',
    previewBgLight: '#F5F3FF',
    previewBgDark: '#1E1436'
  }
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: StudentAccount;
  allAccounts: StudentAccount[];
  tasks: Task[];
  problems: ProblemReview[];
  slots: TimetableSlot[];
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onSetThemeMode?: (mode: 'light' | 'dark') => void;
  currentPalette?: string;
  onSelectPalette?: (paletteId: string) => void;
  onUpdateAccount: (updated: StudentAccount) => void;
  onSelectAccount: (accountId: string) => void;
  onCreateNewAccount: (name: string, domain: string, term: string) => void;
  onDeleteAccount: (accountId: string) => void;
  onAddOccasionalToSchedule: (activity: OccasionalActivity) => void;
  onUpdateProblem: (updated: ProblemReview) => void;
  onDeleteProblem: (problemId: string) => void;
  onExportBackup: () => void;
  onImportBackup: (data: any) => void;
  onClearAllData: () => void;
  initialTab?: 'profile' | 'theme' | 'colors' | 'tasks' | 'reviews' | 'occasional' | 'accounts' | 'data';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  account,
  allAccounts,
  tasks,
  problems,
  slots,
  isDarkMode,
  onToggleTheme,
  onSetThemeMode,
  currentPalette = 'default',
  onSelectPalette,
  onUpdateAccount,
  onSelectAccount,
  onCreateNewAccount,
  onDeleteAccount,
  onAddOccasionalToSchedule,
  onUpdateProblem,
  onDeleteProblem,
  onExportBackup,
  onImportBackup,
  onClearAllData,
  initialTab = 'profile'
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'colors' | 'tasks' | 'reviews' | 'occasional' | 'accounts' | 'data'>(initialTab);

  // Profile Form state
  const [profName, setProfName] = useState(account.name || '');
  const [profDomain, setProfDomain] = useState(account.domain || 'Science & Pre-Engineering');
  const [profTerm, setProfTerm] = useState(account.termOrSubtitle || 'Fall 2026');

  // Occasional activity form
  const [newOccTitle, setNewOccTitle] = useState('');
  const [newOccSubject, setNewOccSubject] = useState(account.subjects?.[0]?.name || 'General');
  const [newOccCategory, setNewOccCategory] = useState<OccasionalActivity['category']>('Workshop');
  const [newOccColor, setNewOccColor] = useState('blue');
  const [newOccHours, setNewOccHours] = useState(2);
  const [newOccNotes, setNewOccNotes] = useState('');

  // New subject form
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('crimson');

  // New account form
  const [newAccName, setNewAccName] = useState('');
  const [newAccDomain, setNewAccDomain] = useState('Science & Pre-Engineering');
  const [newAccTerm, setNewAccTerm] = useState('Fall 2026');

  // Active color picker state
  const [activeColorSubjectId, setActiveColorSubjectId] = useState<string | null>(null);

  if (!isOpen) return null;

  const occasionalList: OccasionalActivity[] = account.occasionalActivities || [];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim()) return;
    onUpdateAccount({
      ...account,
      name: profName.trim(),
      domain: profDomain.trim(),
      termOrSubtitle: profTerm.trim(),
      avatarLetter: profName.trim().charAt(0).toUpperCase()
    });
  };

  const handleAddOccasional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccTitle.trim()) return;

    const newActivity: OccasionalActivity = {
      id: `occ-${Date.now()}`,
      title: newOccTitle.trim(),
      subject: newOccSubject,
      color: newOccColor,
      category: newOccCategory,
      notes: newOccNotes.trim(),
      estimatedHours: newOccHours
    };

    const updated: StudentAccount = {
      ...account,
      occasionalActivities: [...occasionalList, newActivity]
    };
    onUpdateAccount(updated);

    setNewOccTitle('');
    setNewOccNotes('');
  };

  const handleDeleteOccasional = (id: string) => {
    const updated: StudentAccount = {
      ...account,
      occasionalActivities: occasionalList.filter(a => a.id !== id)
    };
    onUpdateAccount(updated);
  };

  const handleSetSubjectColor = (subjectId: string, colorId: string) => {
    const updatedSubjects = (account.subjects || []).map(s => 
      s.id === subjectId ? { ...s, color: colorId } : s
    );
    onUpdateAccount({
      ...account,
      subjects: updatedSubjects
    });
    setActiveColorSubjectId(null);
  };

  const handleAddNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSub: SubjectDefinition = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      color: newSubColor,
      code: newSubName.trim().substring(0, 4).toUpperCase()
    };

    onUpdateAccount({
      ...account,
      subjects: [...(account.subjects || []), newSub]
    });
    setNewSubName('');
  };

  const handleDeleteSubject = (id: string) => {
    onUpdateAccount({
      ...account,
      subjects: (account.subjects || []).filter(s => s.id !== id)
    });
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    onCreateNewAccount(newAccName.trim(), newAccDomain.trim(), newAccTerm.trim());
    setNewAccName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImportBackup(parsed);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleThemeModeSwitch = (mode: 'light' | 'dark') => {
    if (onSetThemeMode) {
      onSetThemeMode(mode);
    } else {
      if ((mode === 'dark' && !isDarkMode) || (mode === 'light' && isDarkMode)) {
        onToggleTheme();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Workspace Settings</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {isDarkMode ? 'Dark Theme' : 'Light Theme'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Themes (Light & Dark), colors, profile, academic tasks, and accounts for <span className="font-semibold text-slate-900 dark:text-white">{account.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Hub */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-semibold scrollbar-none">
          {/* TAB 1: PROFILE & DOMAIN */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Domain</span>
          </button>

          {/* TAB 2: THEMES (LIGHT & DARK VERSIONS) - REQUESTED FEATURE */}
          <button
            onClick={() => setActiveTab('theme')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'theme'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isDarkMode ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>Themes (Light & Dark)</span>
          </button>

          {/* TAB 3: COURSE COLORS */}
          <button
            onClick={() => setActiveTab('colors')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'colors'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Course Colors ({account.subjects?.length || 0})</span>
          </button>

          {/* TAB 4: TASKS */}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({tasks.length})</span>
          </button>

          {/* TAB 5: PROBLEM REVIEWS */}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Problem Reviews ({problems.length})</span>
          </button>

          {/* TAB 6: OCCASIONAL ACTIVITIES */}
          <button
            onClick={() => setActiveTab('occasional')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'occasional'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Occasional Activities ({occasionalList.length})</span>
          </button>

          {/* TAB 7: SWITCH PROFILE */}
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Accounts ({allAccounts.length})</span>
          </button>

          {/* TAB 8: BACKUP */}
          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'data'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup & Reset</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ============================================================== */}
          {/* TAB: PROFILE & DOMAIN                                          */}
          {/* ============================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fade-in max-w-xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Student Profile & Academic Domain
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your identity, major discipline or school branch, and current semester.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student / Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Domain / Field of Focus
                  </label>
                  <input
                    type="text"
                    value={profDomain}
                    onChange={(e) => setProfDomain(e.target.value)}
                    placeholder="e.g. Science & Pre-Engineering, Computer Science, Pre-Med"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Semester / Academic Term
                  </label>
                  <input
                    type="text"
                    value={profTerm}
                    onChange={(e) => setProfTerm(e.target.value)}
                    placeholder="e.g. Fall 2026, Semester 1, Grade 11"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: THEMES (LIGHT & DARK VERSIONS) - REQUESTED IN USER PROMPT  */}
          {/* ============================================================== */}
          {activeTab === 'theme' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Theme Versions: Light & Dark</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose your preferred workspace aesthetic. Switch between daylight bright paper mode and night obsidian mode.
                </p>
              </div>

              {/* 1. Primary Light vs Dark Version Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* LIGHT THEME VERSION CARD */}
                <div
                  onClick={() => handleThemeModeSwitch('light')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    !isDarkMode
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Miniature UI Mockup */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs mb-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-4 h-4 rounded bg-blue-600 text-[9px] text-white font-bold flex items-center justify-center">A</div>
                        <div className="w-16 h-2 rounded bg-slate-200"></div>
                      </div>
                      <div className="w-8 h-2 rounded bg-slate-100"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <div className="p-1.5 rounded bg-blue-50 border border-blue-200">
                        <div className="w-8 h-1.5 bg-blue-600 rounded"></div>
                        <div className="w-5 h-1 bg-blue-400 rounded mt-1"></div>
                      </div>
                      <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200">
                        <div className="w-8 h-1.5 bg-emerald-600 rounded"></div>
                        <div className="w-6 h-1 bg-emerald-400 rounded mt-1"></div>
                      </div>
                      <div className="p-1.5 rounded bg-amber-50 border border-amber-200">
                        <div className="w-8 h-1.5 bg-amber-600 rounded"></div>
                        <div className="w-4 h-1 bg-amber-400 rounded mt-1"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900 dark:text-white">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>Light Version</span>
                        {!isDarkMode && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Crisp white paper canvas with clean borders and high daytime contrast. Ideal for daylight study sessions.
                      </p>
                    </div>
                    {!isDarkMode && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 ml-2" />}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeModeSwitch('light');
                    }}
                    className={`w-full mt-3 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      !isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {!isDarkMode ? 'Selected Version' : 'Switch to Light Version'}
                  </button>
                </div>

                {/* DARK THEME VERSION CARD */}
                <div
                  onClick={() => handleThemeModeSwitch('dark')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    isDarkMode
                      ? 'border-blue-500 bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Miniature Dark UI Mockup */}
                  <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 shadow-xs mb-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-4 h-4 rounded bg-blue-600 text-[9px] text-white font-bold flex items-center justify-center">A</div>
                        <div className="w-16 h-2 rounded bg-slate-700"></div>
                      </div>
                      <div className="w-8 h-2 rounded bg-slate-800"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <div className="p-1.5 rounded bg-blue-950/60 border border-blue-900">
                        <div className="w-8 h-1.5 bg-blue-400 rounded"></div>
                        <div className="w-5 h-1 bg-blue-500 rounded mt-1"></div>
                      </div>
                      <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-900">
                        <div className="w-8 h-1.5 bg-emerald-400 rounded"></div>
                        <div className="w-6 h-1 bg-emerald-500 rounded mt-1"></div>
                      </div>
                      <div className="p-1.5 rounded bg-amber-950/60 border border-amber-900">
                        <div className="w-8 h-1.5 bg-amber-400 rounded"></div>
                        <div className="w-4 h-1 bg-amber-500 rounded mt-1"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900 dark:text-white">
                        <Moon className="w-4 h-4 text-blue-400" />
                        <span>Dark Version</span>
                        {isDarkMode && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Deep obsidian charcoal tones with subtle glows. Reduces eye strain during late-night problem-solving.
                      </p>
                    </div>
                    {isDarkMode && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 ml-2" />}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeModeSwitch('dark');
                    }}
                    className={`w-full mt-3 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isDarkMode ? 'Selected Version' : 'Switch to Dark Version'}
                  </button>
                </div>
              </div>

              {/* 2. Palette Accent Styles */}
              <div className="space-y-3 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-500" />
                    <span>Workspace Palette Accents</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Apply refined color accents to headers, buttons, and calendar highlights:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {THEME_PALETTES.map(p => {
                    const isSelected = (currentPalette || 'default') === p.id;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (onSelectPalette) {
                            onSelectPalette(p.id);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 dark:border-blue-400 bg-slate-50 dark:bg-slate-800 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="w-4 h-4 rounded-full shrink-0 shadow-xs" 
                              style={{ backgroundColor: p.accentHex }}
                            />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {p.name}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          {p.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Live Interactive Workspace Preview */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>Live Theme Preview</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {isDarkMode ? 'Night Mode' : 'Bright Mode'} • {THEME_PALETTES.find(p => p.id === currentPalette)?.name || 'Studio Cobalt'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Sample Class Period</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      09:00 - 10:30
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Physics Lecture · Hall B · Dr. Kowalski
                  </p>
                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Task Checklist and Problem Review Logs sync instantly with your active theme.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: COURSE COLORS                                             */}
          {/* ============================================================== */}
          {activeTab === 'colors' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Course Colors & Academic Identifiers
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assign distinctive color schemes to each subject so your calendar, tasks, and problem logs are organized at a glance.
                </p>
              </div>

              {/* Subject List with Color Selectors */}
              <div className="space-y-3">
                {(account.subjects || []).map(subject => {
                  const colorScheme = getColorById(subject.color);
                  const isPickerOpen = activeColorSubjectId === subject.id;

                  return (
                    <div 
                      key={subject.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setActiveColorSubjectId(isPickerOpen ? null : subject.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs cursor-pointer transition-transform hover:scale-105"
                            style={{ backgroundColor: colorScheme.hex }}
                            title={`Change color for ${subject.name}`}
                          >
                            <Palette className="w-3.5 h-3.5" />
                          </button>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {subject.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Code: {subject.code || 'N/A'} • {colorScheme.label}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded font-bold font-mono text-white"
                            style={{ backgroundColor: colorScheme.hex }}
                          >
                            {colorScheme.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="p-1 rounded text-slate-300 hover:text-red-500 cursor-pointer"
                            title="Remove Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Color Palette dropdown */}
                      {isPickerOpen && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {PROFESSIONAL_COLORS.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSetSubjectColor(subject.id, c.id)}
                              className="p-2 rounded-lg border flex flex-col items-center space-y-1 hover:border-slate-400 cursor-pointer transition-colors"
                              style={{ 
                                borderColor: c.id === subject.color ? c.hex : 'transparent',
                                backgroundColor: c.id === subject.color ? `${c.hex}15` : 'transparent'
                              }}
                            >
                              <div className="w-5 h-5 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: c.hex }}>
                                {c.id === subject.color && <Check className="w-3 h-3" />}
                              </div>
                              <span className="text-[9px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                                {c.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add New Subject */}
              <form onSubmit={handleAddNewSubject} className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="New Course Name (e.g. Biology)..."
                  className="flex-1 min-w-[180px] px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
                <select
                  value={newSubColor}
                  onChange={(e) => setNewSubColor(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  {PROFESSIONAL_COLORS.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Course</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: TASKS                                                     */}
          {/* ============================================================== */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 animate-fade-in max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Task Management Hub ({tasks.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review and oversee all assignments, homework, and test prep checkmarks.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {tasks.map(task => (
                  <div 
                    key={task.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <div className={`text-xs font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {task.subject} • Due {task.dueDate} • {task.priority} Priority
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: PROBLEM REVIEWS                                           */}
          {/* ============================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-fade-in max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Problem Reviews & Academic Blockers ({problems.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Log and review challenging topics, exam prep questions, and concept blockers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {problems.map(prob => (
                  <div 
                    key={prob.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {prob.title}
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={prob.status}
                          onChange={(e) => onUpdateProblem({ ...prob, status: e.target.value as any })}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer font-bold"
                        >
                          <option value="Active">Active</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onDeleteProblem(prob.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {prob.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: OCCASIONAL ACTIVITIES                                     */}
          {/* ============================================================== */}
          {activeTab === 'occasional' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Occasional Academic Activities ({occasionalList.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track workshops, seminars, competitions, and one-off events that occur occasionally.
                </p>
              </div>

              <div className="space-y-2">
                {occasionalList.map(occ => (
                  <div 
                    key={occ.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {occ.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {occ.category} • {occ.estimatedHours || 2} hrs • {occ.subject}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onAddOccasionalToSchedule(occ)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 cursor-pointer"
                      >
                        Add to Today
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOccasional(occ.id)}
                        className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add occasional form */}
              <form onSubmit={handleAddOccasional} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Add New Occasional Activity
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newOccTitle}
                    onChange={(e) => setNewOccTitle(e.target.value)}
                    placeholder="Title (e.g. Science Fair Presentation)..."
                    className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <select
                    value={newOccCategory}
                    onChange={(e) => setNewOccCategory(e.target.value as any)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Study Group">Study Group</option>
                    <option value="Appointment">Appointment</option>
                    <option value="Exam / Quiz">Exam / Quiz</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                >
                  Save Activity
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: ACCOUNTS                                                  */}
          {/* ============================================================== */}
          {activeTab === 'accounts' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Accounts & Profiles on this Device ({allAccounts.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch between registered students or add a new academic profile.
                </p>
              </div>

              <div className="space-y-2">
                {allAccounts.map(acc => {
                  const isCurrent = acc.id === account.id;

                  return (
                    <div 
                      key={acc.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        isCurrent 
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center justify-center">
                          {acc.avatarLetter || acc.name.charAt(0)}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                            <span>{acc.name}</span>
                            {acc.username && (
                              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                                @{acc.username}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {acc.domain} • {acc.subjects?.length || 0} courses
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => onSelectAccount(acc.id)}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                          >
                            Switch
                          </button>
                        )}
                        {allAccounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteAccount(acc.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Create new account form */}
              <form onSubmit={handleCreateAccountSubmit} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Add Another Student Profile
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="Student Name..."
                    className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    value={newAccDomain}
                    onChange={(e) => setNewAccDomain(e.target.value)}
                    placeholder="Domain (e.g. Pre-Med)..."
                    className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    value={newAccTerm}
                    onChange={(e) => setNewAccTerm(e.target.value)}
                    placeholder="Term (e.g. Fall 2026)..."
                    className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                >
                  Create Profile
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: BACKUP & DATA RESET                                       */}
          {/* ============================================================== */}
          {activeTab === 'data' && (
            <div className="space-y-6 animate-fade-in max-w-xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Workspace Backup & Data Reset
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export and restore your full timetable and task JSON, or wipe cleanly to start over.
                </p>
              </div>

              {/* Export & Import Backup */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Data Backup & Sync
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={onExportBackup}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup JSON</span>
                  </button>

                  <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restore Backup JSON</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Clean Wipe */}
              <div className="p-4 rounded-xl border border-red-200 dark:border-red-950/60 bg-red-50/50 dark:bg-red-950/20 space-y-2">
                <div className="text-xs font-bold text-red-900 dark:text-red-200">
                  Wipe & Reset Workspace
                </div>
                <p className="text-[11px] text-red-700 dark:text-red-300">
                  Completely clear all tasks, calendar periods, and problem reviews to start from a blank sheet.
                </p>
                <button
                  onClick={onClearAllData}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                >
                  Wipe All Data to Empty
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Changes saved automatically to your browser storage
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
