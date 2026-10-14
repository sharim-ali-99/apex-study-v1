import React, { useState } from 'react';
import { 
  ProblemReview, 
  ProblemSeverity, 
  ProblemStatus, 
  ProblemCategory,
  StudentAccount 
} from '../types';
import { getColorById, getSubjectColorId } from '../utils/colorPalette';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  Save,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Flame
} from 'lucide-react';

interface ProblemReviewViewProps {
  problems: ProblemReview[];
  account: StudentAccount;
  onAddProblem: (problem: Omit<ProblemReview, 'id' | 'createdDate' | 'updatedDate'>) => void;
  onUpdateProblem: (problem: ProblemReview) => void;
  onDeleteProblem: (problemId: string) => void;
  onAskAIToSolveProblem: (problem: ProblemReview) => void;
}

const CATEGORIES: ProblemCategory[] = [
  'Academic Difficulty',
  'Concept Blocker',
  'Time Management',
  'Schedule Clash',
  'Exam Prep',
  'Personal / Routine'
];

export const ProblemReviewView: React.FC<ProblemReviewViewProps> = ({
  problems,
  account,
  onAddProblem,
  onUpdateProblem,
  onDeleteProblem,
  onAskAIToSolveProblem
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Creator State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemReview | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(account.subjects?.[0]?.name || 'Physics');
  const [category, setCategory] = useState<ProblemCategory>('Academic Difficulty');
  const [severity, setSeverity] = useState<ProblemSeverity>('High Priority');
  const [status, setStatus] = useState<ProblemStatus>('Active');
  const [description, setDescription] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const openCreateModal = () => {
    setEditingProblem(null);
    setTitle('');
    setSubject(account.subjects?.[0]?.name || 'Physics');
    setCategory('Academic Difficulty');
    setSeverity('High Priority');
    setStatus('Active');
    setDescription('');
    setActionPlan('');
    setReflectionNotes('');
    setResolutionNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (prob: ProblemReview) => {
    setEditingProblem(prob);
    setTitle(prob.title);
    setSubject(prob.subject || account.subjects?.[0]?.name || 'Physics');
    setCategory(prob.category);
    setSeverity(prob.severity);
    setStatus(prob.status);
    setDescription(prob.description);
    setActionPlan(prob.actionPlan);
    setReflectionNotes(prob.reflectionNotes);
    setResolutionNotes(prob.resolutionNotes || '');
    setIsModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingProblem) {
      // Update existing problem later on
      const updated: ProblemReview = {
        ...editingProblem,
        title: title.trim(),
        subject,
        category,
        severity,
        status,
        description: description.trim(),
        actionPlan: actionPlan.trim(),
        reflectionNotes: reflectionNotes.trim(),
        resolutionNotes: resolutionNotes.trim(),
        updatedDate: new Date().toISOString().split('T')[0]
      };
      onUpdateProblem(updated);
    } else {
      // Create new problem
      onAddProblem({
        title: title.trim(),
        subject,
        category,
        severity,
        status,
        description: description.trim(),
        actionPlan: actionPlan.trim(),
        reflectionNotes: reflectionNotes.trim(),
        resolutionNotes: resolutionNotes.trim()
      });
    }

    setIsModalOpen(false);
  };

  // Filter problems
  const filteredProblems = problems.filter(prob => {
    if (filterStatus !== 'all' && prob.status !== filterStatus) return false;
    if (filterSubject !== 'all' && prob.subject !== filterSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = prob.title.toLowerCase().includes(q);
      const matchDesc = prob.description.toLowerCase().includes(q);
      const matchSubject = prob.subject?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSubject) return false;
    }
    return true;
  });

  const activeCount = problems.filter(p => p.status === 'Active').length;
  const underReviewCount = problems.filter(p => p.status === 'Under Review').length;
  const resolvedCount = problems.filter(p => p.status === 'Resolved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Motivation */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Problem & Academic Review Log
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Whenever you face any difficulty (in Physics, Maths, schedule clashes, or study roadblocks), log it here. Save your action plan and update your progress later when you overcome it.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log a Problem / Blocker</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Active Blockers
          </div>
          <div className="text-2xl font-black text-rose-950 dark:text-rose-200 mt-1">
            {activeCount}
          </div>
          <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
            Needs attention & action plan
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Under Review
          </div>
          <div className="text-2xl font-black text-amber-950 dark:text-amber-200 mt-1">
            {underReviewCount}
          </div>
          <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
            Currently working on fix
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Resolved & Overcome
          </div>
          <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-1">
            {resolvedCount}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
            Mastered difficulties
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by keyword or concept..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses ({problems.length})</option>
            <option value="Active">Active ({activeCount})</option>
            <option value="Under Review">Under Review ({underReviewCount})</option>
            <option value="Resolved">Resolved ({resolvedCount})</option>
          </select>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {(account.subjects || []).map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problems List */}
      {filteredProblems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {problems.length === 0 ? 'No Problems Logged Yet' : 'No matching problems found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {problems.length === 0
              ? 'Got stuck on a tricky physics topic, calculus proof, or timetable clash? Log it now to review and resolve it step by step.'
              : 'Try adjusting your search query or filters above.'}
          </p>
          {problems.length === 0 && (
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
            >
              + Log Your First Problem
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProblems.map((prob) => {
            const subjectColorId = getSubjectColorId(prob.subject || '', account.subjects);
            const colorObj = getColorById(subjectColorId);

            const isResolved = prob.status === 'Resolved';
            const isUnderReview = prob.status === 'Under Review';

            return (
              <div
                key={prob.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isResolved
                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Subject Badge */}
                      {prob.subject && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                          {prob.subject}
                        </span>
                      )}

                      {/* Category Badge */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {prob.category}
                      </span>

                      {/* Severity Badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prob.severity === 'High Priority'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : prob.severity === 'Moderate'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {prob.severity}
                      </span>

                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                        isResolved
                          ? 'bg-emerald-600 text-white'
                          : isUnderReview
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}>
                        {isResolved ? <Check className="w-3 h-3 mr-0.5" /> : null}
                        <span>{prob.status}</span>
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold leading-snug mt-1 ${
                      isResolved ? 'text-slate-600 dark:text-slate-300 line-through' : 'text-slate-900 dark:text-white'
                    }`}>
                      {prob.title}
                    </h3>

                    {prob.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {prob.description}
                      </p>
                    )}
                  </div>

                  {/* Actions for this problem */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Ask AI to solve button */}
                    <button
                      type="button"
                      onClick={() => onAskAIToSolveProblem(prob)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                      title="Send problem to AI Copilot to get solution steps & timetable tasks"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>AI Solve</span>
                    </button>

                    {/* Edit & Update Later On */}
                    <button
                      type="button"
                      onClick={() => openEditModal(prob)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
                      title="Edit, add reflections, or update status"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Review</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProblem(prob.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Delete problem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Plan & Reflection Notes Box */}
                {(prob.actionPlan || prob.reflectionNotes || prob.resolutionNotes) && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {prob.actionPlan && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Action Plan / Solution Steps:
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                          {prob.actionPlan}
                        </div>
                      </div>
                    )}

                    {prob.reflectionNotes && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                          Reflection & Progress Notes:
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                          {prob.reflectionNotes}
                        </div>
                      </div>
                    )}

                    {prob.resolutionNotes && isResolved && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 sm:col-span-2 border border-emerald-200 dark:border-emerald-900/50">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolution Notes:</span>
                        </div>
                        <div className="text-emerald-900 dark:text-emerald-200">
                          {prob.resolutionNotes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer timestamp */}
                <div className="mt-3 pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Logged: {prob.createdDate}</span>
                  {prob.updatedDate && prob.updatedDate !== prob.createdDate && (
                    <span>Last Updated: {prob.updatedDate}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT PROBLEM MODAL (Save & Update Later On) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div 
            className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingProblem ? 'Update Problem & Review Notes' : 'Log a Problem / Blocker'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {editingProblem ? 'Save your latest reflection or mark it resolved' : 'Describe the difficulty and set your action plan'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Problem / Blocker Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Struggling with Calculus integration formulas, Physics lab report deadline..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course / Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {(account.subjects || []).map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="General">General / Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Problem Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProblemCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as ProblemSeverity)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="High Priority">High Priority (Urgent Blocker)</option>
                    <option value="Moderate">Moderate (Needs Attention)</option>
                    <option value="Minor Issue">Minor Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProblemStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Active">Active Issue</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved / Overcome</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  What is going wrong? (Problem Description)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly where you get confused, why the schedule clashes, or what is holding you back..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Action Plan (How you will fix or practice this)
                </label>
                <textarea
                  rows={2}
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  placeholder="e.g. 1. Re-watch lecture video, 2. Solve 5 textbook problems, 3. Ask teacher during office hours..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reflection & Progress Notes (Update anytime)
                </label>
                <textarea
                  rows={2}
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  placeholder="Add your reflections, what worked, or what you learned along the way..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {status === 'Resolved' && (
                <div>
                  <label className="block font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                    Resolution Notes (How was it overcome?)
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Summarize how this problem was resolved so you can refer back to it..."
                    className="w-full px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold hover:opacity-90 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingProblem ? 'Save & Update Problem' : 'Save Problem Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
