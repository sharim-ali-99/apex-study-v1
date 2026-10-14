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
  CalendarDays
} from 'lucide-react';

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
  initialTab?: 'profile' | 'colors' | 'tasks' | 'reviews' | 'occasional' | 'accounts' | 'data';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'colors' | 'tasks' | 'reviews' | 'occasional' | 'accounts' | 'data'>(initialTab);

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
      occasionalActivities: occasionalList.filter(o => o.id !== id)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (ChatGPT / Gemini style Settings Hub) */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Workspace & Profile Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalization, colors, domain, academic tasks, problem reviews, and accounts for <span className="font-semibold text-slate-900 dark:text-white">{account.name}</span>
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
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Domain</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'colors'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Course Colors ({account.subjects?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks & Checkmarks ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Problem Reviews ({problems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('occasional')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'occasional'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Occasional Activities ({occasionalList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Switch Profile ({allAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'data'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Theme & Backup</span>
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
                    required
                    value={profDomain}
                    onChange={(e) => setProfDomain(e.target.value)}
                    placeholder="e.g. Science & Pre-Engineering, Computer Science, Pre-Med..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['Science & Pre-Engineering', 'Computer Science', 'Pre-Med', 'High School Sciences', 'Economics'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setProfDomain(preset)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Term / Subtitle
                  </label>
                  <input
                    type="text"
                    value={profTerm}
                    onChange={(e) => setProfTerm(e.target.value)}
                    placeholder="e.g. Fall 2026, Grade 11, Semester 1"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer hover:opacity-90"
                >
                  Save Profile Information
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: COURSE COLORS & PALETTE                                   */}
          {/* ============================================================== */}
          {activeTab === 'colors' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Course Colors & Solid Palette
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select clean solid colors for Physics, Maths, Chemistry, etc. to make your calendar instantly readable.
                </p>
              </div>

              {/* Subject list with instant color picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(account.subjects || []).map((sub) => {
                  const colorObj = getColorById(sub.color);
                  const isPickerOpen = activeColorSubjectId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <button
                            type="button"
                            onClick={() => setActiveColorSubjectId(isPickerOpen ? null : sub.id)}
                            className={`w-6 h-6 rounded-lg ${colorObj.previewBg} border border-slate-300 dark:border-slate-600 shadow-xs cursor-pointer hover:scale-105 transition-transform flex items-center justify-center`}
                            title="Click to change color"
                          >
                            <span className="text-[10px] text-white font-bold">✎</span>
                          </button>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                              {sub.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Color: <span className="font-semibold text-slate-600 dark:text-slate-300">{colorObj.label}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                            {sub.code || sub.name.substring(0, 4).toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                            title="Delete subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Color swatch grid picker dropdown */}
                      {isPickerOpen && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Select Solid Color ({PROFESSIONAL_COLORS.length} choices):
                          </span>
                          <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                            {PROFESSIONAL_COLORS.map((col) => (
                              <button
                                key={col.id}
                                type="button"
                                onClick={() => handleSetSubjectColor(sub.id, col.id)}
                                className={`w-7 h-7 rounded-lg ${col.previewBg} border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                                  sub.color === col.id ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/30 dark:ring-white/30' : 'border-transparent'
                                }`}
                                title={col.label}
                              >
                                {sub.color === col.id && <Check className="w-3.5 h-3.5 text-white" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add New Subject */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2">
                  + Add Another Subject / Course
                </span>
                <form onSubmit={handleAddNewSubject} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Course name (e.g. Statistics, Biology)..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <select
                    value={newSubColor}
                    onChange={(e) => setNewSubColor(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    {PROFESSIONAL_COLORS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                  >
                    Add Course
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: TASKS & CHECKMARKS OVERVIEW                               */}
          {/* ============================================================== */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tasks & Academic Checkmarks
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review all tasks, assignments, and study milestones configured in your account.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {tasks.filter(t => t.status === 'completed').length} / {tasks.length} Completed
                </span>
              </div>

              {tasks.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs">
                  No tasks recorded. Your checklist is completely clean!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  {tasks.map(task => (
                    <div key={task.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                          task.status === 'completed' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {task.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <div>
                          <div className={`font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {task.subject || 'General'} • Due: {task.dueDate} • {task.priority} Priority
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {task.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: PROBLEM REVIEWS                                           */}
          {/* ============================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Problem & Academic Reviews Management
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage logged difficulties, study blockers, and action plans. Update status or notes anytime.
                </p>
              </div>

              {problems.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs">
                  No problems or blockers logged.
                </div>
              ) : (
                <div className="space-y-3">
                  {problems.map(prob => (
                    <div key={prob.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            prob.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {prob.status}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {prob.title}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const newStatus = prob.status === 'Resolved' ? 'Active' : 'Resolved';
                              onUpdateProblem({
                                ...prob,
                                status: newStatus,
                                updatedDate: new Date().toISOString().split('T')[0]
                              });
                            }}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Mark as {prob.status === 'Resolved' ? 'Active' : 'Resolved'}
                          </button>
                          <button
                            onClick={() => onDeleteProblem(prob.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                        {prob.description}
                      </div>

                      {prob.actionPlan && (
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs font-mono text-slate-600 dark:text-slate-400">
                          <span className="font-bold font-sans text-slate-900 dark:text-white block mb-0.5">Action Plan:</span>
                          {prob.actionPlan}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: OCCASIONAL ACTIVITIES                                     */}
          {/* ============================================================== */}
          {activeTab === 'occasional' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Occasional & Ad-Hoc Activities
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Save activities you do occasionally (workshops, olympiads, guest lectures) so you can drop them into your calendar anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {occasionalList.map(occ => {
                  const colorObj = getColorById(occ.color);
                  return (
                    <div
                      key={occ.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-3 h-3 rounded-full ${colorObj.previewBg}`}></span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {occ.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {occ.category} • ~{occ.estimatedHours || 1} hrs
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onAddOccasionalToSchedule(occ)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                        >
                          + Add to Calendar
                        </button>
                        <button
                          onClick={() => handleDeleteOccasional(occ.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add occasional form */}
              <form onSubmit={handleAddOccasional} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  + Create New Occasional Activity
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={newOccTitle}
                      onChange={(e) => setNewOccTitle(e.target.value)}
                      placeholder="e.g. Science Fair, Workshop..."
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Category</label>
                    <select
                      value={newOccCategory}
                      onChange={(e) => setNewOccCategory(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Study Group">Study Group</option>
                      <option value="Appointment">Appointment</option>
                      <option value="Exam / Quiz">Exam / Quiz</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Color</label>
                    <select
                      value={newOccColor}
                      onChange={(e) => setNewOccColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {PROFESSIONAL_COLORS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                >
                  Save Occasional Template
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: ACCOUNTS SWITCHER & CREATION                               */}
          {/* ============================================================== */}
          {activeTab === 'accounts' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Student Profiles & Multi-Account Manager
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch between student profiles or create new academic terms.
                </p>
              </div>

              <div className="space-y-2">
                {allAccounts.map(acc => {
                  const isCurrent = acc.id === account.id;
                  return (
                    <div
                      key={acc.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center justify-center">
                          {acc.avatarLetter}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{acc.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                                Active Profile
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {acc.domain || 'Domain'} • {acc.termOrSubtitle} • {acc.subjects?.length || 0} subjects
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!isCurrent && (
                          <button
                            onClick={() => onSelectAccount(acc.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                          >
                            Switch to this
                          </button>
                        )}
                        {allAccounts.length > 1 && (
                          <button
                            onClick={() => onDeleteAccount(acc.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                            title="Delete profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Create new account form */}
              <form onSubmit={handleCreateAccountSubmit} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  + Create Another Profile / Term
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="Student Name..."
                    className="px-2.5 py-1.5 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    value={newAccDomain}
                    onChange={(e) => setNewAccDomain(e.target.value)}
                    placeholder="Domain (e.g. Science, Pre-Med)..."
                    className="px-2.5 py-1.5 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    value={newAccTerm}
                    onChange={(e) => setNewAccTerm(e.target.value)}
                    placeholder="Term (e.g. Fall 2026)..."
                    className="px-2.5 py-1.5 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
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
          {/* TAB: THEME, DATA BACKUP & WIPES                                */}
          {/* ============================================================== */}
          {activeTab === 'data' && (
            <div className="space-y-6 animate-fade-in max-w-xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Appearance, Bright/Dark Theme & Data Management
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch color themes, backup your full workspace JSON, or reset to empty.
                </p>
              </div>

              {/* Theme Settings */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Interface Theme Mode
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Currently in {isDarkMode ? 'Dark Mode' : 'Bright Mode'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  <span>Switch to {isDarkMode ? 'Bright' : 'Dark'}</span>
                </button>
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
            Changes are saved automatically to your browser storage
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
