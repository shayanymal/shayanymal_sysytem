import React, { useState } from 'react';
import { 
  BookmarkCheck, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Undo2, 
  ArrowRight, 
  FileText, 
  CreditCard, 
  Eye, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Share2, 
  FileCheck
} from 'lucide-react';
import { UserAccount, Worker } from '../types';

interface ReservedListProps {
  workers: Worker[];
  currentUser: UserAccount;
  onCancelReservation: (workerId: string) => void;
  onProceedToArchive: (worker: Worker) => void;
  onSelectWorkerForCv: (worker: Worker) => void;
}

export const ReservedList: React.FC<ReservedListProps> = ({
  workers,
  currentUser,
  onCancelReservation,
  onProceedToArchive,
  onSelectWorkerForCv,
}) => {
  const reservedWorkers = workers.filter((w) => w.status === 'reserved');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [workerToCancel, setWorkerToCancel] = useState<Worker | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>بەشی حجزکراوەکان</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            لیستی ئەو سیڤیانەی لەلایەن کڕیارانەوە حجز کراون
          </h2>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            هەر سیڤیەک کە حجز دەکرێت لە لیستی گشتی دێتە دەرەوە و لێرە بە وردەکاری کڕیار، ژمارەی مۆبایل و بەڵگەنامەکانی دادەنرێت.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
          <div>
            <div className="text-2xl font-black">{reservedWorkers.length}</div>
            <div className="text-[10px] text-amber-200">سیڤی حجزکراو</div>
          </div>
        </div>
      </div>

      {/* Main List */}
      {reservedWorkers.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <BookmarkCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            لە ئێستادا هیچ سیڤیەک حجز نەکراوە
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            دەتوانیت لە بەشی «سیڤیەکان» بەتنی حجزکردن لەسەر هەر کرێکارێک دابگریت تا بێتە ئەم لیستە.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {reservedWorkers.map((w) => {
            const res = w.reservation;
            return (
              <div
                key={w.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-500/20 hover:border-amber-500/40 shadow-md overflow-hidden transition"
              >
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Worker Information (4 columns) */}
                  <div className="lg:col-span-5 flex items-start gap-4 pb-4 lg:pb-0 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-6">
                    {w.photoUrl ? (
                      <img
                        src={w.photoUrl}
                        alt={w.fullName}
                        className="w-20 h-24 rounded-2xl object-cover border-2 border-amber-500 shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-24 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 font-bold text-lg flex-shrink-0">
                        {w.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        حجزکراوە
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">
                        {w.fullName}
                      </h4>
                      <p className="text-xs text-slate-400 font-sans">{w.enFullName}</p>
                      
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 pt-1">
                        <div>پاسەپۆرت: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{w.passportNumber}</span></div>
                        <div>ڕەگەزنامە: <span className="font-bold text-emerald-600">{w.nationality}</span></div>
                        <div>کۆمپانیا: <span className="font-semibold text-slate-700 dark:text-slate-300">{w.companyName}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information (5 columns) */}
                  <div className="lg:col-span-4 space-y-3 pb-4 lg:pb-0 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">ناوی تەواوی داواکار (کڕیار):</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {res?.customerFullName || 'دیاری نەکراوە'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-slate-500">مۆبایل:</span>
                      <a 
                        href={`tel:${res?.customerPhone}`} 
                        className="text-xs font-bold font-mono text-emerald-600 hover:underline"
                        dir="ltr"
                      >
                        {res?.customerPhone}
                      </a>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div>لە ڕێی: <span className="font-bold text-slate-800 dark:text-slate-200">{res?.reservedThrough}</span></div>
                      <div>کاتی حجز: <span className="text-slate-700 dark:text-slate-300 font-medium">{res?.reservedAt?.replace('T', ' - ')}</span></div>
                    </div>

                    {/* Customer ID documents */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400">بەڵگەنامەکان:</span>
                      {res?.nationalIdCardPhotoUrl && (
                        <button
                          onClick={() => setPreviewImage({ url: res.nationalIdCardPhotoUrl!, title: `کارتی نیشتمانی: ${res.customerFullName}` })}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>کارتی نیشتمانی</span>
                        </button>
                      )}
                      {res?.informationCardPhotoUrl && (
                        <button
                          onClick={() => setPreviewImage({ url: res.informationCardPhotoUrl!, title: `کارتی زانیاری: ${res.customerFullName}` })}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>کارتی زانیاری</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions Column (3 columns) */}
                  <div className="lg:col-span-3 flex flex-col gap-2.5 justify-center">
                    
                    {/* Proceed to Government Archive Workflow */}
                    <button
                      onClick={() => onProceedToArchive(w)}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>پێشکەشکردن و ئەرشیف</span>
                    </button>

                    {/* View CV A4 */}
                    <button
                      onClick={() => onSelectWorkerForCv(w)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>بینینی سیڤی A4</span>
                    </button>

                    {/* Cancel Reservation */}
                    {currentUser.permissions.canCancelReservation && (
                      <button
                        onClick={() => setWorkerToCancel(w)}
                        className="w-full py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>هەڵوەشاندنەوەی حجز</span>
                      </button>
                    )}

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Cancelling Reservation */}
      {workerToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <Undo2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ئایا دڵنیایت لە هەڵوەشاندنەوەی حجزی ئەم کرێکارە؟
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              سیڤی (<span className="font-bold text-slate-800 dark:text-slate-200">{workerToCancel.fullName}</span>) لەم بەشە دەسڕێتەوە و دەگەڕێتەوە بۆ لیستی گشتی سیڤیە بەردەستەکان بۆ هەموو کڕیارەکانی تر.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setWorkerToCancel(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                پاشگەزبوونەوە
              </button>
              <button
                onClick={() => {
                  onCancelReservation(workerToCancel.id);
                  setWorkerToCancel(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                بەڵێ، حجزەکە هەڵوەشێنەوە
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{previewImage.title}</h4>
              <button onClick={() => setPreviewImage(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              {previewImage?.url ? (
                <img src={previewImage.url} alt="Preview" className="max-h-[75vh] w-auto object-contain rounded-xl" />
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
