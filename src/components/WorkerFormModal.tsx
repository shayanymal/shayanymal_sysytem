import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  User, 
  FileText, 
  Calendar, 
  Globe, 
  Building, 
  CreditCard, 
  AlertTriangle, 
  Check, 
  Image as ImageIcon,
  Camera,
  Plus
} from 'lucide-react';
import { PassportType, ReceivedFrom, Worker } from '../types';
import { calculateAge, getPassportRemainingDays, translateKurdishToEnglish } from '../utils/translation';

interface WorkerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workerData: Partial<Worker>) => void;
  workerToEdit?: Worker | null;
}

const DEFAULT_NATIONALITY_PRESETS = [
  'فیلیپینی',
  'ئەندەنوسی',
  'ئیتیۆپی',
  'نیپاڵی',
  'هیندی',
  'کینی',
  'ئووگاندی',
  'سریلانکی',
  'بەنگلادیشی',
  'غانی',
  'مەغریبی',
  'تونسی',
  'میسری',
  'ڕواندی',
  'تانزانی',
  'ئۆزبەکی',
  'تایلەندی',
  'ڤێتنامی',
  'کۆڵۆمبی',
];

const RECEIVED_FROM_PRESETS: ReceivedFrom[] = [
  'بەڕێوەبەر',
  'کارمەند',
  'شۆفێر',
  'ماڵەکە',
];

const COMPANY_PRESETS = [
  'شایانی ماڵ',
  'نجوم للتنظيف',
];

