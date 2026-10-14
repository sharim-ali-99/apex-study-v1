import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Menu
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'timetable' | 'tasks' | 'checkmarks' | 'timer' | 'overview';
  onOpenNewTaskModal: () => void;
  onOpenNewSlotModal: () => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
  onToggleSidebar?: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  timetable: { title: 'Academic Schedule', subtitle: 'Weekly course timeline and daily agenda' },
  tasks: { title: 'Tasks & Projects', subtitle: 'Assignments, deliverables, and exam preparation' },
  checkmarks: { title: 'Daily Habits', subtitle: 'Consistency tracking, rituals, and course milestones' },
  timer: { title: 'Focus Session', subtitle: 'Deep work interval timer and session logger' },
  overview: { title: 'Academic Overview', subtitle: 'Workload distribution and course progress' }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenNewTaskModal,
  onOpenNewSlotModal,
  onOpenChat,
  isChatOpen,
  onToggleSidebar
}) => {
  const current = TAB_TITLES[currentTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {current.title}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {currentTab === 'tasks' && (
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        )}

        {currentTab === 'timetable' && (
          <button
            onClick={onOpenNewSlotModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class</span>
          </button>
        )}

        <button
          onClick={onOpenChat}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
            isChatOpen
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300'
              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>AI Assistant</span>
        </button>
      </div>
    </header>
  );
};
