import { AppDataState, Worker } from '../types';
import { defaultUsers, initialCompany, initialNotifications, initialWorkers } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'cv_tracking_system_v1';
const BACKUP_STORAGE_KEY = 'cv_tracking_system_backup';
const SNAPSHOTS_KEY = 'cv_tracking_system_snapshots';
const IDB_NAME = 'CV_SYSTEM_PERSISTENT_DB';
const IDB_STORE = 'app_state_store';
const IDB_KEY = 'current_app_state';

// IndexedDB Helper
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveToIndexedDB(state: AppDataState): Promise<boolean> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put(state, IDB_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch (err) {
    console.warn('IndexedDB write error:', err);
    return false;
  }
}

export async function loadFromIndexedDB(): Promise<AppDataState | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => {
        db.close();
        resolve(req.result || null);
      };
      req.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('IndexedDB read error:', err);
    return null;
  }
}

// Merge workers safely while strictly excluding deleted worker IDs
export function mergeWorkersSafely(
  workersA: Worker[] = [], 
  workersB: Worker[] = [], 
  deletedIds: string[] = []
): Worker[] {
  const deletedSet = new Set<string>(deletedIds);
  const map = new Map<string, Worker>();

  for (const w of workersA) {
    if (w && w.id && !deletedSet.has(w.id)) {
      map.set(w.id, w);
    }
  }

  for (const w of workersB) {
    if (!w || !w.id || deletedSet.has(w.id)) continue;
    if (!map.has(w.id)) {
      map.set(w.id, w);
    } else {
      const existing = map.get(w.id)!;
      const dateA = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const dateB = new Date(w.updatedAt || w.createdAt || 0).getTime();
      if (dateB >= dateA) {
        map.set(w.id, w);
      }
    }
  }

  return Array.from(map.values()).filter((w) => !deletedSet.has(w.id));
}

// Merge two full states with deleted worker enforcement
export function mergeAppStates(
  stateA: Partial<AppDataState> | null, 
  stateB: Partial<AppDataState> | null
): AppDataState {
  let localDeleted: string[] = [];
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('deleted_worker_ids') : null;
    if (raw) localDeleted = JSON.parse(raw);
  } catch {}

  const combinedDeleted = Array.from(new Set([
    ...(stateA?.deletedWorkerIds || []),
    ...(stateB?.deletedWorkerIds || []),
    ...localDeleted
  ]));

  const workers = mergeWorkersSafely(stateA?.workers || [], stateB?.workers || [], combinedDeleted);
  const company = stateB?.company || stateA?.company || initialCompany;
  const users = (stateB?.users && stateB.users.length > 0) ? stateB.users : (stateA?.users || defaultUsers);
  const notifications = stateB?.notifications || stateA?.notifications || initialNotifications;

  // Check if system has already been seeded. If it has been seeded, do not revive deleted workers!
  const hasSeeded = typeof window !== 'undefined' ? localStorage.getItem('system_has_been_seeded') : null;
  let finalWorkers = workers;

  if (!hasSeeded) {
    if (finalWorkers.length === 0) {
      finalWorkers = initialWorkers.filter(w => !combinedDeleted.includes(w.id));
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('system_has_been_seeded', 'true');
    }
  }

  return {
    workers: finalWorkers,
    company,
    users,
    notifications,
    deletedWorkerIds: combinedDeleted,
  };
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  workerCount: number;
  data: AppDataState;
}

// Save snapshot to history
export function saveSnapshot(state: AppDataState) {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    let list: BackupSnapshot[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];

    // Check if state changed from last snapshot
    const last = list[0];
    if (last && last.workerCount === state.workers.length && JSON.stringify(last.data.company) === JSON.stringify(state.company)) {
      return; // Skip duplicate snapshot
    }

    const newSnapshot: BackupSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      workerCount: state.workers.length,
      data: state,
    };

    list.unshift(newSnapshot);
    // Keep last 10 snapshots
    list = list.slice(0, 10);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed saving backup snapshot:', err);
  }
}

export function getSavedSnapshots(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

// Export full backup as downloadable JSON file
export function exportBackupFile(state: AppDataState) {
  const backupPayload = {
    appName: 'سیستەمی چاودێریکردنی سیڤی و کرێکاران',
    version: '2.0',
    exportDate: new Date().toISOString(),
    workerCount: state.workers.length,
    state,
  };

  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `CV_System_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
