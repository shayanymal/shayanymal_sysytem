import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Upload, 
  Eye, 
  Archive, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileText, 
  Calendar, 
  User, 
  Search 
} from 'lucide-react';
import { UserAccount, VisaRecordData, Worker } from '../types';

interface VisaSectionProps {
  workers: Worker[];
  currentUser: UserAccount;
  onSaveVisa: (workerId: string, visaData: VisaRecordData, moveToArchive: boolean) => void;
}

export const VisaSection: React.FC<VisaSectionProps> = ({
  workers,
  currentUser,
  onSaveVisa,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [visaNumber, setVisaNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [visaDocumentUrl, setVisaDocumentUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [moveToArchive, setMoveToArchive] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Workers that already have visas
  const workersWithVisas = workers.filter((w) => w.visaData);

  const defaultVisaSample = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&h=400&fit=crop&q=80';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setVisaDocumentUrl(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = (workerId?: string) => {
    setSelectedWorkerId(workerId || (workers[0] ? workers[0].id : ''));
    setVisaNumber(`VISA-IQ-${Math.floor(100000 + Math.random() * 900000)}`);
    setIssueDate(new Date().toISOString().split('T')[0]);
    // 1 year visa expiry
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 1);
    setExpiryDate(exp.toISOString().split('T')[0]);
    setVisaDocumentUrl(defaultVisaSample);
    setNotes('');
    setMoveToArchive(true);
    setShowAddModal(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) return;

    const visaData: VisaRecordData = {
      visaNumber: visaNumber.trim(),
      issueDate,
      expiryDate,
      visaDocumentUrl: visaDocumentUrl || defaultVisaSample,
      notes: notes.trim(),
      status: 'دەرچوو',
      archivedToWorker: moveToArchive,
    };

    onSaveVisa(selectedWorkerId, visaData, moveToArchive);
    setShowAddModal(false);
  };

  const filteredVisas = workersWithVisas.filter((w) => {
    const q = searchTerm.toLowerCase();
    return (
      w.fullName.toLowerCase().includes(q) ||
      w.passportNumber.toLowerCase().includes(q) ||
      (w.visaData?.visaNumber && w.visaData.visaNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>بەشی ڤیزاکان</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            بەڕێوەبردن و ئەپڵۆدی ڤیزای دەرچووی کرێکاران
          </h2>
          <p className="text-xs text-teal-100 mt-1 max-w-xl">
            ئەو ڤیزانەی کە دەردەچن لێرە تۆمار دەکرێن و ئەپڵۆد دەکرێن، لەگەڵ هەڵبژاردەی گواستنەوەی ڕاستەوخۆ بۆ ناو فایلی ئەرشیفی هەمیشەیی کرێکار.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>تۆمارکردنی ڤیزای نوێ</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="گەڕان بەپێی ناوی کرێکار، پاسەپۆرت، ژمارەی ڤیزا..."
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
          />
          <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          کۆی ڤیزاکان: {workersWithVisas.length}
        </span>
      </div>

      {/* Visa Cards Grid */}
      {filteredVisas.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <CreditCard className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            هیچ ڤیزایەک تۆمار نەکراوە
          </h3>
          <p className="text-xs text-slate-400">
            کلیکی «تۆمارکردنی ڤیزای نوێ» بکە بۆ ئەپڵۆدی ڤیزای کرێکارە وەرگیراوەکان.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVisas.map((w) => {
            const v = w.visaData!;
            return (
              <div
                key={w.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition overflow-hidden p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{v.status || 'ڤیزا دەرچوو'}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      کۆد: {w.passportNumber}
                    </span>
                  </div>

                  {/* Worker row */}
                  <div className="flex items-center gap-3">
                    {w.photoUrl ? (
                      <img
                        src={w.photoUrl}
                        alt={w.fullName}
                        className="w-12 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold flex-shrink-0">
                        {w.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {w.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-400">{w.nationality} • {w.companyName}</p>
                      <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        ژمارەی ڤیزا: {v.visaNumber}
                      </div>
                    </div>
                  </div>

                  {/* Visa details */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">بەرواری دەرچوون:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{v.issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">بەرواری بەسەرچوون:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{v.expiryDate}</span>
                    </div>
                    {v.notes && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                        {v.notes}
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {v.visaDocumentUrl && (
                    <button
                      onClick={() => setPreviewDoc({ url: v.visaDocumentUrl!, title: `دۆکیومێنتی ڤیزا: ${w.fullName}` })}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>بینینی وێنەی ڤیزا</span>
                    </button>
                  )}

                  {w.status !== 'archived' && (
                    <button
                      onClick={() => onSaveVisa(w.id, v, true)}
                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                      title="گواستنەوە بۆ ئەرشیف بە تەواوی"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>ئەرشیفکردن</span>
                    </button>
                  )}

                  {w.status === 'archived' && (
                    <span className="text-[10px] text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      لە ئەرشیفە
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Visa Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-auto">
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>تۆمارکردن و ئەپڵۆدی ڤیزای دەرچوو</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Select Worker */}
              <div>
                <label className="block text-xs font-bold mb-1">هەڵبژاردنی کرێکار *</label>
                <select
                  required
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.fullName} ({w.passportNumber} - {w.nationality})
                    </option>
                  ))}
                </select>
              </div>

              {/* Visa Number */}
              <div>
                <label className="block text-xs font-bold mb-1">ژمارەی ڤیزا (Visa Number) *</label>
                <input
                  type="text"
                  required
                  value={visaNumber}
                  onChange={(e) => setVisaNumber(e.target.value)}
                  placeholder="VISA-IQ-123456"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              {/* Issue & Expiry Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">بەرواری دەرچوون *</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">بەرواری بەسەرچوون *</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Upload Visa Document */}
              <div>
                <label className="block text-xs font-bold mb-1">ئەپڵۆدی وێنە یان پی دی ئێفی ڤیزا *</label>
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                  <div className="w-16 h-12 rounded-xl overflow-hidden border bg-slate-200 flex-shrink-0">
                    {(visaDocumentUrl || defaultVisaSample) ? (
                      <img src={visaDocumentUrl || defaultVisaSample} alt="Visa" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ئەپڵۆدی فایل</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold mb-1">تێبینی</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="تێبینی دەربارەی ڤیزاکە..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              {/* Auto archive checkbox */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="autoArchive"
                  checked={moveToArchive}
                  onChange={(e) => setMoveToArchive(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600"
                />
                <label htmlFor="autoArchive" className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  گواستنەوەی ڕاستەوخۆ بۆ بەشی ئەرشیف (کە ئەرشیف کرا لە هیچ کام لە بەشەکان نەمێنێت).
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  پاشەکەوتکردن
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Lightbox */}
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
