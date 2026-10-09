import React from 'react';
import { 
  Users, 
  BookmarkCheck, 
  Archive, 
  ArrowUpRight, 
  UserPlus, 
  FileText, 
  TrendingUp, 
  Globe2, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import { CompanyProfile, UserAccount, Worker } from '../types';

interface DashboardProps {
  workers: Worker[];
  company: CompanyProfile;
  currentUser: UserAccount;
  onNavigate: (tab: string) => void;
  onSelectWorkerForCv: (worker: Worker) => void;
  onOpenAddWorkerModal: () => void;
  onOpenReservationModal: (worker: Worker) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  workers,
  company,
  currentUser,
  onNavigate,
  onSelectWorkerForCv,
  onOpenAddWorkerModal,
  onOpenReservationModal,
}) => {
  const activeWorkers = workers.filter((w) => w.status === 'active');
  const reservedWorkers = workers.filter((w) => w.status === 'reserved');
  const archivedWorkers = workers.filter((w) => w.status === 'archived');

  const totalWorkers = workers.length;
  const reservationRate = totalWorkers > 0 ? Math.round((reservedWorkers.length / totalWorkers) * 100) : 0;

  // Nationality breakdown
  const nationalityCounts: Record<string, number> = {};
  workers.forEach((w) => {
    nationalityCounts[w.nationality] = (nationalityCounts[w.nationality] || 0) + 1;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-medium border border-white/10">
              <Building2 className="w-3.5 h-3.5" />
              <span>{company.name}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              بەخێربێیت، {currentUser.fullName}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 font-medium">
              داشبۆردی سەرەکی سیستەم • بەڕێوەبردنی سیڤی و کرێکارانی بیانی
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser.permissions.canAddWorker && (
              <button
                onClick={onOpenAddWorkerModal}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>زیادکردنی کرێکار</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Main 4 KPI Stats Grid (Clean business workflow metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* 1. Total Workers / CVs */}
        <div 
          onClick={() => onNavigate('workers')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">کۆی گشتی سیڤیەکان</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalWorkers}
            </span>
            <span className="text-xs text-slate-400">سیڤی</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span>بینینی لیستی تەواو</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* 2. Active Available for Booking */}
        <div 
          onClick={() => onNavigate('workers')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">بەردەست بۆ حجز</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
              {activeWorkers.length}
            </span>
            <span className="text-xs text-slate-400">ئامادە</span>
          </div>
          <div className="mt-2 text-[11px] text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
            <span>ئامادە بۆ حجزکردنی ڕاستەوخۆ</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* 3. Reserved Workers */}
        <div 
          onClick={() => onNavigate('reserved')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">حجزکراوەکان</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookmarkCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {reservedWorkers.length}
            </span>
            <span className="text-xs text-slate-400">حجزکراو</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <span>ڕێژەی حجز: {reservationRate}%</span>
            <TrendingUp className="w-3 h-3" />
          </div>
        </div>

        {/* 4. Archived Workers */}
        <div 
          onClick={() => onNavigate('archive')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-500/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ئەرشیف و نوسراوەکان</span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Archive className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-200">
              {archivedWorkers.length}
            </span>
            <span className="text-xs text-slate-400">نوسراو</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <span>چوون بۆ بەشی ئەرشیف</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

      </div>

      {/* Quick Access Grid: Recent Workers & Nationality Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Workers / CVs */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                نوێترین سیڤیە تۆمارکراوەکان
              </h3>
              <p className="text-[11px] text-slate-400">
                سیڤیە بەردەستەکان بۆ حجزکردن و ڕێکخستن
              </p>
            </div>
            <button
              onClick={() => onNavigate('workers')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              بینینی هەمووان ({workers.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeWorkers.slice(0, 4).map((w) => (
              <div
                key={w.id}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500/30 transition flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  {w.photoUrl ? (
                    <img
                      src={w.photoUrl}
                      alt={w.fullName}
                      className="w-12 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold flex-shrink-0">
                      {w.fullName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {w.fullName}
                    </h4>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {w.nationality}
                    </p>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      پاسەپۆرت: {w.passportNumber}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectWorkerForCv(w)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>سیڤی A4</span>
                  </button>

                  {currentUser.permissions.canReserveWorker && (
                    <button
                      onClick={() => onOpenReservationModal(w)}
                      className="py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>حجزکردن</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nationality Distribution & Agency Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-600" />
              <span>دابەشبوونی نەتەوەکان</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              ژمارەی کرێکاران بەپێی وڵات و ڕەگەزنامە
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(nationalityCounts).map(([nat, count]) => {
              const pct = totalWorkers > 0 ? Math.round((count / totalWorkers) * 100) : 0;
              return (
                <div key={nat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{nat}</span>
                    <span className="text-slate-500 dark:text-slate-400">{count} کەس ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>کۆمپانیای شایانی ماڵ:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {workers.filter((w) => (w.companyName || '').includes('شایانی ماڵ')).length} کرێکار
              </span>
            </div>
            <div className="flex justify-between">
              <span>کۆمپانیای نجوم للتنظيف:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {workers.filter((w) => (w.companyName || '').includes('نجوم')).length} کرێکار
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
