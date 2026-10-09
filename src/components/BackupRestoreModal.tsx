import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  Clock, 
  HardDrive, 
  FileText,
  RefreshCw
} from 'lucide-react';
import { AppDataState } from '../types';
import { exportBackupFile, getSavedSnapshots, BackupSnapshot } from '../services/storage';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppDataState;
  onRestoreState: (restoredState: AppDataState) => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onRestoreState,
}) => {
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSnapshots(getSavedSnapshots());
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Export / Download Backup JSON
  const handleExport = () => {
    exportBackupFile(currentState);
    setStatusMessage({
      type: 'success',
      text: 'فایلی باکئەپ بە سەرکەوتوویی داونلۆد کرا و لەسەر ئامێرەکەت پارێزرا.',
    });
  };

  // Handle Import / Restore from JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Check if file is our backup format or raw state
        const targetState: AppDataState = parsed.state || parsed;

        if (!targetState || !Array.isArray(targetState.workers)) {
          throw new Error('فایلی هەڵبژێردراو فۆرماتی دروستی داتای سیستەمی سیڤی نییە.');
        }

        onRestoreState(targetState);
        setStatusMessage({
          type: 'success',
          text: `باکئەپ بە سەرکەوتوویی گەڕێنرایەوە! (${targetState.workers.length} کرێکار بارکران).`,
        });
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err.message || 'هەڵەیەک ڕوویدا لە خوێندنەوەی فایلی باکئەپ.',
        });
      }
    };
    reader.readAsText(file);
  };

  // Restore a specific snapshot
  const handleRestoreSnapshot = (snap: BackupSnapshot) => {
    if (window.confirm(`دڵنیایت لە گەڕاندنەوەی ئەم کۆپییە پارێزراوە؟ (${snap.workerCount} کرێکار)`)) {
      onRestoreState(snap.data);
      setStatusMessage({
        type: 'success',
        text: `کۆپی پارێزراوی بەرواری ${new Date(snap.timestamp).toLocaleString('ckb')} بە سەرکەوتوویی گەڕێنرایەوە.`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                پاراستن، باکئەپ و هێشتنەوەی هەمیشەیی داتاکان
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                داتاکانت لە هەور و لە میمۆری هەمیشەییدا پارێزراون و نەسڕینەوە
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status Alert if any */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Protection Tiers Status Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>دۆخی پاراستنی داتاکانی ئێستا:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">میمۆری هەمیشەیی</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">IndexedDB کارایە ✓</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">کاشی ناوخۆیی</div>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">LocalStorage کارایە ✓</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">خەزنی سێرڤەر</div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">هاوکات دەکرێت ✓</div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              سیستەم لە ٣ ئاستی جیاوازدا هەموو کرێکار، حجز، ڤیزا و پرۆفایلەکان پاشەکەوت دەکات. ئەگەر پەرەکە نوێ بکەیتەوە، براوزەر دابخەیت یان گۆڕانکاری لە کۆددا بکرێت، هیچ داتایەک ناسڕێتەوە.
            </p>
          </div>

          {/* Action 1: Export Manual Backup JSON */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800/40">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>داونلۆدکردنی فایلی تەواوی باکئەپ (Backup File)</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                داونلۆدکردنی فایلی JSON کە هەموو کرێکارەکان ({currentState.workers.length}) و کۆمپانیا لەخۆدەگرێت بۆ پاراستن لەسەر ئامێرەکەت.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>داونلۆدی باکئەپ (.JSON)</span>
            </button>
          </div>

          {/* Action 2: Import / Restore from JSON */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800/40">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>گەڕاندنەوەی داتاکان لە فایلی باکئەپ</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                ئەگەر کۆمپیوتەرت گۆڕی یان فایلی باکئەپی پێشووت پێیە، دەتوانیت هەمووی بگەڕێنیتەوە.
              </p>
            </div>
            <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95">
              <Upload className="w-4 h-4" />
              <span>هەڵبژاردنی فایل (.JSON)</span>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Action 3: Auto-Saved Local Snapshots History */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-500" />
              <span>کۆپییە پارێزراوە خۆکارەکان (Snapshots History):</span>
            </h4>

            {snapshots.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                هێشتا کۆپی مێژوویی پاشەکەوت نەکراوە؛ هەر دەستکارییەک بکەیت لێرە دەردەکەوێت.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(snap.timestamp).toLocaleDateString('ckb')} - {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mr-2">
                          ({snap.workerCount} کرێکار)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition"
                    >
                      گەڕاندنەوە
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs"
          >
            داخستن
          </button>
        </div>

      </div>
    </div>
  );
};
