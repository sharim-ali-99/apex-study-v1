import React, { useState } from 'react';
import { 
  TimetableSlot, 
  Task, 
  StudentAccount, 
  ProblemReview 
} from '../types';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  BookOpen, 
  Award,
  Check,
  Copy,
  AlertCircle,
  TrendingUp,
  Flame,
  Layers
} from 'lucide-react';
import { PROFESSIONAL_COLORS, getColorById, getSubjectColorId } from '../utils/colorPalette';

interface AcademicReportViewProps {
  slots: TimetableSlot[];
  tasks: Task[];
  account: StudentAccount;
  problems?: ProblemReview[];
}

export const AcademicReportView: React.FC<AcademicReportViewProps> = ({
  slots,
  tasks,
  account,
  problems = []
}) => {
  const [copied, setCopied] = useState(false);

  // 1. Task progress metrics
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'High');
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  // 2. Class schedule metrics by subject
  const subjectHours: Record<string, { count: number; color: string }> = {};
  slots.forEach(s => {
    if (!subjectHours[s.subject]) {
      subjectHours[s.subject] = { count: 0, color: s.color };
    }
    subjectHours[s.subject].count += 1.5; // ~1.5 hours per period
  });

  const totalWeeklyClassHours = Object.values(subjectHours).reduce((acc, curr) => acc + curr.count, 0);

  // 3. Problem Review stats
  const activeProblems = problems.filter(p => p.status === 'Active');
  const resolvedProblems = problems.filter(p => p.status === 'Resolved');
  const problemResolutionRate = problems.length > 0
    ? Math.round((resolvedProblems.length / problems.length) * 100)
    : 100;

  // Group tasks by category
  const homeworkCount = tasks.filter(t => t.category === 'Homework').length;
  const projectCount = tasks.filter(t => t.category === 'Project').length;
  const examPrepCount = tasks.filter(t => t.category === 'Exam Prep').length;

  const copyReportSummary = () => {
    const summary = `Academic Status Report (${account.name} - ${account.domain || 'Domain'})
Generated: ${new Date().toLocaleDateString()}
----------------------------------------
Domain: ${account.domain || 'General Studies'} (${account.termOrSubtitle || 'Active Term'})
Total Weekly Class Time: ${totalWeeklyClassHours} hrs (${slots.length} periods)
Active Tasks: ${pendingTasks.length} pending (${completedTasks.length} completed, ${completionPercentage}% rate)
High Priority Deadlines: ${highPriorityTasks.length}
Problem Reviews: ${activeProblems.length} active blockers, ${resolvedProblems.length} resolved (${problemResolutionRate}% solved)
Courses Configured: ${(account.subjects || []).map(s => s.name).join(', ')}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Consolidated Academic Report
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {account.name} • {account.domain || 'Science & Engineering'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {account.termOrSubtitle || 'Current Term'} • Unified workload breakdown, checkmark completion, and problem resolutions
          </p>
        </div>

        <button
          onClick={copyReportSummary}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer shadow-xs transition-opacity"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Summary Copied' : 'Copy Report Summary'}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Weekly Schedule</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalWeeklyClassHours} hrs
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Across {slots.length} class periods
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Checkmark Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {completionPercentage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {completedTasks.length} of {tasks.length} tasks completed
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">High Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {highPriorityTasks.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Urgent assignments / exams
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Problem Reviews</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {activeProblems.length} active
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
            {resolvedProblems.length} overcome & resolved
          </div>
        </div>
      </div>

      {/* Course Breakdown with Custom Colors */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Course Workload & Color Identifiers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hours committed each week for your domain: {account.domain}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 font-bold">
            {(account.subjects || []).length} Courses
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(account.subjects || []).map(sub => {
            const colorObj = getColorById(sub.color);
            const classCount = slots.filter(s => s.subject.toLowerCase() === sub.name.toLowerCase()).length;
            const taskCount = tasks.filter(t => t.subject?.toLowerCase() === sub.name.toLowerCase() && t.status !== 'completed').length;
            const probCount = problems.filter(p => p.subject?.toLowerCase() === sub.name.toLowerCase() && p.status === 'Active').length;

            return (
              <div
                key={sub.id}
                className={`p-3.5 rounded-xl border ${colorObj.cardClasses}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorObj.badgeBg} ${colorObj.badgeText}`}>
                    {sub.code || sub.name.slice(0, 4).toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    {classCount * 1.5}h / week
                  </span>
                </div>
                <div className="font-bold text-xs mt-2 text-slate-900 dark:text-white">
                  {sub.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                  <span>{classCount} class periods</span>
                  <span>{taskCount} pending tasks</span>
                </div>
                {probCount > 0 && (
                  <div className="mt-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{probCount} active blocker logged</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workload Distribution and Task Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task category counts */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Task Category Distribution
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Homework Assignments</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{homeworkCount}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Projects & Term Papers</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{projectCount}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Exam Preparation & Quizzes</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{examPrepCount}</span>
            </div>
          </div>
        </div>

        {/* Problem Resolution Summary */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Problem & Obstacle Reviews
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300">
              <span className="font-semibold">Active Difficulty Issues</span>
              <span className="font-mono font-bold">{activeProblems.length}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
              <span className="font-semibold">Mastered & Resolved Difficulties</span>
              <span className="font-mono font-bold">{resolvedProblems.length}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Difficulty Resolution Rate</span>
              <span className="font-mono font-bold">{problemResolutionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
