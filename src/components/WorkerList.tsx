import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  BookmarkCheck, 
  FileText, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  X,
  ExternalLink,
  Calendar,
  Building,
  UserCheck,
  Download,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  Share2,
  Sparkles
} from 'lucide-react';
import { UserAccount, Worker } from '../types';
import { calculateAge, getPassportRemainingDays, translateKurdishToEnglish } from '../utils/translation';

interface WorkerListProps {
  workers: Worker[];
  currentUser: UserAccount;
  onOpenAddModal: () => void;
  onOpenEditModal: (worker: Worker) => void;
  onDeleteWorker: (workerId: string) => void;
  onSelectWorkerForCv: (worker: Worker) => void;
  onOpenReservationModal: (worker: Worker) => void;
}

export const WorkerList: React.FC<WorkerListProps> = ({
  workers,
  currentUser,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteWorker,
  onSelectWorkerForCv,
  onOpenReservationModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'reserved' | 'expiring' | 'over45'>('active');
  const [nationalityFilter, setNationalityFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [downloadWorker, setDownloadWorker] = useState<Worker | null>(null);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  // Extract unique filter options
  const nationalities = Array.from(new Set(workers.map((w) => w.nationality)));
  const companies = Array.from(new Set(workers.map((w) => w.companyName)));

  // Filter workers
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.enFullName && w.enFullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      w.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.sponsorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.nationality.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'active' && w.status !== 'active') return false;
    if (statusFilter === 'reserved' && w.status !== 'reserved') return false;
    if (statusFilter === 'expiring') {
      const days = getPassportRemainingDays(w.passportExpiryDate);
      if (days > 180) return false;
    }
    if (statusFilter === 'over45') {
      const age = calculateAge(w.birthDate);
      if (age <= 45) return false;
    }

    if (nationalityFilter !== 'all' && w.nationality !== nationalityFilter) return false;
    if (companyFilter !== 'all' && w.companyName !== companyFilter) return false;

    return true;
  });

  // Export full table to Excel (.csv with UTF-8 BOM)
  const handleExportExcel = () => {
    const headers = [
      'ناوی تەواو',
      'ناوی ئینگلیزی',
      'ژمارەی پاسەپۆرت',
      'ڕەگەزنامە',
      'ڕەگەز',
      'تەمەن',
      'بەرواری لەدایکبوون',
      'بەسەرچوونی پاسەپۆرت',
      'سپۆنسەر',
      'کۆمپانیا',
      'وەرگیراوە لە',
      'بەرواری وەرگرتن',
      'جۆری پاسەپۆرت',
      'دۆخ',
    ];

    const rows = filteredWorkers.map((w) => {
      const age = calculateAge(w.birthDate);
      return [
        `"${w.fullName}"`,
        `"${w.enFullName || ''}"`,
        `"${w.passportNumber}"`,
        `"${w.nationality}"`,
        `"${w.gender}"`,
        `"${age}"`,
        `"${w.birthDate}"`,
        `"${w.passportExpiryDate}"`,
        `"${w.sponsorName}"`,
        `"${w.companyName}"`,
        `"${w.receivedFrom}"`,
        `"${w.receivedDate}"`,
        `"${w.passportType}"`,
        `"${w.status === 'reserved' ? 'حجزکراو' : w.status === 'archived' ? 'ئەرشیف' : 'بەردەست'}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Workers_CV_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="گەڕان بەپێی ناوی کرێکار، ژمارەی پاسەپۆرت، سپۆنسەر، ڕەگەزنامە..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          </div>

          {/* View Toggles & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Download Excel Sheet */}
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
              title="داونلۆدکردنی لیستی کرێکاران وەک فایلی ئێکسڵ"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>داونلۆدی خشتە (Excel)</span>
            </button>

            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="خشتە"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="کارتەکان"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {currentUser.permissions.canAddWorker && (
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>زیادکردنی کرێکار</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            بەردەست بۆ حجز ({workers.filter((w) => w.status === 'active').length})
          </button>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            هەموو سیڤیەکان ({workers.length})
          </button>

          <button
            onClick={() => setStatusFilter('expiring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              statusFilter === 'expiring'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>پاسەپۆرتی نزیک لە بەسەرچوون</span>
          </button>

          <button
            onClick={() => setStatusFilter('over45')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              statusFilter === 'over45'
                ? 'bg-orange-600 text-white font-bold'
                : 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>تەمەنی سەروو ٤٥ ساڵ</span>
          </button>

          {/* Nationality Dropdown */}
          <select
            value={nationalityFilter}
            onChange={(e) => setNationalityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">هەموو ڕەگەزنامەکان</option>
            {nationalities.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          {/* Company Dropdown */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">هەموو کۆمپانیاکان</option>
            {companies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

        </div>

      </div>

      {/* Main Content: Table or Cards View */}
      {filteredWorkers.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 text-sm">هیچ سیڤیەک بەم پێوەرانە نەدۆزرایەوە.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">کرێکار</th>
                  <th className="py-3.5 px-4">ژمارەی پاسەپۆرت</th>
                  <th className="py-3.5 px-4">ڕەگەزنامە / ڕەگەز</th>
                  <th className="py-3.5 px-4">تەمەن</th>
                  <th className="py-3.5 px-4">بەسەرچوونی پاسەپۆرت</th>
                  <th className="py-3.5 px-4">سپۆنسەر / کۆمپانیا</th>
                  <th className="py-3.5 px-4">وەرگیراوە لە</th>
                  <th className="py-3.5 px-4 text-center">داونلۆد و کردارەکان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredWorkers.map((w) => {
                  const age = calculateAge(w.birthDate);
                  const daysLeft = getPassportRemainingDays(w.passportExpiryDate);
                  const isOver45 = age > 45;

                  return (
                    <tr
                      key={w.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition group"
                    >
                      {/* Photo & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="relative cursor-pointer"
                            onClick={() => w.photoUrl && setPreviewImage({ url: w.photoUrl, title: w.fullName })}
                          >
                            {w.photoUrl ? (
                              <img
                                src={w.photoUrl}
                                alt={w.fullName}
                                className="w-10 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-10 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">
                                {w.fullName.charAt(0)}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {w.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-sans">
                              {w.enFullName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Passport Number */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {w.passportNumber}
                          </span>
                          {w.passportPhotoUrl && (
                            <button
                              onClick={() => setPreviewImage({ url: w.passportPhotoUrl, title: `پاسەپۆرتی ${w.fullName}` })}
                              className="text-slate-400 hover:text-emerald-600 transition"
                              title="بینینی وێنەی پاسەپۆرت"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          جۆر: {w.passportType}
                        </div>
                      </td>

                      {/* Nationality & Gender */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {w.nationality}
                        </div>
                        <span className="inline-block text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {w.gender} (Female)
                        </span>
                      </td>

                      {/* Age */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {age} ساڵ
                          </span>
                          {isOver45 && (
                            <span 
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                              title="ئاگاداری: تەمەنی لە ٤٥ ساڵ گەورەترە"
                            >
                              سەروو ٤٥
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{w.birthDate}</div>
                      </td>

                      {/* Passport Expiration */}
                      <td className="py-3.5 px-4">
                        <div>{w.passportExpiryDate}</div>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          daysLeft <= 0
                            ? 'bg-rose-600 text-white'
                            : daysLeft < 60
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : daysLeft <= 180
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'text-slate-400'
                        }`}>
                          {daysLeft <= 0 ? 'بەسەرچووە!' : `${daysLeft} ڕۆژی ماوە`}
                        </span>
                      </td>

                      {/* Sponsor & Company */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {w.sponsorName || 'دیاری نەکراوە'}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          {w.companyName}
                        </div>
                      </td>

                      {/* Received From */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {w.receivedFrom}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {w.receivedDate}
                        </div>
                      </td>

                      {/* Actions with Download Button */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Dedicated DOWNLOAD Button */}
                          <button
                            onClick={() => setDownloadWorker(w)}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                            title="داونلۆدکردنی سیڤی (PDF / وێنە)"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>داونلۆد</span>
                          </button>

                          {/* Reserve Button */}
                          {w.status === 'active' && currentUser.permissions.canReserveWorker && (
                            <button
                              onClick={() => onOpenReservationModal(w)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                              title="حجزکردن"
                            >
                              <BookmarkCheck className="w-3.5 h-3.5" />
                              <span>حجز</span>
                            </button>
                          )}

                          {w.status === 'reserved' && (
                            <span className="px-2 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-300/40">
                              حجزکراوە
                            </span>
                          )}

                          {/* CV Builder Button */}
                          <button
                            onClick={() => onSelectWorkerForCv(w)}
                            className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
                            title="دروستکردنی سیڤی A4"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          {currentUser.permissions.canEditWorker && (
                            <button
                              onClick={() => onOpenEditModal(w)}
                              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                              title="دەستکاری"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          {currentUser.permissions.canDeleteWorker && (
                            <button
                              onClick={() => setWorkerToDelete(w)}
                              className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
                              title="سڕینەوە"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkers.map((w) => {
            const age = calculateAge(w.birthDate);
            const daysLeft = getPassportRemainingDays(w.passportExpiryDate);
            const isOver45 = age > 45;

            return (
              <div
                key={w.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  
                  {/* Top Badge & Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {w.companyName}
                    </span>
                    {w.status === 'reserved' ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-full">
                        حجزکراوە
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                        بەردەستە
                      </span>
                    )}
                  </div>

                  {/* Worker Photo & Main Info */}
                  <div className="flex items-start gap-4">
                    <div 
                      className="relative cursor-pointer flex-shrink-0"
                      onClick={() => w.photoUrl && setPreviewImage({ url: w.photoUrl, title: w.fullName })}
                    >
                      {w.photoUrl ? (
                        <img
                          src={w.photoUrl}
                          alt={w.fullName}
                          className="w-16 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">
                          {w.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug truncate">
                        {w.fullName}
                      </h4>
                      <p className="text-xs text-slate-400 font-sans truncate">{w.enFullName}</p>
                      
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {w.nationality}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isOver45 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          تەمەن: {age} ساڵ {isOver45 && '⚠️'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Passport & Expiry Details */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ژمارەی پاسەپۆرت:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {w.passportNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">بەسەرچوونی پاسەپۆرت:</span>
                      <span className={`font-bold ${
                        daysLeft <= 0 ? 'text-rose-600' : daysLeft < 180 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {w.passportExpiryDate} ({daysLeft} ڕۆژ)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">سپۆنسەر:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {w.sponsorName}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Card Footer Actions with Download Button */}
                <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  
                  {/* Download Button */}
                  <button
                    onClick={() => setDownloadWorker(w)}
                    className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                    title="داونلۆدی سیڤی"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>داونلۆد</span>
                  </button>

                  <button
                    onClick={() => onSelectWorkerForCv(w)}
                    className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>سیڤی A4</span>
                  </button>

                  {w.status === 'active' && currentUser.permissions.canReserveWorker && (
                    <button
                      onClick={() => onOpenReservationModal(w)}
                      className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center gap-1"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>حجز</span>
                    </button>
                  )}

                  {currentUser.permissions.canEditWorker && (
                    <button
                      onClick={() => onOpenEditModal(w)}
                      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
                      title="دەستکاری"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {currentUser.permissions.canDeleteWorker && (
                    <button
                      onClick={() => setWorkerToDelete(w)}
                      className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 hover:bg-rose-200 transition"
                      title="سڕینەوە"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Quick Download CV Modal (Points 1: "لەبەشی سیڤیەکان بتوانین داونلۆد بکەین") */}
      {downloadWorker && (
        <DownloadCvModal
          worker={downloadWorker}
          onClose={() => setDownloadWorker(null)}
          onOpenFullCv={() => {
            onSelectWorkerForCv(downloadWorker);
            setDownloadWorker(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {workerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white text-center mb-2">
              سڕینەوەی ئەم کرێکارە لە سیستەم
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center mb-6">
              ئایا دڵنیایت لە سڕینەوەی یەکجاری کرێکار <span className="font-bold text-slate-900 dark:text-white">({workerToDelete.fullName})</span> بە پاسەپۆرتی <span className="font-mono font-bold text-slate-900 dark:text-white">({workerToDelete.passportNumber})</span>؟<br/>
              ئەم زانیارییە بە تەواوی دەسڕێتەوە و دواتر ناگەڕێتەوە ناو لیستەکەت.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onDeleteWorker(workerToDelete.id);
                  setWorkerToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>سڕینەوەی یەکجاری</span>
              </button>
              <button
                onClick={() => setWorkerToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
              >
                پاشگەزبوونەوە
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Photo / Passport Scan */}
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

// Subcomponent: Download CV Modal with Image (PNG) / PDF / Text options
const DownloadCvModal: React.FC<{
  worker: Worker;
  onClose: () => void;
  onOpenFullCv: () => void;
}> = ({ worker, onClose, onOpenFullCv }) => {
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const cvCardRef = useRef<HTMLDivElement>(null);

  const age = calculateAge(worker.birthDate);

  // 1. Download as PNG Image using html2canvas with font readiness and ligature preservation
  const handleDownloadImage = async () => {
    if (!cvCardRef.current) return;
    setIsExportingImage(true);
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 80));

      const canvas = await html2canvas(cvCardRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const fontLink = clonedDoc.createElement('link');
          fontLink.rel = 'stylesheet';
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap';
          clonedDoc.head.appendChild(fontLink);

          const card = clonedDoc.querySelector('[data-cv-card]') as HTMLElement;
          if (card) {
            card.style.letterSpacing = 'normal';
            card.style.fontFamily = "'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          }
        },
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `CV_${worker.fullName.replace(/\s+/g, '_')}_${worker.passportNumber}.png`;
      link.click();
    } catch (err) {
      console.error('Failed generating CV image:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  // 2. Direct Print / Save as PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // 3. Download image or file asset
  const handleDownloadAsset = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // 4. Download worker full data as JSON
  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(worker, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `Data_${worker.fullName.replace(/\s+/g, '_')}_${worker.passportNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 5. Copy formatted summary text
  const handleCopySummary = () => {
    const text = `
📋 سیڤی کرێکاری بیانی / BIO-DATA
👤 ناوی تەواو: ${worker.fullName} (${worker.enFullName || ''})
🛂 ژمارەی پاسەپۆرت: ${worker.passportNumber}
🌍 ڕەگەزنامە: ${worker.nationality} (${translateKurdishToEnglish(worker.nationality)})
📅 بەرواری لەدایکبوون: ${worker.birthDate} (تەمەن: ${age} ساڵ)
⏳ بەسەرچوونی پاسەپۆرت: ${worker.passportExpiryDate}
🏢 کۆمپانیا: ${worker.companyName}
✨ شارەزایی: ${worker.cvDetails?.skills?.join('، ') || 'ماڵ خاوێنکردنەوە، خواردن دروستکردن، بەخێوکردنی مناڵ'}
🗣️ زمانەکان: ${worker.cvDetails?.languages?.map((l) => `${l.language} (${l.level})`).join('، ') || 'عەرەبی، ئینگلیزی'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-teal-50 dark:bg-teal-950/60 border-b border-teal-200 dark:border-teal-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                داونلۆدی سیڤی: {worker.fullName}
              </h3>
              <p className="text-xs text-teal-700 dark:text-teal-400">
                داونلۆدکردن وەک وێنە، PDF، پرێنت یان کۆپیکردنی دەقی فەرمی
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Download Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Download as Image */}
            <button
              onClick={handleDownloadImage}
              disabled={isExportingImage}
              className="p-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>{isExportingImage ? 'ئامادەکردنی وێنە...' : 'داونلۆد وەک وێنە (PNG)'}</span>
              <span className="text-[10px] text-teal-200">کوالێتی بەرز بۆ ناردن</span>
            </button>

            {/* Print / Save as PDF */}
            <button
              onClick={handlePrintPdf}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <Printer className="w-5 h-5 text-emerald-400" />
              <span>پرێنت و PDF فەرمی</span>
              <span className="text-[10px] text-slate-300">قەبارەی A4</span>
            </button>

            {/* Copy Summary Text */}
            <button
              onClick={handleCopySummary}
              className={`p-3.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 active:scale-95 ${
                copiedText
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              {copiedText ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5 text-teal-600" />}
              <span>{copiedText ? 'کۆپی کرا!' : 'کۆپیکردنی دەقی سیڤی'}</span>
              <span className="text-[10px] text-slate-400">بۆ واتسئاپ و ڤایبەر</span>
            </button>

          </div>

          {/* Additional Individual Download Assets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">داونلۆدی بەشەکان:</span>
            
            {worker.photoUrl && (
              <button
                onClick={() => handleDownloadAsset(worker.photoUrl!, `Photo_${worker.fullName.replace(/\s+/g, '_')}.jpg`)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>وێنەی کەسی کرێکار</span>
              </button>
            )}

            {worker.passportPhotoUrl && (
              <button
                onClick={() => handleDownloadAsset(worker.passportPhotoUrl!, `Passport_${worker.passportNumber}.jpg`)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>وێنەی پاسەپۆرت</span>
              </button>
            )}

            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>فایلی داتا (JSON)</span>
            </button>
          </div>

          {/* Printable Preview Card to be Captured by html2canvas */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-xs font-bold text-slate-500 block mb-2">بینینی پێشوەختەی کارتی سیڤی:</span>
            
            <div 
              ref={cvCardRef}
              data-cv-card="true"
              className="cv-card-preview bg-white text-slate-900 p-6 rounded-2xl border border-slate-300 shadow-md space-y-4"
              style={{ direction: 'rtl' }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b pb-3 border-emerald-700">
                <div>
                  <h4 className="text-base font-black text-emerald-900">{worker.companyName}</h4>
                  <p className="text-[10px] text-slate-500">فۆڕمی فەرمی زانیاری کرێکاری بیانی / BIO-DATA</p>
                </div>
                <div className="text-left font-mono text-[10px] text-emerald-800 font-bold" dir="ltr">
                  #{worker.passportNumber}
                </div>
              </div>

              {/* Photo & Main Grid */}
              <div className="flex items-start gap-4">
                <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-emerald-700 bg-slate-100 flex-shrink-0">
                  {worker.photoUrl ? (
                    <img src={worker.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl">{worker.fullName.charAt(0)}</div>
                  )}
                </div>

                <div className="flex-1 space-y-1 text-xs">
                  <div className="font-extrabold text-sm text-slate-900">{worker.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-sans">{worker.enFullName}</div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-2 text-[11px]">
                    <div><span className="text-slate-500">پاسەپۆرت:</span> <span className="font-mono font-bold">{worker.passportNumber}</span></div>
                    <div><span className="text-slate-500">ڕەگەزنامە:</span> <span className="font-bold text-emerald-700">{worker.nationality}</span></div>
                    <div><span className="text-slate-500">تەمەن:</span> <span className="font-bold">{age} ساڵ</span></div>
                    <div><span className="text-slate-500">ڕەگەز:</span> <span>{worker.gender} <span dir="ltr" style={{ unicodeBidi: 'isolate', display: 'inline-block' }} className="font-sans text-[10px]">({worker.gender === 'مێ' ? 'Female' : 'Male'})</span></span></div>
                    <div><span className="text-slate-500">بەسەرچوون:</span> <span>{worker.passportExpiryDate}</span></div>
                    <div><span className="text-slate-500">کۆمپانیا:</span> <span>{worker.companyName}</span></div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-emerald-900 block mb-1">شارەزایی کارکردن:</span>
                <div className="flex flex-wrap gap-1">
                  {(worker.cvDetails?.skills || ['ماڵ خاوێنکردنەوە', 'خواردن دروستکردن', 'بەخێوکردنی مناڵ', 'جل شوشتن و ئوتوو']).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                <div>
                  <span className="font-bold text-slate-700">زمانەکان: </span>
                  <span className="text-slate-600">
                    {worker.cvDetails?.languages && worker.cvDetails.languages.length > 0
                      ? worker.cvDetails.languages.map((l, idx) => (
                          <span key={idx} className="inline-block ml-1.5">
                            {l.language} <span dir="ltr" style={{ unicodeBidi: 'isolate', display: 'inline-block' }} className="font-sans text-[10px]">({l.level})</span>
                          </span>
                        ))
                      : 'عەرەبی (باش)، ئینگلیزی (نایاب)'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  مۆر و واژۆی فەرمی کۆمپانیا
                </div>
              </div>

            </div>
          </div>

          {/* Open Full CV Builder */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onOpenFullCv}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>کردنەوەی تەواوی پەڕەی A4 لە بەشی دروستکەری سیڤی</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            >
              داخستن
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
