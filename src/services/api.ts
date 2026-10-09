import { AppDataState, AppNotification, CompanyProfile, UserAccount, Worker } from '../types';
import { defaultUsers, initialCompany, initialNotifications, initialWorkers } from '../data/initialData';
import { notificationService } from './notificationService';
import { 
  loadFromIndexedDB, 
  saveToIndexedDB, 
  saveSnapshot, 
  mergeAppStates, 
  mergeWorkersSafely 
} from './storage';

const LOCAL_STORAGE_KEY = 'cv_tracking_system_v1';
const BACKUP_STORAGE_KEY = 'cv_tracking_system_backup';

export async function fetchInitialData(): Promise<AppDataState> {
  let localState: AppDataState | null = null;
  let idbState: AppDataState | null = null;
  let remoteState: AppDataState | null = null;

  // 1. Load from IndexedDB (highest capacity and durability)
  try {
    idbState = await loadFromIndexedDB();
  } catch (e) {
    console.warn('Could not read IndexedDB:', e);
  }

  // 2. Load from localStorage (primary & backup)
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(BACKUP_STORAGE_KEY);
    if (raw) {
      localState = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read localStorage:', e);
  }

  // 3. Load from backend /api/data
  try {
    const res = await fetch('/api/data', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.workers && Array.isArray(data.workers)) {
        remoteState = data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/data unavailable, continuing with client data:', err);
  }

  // 4. Merge all sources safely so NO worker is ever wiped or lost
  let mergedState = mergeAppStates(localState, idbState);
  if (remoteState) {
    mergedState = mergeAppStates(mergedState, remoteState);
  }

  // Fallback to initial seeds only on very first launch
  const hasSeeded = typeof window !== 'undefined' ? localStorage.getItem('system_has_been_seeded') : null;
  if (!hasSeeded) {
    if (!mergedState.workers || mergedState.workers.length === 0) {
      mergedState.workers = initialWorkers;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('system_has_been_seeded', 'true');
    }
  }
  if (!mergedState.company) {
    mergedState.company = initialCompany;
  }
  if (!mergedState.users || mergedState.users.length === 0) {
    mergedState.users = defaultUsers;
  }
  if (!mergedState.notifications) {
    mergedState.notifications = initialNotifications;
  }

  // 5. Persist merged state across all storage tiers immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedState));
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(mergedState));
    await saveToIndexedDB(mergedState);
    saveSnapshot(mergedState);

    // Sync back to backend if backend was missing data
    if (!remoteState || (remoteState.workers && remoteState.workers.length < mergedState.workers.length)) {
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedState),
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Failed writing merged initial state:', e);
  }

  return mergedState;
}

export async function saveAppData(state: AppDataState): Promise<void> {
  // 1. Immediately write to localStorage & backup key
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }

  // 2. Persist to IndexedDB
  try {
    await saveToIndexedDB(state);
    saveSnapshot(state);
  } catch (e) {
    console.error('Error saving to IndexedDB:', e);
  }

  // 3. Sync to backend API
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch (err) {
    console.warn('Failed syncing to remote /api/data:', err);
  }
}

// Background sync listener that checks if another user or device reserved a worker
export function startBackgroundSync(
  currentState: AppDataState,
  onRemoteUpdate: (newState: AppDataState) => void
) {
  let knownReservedIds = new Set(
    currentState.workers.filter((w) => w.status === 'reserved').map((w) => w.id)
  );

  const interval = setInterval(async () => {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (!res.ok) return;
      const remoteData: AppDataState = await res.json();
      if (!remoteData || !Array.isArray(remoteData.workers)) return;

      // Check for newly reserved workers from other sessions
      const newlyReserved = remoteData.workers.filter(
        (w) => w.status === 'reserved' && !knownReservedIds.has(w.id)
      );

      if (newlyReserved.length > 0) {
        newlyReserved.forEach((w) => {
          notificationService.sendSystemNotification('سیڤی نوێ حجز کرا!', {
            body: `سیڤی (${w.fullName}) لەلایەن ${w.reservation?.customerFullName || 'داواکار'} حجز کرا.`,
            tag: `reservation-${w.id}`,
          });
        });

        // Update known set
        knownReservedIds = new Set(
          remoteData.workers.filter((w) => w.status === 'reserved').map((w) => w.id)
        );

        // Safely merge remote workers with current workers so local additions are never deleted, excluding any deleted IDs
        const currentDeleted = currentState.deletedWorkerIds || [];
        const safeMergedWorkers = mergeWorkersSafely(currentState.workers, remoteData.workers, currentDeleted);
        const safeState: AppDataState = {
          ...remoteData,
          workers: safeMergedWorkers,
          deletedWorkerIds: currentDeleted,
        };

        onRemoteUpdate(safeState);
      }
    } catch {
      // Ignore background sync errors silently
    }
  }, 6000);

  return () => clearInterval(interval);
}
