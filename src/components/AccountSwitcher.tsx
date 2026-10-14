import React, { useState } from 'react';
import { StudentAccount } from '../types';
import { ChevronDown, Plus, Check, User, Edit3, Settings } from 'lucide-react';

interface AccountSwitcherProps {
  accounts: StudentAccount[];
  activeAccountId: string;
  onSelectAccount: (id: string) => void;
  onCreateAccount: (name: string, domain: string, term: string) => void;
  onOpenProfileSetup: () => void;
  onOpenSettings: () => void;
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  accounts,
  activeAccountId,
  onSelectAccount,
  onCreateAccount,
  onOpenProfileSetup,
  onOpenSettings
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('Science & Pre-Engineering');
  const [newTerm, setNewTerm] = useState('Fall 2026');

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateAccount(newName.trim(), newDomain.trim() || 'Science & Engineering', newTerm.trim() || 'Academic Year');
    setNewName('');
    setIsCreating(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer text-left shadow-xs"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center shrink-0">
          {activeAccount?.avatarLetter || 'S'}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center space-x-1">
            <span>{activeAccount?.name || 'Student'}</span>
            <span className="text-[10px] text-slate-400 font-medium font-mono">
              ({activeAccount?.subjects?.length || 0} courses)
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate max-w-[150px]">
            {activeAccount?.domain || activeAccount?.termOrSubtitle || 'Pre-Engineering'}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Switch Student Account</span>
            <span className="text-[9px] text-slate-400">{accounts.length} active</span>
          </div>

          <div className="space-y-1">
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
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-[10px] flex items-center justify-center">
                      {acc.avatarLetter}
                    </span>
                    <div>
                      <div className="leading-tight">{acc.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {acc.domain || 'Domain'} • {acc.termOrSubtitle}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />}
                </button>
              );
            })}
          </div>

          {/* Quick Profile Setup & Settings Links */}
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenProfileSetup();
              }}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-left"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Courses & Colors</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-left"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Workspace Settings</span>
            </button>
          </div>

          {/* Create new account/term */}
          <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
            {isCreating ? (
              <form onSubmit={handleCreate} className="p-2 space-y-2">
                <input
                  type="text"
                  required
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your Name / Account..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="Domain (e.g. Science, Pre-Med)..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="Term (e.g. Spring 2027)..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
                <div className="flex items-center space-x-1 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                  >
                    Save Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Another Profile / Term</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
