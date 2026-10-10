import React, { useState, useEffect } from 'react';
import { 
  AppDataState, 
  AppNotification, 
  ArchiveRecordData, 
  CompanyProfile, 
  ReservationInfo, 
  UserAccount, 
  VisaRecordData, 
  Worker, 
  WorkerCvDetails 
} from './types';
import { fetchInitialData, saveAppData, startBackgroundSync } from './services/api';
import { notificationService } from './services/notificationService';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { Dashboard } from './components/Dashboard';
import { WorkerList } from './components/WorkerList';
import { WorkerFormModal } from './components/WorkerFormModal';
import { CvBuilder } from './components/CvBuilder';
import { ReservationModal } from './components/ReservationModal';
import { ReservedList } from './components/ReservedList';
import { ArchiveSection } from './components/ArchiveSection';
import { VisaSection } from './components/VisaSection';
import { UserManagementModal } from './components/UserManagementModal';
import { CompanyProfileModal } from './components/CompanyProfileModal';
import { RightSidebar } from './components/RightSidebar';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { DirectClientBookingModal } from './components/DirectClientBookingModal';

const DEFAULT_WORKER_PHOTO = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=faces&q=80';
const DEFAULT_PASSPORT_PHOTO = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&h=400&fit=crop&q=80';

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [deletedWorkerIds, setDeletedWorkerIds] = useState<string[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('deleted_worker_ids') : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Modal controls
  const [isWorkerFormOpen, setIsWorkerFormOpen] = useState(false);
  const [workerToEdit, setWorkerToEdit] = useState<Worker | null>(null);
  const [workerForCv, setWorkerForCv] = useState<Worker | null>(null);
  const [workerToReserve, setWorkerToReserve] = useState<Worker | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [scannedWorkerForBooking, setScannedWorkerForBooking] = useState<Worker | null>(null);
  const [isDirectClientModalOpen, setIsDirectClientModalOpen] = useState(false);

  // Initialize data
  useEffect(() => {
    async function init() {
      try {
        const state = await fetchInitialData();
        const delIds = state.deletedWorkerIds || [];
        setDeletedWorkerIds(delIds);
        const cleanWorkers = (state.workers || []).filter((w) => !delIds.includes(w.id));
        setWorkers(cleanWorkers);
        setCompany(state.company);
        setUsers(state.users);
        setNotifications(state.notifications);

        // Check for QR Code direct reservation parameter (e.g. ?reserve=w-123 or #reserve=w-123)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
          const reserveId = urlParams.get('reserve') || hashParams.get('reserve');

          if (reserveId) {
            const targetWorker = cleanWorkers.find((w) => w.id === reserveId);
            if (targetWorker) {
              setScannedWorkerForBooking(targetWorker);
              setIsDirectClientModalOpen(true);
              // Hide URL parameters so scanner user does not see raw query data
              try {
                window.history.replaceState({}, document.title, window.location.pathname);
              } catch {}
            }
          }
        }

        // Check stored user session
        const storedUser = localStorage.getItem('current_user_session');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            const found = state.users.find((u) => u.id === parsed.id && u.active);
            if (found) {
              setCurrentUser(found);
            }
          } catch {
            // ignore
          }
        }

        setDataLoaded(true);
      } catch (err) {
        console.error('Initialization fallback triggered:', err);
        setDataLoaded(true);
      }
    }
    init();
  }, []);

  // Sync dark mode class on document and body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Background Cloud synchronization
  useEffect(() => {
    if (!dataLoaded || !company) return;
    const currentState: AppDataState = {
      workers,
      company,
      users,
      notifications,
      deletedWorkerIds,
    };

    const cleanup = startBackgroundSync(currentState, (remoteState) => {
      const currentDel = deletedWorkerIds || [];
      const cleanRemote = (remoteState.workers || []).filter((w) => !currentDel.includes(w.id));
      setWorkers(cleanRemote);
      if (remoteState.company) setCompany(remoteState.company);
      if (remoteState.users) setUsers(remoteState.users);
      if (remoteState.notifications) setNotifications(remoteState.notifications);
    });

    return cleanup;
  }, [dataLoaded, workers, company, users, notifications, deletedWorkerIds]);

  // Helper to persist state
  const persistState = (
    newWorkers?: Worker[], 
    newCompany?: CompanyProfile, 
    newUsers?: UserAccount[], 
    newNotifications?: AppNotification[],
    newDeletedIds?: string[]
  ) => {
    const currentDel = newDeletedIds || deletedWorkerIds;
    const cleanWorkers = (newWorkers || workers).filter((w) => !currentDel.includes(w.id));
    const state: AppDataState = {
      workers: cleanWorkers,
      company: newCompany || company!,
      users: newUsers || users,
      notifications: newNotifications || notifications,
      deletedWorkerIds: currentDel,
    };
    saveAppData(state);
  };

  // Restore full backup state
  const handleRestoreState = (restoredState: AppDataState) => {
    const delIds = restoredState.deletedWorkerIds || [];
    setDeletedWorkerIds(delIds);
    setWorkers((restoredState.workers || []).filter((w) => !delIds.includes(w.id)));
    if (restoredState.company) setCompany(restoredState.company);
    if (restoredState.users) setUsers(restoredState.users);
    if (restoredState.notifications) setNotifications(restoredState.notifications);
    saveAppData(restoredState);
  };

  // Auth handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('current_user_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('current_user_session');
  };

  // Worker CRUD handlers
  const handleSaveWorker = (workerData: Partial<Worker>) => {
    if (workerToEdit) {
      // Edit
      const updatedWorkers = workers.map((w) =>
        w.id === workerToEdit.id
          ? ({ ...w, ...workerData, updatedAt: new Date().toISOString() } as Worker)
          : w
      );
      setWorkers(updatedWorkers);
      persistState(updatedWorkers);
    } else {
      // Add new
      const newWorker: Worker = {
        id: `w-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fullName: workerData.fullName || '',
        enFullName: workerData.enFullName || '',
        passportNumber: workerData.passportNumber || '',
        nationality: workerData.nationality || 'فیلیپینی',
        enNationality: workerData.enNationality || 'Filipino',
        gender: workerData.gender || 'مێ',
        enGender: workerData.enGender || 'Female',
        birthDate: workerData.birthDate || '1995-01-01',
        passportExpiryDate: workerData.passportExpiryDate || '2029-01-01',
        sponsorName: workerData.sponsorName || '',
        receivedFrom: workerData.receivedFrom || 'بەڕێوەبەر',
        receivedDate: workerData.receivedDate || new Date().toISOString().split('T')[0],
        passportType: workerData.passportType || 'یەکێک لە کۆمپانیاکان',
        companyName: workerData.companyName || company?.name || 'شایانی ماڵ',
        photoUrl: workerData.photoUrl || DEFAULT_WORKER_PHOTO,
        passportPhotoUrl: workerData.passportPhotoUrl || DEFAULT_PASSPORT_PHOTO,
      };
      const updatedWorkers = [newWorker, ...workers];
      setWorkers(updatedWorkers);
      persistState(updatedWorkers);
    }
    setWorkerToEdit(null);
  };

  const handleUpdateWorkerDirect = (updatedWorker: Worker) => {
    const updated = workers.map((w) => (w.id === updatedWorker.id ? updatedWorker : w));
    setWorkers(updated);
    if (workerForCv && workerForCv.id === updatedWorker.id) {
      setWorkerForCv(updatedWorker);
    }
    persistState(updated);
  };

  const handleDeleteWorker = async (workerId: string) => {
    const updatedWorkers = workers.filter((w) => w.id !== workerId);
    const updatedDeleted = Array.from(new Set([...deletedWorkerIds, workerId]));
    setWorkers(updatedWorkers);
    setDeletedWorkerIds(updatedDeleted);
    try {
      localStorage.setItem('deleted_worker_ids', JSON.stringify(updatedDeleted));
    } catch {}
    persistState(updatedWorkers, undefined, undefined, undefined, updatedDeleted);

    // If currently selected for CV or edit, clear it
    if (workerForCv && workerForCv.id === workerId) {
      setWorkerForCv(updatedWorkers[0] || null);
    }

    // Call server DELETE endpoint to permanently purge from server db.json
    try {
      await fetch(`/api/workers/${workerId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed notifying server of delete:', err);
    }
  };

  // Reservation handler
  const handleConfirmReservation = (workerId: string, reservation: ReservationInfo) => {
    const worker = workers.find((w) => w.id === workerId);
    const updatedWorkers = workers.map((w) => {
      if (w.id === workerId) {
        return {
          ...w,
          status: 'reserved' as const,
          reservation,
          updatedAt: new Date().toISOString(),
        };
      }
      return w;
    });

    const newNotification: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'سیڤی نوێ حجز کرا!',
      message: `سیڤی (${worker?.fullName}) لەلایەن بەڕێز (${reservation.customerFullName}) حجز کرا.`,
      type: 'reservation',
      workerId,
      workerName: worker?.fullName,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const updatedNotifs = [newNotification, ...notifications];
    setWorkers(updatedWorkers);
    setNotifications(updatedNotifs);
    persistState(updatedWorkers, undefined, undefined, updatedNotifs);
    setWorkerToReserve(null);
  };

  // Cancel reservation handler
  const handleCancelReservation = (workerId: string) => {
    const updatedWorkers = workers.map((w) => {
      if (w.id === workerId) {
        const { reservation, ...rest } = w;
        return {
          ...rest,
          status: 'active' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return w;
    });

    setWorkers(updatedWorkers);
    persistState(updatedWorkers);
  };

  // Proceed from reservation to archive
  const handleProceedToArchive = (worker: Worker) => {
    const updatedWorkers = workers.map((w) => {
      if (w.id === worker.id) {
        return {
          ...w,
          status: 'archived' as const,
          archiveData: w.archiveData || {
            submissionDate: new Date().toISOString().split('T')[0],
            fingerprintDate: '',
            erbilLaborDept: { letterNumber: '', letterDate: '' },
            generalLaborDept: { letterNumber: '', letterDate: '' },
            socialSecurityDept: { letterNumber: '', letterDate: '' },
            ministryOfLabor: { letterNumber: '', letterDate: '' },
            status: 'لە پرۆسەدایە' as const,
            archivedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return w;
    });

    setWorkers(updatedWorkers);
    persistState(updatedWorkers);
    setCurrentTab('archive');
  };

  // Save CV details
  const handleSaveCv = (workerId: string, cvDetails: WorkerCvDetails) => {
    const updatedWorkers = workers.map((w) =>
      w.id === workerId ? { ...w, cvDetails, updatedAt: new Date().toISOString() } : w
    );
    setWorkers(updatedWorkers);
    persistState(updatedWorkers);
  };

  // Update Archive Data
  const handleUpdateArchiveData = (workerId: string, archiveData: ArchiveRecordData) => {
    const updatedWorkers = workers.map((w) =>
      w.id === workerId ? { ...w, archiveData, updatedAt: new Date().toISOString() } : w
    );
    setWorkers(updatedWorkers);
    persistState(updatedWorkers);
  };

  // Save Visa
  const handleSaveVisa = (workerId: string, visaData: VisaRecordData, moveToArchive: boolean) => {
    const updatedWorkers = workers.map((w) => {
      if (w.id === workerId) {
        return {
          ...w,
          visaData,
          status: moveToArchive ? ('archived' as const) : w.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return w;
    });
    setWorkers(updatedWorkers);
    persistState(updatedWorkers);
  };

  // Company and User management handlers
  const handleSaveCompany = (updatedCompany: CompanyProfile) => {
    setCompany(updatedCompany);
    persistState(undefined, updatedCompany);
  };

  const handleSaveUser = (userData: UserAccount) => {
    const exists = users.some((u) => u.id === userData.id);
    let updatedUsers: UserAccount[];
    if (exists) {
      updatedUsers = users.map((u) => (u.id === userData.id ? userData : u));
    } else {
      updatedUsers = [...users, userData];
    }
    setUsers(updatedUsers);
    persistState(undefined, undefined, updatedUsers);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter((u) => u.id !== userId);
    setUsers(updatedUsers);
    persistState(undefined, undefined, updatedUsers);
  };

  // Notification handlers
  const handleMarkNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    persistState(undefined, undefined, undefined, updated);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    persistState(undefined, undefined, undefined, []);
  };

  if (!dataLoaded || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">سیستەمی چاودێریکردنی سیڤی ئامادە دەکرێت...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-150`}>
      
      {/* Login Screen (Item 1 requested by user) */}
      {!currentUser && (
        <LoginModal
          isOpen={!currentUser}
          onLogin={handleLogin}
          users={users}
          company={company}
        />
      )}

      {currentUser && (
        <div className="flex min-h-screen">
          {/* Right-Side Slide Sidebar */}
          <RightSidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            currentUser={currentUser}
            company={company}
            workers={workers}
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
            onOpenUserManagementModal={() => setIsUserManagementModalOpen(true)}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            onLogout={handleLogout}
          />

          {/* Main Content Area (with dynamic right margin matching sidebar) */}
          <div className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
            isSidebarExpanded ? 'lg:mr-64' : 'lg:mr-20'
          }`}>
            {/* Main Top Header */}
            <Header
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              currentUser={currentUser}
              company={company}
              workers={workers}
              notifications={notifications}
              onMarkNotificationAsRead={handleMarkNotificationAsRead}
              onClearAllNotifications={handleClearAllNotifications}
              onLogout={handleLogout}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onOpenCompanyModal={() => setIsCompanyModalOpen(true)}
              onOpenUserManagementModal={() => setIsUserManagementModalOpen(true)}
              onOpenBackupModal={() => setIsBackupModalOpen(true)}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
              isSidebarExpanded={isSidebarExpanded}
              onToggleDesktopSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
            />

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
              
              {/* 1. Dashboard View */}
              {currentTab === 'dashboard' && (
                <Dashboard
                  workers={workers}
                  company={company}
                  currentUser={currentUser}
                  onNavigate={(tab) => setCurrentTab(tab)}
                  onSelectWorkerForCv={(worker) => {
                    setWorkerForCv(worker);
                    setCurrentTab('cv-builder');
                  }}
                  onOpenAddWorkerModal={() => {
                    setWorkerToEdit(null);
                    setIsWorkerFormOpen(true);
                  }}
                  onOpenReservationModal={(worker) => setWorkerToReserve(worker)}
                />
              )}

              {/* 2. Workers / CV List View */}
              {currentTab === 'workers' && (
                <WorkerList
                  workers={workers}
                  currentUser={currentUser}
                  onOpenAddModal={() => {
                    setWorkerToEdit(null);
                    setIsWorkerFormOpen(true);
                  }}
                  onOpenEditModal={(worker) => {
                    setWorkerToEdit(worker);
                    setIsWorkerFormOpen(true);
                  }}
                  onDeleteWorker={handleDeleteWorker}
                  onSelectWorkerForCv={(worker) => {
                    setWorkerForCv(worker);
                    setCurrentTab('cv-builder');
                  }}
                  onOpenReservationModal={(worker) => setWorkerToReserve(worker)}
                />
              )}

              {/* 3. CV Builder (A4 Bilingual Kurdish-English & QR Code) */}
              {currentTab === 'cv-builder' && company && (
                <CvBuilder
                  workers={workers}
                  selectedWorker={workerForCv}
                  onSelectWorker={(worker) => setWorkerForCv(worker)}
                  company={company}
                  onUpdateCompany={(updatedCompany) => {
                    setCompany(updatedCompany);
                    persistState(undefined, updatedCompany);
                  }}
                  onUpdateWorker={handleUpdateWorkerDirect}
                  onSaveCv={handleSaveCv}
                  onOpenReservationModal={(worker) => setWorkerToReserve(worker)}
                />
              )}

              {/* 4. Reserved List View */}
              {currentTab === 'reserved' && (
                <ReservedList
                  workers={workers}
                  currentUser={currentUser}
                  onCancelReservation={handleCancelReservation}
                  onProceedToArchive={handleProceedToArchive}
                  onSelectWorkerForCv={(worker) => {
                    setWorkerForCv(worker);
                    setCurrentTab('cv-builder');
                  }}
                />
              )}

              {/* 5. Archive & Government Letters */}
              {currentTab === 'archive' && (
                <ArchiveSection
                  workers={workers}
                  currentUser={currentUser}
                  onUpdateArchiveData={handleUpdateArchiveData}
                  onDeleteWorker={handleDeleteWorker}
                />
              )}

              {/* 6. Visas Section */}
              {currentTab === 'visas' && (
                <VisaSection
                  workers={workers}
                  currentUser={currentUser}
                  onSaveVisa={handleSaveVisa}
                />
              )}

            </main>
          </div>

          {/* Modals */}
          
          {/* Add / Edit Worker Modal (Points A-M) */}
          <WorkerFormModal
            isOpen={isWorkerFormOpen}
            onClose={() => {
              setIsWorkerFormOpen(false);
              setWorkerToEdit(null);
            }}
            onSave={handleSaveWorker}
            workerToEdit={workerToEdit}
          />

          {/* Reservation Modal (Points 1-5) */}
          <ReservationModal
            isOpen={!!workerToReserve}
            onClose={() => setWorkerToReserve(null)}
            worker={workerToReserve}
            currentUser={currentUser}
            onConfirmReservation={handleConfirmReservation}
          />

          {/* Company Profile Modal */}
          <CompanyProfileModal
            isOpen={isCompanyModalOpen}
            onClose={() => setIsCompanyModalOpen(false)}
            company={company}
            onSaveCompany={handleSaveCompany}
          />

          {/* User Management & RBAC Modal */}
          <UserManagementModal
            isOpen={isUserManagementModalOpen}
            onClose={() => setIsUserManagementModalOpen(false)}
            users={users}
            currentUser={currentUser}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
          />

          {/* Backup & Restore Data Protection Modal */}
          {company && (
            <BackupRestoreModal
              isOpen={isBackupModalOpen}
              onClose={() => setIsBackupModalOpen(false)}
              currentState={{
                workers,
                company,
                users,
                notifications,
              }}
              onRestoreState={handleRestoreState}
            />
          )}

        </div>
      )}

    </div>
  );
}
