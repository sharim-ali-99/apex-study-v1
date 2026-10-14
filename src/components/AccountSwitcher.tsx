import React, { useState } from 'react';
import { StudentAccount } from '../types';
import { 
  ChevronDown, 
  Plus, 
  Check, 
  User, 
  Edit3, 
  Settings, 
  LogOut, 
  Shield, 
  KeyRound,
  UserCheck
} from 'lucide-react';

interface AccountSwitcherProps {
  accounts: StudentAccount[];
  activeAccountId: string;
  onSelectAccount: (id: string) => void;
  onCreateAccount: (name: string, domain: string, term: string) => void;
  onOpenProfileSetup: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
  onOpenUserArea?: () => void;
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  accounts,
  activeAccountId,
  onSelectAccount,
  onCreateAccount,
  onOpenProfileSetup,
  onOpenSettings,
  onLogout,
  onOpenUserArea
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDomain, setNewDomain] = useState('Science & Pre-Engineering');
  const [newTerm, setNewTerm] = useState('Academic Year 2026-2027');

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateAccount(newName.trim(), newDomain.trim() || 'Science & Engineering', newTerm.trim() || 'Academic Year');
    setNewName('');
    setNewUsername('');
    setNewPassword('');
    setIsCreating(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer text-left shadow-xs"
        title="User Area & Profile Account"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
          {activeAccount?.avatarLetter || 'S'}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center space-x-1.5">
            <span>{activeAccount?.name || 'Student'}</span>
            {activeAccount?.username && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium">
                @{activeAccount.username}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate max-w-[150px]">
            {activeAccount?.domain || 'Pre-Engineering'} • {activeAccount?.subjects?.length || 0} courses
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-1.5 w-76 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2.5 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Active Account Identity Card */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-2 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {activeAccount?.avatarLetter || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {activeAccount?.name}
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                  @{activeAccount?.username || 'user'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {activeAccount?.domain}
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase">
                Active
              </span>
            </div>
          </div>

          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Accounts on this Device</span>
            <span className="text-[10px] font-mono text-slate-500">{accounts.length} saved</span>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto my-1 pr-1">
            {accounts.map(acc => {
              const isSelected = acc.id === activeAccountId;

              return (
                <button
                  key={acc.id}
                  onClick={() => {
                    onSelectAccount(acc.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 font-bold border border-blue-200 dark:border-blue-900'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {acc.avatarLetter}
                    </span>
                    <div className="truncate">
                      <div className="leading-tight truncate flex items-center space-x-1">
                        <span>{acc.name}</span>
                        {acc.username && (
                          <span className="text-[10px] text-slate-400 font-mono font-normal">
                            @{acc.username}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">
                        {acc.domain} • {acc.subjects?.length || 0} courses
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Quick Profile Setup & Settings Links */}
          <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenProfileSetup();
              }}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-left transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Courses & Colors</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-left transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Workspace Settings</span>
            </button>
          </div>

          {/* User Area Login / Account Creation */}
          <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
            {onOpenUserArea && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenUserArea();
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer text-left transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Another Account</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer text-left transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out / Switch User</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
