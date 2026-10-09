import React, { useState } from 'react';
import { 
  Archive, 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  Building, 
  CheckCircle2, 
  Upload, 
  Eye, 
  Edit, 
  ExternalLink, 
  FileSpreadsheet, 
  X,
  Search,
  Check,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { ArchiveRecordData, GovLetter, UserAccount, Worker } from '../types';

interface ArchiveSectionProps {
  workers: Worker[];
  currentUser: UserAccount;
  onUpdateArchiveData: (workerId: string, archiveData: ArchiveRecordData) => void;
  onDeleteWorker: (workerId: string) => void;
}

export const ArchiveSection: React.FC<ArchiveSectionProps> = ({
  workers,
  currentUser,
  onUpdateArchiveData,
  onDeleteWorker,
}) => {
  const archivedWorkers = workers.filter((w) => w.status === 'archived');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterNationality, setFilterNationality] = useState('all');
  const [filterSponsor, setFilterSponsor] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [selectedWorkerForEdit, setSelectedWorkerForEdit] = useState<Worker | null>(null);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  // Extract unique filters
  const nationalities = Array.from(new Set(archivedWorkers.map((w) => w.nationality)));
  const sponsors = Array.from(new Set(archivedWorkers.map((w) => w.sponsorName).filter(Boolean)));
  const companies = Array.from(new Set(archivedWorkers.map((w) => w.companyName)));

  // Filter archived records
  const filteredList = archivedWorkers.filter((w) => {
    const matchesSearch =
      w.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.reservation?.customerFullName &&
        w.reservation.customerFullName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterNationality !== 'all' && w.nationality !== filterNationality) return false;
    if (filterSponsor !== 'all' && w.sponsorName !== filterSponsor) return false;
    if (filterCompany !== 'all' && w.companyName !== filterCompany) return false;
    return true;
  });

  // Export to Excel / CSV with UTF-8 BOM
  const handleExportExcel = () => {
    const headers = [
      'ناوی کرێکار',
      'ژمارەی پاسەپۆرت',
      'ڕەگەزنامە',
      'سپۆنسەر',
      'کۆمپانیا',
      'ناوی داواکار (کڕیار)',
      'مۆبایلی داواکار',
      'بەرواری پێشکەشکردن',
      'بەرواری پەنجەمۆر',
      'نوسراوی کار هەولێر',
      'بەرواری کار هەولێر',
      'نوسراوی گشتی کار',
      'بەرواری گشتی کار',
      'نوسراوی دەستەبەری',
      'بەرواری دەستەبەری',
      'نوسراوی وەزارەتی کار',
      'بەرواری وەزارەت',
      'دۆخی فەرمی',
    ];

    const rows = filteredList.map((w) => {
      const arch = w.archiveData;
      const res = w.reservation;
      return [
        `"${w.fullName}"`,
        `"${w.passportNumber}"`,
        `"${w.nationality}"`,
        `"${w.sponsorName || ''}"`,
        `"${w.companyName}"`,
        `"${res?.customerFullName || ''}"`,
        `"${res?.customerPhone || ''}"`,
        `"${arch?.submissionDate || ''}"`,
        `"${arch?.fingerprintDate || ''}"`,
        `"${arch?.erbilLaborDept?.letterNumber || ''}"`,
        `"${arch?.erbilLaborDept?.letterDate || ''}"`,
        `"${arch?.generalLaborDept?.letterNumber || ''}"`,
        `"${arch?.generalLaborDept?.letterDate || ''}"`,
        `"${arch?.socialSecurityDept?.letterNumber || ''}"`,
        `"${arch?.socialSecurityDept?.letterDate || ''}"`,
        `"${arch?.ministryOfLabor?.letterNumber || ''}"`,
        `"${arch?.ministryOfLabor?.letterDate || ''}"`,
        `"${arch?.status || 'لە پرۆسەدایە'}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Archive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export / Print PDF report
  const handlePrintPdfReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
            <Archive className="w-3.5 h-3.5" />
            <span>بەشی ئەرشیف و نوسراوە فەرمییەکان</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            ئەرشیفی پێشکەشکراوان و ڕاپۆرتی بەڕێوەبەرایەتی و وەزارەتی کار
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            تەواوی زانیارییەکانی داواکار و کرێکار لەگەڵ بەرواری پەنجەمۆر، نوسراوەکانی کاری هەولێر، بەڕێوەبەرایەتی گشتی، دەستەبەری کۆمەڵایەتی و وەزارەتی کار.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>ئێکسپۆرت بە Excel (.csv)</span>
          </button>

          <button
            onClick={handlePrintPdfReport}
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>پرێنت و PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="گەڕان بەپێی ناوی کرێکار یان داواکار..."
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
            <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Filter Nationality */}
          <div>
            <select
              value={filterNationality}
              onChange={(e) => setFilterNationality(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            >
              <option value="all">هەموو ڕەگەزنامەکان (All)</option>
              {nationalities.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Filter Sponsor */}
          <div>
            <select
              value={filterSponsor}
              onChange={(e) => setFilterSponsor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            >
              <option value="all">هەموو سپۆنسەرەکان</option>
              {sponsors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Filter Company */}
          <div>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            >
              <option value="all">هەموو کۆمپانیاکان</option>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Table */}
      {filteredList.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Archive className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            هیچ دۆسیەیەکی ئەرشیف بەردەست نییە
          </h3>
          <p className="text-xs text-slate-400">
            سیڤیە حجزکراوەکان لە بەشی «حجزکراوەکان» کلیکی «پێشکەشکردن و ئەرشیف» بکە بۆ گواستنەوەیان بۆ ئێرە.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-3">کرێکار</th>
                  <th className="py-3 px-3">داواکار (کڕیار)</th>
                  <th className="py-3 px-3">بەرواری پێشکەشکردن</th>
                  <th className="py-3 px-3">بەرواری پەنجەمۆر</th>
                  <th className="py-3 px-3">کاری هەولێر</th>
                  <th className="py-3 px-3">گشتی کار</th>
                  <th className="py-3 px-3">دەستەبەری کۆمەڵایەتی</th>
                  <th className="py-3 px-3">وەزارەتی کار</th>
                  <th className="py-3 px-3 text-center no-print">کردارەکان (دەستکاری / سڕینەوە)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredList.map((w) => {
                  const arch = w.archiveData;
                  const res = w.reservation;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      
                      {/* Worker */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {w.photoUrl ? (
                            <img src={w.photoUrl} alt={w.fullName} className="w-8 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs flex-shrink-0">
                              {w.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{w.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{w.passportNumber} ({w.nationality})</div>
                          </div>
                        </div>
                      </td>

                      {/* Requester */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{res?.customerFullName || 'نادیار'}</div>
                        <div className="text-[10px] text-emerald-600 font-mono" dir="ltr">{res?.customerPhone}</div>
                      </td>

                      {/* Submission Date */}
                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {arch?.submissionDate || 'دیاری نەکراوە'}
                      </td>

                      {/* Fingerprint Date */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {arch?.fingerprintDate || 'دیاری نەکراوە'}
                        </span>
                      </td>

                      {/* Erbil Labor Letter */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {arch?.erbilLaborDept?.letterNumber || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400">{arch?.erbilLaborDept?.letterDate}</div>
                        {arch?.erbilLaborDept?.documentPhotoUrl && (
                          <button
                            onClick={() => setPreviewDoc({ url: arch.erbilLaborDept.documentPhotoUrl!, title: `نوسراوی کاری هەولێر: ${w.fullName}` })}
                            className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <Eye className="w-3 h-3" />
                            <span>بینینی نوسراو</span>
                          </button>
                        )}
                      </td>

                      {/* General Labor Letter */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {arch?.generalLaborDept?.letterNumber || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400">{arch?.generalLaborDept?.letterDate}</div>
                        {arch?.generalLaborDept?.documentPhotoUrl && (
                          <button
                            onClick={() => setPreviewDoc({ url: arch.generalLaborDept.documentPhotoUrl!, title: `نوسراوی گشتی کار: ${w.fullName}` })}
                            className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <Eye className="w-3 h-3" />
                            <span>بینینی نوسراو</span>
                          </button>
                        )}
                      </td>

                      {/* Social Security Letter */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {arch?.socialSecurityDept?.letterNumber || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400">{arch?.socialSecurityDept?.letterDate}</div>
                        {arch?.socialSecurityDept?.documentPhotoUrl && (
                          <button
                            onClick={() => setPreviewDoc({ url: arch.socialSecurityDept.documentPhotoUrl!, title: `دەستەبەری کۆمەڵایەتی: ${w.fullName}` })}
                            className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <Eye className="w-3 h-3" />
                            <span>بینینی نوسراو</span>
                          </button>
                        )}
                      </td>

                      {/* Ministry of Labor Letter */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {arch?.ministryOfLabor?.letterNumber || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400">{arch?.ministryOfLabor?.letterDate}</div>
                        {arch?.ministryOfLabor?.documentPhotoUrl && (
                          <button
                            onClick={() => setPreviewDoc({ url: arch.ministryOfLabor.documentPhotoUrl!, title: `نوسراوی وەزارەتی کار: ${w.fullName}` })}
                            className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <Eye className="w-3 h-3" />
                            <span>بینینی نوسراو</span>
                          </button>
                        )}
                      </td>

                      {/* Actions: Edit Letters & Delete Permanently */}
                      <td className="py-3 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedWorkerForEdit(w)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1"
                            title="دەستکاری نوسراوەکان"
                          >
                            <Edit className="w-3.5 h-3.5 text-emerald-600" />
                            <span>دەستکاری</span>
                          </button>

                          <button
                            onClick={() => setWorkerToDelete(w)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1 border border-rose-200/60 dark:border-rose-900/60"
                            title="سڕینەوەی ئەم تۆمارە لە ئەرشیف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>سڕینەوە</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Archive Record */}
      {workerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white text-center mb-2">
              سڕینەوەی ئەم تۆمارە لە ئەرشیف
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center mb-6">
              ئایا دڵنیایت لە سڕینەوەی یەکجاری تۆماری کرێکار <span className="font-bold text-slate-900 dark:text-white">({workerToDelete.fullName})</span> بە پاسەپۆرتی <span className="font-mono font-bold text-slate-900 dark:text-white">({workerToDelete.passportNumber})</span> لە ئەرشیف؟<br/>
              سەرجەم نوسراوەکان و زانیارییەکانی دەسڕێنەوە و چیتر ناگەڕێتەوە ناو لیستەکەت.
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

      {/* Edit Archive & Letters Modal */}
      {selectedWorkerForEdit && (
        <EditArchiveModal
          worker={selectedWorkerForEdit}
          onClose={() => setSelectedWorkerForEdit(null)}
          onDelete={() => {
            const target = selectedWorkerForEdit;
            setSelectedWorkerForEdit(null);
            setWorkerToDelete(target);
          }}
          onSave={(updatedData) => {
            onUpdateArchiveData(selectedWorkerForEdit.id, updatedData);
            setSelectedWorkerForEdit(null);
          }}
        />
      )}

      {/* Document Lightbox */}
      {previewDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{previewDoc.title}</h4>
              <button onClick={() => setPreviewDoc(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              {previewDoc?.url ? (
                <img src={previewDoc.url} alt="Document" className="max-h-[75vh] w-auto object-contain rounded-xl" />
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-component: Edit Archive Modal
const EditArchiveModal: React.FC<{
  worker: Worker;
  onClose: () => void;
  onDelete?: () => void;
  onSave: (data: ArchiveRecordData) => void;
}> = ({ worker, onClose, onDelete, onSave }) => {
  const existing = worker.archiveData;

  const [submissionDate, setSubmissionDate] = useState(existing?.submissionDate || new Date().toISOString().split('T')[0]);
  const [fingerprintDate, setFingerprintDate] = useState(existing?.fingerprintDate || '');
  const [status, setStatus] = useState(existing?.status || 'لە پرۆسەدایە');
  const [finalNotes, setFinalNotes] = useState(existing?.finalNotes || '');

  // 4 Letters
  const [erbilLaborLetterNum, setErbilLaborLetterNum] = useState(existing?.erbilLaborDept?.letterNumber || '');
  const [erbilLaborLetterDate, setErbilLaborLetterDate] = useState(existing?.erbilLaborDept?.letterDate || '');
  const [erbilLaborDocUrl, setErbilLaborDocUrl] = useState(existing?.erbilLaborDept?.documentPhotoUrl || '');

  const [generalLaborLetterNum, setGeneralLaborLetterNum] = useState(existing?.generalLaborDept?.letterNumber || '');
  const [generalLaborLetterDate, setGeneralLaborLetterDate] = useState(existing?.generalLaborDept?.letterDate || '');
  const [generalLaborDocUrl, setGeneralLaborDocUrl] = useState(existing?.generalLaborDept?.documentPhotoUrl || '');

  const [socialSecurityLetterNum, setSocialSecurityLetterNum] = useState(existing?.socialSecurityDept?.letterNumber || '');
  const [socialSecurityLetterDate, setSocialSecurityLetterDate] = useState(existing?.socialSecurityDept?.letterDate || '');
  const [socialSecurityDocUrl, setSocialSecurityDocUrl] = useState(existing?.socialSecurityDept?.documentPhotoUrl || '');

  const [ministryLetterNum, setMinistryLetterNum] = useState(existing?.ministryOfLabor?.letterNumber || '');
  const [ministryLetterDate, setMinistryLetterDate] = useState(existing?.ministryOfLabor?.letterDate || '');
  const [ministryDocUrl, setMinistryDocUrl] = useState(existing?.ministryOfLabor?.documentPhotoUrl || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setter(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: ArchiveRecordData = {
      submissionDate,
      fingerprintDate,
      status: status as any,
      finalNotes,
      archivedAt: existing?.archivedAt || new Date().toISOString(),
      erbilLaborDept: {
        letterNumber: erbilLaborLetterNum,
        letterDate: erbilLaborLetterDate,
        documentPhotoUrl: erbilLaborDocUrl,
      },
      generalLaborDept: {
        letterNumber: generalLaborLetterNum,
        letterDate: generalLaborLetterDate,
        documentPhotoUrl: generalLaborDocUrl,
      },
      socialSecurityDept: {
        letterNumber: socialSecurityLetterNum,
        letterDate: socialSecurityLetterDate,
        documentPhotoUrl: socialSecurityDocUrl,
      },
      ministryOfLabor: {
        letterNumber: ministryLetterNum,
        letterDate: ministryLetterDate,
        documentPhotoUrl: ministryDocUrl,
      },
    };
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-auto">
        
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              دەستکاری نوسراوەکانی حکومی و پەنجەمۆر ({worker.fullName})
            </h3>
            <p className="text-xs text-slate-500">
              تۆمارکردنی ژمارە و بەرواری نوسراوەکان لەگەڵ ئەپڵۆدی دۆکیومێنتەکان
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Main Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold mb-1">بەرواری پێشکەشکردن *</label>
              <input
                type="date"
                required
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">بەرواری پەنجەمۆر *</label>
              <input
                type="date"
                value={fingerprintDate}
                onChange={(e) => setFingerprintDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">دۆخی مامەڵە</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="لە پرۆسەدایە">لە پرۆسەدایە</option>
                <option value="تەواوبوو">تەواوبوو</option>
                <option value="ڕەتکرایەوە">ڕەتکرایەوە</option>
              </select>
            </div>
          </div>

          {/* 4 Government Letters */}
          <div className="space-y-4">
            
            {/* 1. بەڕێوەبەرایەتی کار هەولێر */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                ١. نوسراوی بەڕێوەبەرایەتی کار هەولێر (Erbil Labor Directorate)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="ژمارەی نوسراو (نموونە: ک/١٠٩٤٢)"
                  value={erbilLaborLetterNum}
                  onChange={(e) => setErbilLaborLetterNum(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs"
                />
                <input
                  type="date"
                  value={erbilLaborLetterDate}
                  onChange={(e) => setErbilLaborLetterDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs"
                />
                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{erbilLaborDocUrl ? 'وێنەی نوسراو هەڵبژێردراوە' : 'ئەپڵۆدی نوسراو (وێنە/PDF)'}</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, setErbilLaborDocUrl)} />
                </label>
              </div>
            </div>

            {/* 2. بەڕێوەبەرایەتی گشتی کار */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                ٢. نوسراوی بەڕێوەبەرایەتی گشتی کار (General Directorate of Labor)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="ژمارەی نوسراو"
                  value={generalLaborLetterNum}
                  onChange={(e) => setGeneralLaborLetterNum(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs"
                />
                <input
                  type="date"
                  value={generalLaborLetterDate}
                  onChange={(e) => setGeneralLaborLetterDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs"
                />
                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{generalLaborDocUrl ? 'وێنەی نوسراو هەڵبژێردراوە' : 'ئەپڵۆدی نوسراو'}</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, setGeneralLaborDocUrl)} />
                </label>
              </div>
            </div>

            {/* 3. دەستەبەری کۆمەڵایەتی */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                ٣. نوسراوی دەستەبەری کۆمەڵایەتی (Social Security)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="ژمارەی نوسراو"
                  value={socialSecurityLetterNum}
                  onChange={(e) => setSocialSecurityLetterNum(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs"
                />
                <input
                  type="date"
                  value={socialSecurityLetterDate}
                  onChange={(e) => setSocialSecurityLetterDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs"
                />
                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{socialSecurityDocUrl ? 'وێنەی نوسراو هەڵبژێردراوە' : 'ئەپڵۆدی نوسراو'}</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, setSocialSecurityDocUrl)} />
                </label>
              </div>
            </div>

            {/* 4. وەزارەتی کار */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                ٤. نوسراوی وەزارەتی کار و کاروباری کۆمەڵایەتی (Ministry of Labor)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="ژمارەی نوسراو"
                  value={ministryLetterNum}
                  onChange={(e) => setMinistryLetterNum(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs"
                />
                <input
                  type="date"
                  value={ministryLetterDate}
                  onChange={(e) => setMinistryLetterDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs"
                />
                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{ministryDocUrl ? 'وێنەی نوسراو هەڵبژێردراوە' : 'ئەپڵۆدی نوسراو'}</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, setMinistryDocUrl)} />
                </label>
              </div>
            </div>

          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold mb-1">تێبینی کۆتایی ئەرشیف</label>
            <textarea
              rows={2}
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
              placeholder="تێبینی دەربارەی نوسراوەکان و پەنجەمۆر..."
            />
          </div>

          <div className="pt-3 border-t flex items-center justify-between gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>سڕینەوە لە ئەرشیف</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                پاشگەزبوونەوە
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                پاشەکەوتکردنی هەموو نوسراوەکان
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
