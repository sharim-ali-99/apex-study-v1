import React from 'react';
import { 
  Calendar, 
  CheckSquare, 
  CheckCheck, 
  Clock, 
  BarChart2, 
  Sparkles, 
  Sun, 
  Moon, 
  Download, 
  Plus,
  Palette
} from 'lucide-react';
import { Task, TimetableSlot, DailyCheckmark } from '../types';
import { PaletteTheme, PALETTES } from '../utils/themeColors';

interface SidebarProps {
  currentTab: 'timetable' | 'tasks' | 'checkmarks' | 'timer' | 'overview';
  setCurrentTab: (tab: 'timetable' | 'tasks' | 'checkmarks' | 'timer' | 'overview') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  currentPalette: PaletteTheme;
  setCurrentPalette: (palette: PaletteTheme) => void;
  tasks: Task[];
  timetable: TimetableSlot[];
  checkmarks: DailyCheckmark[];
  onOpenNewTaskModal: () => void;
  onOpenNewSlotModal: () => void;
  onOpenInstructionsModal: () => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
  userName: string;
  setUserName: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isDarkMode,
  setIsDarkMode,
  currentPalette,
  setCurrentPalette,
  tasks,
  timetable,
  checkmarks,
  onOpenNewTaskModal,
  onOpenNewSlotModal,
  onOpenInstructionsModal,
  onOpenChat,
  isChatOpen,
  userName,
  setUserName
}) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(userName);
  const [showPaletteMenu, setShowPaletteMenu] = React.useState(false);

  const activeTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const habitsDoneToday = checkmarks.filter(c => c.completedDates.includes(todayStr)).length;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      localStorage.setItem('apexstudy_user_name', nameInput.trim());
    }
    setIsEditingName(false);
  };

  const navItems = [
    {
      id: 'timetable' as const,
      label: 'Schedule',
      icon: Calendar,
      count: timetable.length > 0 ? timetable.length : undefined
    },
    {
      id: 'tasks' as const,
      label: 'Tasks',
      icon: CheckSquare,
      count: activeTasksCount > 0 ? activeTasksCount : undefined
    },
    {
      id: 'checkmarks' as const,
      label: 'Daily Habits',
      icon: CheckCheck,
      count: checkmarks.length > 0 ? `${habitsDoneToday}/${checkmarks.length}` : undefined
    },
    {
      id: 'timer' as const,
      label: 'Focus Timer',
      icon: Clock
    },
    {
      id: 'overview' as const,
      label: 'Academic Progress',
      icon: BarChart2
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between select-none">
      {/* Top Workspace Header */}
      <div>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                {isEditingName ? (
                  <form onSubmit={handleNameSubmit}>
                    <input
                      type="text"
                      autoFocus
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onBlur={handleNameSubmit}
                      className="text-xs font-semibold px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white w-full border border-slate-300 dark:border-slate-700 outline-none"
                    />
                  </form>
                ) : (
                  <div
                    onClick={() => {
                      setNameInput(userName);
                      setIsEditingName(true);
                    }}
                    title="Click to rename your workspace"
                    className="cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {userName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {todayFormatted}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5">
          <button
            onClick={onOpenNewTaskModal}
            className="flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>
          <button
            onClick={onOpenNewSlotModal}
            className="flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Class</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span className={`text-[11px] font-mono tabular-nums ${
                    isActive ? 'text-slate-700 dark:text-slate-300 font-semibold' : 'text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* Assistant Trigger */}
        <button
          onClick={onOpenChat}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            isChatOpen
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>AI Assistant</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Cmd+K</span>
        </button>

        {/* Curated Color Palette Switcher */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Color Palette
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {PALETTES.find(p => p.id === currentPalette)?.name}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-md">
            {PALETTES.map(p => (
              <button
                key={p.id}
                onClick={() => setCurrentPalette(p.id)}
                title={`${p.name} - ${p.desc}`}
                className={`h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                  currentPalette === p.id ? 'ring-1.5 ring-slate-900 dark:ring-white scale-105' : 'hover:scale-105 opacity-80'
                }`}
                style={{ backgroundColor: p.previewAccent }}
              />
            ))}
          </div>
        </div>

        {/* Theme and Backup Tools Row */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5"
            title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span className="text-[11px]">{isDarkMode ? 'Bright' : 'Dark'}</span>
          </button>

          <button
            onClick={onOpenInstructionsModal}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
            title="Backup & Settings"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">Backup</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
