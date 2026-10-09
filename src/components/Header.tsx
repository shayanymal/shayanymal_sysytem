import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Settings, 
  ShieldCheck, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  UserCircle, 
  Check, 
  AlertTriangle, 
  Clock, 
  Volume2,
  Menu,
  BookmarkCheck,
  Database
} from 'lucide-react';
import { AppNotification, CompanyProfile, UserAccount, Worker } from '../types';
import { notificationService } from '../services/notificationService';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserAccount;
  company: CompanyProfile;
  workers: Worker[];
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onClearAllNotifications: () => void;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenCompanyModal: () => void;
  onOpenUserManagementModal: () => void;
  onToggleMobileSidebar: () => void;
  isSidebarExpanded?: boolean;
  onToggleDesktopSidebar?: () => void;
  onOpenBackupModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  company,
  workers,
  notifications,
  onMarkNotificationAsRead,
  onClearAllNotifications,
  onLogout,
  darkMode,
  setDarkMode,
  onOpenCompanyModal,
  onOpenUserManagementModal,
  onToggleMobileSidebar,
  isSidebarExpanded,
  onToggleDesktopSidebar,
  onOpenBackupModal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking anywhere outside
  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showNotifications]);

  // Close notifications when navigating tabs
  useEffect(() => {
    setShowNotifications(false);
  }, [currentTab]);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const handleTestChime = () => {
    notificationService.playChime('success');
  };

  const handleEnableDesktopNotifications = async () => {
    const res = await notificationService.requestPermission();
    if (res === 'granted') {
      notificationService.sendSystemNotification('نۆتیفیکەیشن کارا کرا!', {
        body: 'ئێستا ئاگادارییەکانی حجزکردن و بەسەرچوونی پاسەپۆرتت پێدەگات.',
      });
    }
  };

  const tabTitles: Record<string, string> = {
    dashboard: 'داشبۆردی سەرەکی',
    workers: 'لیستی سیڤیەکان',
    'cv-builder': 'دروستکردنی سیڤی A4',
    reserved: 'سیڤیە حجزکراوەکان',
    archive: 'ئەرشیف و نوسراوە فەرمییەکان',
    visas: 'بەشی ڤیزاکان',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Right side (RTL start): Mobile Menu Toggle & Current Page Title */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger to trigger right slide drawer */}
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 lg:hidden hover:bg-slate-200"
              title="کردنەوەی بەشەکان"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Slide toggle */}
            {onToggleDesktopSidebar && (
              <button
                onClick={onToggleDesktopSidebar}
                className="hidden lg:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition items-center gap-1.5 text-xs font-bold"
                title="کردنەوە / داخستنی سلایدی بەشەکان"
              >
                <Menu className="w-4 h-4 text-emerald-600" />
                <span>{isSidebarExpanded ? 'داخستنی ناوەکان' : 'کردنەوەی ناوەکان (سلاید)'}</span>
              </button>
            )}

            <div className="text-right">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {tabTitles[currentTab] || 'سیستەمی چاودێریکردنی سیڤی'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {company.name} • {company.activity}
              </p>
            </div>
          </div>

          {/* Left Action Icons */}
          <div className="flex items-center gap-2">
            
            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title={darkMode ? 'گۆڕین بۆ شێوازی ڕووناک' : 'گۆڕین بۆ شێوازی تاریک'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Notification Bell with Outside Click Dismiss */}
            <div className="relative">
              <button
                ref={notificationButtonRef}
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                title="ئاگادارییەکان"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {showNotifications && (
                <div 
                  ref={notificationDropdownRef}
                  className="absolute left-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden text-right animate-fadeIn"
                >
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      ئاگادارییەکان ({notifications.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTestChime}
                        className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 flex items-center gap-1"
                        title="تاقیکردنەوەی دەنگی زەنگ"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        دەنگ
                      </button>
                      {notifications.length > 0 && (
                        <button
                          onClick={onClearAllNotifications}
                          className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
                        >
                          پاککردنەوە
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                    <span>ئاگادارکردنەوە تەنانەت ئەگەر داخراویش بێت:</span>
                    <button
                      onClick={handleEnableDesktopNotifications}
                      className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
                    >
                      کاراکردن
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        هیچ ئاگادارییەکی نوێ نییە
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => onMarkNotificationAsRead(notif.id)}
                          className={`p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition ${
                            !notif.read ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex-shrink-0">
                              {notif.type === 'reservation' ? (
                                <BookmarkCheck className="w-4 h-4 text-amber-500" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  {notif.title}
                                </h4>
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(notif.createdAt).toLocaleDateString('ku-IQ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
