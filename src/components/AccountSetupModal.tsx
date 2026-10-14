import React, { useState, useEffect } from 'react';
import { StudentAccount, SubjectDefinition } from '../types';
import { PROFESSIONAL_COLORS, getColorById } from '../utils/colorPalette';
import { 
  X, 
  Check, 
  Plus, 
  Trash2, 
  User, 
  BookOpen, 
  Palette, 
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';

interface AccountSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: StudentAccount;
  onSaveAccount: (updatedAccount: StudentAccount) => void;
  isInitialSetup?: boolean;
}

const DOMAIN_PRESETS = [
  'Science & Pre-Engineering',
  'Computer Science & Software',
  'Pre-Med & Biological Sciences',
  'Mathematics & Statistics',
  'High School General Sciences',
  'Commerce, Finance & Economics',
  'Humanities, Law & Arts',
  'Custom Domain'
];

export const AccountSetupModal: React.FC<AccountSetupModalProps> = ({
  isOpen,
  onClose,
  account,
  onSaveAccount,
  isInitialSetup = false
}) => {
  const [name, setName] = useState(account.name || '');
  const [domain, setDomain] = useState(account.domain || 'Science & Pre-Engineering');
  const [customDomain, setCustomDomain] = useState('');
  const [term, setTerm] = useState(account.termOrSubtitle || 'Current Term');
  const [subjects, setSubjects] = useState<SubjectDefinition[]>(
    account.subjects?.length ? account.subjects : []
  );

  const [activeColorPickerSubjectId, setActiveColorPickerSubjectId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('blue');

  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setDomain(account.domain || 'Science & Pre-Engineering');
      setTerm(account.termOrSubtitle || 'Current Term');
      setSubjects(account.subjects?.length ? account.subjects : []);
    }
  }, [account, isOpen]);

  if (!isOpen) return null;

  const handleColorChange = (subjectId: string, colorId: string) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, color: colorId } : s));
    setActiveColorPickerSubjectId(null);
  };

  const handleAddSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubjectName.trim()) return;

    const newSub: SubjectDefinition = {
      id: `sub-${Date.now()}`,
      name: newSubjectName.trim(),
      color: newSubjectColor,
      code: newSubjectName.trim().substring(0, 4).toUpperCase()
    };

    setSubjects(prev => [...prev, newSub]);
    setNewSubjectName('');
    // Advance color to next available color in palette
    const currentIndex = PROFESSIONAL_COLORS.findIndex(c => c.id === newSubjectColor);
    const nextColor = PROFESSIONAL_COLORS[(currentIndex + 1) % PROFESSIONAL_COLORS.length].id;
    setNewSubjectColor(nextColor);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = () => {
    const finalDomain = domain === 'Custom Domain' ? (customDomain.trim() || 'General Studies') : domain;
    const updated: StudentAccount = {
      ...account,
      name: name.trim() || 'Student',
      domain: finalDomain,
      termOrSubtitle: term.trim() || 'Academic Year',
      avatarLetter: (name.trim() || 'S').charAt(0).toUpperCase(),
      subjects
    };

    onSaveAccount(updated);
    onClose();
  };

  const applyDomainTemplate = (dom: string) => {
    setDomain(dom);
    if (dom === 'Science & Pre-Engineering') {
      setSubjects([
        { id: `sub-${Date.now()}-1`, name: 'Physics', color: 'blue', code: 'PHY' },
        { id: `sub-${Date.now()}-2`, name: 'Maths', color: 'crimson', code: 'MATH' },
        { id: `sub-${Date.now()}-3`, name: 'Chemistry', color: 'emerald', code: 'CHEM' },
        { id: `sub-${Date.now()}-4`, name: 'Computer Science', color: 'indigo', code: 'CS' },
        { id: `sub-${Date.now()}-5`, name: 'English', color: 'amber', code: 'ENG' }
      ]);
    } else if (dom === 'Computer Science & Software') {
      setSubjects([
        { id: `sub-${Date.now()}-1`, name: 'Algorithms & Data Structures', color: 'indigo', code: 'DSA' },
        { id: `sub-${Date.now()}-2`, name: 'Discrete Maths', color: 'crimson', code: 'DM' },
        { id: `sub-${Date.now()}-3`, name: 'Computer Systems', color: 'blue', code: 'SYS' },
        { id: `sub-${Date.now()}-4`, name: 'Web Engineering', color: 'teal', code: 'WEB' },
        { id: `sub-${Date.now()}-5`, name: 'Physics Mechanics', color: 'amber', code: 'PHY' }
      ]);
    } else if (dom === 'Pre-Med & Biological Sciences') {
      setSubjects([
        { id: `sub-${Date.now()}-1`, name: 'Biology & Anatomy', color: 'emerald', code: 'BIO' },
        { id: `sub-${Date.now()}-2`, name: 'Organic Chemistry', color: 'teal', code: 'CHEM' },
        { id: `sub-${Date.now()}-3`, name: 'Physics for Life Sciences', color: 'blue', code: 'PHY' },
        { id: `sub-${Date.now()}-4`, name: 'Biostatistics', color: 'crimson', code: 'STAT' },
        { id: `sub-${Date.now()}-5`, name: 'Medical Ethics', color: 'purple', code: 'ETH' }
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isInitialSetup ? 'Set Up Your Student Profile' : 'Student Account & Course Setup'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your name, academic domain, and the things you are going to do with custom color codes
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Identity & Domain */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
              <User className="w-3.5 h-3.5" />
              <span>1. Account Identity & Domain</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sharim"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Term / Level / Year
                </label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g. Fall 2026, Grade 11, Semester 1"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Domain (Field of Focus)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {DOMAIN_PRESETS.map((dp) => (
                  <button
                    key={dp}
                    type="button"
                    onClick={() => applyDomainTemplate(dp)}
                    className={`px-2.5 py-2 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer ${
                      domain === dp
                        ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    {dp}
                  </button>
                ))}
              </div>

              {domain === 'Custom Domain' && (
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="Type your custom academic domain..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Section 2: The Things You Are Going To Do (Subjects & Colors) */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>2. The Things You Are Going To Do (Subjects & Colors)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pick and change colors for each subject. Lots of solid color options to organize your timetable and tasks.
                </p>
              </div>
            </div>

            {/* List of subjects with color selector */}
            <div className="space-y-2">
              {subjects.map((sub) => {
                const colorObj = getColorById(sub.color);
                const isPickerOpen = activeColorPickerSubjectId === sub.id;

                return (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex flex-col space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Current Color Indicator Button */}
                        <button
                          type="button"
                          onClick={() => setActiveColorPickerSubjectId(isPickerOpen ? null : sub.id)}
                          className={`w-7 h-7 rounded-lg ${colorObj.previewBg} text-white flex items-center justify-center font-bold shadow-xs cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-slate-400 transition-all`}
                          title={`Click to change color for ${sub.name}`}
                        >
                          <Palette className="w-3.5 h-3.5" />
                        </button>

                        <div>
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSubjects(prev => prev.map(s => s.id === sub.id ? { ...s, name: val } : s));
                            }}
                            className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-slate-900 dark:focus:border-white focus:outline-none px-1"
                          />
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2 px-1">
                            <span>Code: {sub.code || sub.name.substring(0, 3).toUpperCase()}</span>
                            <span>•</span>
                            <span className="font-semibold">{colorObj.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setActiveColorPickerSubjectId(isPickerOpen ? null : sub.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          {isPickerOpen ? 'Close Swatches' : 'Change Color'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Remove subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Color Swatches Grid (Give and Take Colors) */}
                    {isPickerOpen && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                          Choose a solid color for {sub.name}:
                        </div>
                        <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                          {PROFESSIONAL_COLORS.map((col) => {
                            const isSelected = sub.color === col.id;
                            return (
                              <button
                                key={col.id}
                                type="button"
                                onClick={() => handleColorChange(sub.id, col.id)}
                                className={`h-8 rounded-lg ${col.previewBg} flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-105 ${
                                  isSelected ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-105' : 'opacity-85 hover:opacity-100'
                                }`}
                                title={col.label}
                              >
                                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add New Subject Inline */}
            <form onSubmit={handleAddSubject} className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Add another course or subject (e.g. Biology, Economics)..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <select
                value={newSubjectColor}
                onChange={(e) => setNewSubjectColor(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                {PROFESSIONAL_COLORS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <button
                type="submit"
                className="flex items-center space-x-1 px-3 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {subjects.length} course{subjects.length === 1 ? '' : 's'} configured with color coding
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Update Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
