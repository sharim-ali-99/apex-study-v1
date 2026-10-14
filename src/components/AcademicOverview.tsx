import React from 'react';
import { Task, TimetableSlot } from '../types';
import { 
  BookOpen, 
  Calendar, 
  CheckSquare
} from 'lucide-react';

interface AcademicOverviewProps {
  tasks: Task[];
  timetable: TimetableSlot[];
  onOpenNewTask: () => void;
  onOpenAI: () => void;
}

export const AcademicOverview: React.FC<AcademicOverviewProps> = ({
  tasks,
  timetable,
  onOpenNewTask,
  onOpenAI
}) => {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const homeworkCount = tasks.filter(t => t.category === 'Homework').length;
  const projectCount = tasks.filter(t => t.category === 'Project').length;
  const examPrepCount = tasks.filter(t => t.category === 'Exam Prep').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'completed');

  const subjectDistribution: Record<string, number> = {};
  timetable.forEach(slot => {
    subjectDistribution[slot.subject] = (subjectDistribution[slot.subject] || 0) + 1;
  });

  const subjectList = Object.entries(subjectDistribution).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Homework</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {homeworkCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Problem sets & readings</div>
        </div>

        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Projects & Labs</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {projectCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Milestones & reports</div>
        </div>

        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Exam Preps</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {examPrepCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Midterms & quizzes</div>
        </div>

        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">Weekly Scheduled</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {timetable.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Classes & sessions</div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course distribution */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Course Distribution
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{subjectList.length} courses</span>
          </div>

          <div className="space-y-3">
            {subjectList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No classes currently in schedule.</p>
            ) : (
              subjectList.map(([subject, count]) => {
                const percentage = Math.round((count / timetable.length) * 100);
                return (
                  <div key={subject} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span>{subject}</span>
                      <span className="font-mono text-slate-400">{count} sessions ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-900 dark:bg-white"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* High priority tasks */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              High Priority Deliverables
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{highPriorityTasks.length} active</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {highPriorityTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No high priority tasks pending.</p>
            ) : (
              highPriorityTasks.map(t => (
                <div key={t.id} className="py-2.5 flex items-start justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.subject || t.category} · Due {t.dueDate}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
