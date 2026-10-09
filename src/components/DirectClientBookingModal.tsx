import React, { useState } from 'react';
import { 
  BookmarkCheck, 
  User, 
  Phone, 
  Building2, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  FileText, 
  Sparkles,
  PhoneCall,
  Clock
} from 'lucide-react';
import { CompanyProfile, ReservationInfo, Worker } from '../types';
import { notificationService } from '../services/notificationService';

interface DirectClientBookingModalProps {
  isOpen: boolean;
  worker: Worker | null;
  company: CompanyProfile;
  onClose: () => void;
  onConfirmReservation: (workerId: string, reservation: ReservationInfo) => void;
}

export const DirectClientBookingModal: React.FC<DirectClientBookingModalProps> = ({
  isOpen,
  worker,
  company,
  onClose,
  onConfirmReservation,
}) => {
  const [customerFullName, setCustomerFullName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !worker) return null;

  const isAlreadyReserved = worker.status === 'reserved';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerFullName.trim() || !customerPhone.trim()) return;

    setIsSubmitting(true);

    const reservation: ReservationInfo = {
      customerFullName: customerFullName.trim(),
      customerPhone: customerPhone.trim(),
      reservedThrough: 'سکانکردنی بارکۆد (ڕاستەوخۆ)',
      reservedAt: new Date().toISOString(),
      nationalIdCardPhotoUrl: '',
      informationCardPhotoUrl: '',
      notes: customerNotes.trim() || 'داواکاری ڕاستەوخۆ لە ڕێگەی سکانکردنی بارکۆدی سەر سیڤی تۆمار کراوە',
      reservedByUserId: 'client-qr',
      reservedByUserName: 'داواکاری ئۆنلاین (مۆبایل)',
    };

    onConfirmReservation(worker.id, reservation);

    notificationService.playChime('success');
    notificationService.sendSystemNotification('داواکاری حجزکردن گەیشت!', {
      body: `سیڤی (${worker.fullName}) لەلایەن (${customerFullName}) لە ڕێگەی سکانکردنی بارکۆدەوە حجز کرا.`,
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-auto">
        
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="داخستن"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
              <Building2 className="w-3.5 h-3.5" />
              <span>{company.name}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>فۆڕمی حجزکردنی ڕاستەوخۆ</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            حجزکردنی سیڤی کرێکار
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            زانیارییەکانت تۆمار بکە بۆ تەواوکردنی حجزکردن و دانانی ئەم سیڤیە بە ناوی تۆوە
          </p>
        </div>

        {/* Worker Summary Card */}
        <div className="p-4 mx-5 mt-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
          {worker.photoUrl ? (
            <img
              src={worker.photoUrl}
              alt={worker.fullName}
              className="w-16 h-20 rounded-xl object-cover border-2 border-emerald-600 shadow-xs flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-20 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 flex items-center justify-center text-xl font-bold flex-shrink-0">
              {worker.fullName.charAt(0)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {worker.fullName}
              </h3>
              {isAlreadyReserved ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                  پێشتر حجز کراوە
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  بەردەستە بۆ حجز
                </span>
              )}
            </div>

            {worker.enFullName && (
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                {worker.enFullName}
              </p>
            )}

            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400">نەتەوە: </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{worker.nationality}</span>
              </div>
              <div>
                <span className="text-slate-400">پاسەپۆرت: </span>
                <span className="font-mono font-bold">{worker.passportNumber}</span>
              </div>
              <div>
                <span className="text-slate-400">ڕەگەز: </span>
                <span>{worker.gender}</span>
              </div>
              <div>
                <span className="text-slate-400">کۆمپانیا: </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{worker.companyName || company.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                داواکاری حجزکردنەکەت بە سەرکەوتوویی تۆمار کرا!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                سوپاس بەڕێز <span className="font-bold text-emerald-700 dark:text-emerald-400">{customerFullName}</span>. سیڤی کرێکار ({worker.fullName}) بە سەرکەوتوویی بە ناوی تۆوە حجز کرا.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-right space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>هەنگاوی داهاتوو چییە؟</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                تیمی کۆمپانیای <span className="font-bold text-emerald-700 dark:text-emerald-300">{company.name}</span> لە کورتترین ماوەدا پەیوەندیت پێوە دەکەن لە ڕێگەی ژمارە مۆبایلی (<span className="font-mono font-bold" dir="ltr">{customerPhone}</span>) بۆ تەواوکردنی ڕێکارە فەرمییەکان.
              </p>

              {(company.phone1 || company.phone2) && (
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">پەیوەندی ڕاستەوخۆ:</span>
                  <div className="flex items-center gap-2 font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span dir="ltr">{company.phone1}</span>
                    {company.phone2 && <span dir="ltr">/ {company.phone2}</span>}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              داخستن
            </button>
          </div>
        ) : isAlreadyReserved ? (
          /* Already Reserved Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ئەم سیڤیە لە ئێستادا حجز کراوە!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                بەداخەوە کرێکار ({worker.fullName}) لەلایەن کەسێکی ترەوە حجز کراوە. دەتوانیت پەیوەندی بە ئۆفیسەوە بکەیت بۆ زانیاری زیاتر یان هەڵبژاردنی سیڤیەکی تر.
              </p>
            </div>

            {(company.phone1 || company.phone2) && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">پەیوەندی بە ئۆفیس:</span>
                <span className="font-mono font-bold text-emerald-600" dir="ltr">{company.phone1}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition cursor-pointer"
            >
              داخستن
            </button>
          </div>
        ) : (
          /* Clean Booking Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* 1. Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ناوی تەواوی داواکار (کڕیار) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customerFullName}
                  onChange={(e) => setCustomerFullName(e.target.value)}
                  placeholder="ناوی سیانی یان چواری خۆت بنووسە..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  autoFocus
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 2. Customer Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ژمارەی مۆبایل بۆ پەیوەندیکردن *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0750 000 0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  dir="ltr"
                />
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* 3. Notes / Address (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                تێبینی یان ناونیشان (ئارەزوومەندانە)
              </label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="شار، گەڕەک یان هەر تێبینییەکی تایبەتت هەیە لێرە بینوسە..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <BookmarkCheck className="w-5 h-5" />
                <span>{isSubmitting ? 'تۆمار دەکرێت...' : 'تەواوکردنی حجزکردنی کرێکار'}</span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                دوای ناردنی فۆڕمەکە، تیمی ئۆفیس ڕاستەوخۆ پەیوەندیت پێوە دەکەن.
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
