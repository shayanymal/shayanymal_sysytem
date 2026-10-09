import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookmarkCheck, 
  User, 
  Phone, 
  Users, 
  Calendar, 
  Upload, 
  FileText, 
  Check, 
  CreditCard, 
  AlertCircle 
} from 'lucide-react';
import { ReservationInfo, UserAccount, Worker } from '../types';
import { notificationService } from '../services/notificationService';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker | null;
  currentUser: UserAccount;
  onConfirmReservation: (workerId: string, reservation: ReservationInfo) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  worker,
  currentUser,
  onConfirmReservation,
}) => {
  const defaultIdSample = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop&q=80';

  const [customerFullName, setCustomerFullName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [reservedThrough, setReservedThrough] = useState('بەڕێوەبەر');
  const [customReservedThrough, setCustomReservedThrough] = useState('');
  const [reservedAt, setReservedAt] = useState(new Date().toISOString().slice(0, 16));
  const [nationalIdCardPhotoUrl, setNationalIdCardPhotoUrl] = useState(defaultIdSample);
  const [informationCardPhotoUrl, setInformationCardPhotoUrl] = useState(defaultIdSample);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCustomerFullName('');
      setCustomerPhone('');
      setReservedThrough(currentUser.role === 'admin' ? 'بەڕێوەبەر' : currentUser.fullName);
      setCustomReservedThrough('');
      setReservedAt(new Date().toISOString().slice(0, 16));
      setNationalIdCardPhotoUrl(defaultIdSample);
      setInformationCardPhotoUrl(defaultIdSample);
      setNotes('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !worker) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setter(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalReservedThrough =
      reservedThrough === 'تر' ? customReservedThrough.trim() || 'دەستنووس' : reservedThrough;

    const reservation: ReservationInfo = {
      customerFullName: customerFullName.trim(),
      customerPhone: customerPhone.trim(),
      reservedThrough: finalReservedThrough,
      reservedAt,
      nationalIdCardPhotoUrl: nationalIdCardPhotoUrl || defaultIdSample,
      informationCardPhotoUrl: informationCardPhotoUrl || defaultIdSample,
      notes: notes.trim(),
      reservedByUserId: currentUser.id,
      reservedByUserName: currentUser.fullName,
    };

    onConfirmReservation(worker.id, reservation);

    // Trigger audible and desktop notification as requested by user
    notificationService.sendSystemNotification('سیڤی حجز کرا!', {
      body: `سیڤی (${worker.fullName}) لەلایەن ${customerFullName} حجز کرا.`,
      tag: `res-${worker.id}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-auto">
        
        {/* Header with Worker Badge */}
        <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                حجزکردنی سیڤی کرێکار
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                تۆمارکردنی تەواوی زانیارییەکانی داواکار (کڕیار)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Worker Summary Banner */}
        <div className="p-4 mx-6 mt-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          {worker.photoUrl ? (
            <img
              src={worker.photoUrl}
              alt={worker.fullName}
              className="w-14 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-600 shadow-xs flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
              {worker.fullName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {worker.fullName}
            </h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-2 mt-1">
              <span>پاسەپۆرت: {worker.passportNumber}</span>
              <span>•</span>
              <span>ڕەگەزنامە: {worker.nationality}</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{worker.companyName}</span>
            </div>
          </div>
        </div>

        {/* Form Body (Points 1 - 5) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1- ناوی تەواوی داواکار */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                1- ناوی تەواوی داواکار (Customer Full Name) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerFullName}
                  onChange={(e) => setCustomerFullName(e.target.value)}
                  placeholder="ناوی چواری داواکار بنووسە..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 2- ژمارەی مۆبایل */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                2- ژمارەی مۆبایل (Phone Number) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0750 000 0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 3- لە ڕێی کێ حجز کراوە؟ */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                3- لە ڕێی کێ حجزی کردیە؟ *
              </label>
              <select
                value={reservedThrough}
                onChange={(e) => setReservedThrough(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="بەڕێوەبەر">بەڕێوەبەر</option>
                <option value="کارمەندی ئۆفیس">کارمەندی ئۆفیس</option>
                <option value="شۆفێر">شۆفێر</option>
                <option value="ماڵپەڕ / ئۆنلاین">ماڵپەڕ / ئۆنلاین</option>
                <option value="بریکار / وەکیل">بریکار / وەکیل</option>
                <option value="تر">نووسینی کەسی تر...</option>
              </select>

              {reservedThrough === 'تر' && (
                <input
                  type="text"
                  required
                  value={customReservedThrough}
                  onChange={(e) => setCustomReservedThrough(e.target.value)}
                  placeholder="ناوی ئەو کەسە بنووسە کە لەڕێیەوە حجز کراوە..."
                  className="mt-2 w-full px-3.5 py-2 rounded-xl border border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              )}
            </div>

            {/* 4- کەی حجز کراوە؟ (بەروار و کات) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                4- کەی حجزی کردیە؟ (بەروار و کات) *
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={reservedAt}
                  onChange={(e) => setReservedAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* 5- کارتی زانیاری و کارتی نیشتمانی داواکار */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              5- کارتی زانیاری و کارتی نیشتیمانی داواکار ئەپڵۆد بکرێت *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* کارتی نیشتمانی */}
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  کارتی نیشتمانی (National ID Card)
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                    {nationalIdCardPhotoUrl ? (
                      <img src={nationalIdCardPhotoUrl} alt="National ID" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">کارت</div>
                    )}
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs hover:bg-slate-100 transition flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ئەپڵۆد</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setNationalIdCardPhotoUrl)}
                    />
                  </label>
                </div>
              </div>

              {/* کارتی زانیاری */}
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  کارتی زانیاری (Information Card)
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                    {informationCardPhotoUrl ? (
                      <img src={informationCardPhotoUrl} alt="Info Card" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">کارت</div>
                    )}
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs hover:bg-slate-100 transition flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ئەپڵۆد</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setInformationCardPhotoUrl)}
                    />
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Notes / Deposit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              تێبینی و بڕی پارەی پێشەکی (Deposit / Notes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="نموونە: بڕی ٢٠٠ دۆلار وەرگیراوە، پەنجەمۆر هەفتەی داهاتوو دەکرێت..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Submission Bar */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 transition"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>پشتڕاستکردنەوە و حجزکردنی سیڤی</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
