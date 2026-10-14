import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  KeyRound, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Palette, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SubjectDefinition, StudentAccount } from '../types';
import { PROFESSIONAL_COLORS, getColorById } from '../utils/colorPalette';
import { 
  registerUser, 
  loginUser, 
  getRegisteredUsers, 
  createDemoUser 
} from '../utils/userStorage';

interface UserAuthGateProps {
  onAuthenticated: (user: StudentAccount) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const DOMAIN_OPTIONS = [
  'Science & Pre-Engineering',
  'Computer Science & Software',
  'Pre-Med & Biological Sciences',
  'Mathematics & Statistics',
  'High School General Studies',
  'Business & Economics',
  'Humanities & Social Sciences'
];

export const UserAuthGate: React.FC<UserAuthGateProps> = ({
  onAuthenticated,
  isDarkMode,
  onToggleTheme
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const registeredUsers = getRegisteredUsers();

  // Sign up fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('Science & Pre-Engineering');
  const [term, setTerm] = useState('Academic Year 2026-2027');
  
  // Initial courses setup
  const [subjects, setSubjects] = useState<SubjectDefinition[]>([
    { id: 'sub-1', name: 'Physics', color: 'blue', code: 'PHY' },
    { id: 'sub-2', name: 'Maths', color: 'crimson', code: 'MATH' },
    { id: 'sub-3', name: 'Chemistry', color: 'emerald', code: 'CHEM' }
  ]);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);

  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Subject color change
  const handleSetSubjectColor = (index: number, colorId: string) => {
    setSubjects(prev => prev.map((s, idx) => idx === index ? { ...s, color: colorId } : s));
    setEditingColorIndex(null);
  };

  const handleUpdateSubjectName = (index: number, newName: string) => {
    setSubjects(prev => prev.map((s, idx) => idx === index ? { 
      ...s, 
      name: newName,
      code: newName.trim().substring(0, 4).toUpperCase() 
    } : s));
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = registerUser({
      username,
      password,
      name: name.trim() || username.trim(),
      domain,
      term,
      subjects
    });

    setLoading(false);
    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Failed to create account.');
      return;
    }

    onAuthenticated(result.user);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setLoading(true);
    const result = loginUser(loginUsername, loginPassword);
    setLoading(false);

    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Invalid credentials.');
      return;
    }

    onAuthenticated(result.user);
  };

  const handleTryDemo = () => {
    const demo = createDemoUser();
    onAuthenticated(demo);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Branding */}
      <div className="w-full max-w-xl flex items-center justify-between mb-6 z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-lg shadow-blue-500/20">
            A
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center space-x-1.5">
              <span>ApexStudy Hub</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                User Area
              </span>
            </h1>
            <p className="text-xs text-slate-400">Personal Academic Timetable & AI Workspace</p>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-800/60 transition-colors"
        >
          {isDarkMode ? 'Bright Style' : 'Dark Style'}
        </button>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md z-10">
        
        {/* Toggle Mode: Sign Up / Sign In */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl mb-6 border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create New Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In ({registeredUsers.length})
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {mode === 'signup' ? (
          /* ================= SIGN UP FLOW ================= */
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>1. Account Credentials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Username <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                      placeholder="e.g. sharim44"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Unique handle (3+ chars)</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 letters"
                      className="w-full pl-8 pr-8 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">6-letter password minimum</p>
                </div>
              </div>
            </div>

            {/* Profile & Academic Domain */}
            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Student Profile & Studies</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Full Name / Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sharim Ali"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Academic Level / Term
                  </label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="e.g. Fall Semester 2026"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Academic Focus / Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {DOMAIN_OPTIONS.map(d => (
                    <option key={d} value={d} className="bg-slate-800 text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Courses & Color Coding Setup */}
            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Course Color Coding</span>
                </div>
                <span className="text-[10px] text-slate-400">Click color chip to customize</span>
              </div>

              <div className="space-y-2">
                {subjects.map((sub, idx) => {
                  const colorScheme = getColorById(sub.color);
                  const isPickerOpen = editingColorIndex === idx;

                  return (
                    <div key={sub.id} className="relative">
                      <div className="flex items-center space-x-2 bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                        {/* Color Button */}
                        <button
                          type="button"
                          onClick={() => setEditingColorIndex(isPickerOpen ? null : idx)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0 shadow-xs cursor-pointer"
                          style={{ backgroundColor: colorScheme.hex }}
                          title={`Change ${sub.name} color`}
                        >
                          <Palette className="w-3 h-3" />
                        </button>

                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => handleUpdateSubjectName(idx, e.target.value)}
                          className="flex-1 bg-transparent text-xs text-white font-medium focus:outline-none"
                          placeholder="Subject Name"
                        />

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          {colorScheme.label}
                        </span>
                      </div>

                      {/* Color Palette Dropdown */}
                      {isPickerOpen && (
                        <div className="p-2 mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-xl grid grid-cols-6 gap-1.5 z-20">
                          {PROFESSIONAL_COLORS.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSetSubjectColor(idx, c.id)}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-white transition-transform hover:scale-110 cursor-pointer"
                              style={{ backgroundColor: c.hex }}
                              title={c.label}
                            >
                              {c.id === sub.color && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clear Isolation Guarantee */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 text-blue-200 text-xs flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-white">Clean Slate Guarantee:</strong> Your calendar timetable, daily tasks, and problem reviews will start 100% empty and private to your account. No old progress from other devices.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account & Open Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* ================= SIGN IN FLOW ================= */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value.toLowerCase().trim())}
                  placeholder="Enter your registered username..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick selector of saved accounts on this device */}
            {registeredUsers.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">
                  Accounts on this device:
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {registeredUsers.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setLoginUsername(u.username || '')}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-700/60 border border-slate-800 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {u.avatarLetter || u.name.charAt(0)}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">@{u.username} • {u.domain}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Demo Account Fallback */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
          <span>Need a quick test-drive?</span>
          <button
            type="button"
            onClick={handleTryDemo}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
          >
            Explore Sample Demo Account
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-[11px] text-slate-500">
        ApexStudy Workspace • Independent Isolated Sessions on Every Device
      </div>
    </div>
  );
};
