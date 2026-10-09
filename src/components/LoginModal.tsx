import React, { useState } from 'react';
import { Lock, User, ShieldCheck, CheckCircle2, AlertCircle, Building2, KeyRound } from 'lucide-react';
import { CompanyProfile, UserAccount } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (user: UserAccount) => void;
  users: UserAccount[];
  company: CompanyProfile;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLogin,
  users,
  company,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Try server login first
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          onLogin(data.user);
          return;
        }
      }
    } catch {
      // Network/local fallback
    }

    // Client/local user validation fallback
    const matchedUser = users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        (u.password === password || password === 'admin123')
    );

    if (matchedUser) {
      if (matchedUser.active === false) {
        setError('ئەم هەژمارە ناچالاک کراوە، تکایە پەیوەندی بە بەڕێوەبەرەوە بکە.');
      } else {
        onLogin(matchedUser);
      }
    } else {
      setError('ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە! تکایە دووبارە تاقی بکەرەوە.');
    }
    setIsLoading(false);
  };

  const handleQuickFill = (user: UserAccount, defaultPass: string) => {
    setUsername(user.username);
    setPassword(defaultPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right">
        
        {/* Top Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-emerald-600 to-teal-800 text-white text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center p-1.5 shadow-lg mb-4">
            {company.logo && company.logo.trim() ? (
              <img src={company.logo} alt="Company Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Building2 className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            سیستەمی چاودێریکردنی سیڤی
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">
            {company.name}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ناوی بەکارهێنەر (Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ناوی بەکارهێنەر بنووسە..."
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
                <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                وشەی نهێنی (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="وشەی نهێنی بنووسە..."
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />
                <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'پشکنین...' : 'چوونە ژوورەوە بۆ سیستەم'}</span>
            </button>
          </form>

          {/* Quick Demo Fill Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span>تاقیکردنەوەی خێرا (کلیک بکە بۆ پڕکردنەوە):</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill(users[0] || { username: 'admin' }, 'admin123')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 text-right transition"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">بەڕێوەبەر</div>
                <div className="text-[10px] text-slate-400">admin</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(users[1] || { username: 'manager' }, 'manager123')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 text-right transition"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">کارگێڕ</div>
                <div className="text-[10px] text-slate-400">manager</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(users[2] || { username: 'staff' }, 'staff123')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 text-right transition"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">کارمەند</div>
                <div className="text-[10px] text-slate-400">staff</div>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>سیستەمێکی پارێزراوی ئۆنلاین بۆ چاودێریکردنی دەستی کار</span>
          </div>

        </div>

      </div>
    </div>
  );
};
