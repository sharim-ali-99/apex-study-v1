import React, { useState, useEffect, useRef } from 'react';
import { Task, FocusSession } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2,
  VolumeX
} from 'lucide-react';

interface FocusTimerProps {
  tasks: Task[];
  sessions: FocusSession[];
  onLogSession: (session: FocusSession) => void;
}

type TimerMode = 'pomodoro' | 'deep_work' | 'short_break' | 'long_break';

const MODE_DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  deep_work: 50 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const FocusTimer: React.FC<FocusTimerProps> = ({
  tasks,
  sessions,
  onLogSession
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.pomodoro);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  const timerRef = useRef<any>(null);

  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {}
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            playAlertSound();

            const task = tasks.find(t => t.id === selectedTaskId);
            const durationMins = Math.round(MODE_DURATIONS[mode] / 60);

            onLogSession({
              id: `sess-${Date.now()}`,
              timestamp: new Date().toISOString(),
              durationMinutes: durationMins,
              taskTitle: task ? task.title : 'Study Session',
              mode: mode === 'deep_work' ? 'pomodoro' : mode
            });

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, selectedTaskId, soundEnabled]);

  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalFocusMinutesToday = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const completedCount = sessions.filter(s => s.mode === 'pomodoro').length;
  const currentTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="max-w-xl mx-auto space-y-8 py-4">
      {/* Mode selection */}
      <div className="flex items-center justify-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-medium w-fit mx-auto">
        <button
          onClick={() => switchMode('pomodoro')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            mode === 'pomodoro' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          25m Focus
        </button>
        <button
          onClick={() => switchMode('deep_work')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            mode === 'deep_work' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          50m Deep Work
        </button>
        <button
          onClick={() => switchMode('short_break')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            mode === 'short_break' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          5m Break
        </button>
        <button
          onClick={() => switchMode('long_break')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            mode === 'long_break' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          15m Break
        </button>
      </div>

      {/* Clock display */}
      <div className="text-center py-4">
        <div className="font-mono text-8xl font-medium tracking-tight text-slate-900 dark:text-white tabular-nums select-none">
          {formatTime(timeLeft)}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 font-medium">
          {isActive ? 'Session in progress' : 'Ready to start'}
        </p>
      </div>

      {/* Task linking */}
      <div className="max-w-sm mx-auto">
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none cursor-pointer border-none"
        >
          <option value="">No linked task (General focus)</option>
          {tasks.filter(t => t.status !== 'completed').map(task => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
        {currentTask && (
          <p className="text-[11px] text-slate-500 text-center mt-1.5">
            Focusing on: <strong className="text-slate-700 dark:text-slate-300">{currentTask.title}</strong>
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-6 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            isActive
              ? 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 text-white'
              : 'bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
          }`}
        >
          {isActive ? 'Pause' : 'Start Focus'}
        </button>

        <button
          onClick={handleReset}
          title="Reset"
          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute alert' : 'Enable alert'}
          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Real Study History */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around text-center text-xs text-slate-500 dark:text-slate-400">
        <div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
            {completedCount}
          </div>
          <div className="text-[11px]">Sessions Completed</div>
        </div>

        <div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
            {totalFocusMinutesToday}m
          </div>
          <div className="text-[11px]">Total Focus Today</div>
        </div>
      </div>
    </div>
  );
};
