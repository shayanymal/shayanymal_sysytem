import React from 'react';
import { 
  Building2, 
  Users, 
  BookmarkCheck, 
  Archive, 
  CreditCard, 
  Settings, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Sun, 
  Moon, 
  LogOut, 
  LayoutDashboard,
  Menu,
  X,
  Database
} from 'lucide-react';
import { CompanyProfile, UserAccount, Worker } from '../types';

interface RightSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserAccount;
  company: CompanyProfile;
  workers: Worker[];
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenCompanyModal: () => void;
  onOpenUserManagementModal: () => void;
  onOpenBackupModal: () => void;
  onLogout: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  company,
  workers,
  isExpanded,
  setIsExpanded,
  isMobileOpen,
  setIsMobileOpen,
  darkMode,
  setDarkMode,
  onOpenCompanyModal,
  onOpenUserManagementModal,
  onOpenBackupModal,
  onLogout,
}) => {
  const activeWorkersCount = workers.filter((w) => w.status === 'active').length;
  const reservedWorkersCount = workers.filter((w) => w.status === 'reserved').length;
  const archivedWorkersCount = workers.filter((w) => w.status === 'archived').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'داشبۆردی سەرەکی',
      shortLabel: 'داشبۆرد',
      icon: LayoutDashboard,
      badge: null,
      color: 'emerald',
    },
    {
      id: 'workers',
      label: 'لیستی سیڤیەکان',
      shortLabel: 'سیڤیەکان',
      icon: Users,
      badge: activeWorkersCount,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
      color: 'emerald',
    },
    {
      id: 'cv-builder',
      label: 'دروستکردنی سیڤی A4',
      shortLabel: 'سیڤی A4',
      icon: FileText,
      badge: null,
      color: 'emerald',
    },
    {
      id: 'reserved',
      label: 'سیڤیە حجزکراوەکان',
      shortLabel: 'حجزکراوەکان',
      icon: BookmarkCheck,
      badge: reservedWorkersCount,
      badgeColor: 'bg-amber-500 text-white font-bold',
      color: 'amber',
    },
    {
      id: 'archive',
      label: 'ئەرشیف و نوسراوەکان',
      shortLabel: 'ئەرشیف',
      icon: Archive,
      badge: archivedWorkersCount,
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
      color: 'emerald',
    },
    {
      id: 'visas',
      label: 'بەشی ڤیزاکان',
      shortLabel: 'ڤیزاکان',
      icon: CreditCard,
      badge: null,
      color: 'emerald',
    },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    // When in collapsed mode, clicking an icon smoothly expands the names like a slide
    if (!isExpanded) {
      setIsExpanded(true);
    }
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Right-Side Sidebar Container (RTL Right Side) */}
      <aside
        className={`fixed top-0 right-0 h-screen z-50 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-300 ease-in-out flex flex-col no-print
          ${isExpanded ? 'w-64' : 'w-20'}
          ${isMobileOpen ? 'translate-x-0 !w-72' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header / Logo Section */}
        <div className="h-16 sm:h-20 px-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 p-0.5 shadow-sm flex-shrink-0 flex items-center justify-center">
              {company.logo ? (
                <img src={company.logo} alt="Company Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white font-bold text-lg rounded-xl">
                  {company.name.charAt(0)}
                </div>
              )}
            </div>

            {(isExpanded || isMobileOpen) && (
              <div className="min-w-0 text-right animate-fadeIn">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                  {company.name}
                </h1>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate mt-0.5">
                  سیستەمی چاودێریکردنی سیڤی
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Links */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1.5">
          
          {/* Slide Drawer Toggle Trigger (Desktop) */}
          <div className="hidden lg:flex items-center justify-between px-1 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            {isExpanded ? (
              <>
                <span className="text-[11px] font-bold text-slate-400">بەشەکانی سیستەم</span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition flex items-center gap-1 text-[11px] font-bold"
                  title="داخستنی ناوەکان (تەنها ئایکۆن)"
                >
                  <span>داخستنی سلاید</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition flex flex-col items-center justify-center gap-1 text-[10px] font-bold shadow-xs group"
                title="کردنەوەی ناوەکان (سلاید)"
              >
                <Menu className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>سلاید</span>
              </button>
            )}
          </div>

          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold transition-all relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                } ${!isExpanded && !isMobileOpen ? 'justify-center' : 'justify-start'}`}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : item.color === 'amber' ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'
                }`} />

                {(isExpanded || isMobileOpen) && (
                  <div className="flex-1 flex items-center justify-between min-w-0 text-right">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsed notification indicator badge */}
                {!isExpanded && !isMobileOpen && item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            );
          })}

          <div className="my-3 border-t border-slate-100 dark:border-slate-800" />

          {/* Company Profile in Sidebar */}
          <button
            onClick={() => {
              onOpenCompanyModal();
              if (isMobileOpen) setIsMobileOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
              !isExpanded && !isMobileOpen ? 'justify-center' : 'justify-start'
            }`}
            title={!isExpanded ? 'پرۆفایلی کۆمپانیا' : undefined}
          >
            <Building2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            {(isExpanded || isMobileOpen) && <span>پرۆفایلی کۆمپانیا</span>}
          </button>

          {/* Users / RBAC Management (Admin only) */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => {
                onOpenUserManagementModal();
                if (isMobileOpen) setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                !isExpanded && !isMobileOpen ? 'justify-center' : 'justify-start'
              }`}
              title={!isExpanded ? 'بەڕێوەبردنی بەکارهێنەران' : undefined}
            >
              <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              {(isExpanded || isMobileOpen) && <span>بەڕێوەبردنی بەکارهێنەران</span>}
            </button>
          )}

          {/* Backup & Data Protection Trigger */}
          <button
            onClick={() => {
              onOpenBackupModal();
              if (isMobileOpen) setIsMobileOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
              !isExpanded && !isMobileOpen ? 'justify-center' : 'justify-start'
            }`}
            title={!isExpanded ? 'پاراستنی داتاکان و باکئەپ' : undefined}
          >
            <Database className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            {(isExpanded || isMobileOpen) && <span>پاراستنی داتاکان و باکئەپ</span>}
          </button>

        </div>

        {/* Bottom User & Theme Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          
          {/* Dark / Light Mode Button inside Sidebar */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold transition ${
              darkMode 
                ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' 
                : 'bg-slate-200/80 text-slate-800 hover:bg-slate-300'
            } ${!isExpanded && !isMobileOpen ? 'justify-center' : 'justify-between px-3'}`}
            title={darkMode ? 'گۆڕین بۆ شێوازی ڕووناک' : 'گۆڕین بۆ شێوازی تاریک'}
          >
            <div className="flex items-center gap-2">
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              {(isExpanded || isMobileOpen) && (
                <span>{darkMode ? 'شێوازی ڕووناک' : 'شێوازی تاریک'}</span>
              )}
            </div>
            {(isExpanded || isMobileOpen) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                {darkMode ? 'تاریک' : 'ڕووناک'}
              </span>
            )}
          </button>

          {/* Manager Profile Box inside Slide Drawer */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
            {(isExpanded || isMobileOpen) && (
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 px-1">
                پرۆفایلی بەڕێوەبەر:
              </div>
            )}
            <div className={`flex items-center gap-2.5 ${!isExpanded && !isMobileOpen ? 'justify-center' : 'justify-between'}`}>
              <div 
                onClick={() => {
                  if (!isExpanded) setIsExpanded(true);
                }}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                title={!isExpanded ? 'کلیک بکە بۆ بینینی پرۆفایلی بەڕێوەبەر' : undefined}
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-xs border border-emerald-500">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.fullName.charAt(0)
                  )}
                </div>
                {(isExpanded || isMobileOpen) && (
                  <div className="min-w-0 text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                      {currentUser.roleTitle} (@{currentUser.username})
                    </div>
                  </div>
                )}
              </div>

              {(isExpanded || isMobileOpen) && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  title="دەرچوون لە هەژمار"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Profile Actions when Slide is Expanded */}
            {(isExpanded || isMobileOpen) && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                <button
                  onClick={() => {
                    onOpenCompanyModal();
                    if (isMobileOpen) setIsMobileOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>پرۆفایلی کۆمپانیا</span>
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      onOpenUserManagementModal();
                      if (isMobileOpen) setIsMobileOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>بەڕێوەبردنی بەکارهێنەران</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </aside>
    </>
  );
};
