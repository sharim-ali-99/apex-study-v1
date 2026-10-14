import React, { useState } from 'react';
import { Task, TimetableSlot, DailyCheckmark, ProgressMilestone } from '../types';
import { 
  X, 
  Download, 
  Upload, 
  Terminal, 
  Check, 
  Copy, 
  Sparkles,
  Laptop,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  timetable: TimetableSlot[];
  checkmarks: DailyCheckmark[];
  milestones: ProgressMilestone[];
  onImportData: (data: { 
    tasks: Task[]; 
    timetable: TimetableSlot[];
    checkmarks?: DailyCheckmark[];
    milestones?: ProgressMilestone[];
  }) => void;
  onClearAllData: () => void;
  onLoadSampleData: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  timetable,
  checkmarks,
  milestones,
  onImportData,
  onClearAllData,
  onLoadSampleData
}) => {
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleExportJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      timetable,
      checkmarks,
      milestones
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `apexstudy_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed.tasks) && Array.isArray(parsed.timetable)) {
        onImportData({
          tasks: parsed.tasks,
          timetable: parsed.timetable,
          checkmarks: Array.isArray(parsed.checkmarks) ? parsed.checkmarks : [],
          milestones: Array.isArray(parsed.milestones) ? parsed.milestones : []
        });
        setImportStatus('Backup loaded successfully!');
        setTimeout(() => setImportStatus(''), 3000);
      } else {
        setImportStatus('Invalid JSON format: missing tasks or timetable arrays');
      }
    } catch (e: any) {
      setImportStatus(`Error parsing JSON: ${e.message}`);
    }
  };

  const localRunBash = `# 1. Download or clone project folder
cd apexstudy-dashboard

# 2. Install dependencies
npm install

# 3. (Optional) Set your Gemini API key for cloud intelligence:
# export GEMINI_API_KEY="your-gemini-key"

# 4. Start local development server
npm run dev

# 5. Open your browser at:
# http://localhost:3000`;

  const copyBash = () => {
    navigator.clipboard.writeText(localRunBash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <Laptop className="w-5 h-5 text-blue-600" />
              <span>Workspace Control & Local Run Guide</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reset to empty slate, export backups, or run offline locally.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Section 1: Blank Slate Reset & Template */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center space-x-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Workspace Slate Manager</span>
            </h4>
            <p className="text-slate-500 dark:text-slate-400 mb-3">
              Manage your personal student workspace. You requested a completely clean slate so you can enter your exact classes, homework, and habits.
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onClearAllData}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe to 100% Completely Empty</span>
              </button>

              <button
                onClick={onLoadSampleData}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Template Preview</span>
              </button>
            </div>
          </div>

          {/* Section 2: Step-by-step local run */}
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>How to Run Locally on Your Machine</span>
            </h4>
            <div className="space-y-2 mb-3 leading-relaxed">
              <p>
                <strong>Step 1:</strong> Make sure <strong>Node.js (v18+)</strong> is installed from <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-blue-600 underline">nodejs.org</a>.
              </p>
              <p>
                <strong>Step 2:</strong> Download or extract the project folder to your local computer.
              </p>
              <p>
                <strong>Step 3:</strong> Open terminal and run:
              </p>
            </div>

            <div className="relative bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800">
              <button
                onClick={copyBash}
                className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center space-x-1 text-[10px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <pre className="overflow-x-auto">{localRunBash}</pre>
            </div>
          </div>

          {/* Section 3: Data Backup & Restore */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Data Export & Backup</span>
            </h4>
            <p className="mb-3 leading-relaxed text-slate-600 dark:text-slate-400">
              Download a JSON backup of your custom timetable, tasks, and daily checkmarks.
            </p>

            <button
              onClick={handleExportJson}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup ({tasks.length} tasks, {timetable.length} slots, {checkmarks.length} habits)</span>
            </button>

            {/* Import JSON Area */}
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Restore from Backup JSON:
              </label>
              <textarea
                rows={3}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Paste previously exported JSON here...'
                className="w-full p-2.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={handleImportJson}
                  disabled={!importJsonText.trim()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Data</span>
                </button>
                {importStatus && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {importStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