export const WorkerFormModal: React.FC<WorkerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  workerToEdit,
}) => {
  // Customizable country list with localStorage persistence
  const [countriesList, setCountriesList] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('system_custom_countries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...DEFAULT_NATIONALITY_PRESETS, ...parsed]));
        }
      }
    } catch {}
    return DEFAULT_NATIONALITY_PRESETS;
  });

  const [fullName, setFullName] = useState('');
  const [enFullName, setEnFullName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('فیلیپینی');
  const [enNationality, setEnNationality] = useState('Filipino');
  const [isCustomCountryMode, setIsCustomCountryMode] = useState(false);
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryEnName, setNewCountryEnName] = useState('');
  const [gender, setGender] = useState<'مێ' | 'نێر'>('مێ');
  const [birthDate, setBirthDate] = useState('1996-01-01');
  const [passportExpiryDate, setPassportExpiryDate] = useState('2029-01-01');
  const [sponsorName, setSponsorName] = useState('');
  const [receivedFrom, setReceivedFrom] = useState<ReceivedFrom>('بەڕێوەبەر');
  const [customReceivedFrom, setCustomReceivedFrom] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [passportType, setPassportType] = useState<PassportType>('یەکێک لە کۆمپانیاکان');
  const [companyName, setCompanyName] = useState('شایانی ماڵ');
  const [photoUrl, setPhotoUrl] = useState('');
  const [passportPhotoUrl, setPassportPhotoUrl] = useState('');

  // Sample quick avatar presets
  const samplePhotos = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&crop=faces&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=faces&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=faces&q=80',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=500&fit=crop&crop=faces&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&crop=faces&q=80',
  ];

  const defaultPassportSample = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&h=400&fit=crop&q=80';

  // Add new country helper
  const handleAddNewCountry = (countryToAdd: string, enCountryToAdd?: string) => {
    const trimmed = countryToAdd.trim();
    if (!trimmed) return;
    if (!countriesList.includes(trimmed)) {
      const updated = [...countriesList, trimmed];
      setCountriesList(updated);
      try {
        localStorage.setItem('system_custom_countries', JSON.stringify(updated));
      } catch {}
    }
    setNationality(trimmed);
    setEnNationality(enCountryToAdd?.trim() || translateKurdishToEnglish(trimmed));
    setNewCountryName('');
    setNewCountryEnName('');
    setShowAddCountryModal(false);
    setIsCustomCountryMode(false);
  };

  useEffect(() => {
    if (workerToEdit) {
      setFullName(workerToEdit.fullName || '');
      setEnFullName(workerToEdit.enFullName || '');
      setPassportNumber(workerToEdit.passportNumber || '');
      const editNat = workerToEdit.nationality || 'فیلیپینی';
      setNationality(editNat);
      setEnNationality(workerToEdit.enNationality || translateKurdishToEnglish(editNat));
      if (!countriesList.includes(editNat)) {
        setCountriesList((prev) => [...prev, editNat]);
      }
      setGender(workerToEdit.gender || 'مێ');
      setBirthDate(workerToEdit.birthDate || '1996-01-01');
      setPassportExpiryDate(workerToEdit.passportExpiryDate || '2029-01-01');
      setSponsorName(workerToEdit.sponsorName || '');
      setReceivedDate(workerToEdit.receivedDate || new Date().toISOString().split('T')[0]);
      setPassportType(workerToEdit.passportType || 'یەکێک لە کۆمپانیاکان');
      setCompanyName(workerToEdit.companyName || 'شایانی ماڵ');
      setPhotoUrl(workerToEdit.photoUrl || '');
      setPassportPhotoUrl(workerToEdit.passportPhotoUrl || '');

      if (RECEIVED_FROM_PRESETS.includes(workerToEdit.receivedFrom as any)) {
        setReceivedFrom(workerToEdit.receivedFrom);
      } else {
        setReceivedFrom('تر');
        setCustomReceivedFrom(workerToEdit.receivedFrom || '');
      }
    } else {
      // New worker defaults
      setFullName('');
      setEnFullName('');
      setPassportNumber('');
      setNationality('فیلیپینی');
      setEnNationality('Filipino');
      setIsCustomCountryMode(false);
      setGender('مێ');
      setBirthDate('1996-01-01');
      setPassportExpiryDate('2029-01-01');
      setSponsorName('');
      setReceivedFrom('بەڕێوەبەر');
      setCustomReceivedFrom('');
      setReceivedDate(new Date().toISOString().split('T')[0]);
      setPassportType('یەکێک لە کۆمپانیاکان');
      setCompanyName('شایانی ماڵ');
      setPhotoUrl(samplePhotos[0]);
      setPassportPhotoUrl(defaultPassportSample);
    }
  }, [workerToEdit, isOpen]);

  if (!isOpen) return null;

  const currentAge = calculateAge(birthDate);
  const passportDaysLeft = getPassportRemainingDays(passportExpiryDate);

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

    const finalReceivedFrom = receivedFrom === 'تر' ? customReceivedFrom.trim() || 'دەستنووس' : receivedFrom;
    const trimmedNationality = nationality.trim() || 'فیلیپینی';

    // Auto-save new country to the system's country list if not present
    if (trimmedNationality && !countriesList.includes(trimmedNationality)) {
      const updated = [...countriesList, trimmedNationality];
      setCountriesList(updated);
      try {
        localStorage.setItem('system_custom_countries', JSON.stringify(updated));
      } catch {}
    }

    const workerData: Partial<Worker> = {
      fullName: fullName.trim(),
      enFullName: enFullName.trim() || fullName.trim(),
      passportNumber: passportNumber.trim().toUpperCase(),
      nationality: trimmedNationality,
      enNationality: enNationality.trim() || translateKurdishToEnglish(trimmedNationality),
      gender,
      enGender: gender === 'مێ' ? 'Female' : 'Male',
      birthDate,
      passportExpiryDate,
      sponsorName: sponsorName.trim(),
      receivedFrom: finalReceivedFrom,
      receivedDate,
      passportType,
      companyName,
      photoUrl: photoUrl || samplePhotos[0],
      passportPhotoUrl: passportPhotoUrl || defaultPassportSample,
    };

    onSave(workerData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {workerToEdit ? 'دەستکاری کردنی زانیاریەکانی کرێکار' : 'زیادکردنی کرێکاری نوێ'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                پڕکردنەوەی هەموو وردەکارییەکانی پاسەپۆرت و کۆمپانیا بەپێی یاسا
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* Section: Worker Photo & Passport Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            {/* L. وێنەی کرێکارەکە */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>L. وێنەی کرێکارەکە (Photo)</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-emerald-500/40 bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                  {photoUrl && photoUrl.trim() ? (
                    <img src={photoUrl} alt="Worker preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">وێنە</div>
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ئەپڵۆدی وێنە لە ئامێرەکەت</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setPhotoUrl)}
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">یان هەڵبژاردنی وێنەی نموونەیی:</p>
                  <div className="flex gap-1.5">
                    {samplePhotos.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Sample ${i}`}
                        onClick={() => setPhotoUrl(url)}
                        className={`w-7 h-7 rounded-lg object-cover cursor-pointer border ${
                          photoUrl === url ? 'border-emerald-500 ring-2 ring-emerald-400' : 'border-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* M. وێنەیەک لە پاسەپۆرت */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>M. وێنەی پاسەپۆرتی کرێکار (Passport Scan)</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-16 rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                  {passportPhotoUrl && passportPhotoUrl.trim() ? (
                    <img src={passportPhotoUrl} alt="Passport preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">پاسەپۆرت</div>
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-semibold transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ئەپڵۆدی کۆپی پاسەپۆرت</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setPassportPhotoUrl)}
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">کۆپی سکان یان وێنەی ڕوونی پاسەپۆرت</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Basic Identity (A, B, C, D) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* A. ناوی تەواوی کرێکار */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                A. ناوی تەواوی کرێکار (Full Name) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ناوی تەواو بە کوردی بنووسە..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* English Name for CV Translation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ناوی تەواو بە ئینگلیزی (English Name on Passport)
              </label>
              <input
                type="text"
                value={enFullName}
                onChange={(e) => setEnFullName(e.target.value)}
                placeholder="وەک لە پاسەپۆرت هاتووە (e.g. Maria Santos)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* B. ژمارەی پاسەپۆرت */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                B. ژمارەی پاسەپۆرت (Passport Number) *
              </label>
              <input
                type="text"
                required
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                placeholder="نموونە: P8923411A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm uppercase tracking-wider font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* C. رەگەزنامە و وڵات */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  C. ڕەگەزنامە و وڵاتی کرێکار (Nationality / Country) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomCountryMode(!isCustomCountryMode)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    {isCustomCountryMode ? (
                      <span>📋 هەڵبژاردن لە لیست</span>
                    ) : (
                      <span>✍️ نووسینی ناوی وڵات</span>
                    )}
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={() => setShowAddCountryModal(true)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>زیادکردنی وڵات بۆ لیست</span>
                  </button>
                </div>
              </div>

              {/* Free-form Typing Mode OR Dropdown Selection */}
              {isCustomCountryMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      required
                      value={nationality}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNationality(val);
                        setEnNationality(translateKurdishToEnglish(val));
                      }}
                      placeholder="ناوی وڵات یان ڕەگەزنامە بە کوردی (وەک: مەغریب، ڕواندا، تونس...)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={enNationality}
                      onChange={(e) => setEnNationality(e.target.value)}
                      placeholder="ناوی ئینگلیزی (e.g. Moroccan, Rwandan)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={nationality}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__ADD_NEW__') {
                        setIsCustomCountryMode(true);
                        setNationality('');
                        setEnNationality('');
                      } else {
                        setNationality(val);
                        setEnNationality(translateKurdishToEnglish(val));
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                  >
                    {countriesList.map((nat) => (
                      <option key={nat} value={nat}>
                        {nat} ({translateKurdishToEnglish(nat)})
                      </option>
                    ))}
                    <option value="__ADD_NEW__">✍️ نووسینی وڵاتێکی تر بە دەستی خۆت...</option>
                  </select>
                </div>
              )}

              {/* Add New Country Modal / Drawer */}
              {showAddCountryModal && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      زیادکردنی وڵاتی نوێ بۆ لیستی سیستەم
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddCountryModal(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newCountryName}
                      onChange={(e) => {
                        setNewCountryName(e.target.value);
                        setNewCountryEnName(translateKurdishToEnglish(e.target.value));
                      }}
                      placeholder="ناوی وڵات بە کوردی (نموونە: کۆلۆمبیا، مەغریب)"
                      className="px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-800 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newCountryEnName}
                      onChange={(e) => setNewCountryEnName(e.target.value)}
                      placeholder="ناوی ئینگلیزی (e.g. Colombian, Moroccan)"
                      className="px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-800 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCountryModal(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      پاشگەزبوونەوە
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddNewCountry(newCountryName, newCountryEnName)}
                      disabled={!newCountryName.trim()}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                    >
                      زیادکردن و هەڵبژاردن
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Preset Chips for instant one-click selection */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold ml-1">هەڵبژاردنی خێرا:</span>
                {countriesList.slice(0, 10).map((nat) => (
                  <button
                    key={nat}
                    type="button"
                    onClick={() => {
                      setNationality(nat);
                      setEnNationality(translateKurdishToEnglish(nat));
                      setIsCustomCountryMode(false);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition ${
                      nationality === nat
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {nat}
                  </button>
                ))}
              </div>
            </div>

            {/* D. رەگەز - Default Female with Kurdish requirement note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                D. رەگەز (Gender) * <span className="text-emerald-600 font-normal">(هەمیشە مێ بنوسرێت)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('مێ')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    gender === 'مێ'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>مێ (Female)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('نێر')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    gender === 'نێر'
                      ? 'bg-slate-200 dark:bg-slate-700 border-slate-400 text-slate-900 dark:text-white'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <span>نێر (Male)</span>
                </button>
              </div>
            </div>

            {/* E. بەرواری لەدایک بوونی کرێکار + Age validation (>45 warning) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  E. بەرواری لەدایک بوون (Date of Birth) *
                </label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  currentAge > 45 
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  تەمەن: {currentAge} ساڵ
                </span>
              </div>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {currentAge > 45 && (
                <div className="mt-1.5 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 text-[11px] text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>ئاگاداری: تەمەنی ئەم کرێکارە لە ٤٥ ساڵ گەورەترە ({currentAge} ساڵ).</span>
                </div>
              )}
            </div>

          </div>

          {/* Section: Dates, Sponsor, Origin, Companies (F, G, H, I, J, K) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            
            {/* F. بەرواری بەسەرچوونی پاسەپۆرت */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  F. بەرواری بەسەرچوونی پاسەپۆرت *
                </label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  passportDaysLeft <= 0
                    ? 'bg-rose-600 text-white'
                    : passportDaysLeft < 180
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {passportDaysLeft <= 0 ? 'بەسەرچووە!' : `${passportDaysLeft} ڕۆژی ماوە`}
                </span>
              </div>
              <input
                type="date"
                required
                value={passportExpiryDate}
                onChange={(e) => setPassportExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {passportDaysLeft <= 180 && (
                <div className="mt-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>ئاگاداری: پاسەپۆرت کەمتر لە ٦ مانگی ماوە بۆ بەسەرچوون!</span>
                </div>
              )}
            </div>

            {/* G. ناوی سپۆنسەر */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                G. ناوی سپۆنسەر (Sponsor Name) *
              </label>
              <input
                type="text"
                required
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="ناوی کەس یان سپۆنسەر..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* H. سیڤی وەرگیرا لە (بەڕێوەبەر-کارمەند – شۆفێر – ماڵەکە یان خۆمان شتێک دەنووسین) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                H. سیڤی وەرگیرا لە *
              </label>
              <select
                value={receivedFrom}
                onChange={(e) => setReceivedFrom(e.target.value as ReceivedFrom)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-2"
              >
                {RECEIVED_FROM_PRESETS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
                <option value="تر">خۆمان شتێک دەنوسین (دەستنووس)...</option>
              </select>

              {receivedFrom === 'تر' && (
                <input
                  type="text"
                  required
                  value={customReceivedFrom}
                  onChange={(e) => setCustomReceivedFrom(e.target.value)}
                  placeholder="ناوی سەرچاوە یان کەسەکە بنووسە..."
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-slate-900 dark:text-white text-sm focus:outline-none"
                />
              )}
            </div>

            {/* I. بەرواری وەرگرتنی سیڤیەکە */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                I. بەرواری وەرگرتنی سیڤیەکە *
              </label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* J. جۆری پاسەپۆرتەکە چیە (یەکێک لە کۆمپانیاکان یان z) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                J. جۆری پاسەپۆرتەکە چیە؟ *
              </label>
              <select
                value={passportType}
                onChange={(e) => setPassportType(e.target.value as PassportType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="یەکێک لە کۆمپانیاکان">یەکێک لە کۆمپانیاکان</option>
                <option value="z">جۆری z</option>
                <option value="ئاسایی">ئاسایی</option>
                <option value="تایبەت">تایبەت</option>
              </select>
            </div>

            {/* K. ناوی کۆمپانیا (شایانی ماڵ – یان نجوم للتنظيف) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                K. ناوی کۆمپانیا *
              </label>
              <select
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {COMPANY_PRESETS.map((comp) => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
                <option value="کۆمپانیای تر">کۆمپانیای تر...</option>
              </select>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{workerToEdit ? 'پاشەکەوتکردنی گۆڕانکارییەکان' : 'تۆمارکردنی کرێکار'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
