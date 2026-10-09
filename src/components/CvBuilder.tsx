import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas-pro';
import { 
  Printer, 
  Download, 
  Save, 
  Eye, 
  Languages, 
  Plus, 
  Trash2, 
  Sparkles, 
  QrCode as QrIcon, 
  Check, 
  Building2, 
  Phone, 
  MapPin, 
  User, 
  Scale, 
  Ruler, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Calendar,
  BookmarkCheck,
  ChevronDown,
  Upload,
  Image,
  Edit2,
  Sliders,
  Type,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  Layers,
  X
} from 'lucide-react';
import { CompanyProfile, LanguageSkill, PriorExperience, Worker, WorkerCvDetails, CvCustomSettings } from '../types';
import { calculateAge, getPassportRemainingDays, translateKurdishToEnglish } from '../utils/translation';

interface CvBuilderProps {
  workers: Worker[];
  selectedWorker: Worker | null;
  onSelectWorker: (worker: Worker) => void;
  company: CompanyProfile;
  onUpdateCompany?: (company: CompanyProfile) => void;
  onUpdateWorker?: (worker: Worker) => void;
  onSaveCv: (workerId: string, cvDetails: WorkerCvDetails) => void;
  onOpenReservationModal: (worker: Worker) => void;
}

const COMMON_SKILLS_PRESETS = [
  'ماڵ خاوێنکردنەوە',
  'خواردن دروستکردن',
  'بەخێوکردنی مناڵ',
  'چاودێری بەساڵاچووان',
  'جل شوشتن و ئوتوو',
  'دورمان',
  'قاپ شوشتن',
  'باخداری',
];

const EDUCATION_LEVEL_PRESETS = [
  'سەرەتایی',
  'ناوەندی',
  'ئامادەیی',
  'دبلۆم',
  'بەکالۆریۆس',
];

// Bidi-safe parenthesis wrapper that guarantees parentheses never flip or invert in html2canvas / RTL export
const BidiParen: React.FC<{ children: React.ReactNode; dir?: 'ltr' | 'rtl'; className?: string }> = ({ 
  children, 
  dir = 'ltr',
  className = '' 
}) => (
  <span 
    dir={dir} 
    style={{ unicodeBidi: 'isolate', display: 'inline-block' }} 
    className={`font-sans ${className}`}
  >
    ({children})
  </span>
);

export const CvBuilder: React.FC<CvBuilderProps> = ({
  workers,
  selectedWorker,
  onSelectWorker,
  company,
  onUpdateCompany,
  onUpdateWorker,
  onSaveCv,
  onOpenReservationModal,
}) => {
  const currentWorker = selectedWorker || workers[0];

  // Active editor tab in the control panel
  const [activeTab, setActiveTab] = useState<'company' | 'worker' | 'sections' | 'skills' | 'languages' | 'experience' | 'notes'>('company');

  // Company details (fully editable in CV section)
  const [companyName, setCompanyName] = useState<string>(company.name);
  const [companyEnName, setCompanyEnName] = useState<string>(company.enName);
  const [companyActivity, setCompanyActivity] = useState<string>(company.activity);
  const [companyEnActivity, setCompanyEnActivity] = useState<string>(company.enActivity);
  const [companyLogo, setCompanyLogo] = useState<string>(company.logo);
  const [companyPhone1, setCompanyPhone1] = useState<string>(company.phone1);
  const [companyPhone2, setCompanyPhone2] = useState<string>(company.phone2);
  const [companyLicense, setCompanyLicense] = useState<string>(company.licenseNumber);
  const [companyAddress, setCompanyAddress] = useState<string>(company.address);
  const [logoSize, setLogoSize] = useState<number>(75);
  const [qrCodeSize, setQrCodeSize] = useState<number>(88);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);

  // Worker Profile Details (editable inside CV section)
  const [workerFullName, setWorkerFullName] = useState<string>('');
  const [workerEnFullName, setWorkerEnFullName] = useState<string>('');
  const [workerPassportNumber, setWorkerPassportNumber] = useState<string>('');
  const [workerNationality, setWorkerNationality] = useState<string>('');
  const [workerBirthDate, setWorkerBirthDate] = useState<string>('');
  const [workerPassportExpiry, setWorkerPassportExpiry] = useState<string>('');
  const [workerGender, setWorkerGender] = useState<'مێ' | 'نێر'>('مێ');
  const [workerPhoto, setWorkerPhoto] = useState<string>('');
  const [workerAgency, setWorkerAgency] = useState<string>('');

  // CV Banner and Section Headings (fully customizable)
  const [cvBannerTitle, setCvBannerTitle] = useState<string>('سیڤی و زانیاری فەرمی کرێکاری بیانی');
  const [cvBannerEnTitle, setCvBannerEnTitle] = useState<string>('APPLICATION & BIO-DATA FORM');
  const [codePrefix, setCodePrefix] = useState<string>('ژمارەی کۆد: #');
  const [personalInfoTitle, setPersonalInfoTitle] = useState<string>('زانیارییە کەسییەکان / PERSONAL INFORMATION');
  const [languagesTitle, setLanguagesTitle] = useState<string>('شارەزایی زمانەکان / LANGUAGE PROFICIENCY');
  const [skillsTitle, setSkillsTitle] = useState<string>('شارەزایی کارکردنی ناوماڵ / WORK SKILLS & RESPONSIBILITIES');
  const [experienceTitle, setExperienceTitle] = useState<string>('ئەزموونی پێشینە لە وڵاتان / PREVIOUS EMPLOYMENT HISTORY');
  const [notesTitle, setNotesTitle] = useState<string>('تێبینی کۆمپانیا');
  const [stampTitle, setStampTitle] = useState<string>('مۆر و واژۆی فەرمی کۆمپانیا');

  // Physical & Education Specs
  const [weightKg, setWeightKg] = useState<number>(55);
  const [heightCm, setHeightCm] = useState<number>(158);
  const [educationLevel, setEducationLevel] = useState<string>('ئامادەیی');

  // Languages, Skills, Experience
  const [languages, setLanguages] = useState<LanguageSkill[]>([
    { language: 'عەرەبی', enLanguage: 'Arabic', level: 'باش', enLevel: 'Good' },
    { language: 'ئینگلیزی', enLanguage: 'English', level: 'نایاب', enLevel: 'Fluent' },
  ]);
  const [skills, setSkills] = useState<string[]>([
    'ماڵ خاوێنکردنەوە',
    'خواردن دروستکردن',
    'بەخێوکردنی مناڵ',
    'جل شوشتن و ئوتوو',
  ]);
  const [newCustomSkill, setNewCustomSkill] = useState<string>('');
  const [priorExperience, setPriorExperience] = useState<PriorExperience[]>([]);
  const [notes, setNotes] = useState<string>('کەسێکی خاوێن، بەڕێز و پابەندە بە ڕێنماییەکان.');
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [cvLanguageMode, setCvLanguageMode] = useState<'bilingual' | 'english' | 'kurdish'>('bilingual');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const cvPrintRef = useRef<HTMLDivElement>(null);

  // Sync when company prop changes
  useEffect(() => {
    if (company) {
      setCompanyName(company.name);
      setCompanyEnName(company.enName);
      setCompanyActivity(company.activity);
      setCompanyEnActivity(company.enActivity);
      setCompanyLogo(company.logo);
      setCompanyPhone1(company.phone1);
      setCompanyPhone2(company.phone2);
      setCompanyLicense(company.licenseNumber);
      setCompanyAddress(company.address);
    }
  }, [company]);

  // Load selected worker's details and CV details
  useEffect(() => {
    if (currentWorker) {
      setWorkerFullName(currentWorker.fullName || '');
      setWorkerEnFullName(currentWorker.enFullName || '');
      setWorkerPassportNumber(currentWorker.passportNumber || '');
      setWorkerNationality(currentWorker.nationality || 'فیلیپینی');
      setWorkerBirthDate(currentWorker.birthDate || '1995-01-01');
      setWorkerPassportExpiry(currentWorker.passportExpiryDate || '2029-01-01');
      setWorkerGender(currentWorker.gender || 'مێ');
      setWorkerPhoto(currentWorker.photoUrl || '');
      setWorkerAgency(currentWorker.companyName || company.name);

      if (currentWorker.cvDetails) {
        const d = currentWorker.cvDetails;
        setWeightKg(d.weightKg || 55);
        setHeightCm(d.heightCm || 158);
        setEducationLevel(d.educationLevel || 'ئامادەیی');
        setLanguages(d.languages || []);
        setSkills(d.skills || []);
        setPriorExperience(d.priorExperience || []);
        setNotes(d.notes || 'کەسێکی چالاک، بەڕێز و بێ کێشەیە.');

        if (d.customSettings) {
          const c = d.customSettings;
          if (c.cvTitle) setCvBannerTitle(c.cvTitle);
          if (c.cvEnTitle) setCvBannerEnTitle(c.cvEnTitle);
          if (c.codePrefix) setCodePrefix(c.codePrefix);
          if (c.personalInfoTitle) setPersonalInfoTitle(c.personalInfoTitle);
          if (c.languagesTitle) setLanguagesTitle(c.languagesTitle);
          if (c.skillsTitle) setSkillsTitle(c.skillsTitle);
          if (c.experienceTitle) setExperienceTitle(c.experienceTitle);
          if (c.notesTitle) setNotesTitle(c.notesTitle);
          if (c.stampTitle) setStampTitle(c.stampTitle);
          if (c.logoSize) setLogoSize(c.logoSize);
          if (c.qrCodeSize) setQrCodeSize(c.qrCodeSize);
        }
      } else {
        // Defaults
        setWeightKg(55);
        setHeightCm(158);
        setEducationLevel('ئامادەیی');
        setLanguages([
          { language: 'عەرەبی', enLanguage: 'Arabic', level: 'باش', enLevel: 'Good' },
          { language: 'ئینگلیزی', enLanguage: 'English', level: 'زۆر باش', enLevel: 'Very Good' },
        ]);
        setSkills(['ماڵ خاوێنکردنەوە', 'خواردن دروستکردن', 'بەخێوکردنی مناڵ']);
        setPriorExperience([]);
        setNotes('کەسێکی چالاک، بەڕێز و بێ کێشەیە.');
      }

      // Generate clean website URL for direct booking when scanned by phone camera
      const baseUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${window.location.pathname}`
        : 'https://ais-dev-cnzmf32u6uscu2skq4jzlr-310186664537.europe-west2.run.app/';
      
      const cleanBookingUrl = `${baseUrl}?reserve=${encodeURIComponent(currentWorker.id)}`;

      QRCode.toDataURL(cleanBookingUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: '#064e3b',
          light: '#ffffff',
        },
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [currentWorker, company.name]);

  if (!currentWorker) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500">هیچ کرێکارێک لە سیستەم نییە بۆ دروستکردنی سیڤی.</p>
      </div>
    );
  }

  const age = calculateAge(workerBirthDate || currentWorker.birthDate);

  // File Upload Handlers (converts locally uploaded image to base64 data URL)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCompanyLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWorkerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setWorkerPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Skill toggles & custom skill adder
  const handleToggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = newCustomSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewCustomSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Language handlers
  const handleAddLanguage = () => {
    setLanguages([
      ...languages,
      { language: 'کوردی', enLanguage: 'Kurdish', level: 'باش', enLevel: 'Good' },
    ]);
  };

  const handleUpdateLanguage = (index: number, field: keyof LanguageSkill, val: any) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: val };
    if (field === 'language') {
      updated[index].enLanguage = translateKurdishToEnglish(val);
    }
    if (field === 'level') {
      const enLevelMap: Record<string, any> = {
        'نایاب': 'Fluent',
        'زۆر باش': 'Very Good',
        'باش': 'Good',
        'سەرەتایی': 'Fair',
      };
      updated[index].enLevel = enLevelMap[val] || 'Good';
    }
    setLanguages(updated);
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  // Prior Experience handlers
  const handleAddExperience = () => {
    setPriorExperience([
      ...priorExperience,
      {
        id: Date.now().toString(),
        country: 'ئیمارات',
        enCountry: 'UAE',
        duration: '٢ ساڵ',
        enDuration: '2 Years',
        role: 'کاری ناوماڵ',
        enRole: 'Housekeeping',
      },
    ]);
  };

  const handleUpdateExperience = (id: string, field: keyof PriorExperience, val: string) => {
    setPriorExperience(
      priorExperience.map((exp) => {
        if (exp.id === id) {
          const updated = { ...exp, [field]: val };
          if (field === 'country') updated.enCountry = translateKurdishToEnglish(val);
          if (field === 'duration') updated.enDuration = translateKurdishToEnglish(val);
          if (field === 'role') updated.enRole = translateKurdishToEnglish(val);
          return updated;
        }
        return exp;
      })
    );
  };

  const handleRemoveExperience = (id: string) => {
    setPriorExperience(priorExperience.filter((exp) => exp.id !== id));
  };

  // Save everything: Company profile, Worker profile, and CV Details with custom headings
  const handleSaveAll = () => {
    // 1. Update Company if changed
    const updatedCompany: CompanyProfile = {
      ...company,
      name: companyName,
      enName: companyEnName,
      activity: companyActivity,
      enActivity: companyEnActivity,
      logo: companyLogo,
      phone1: companyPhone1,
      phone2: companyPhone2,
      licenseNumber: companyLicense,
      address: companyAddress,
    };
    if (onUpdateCompany) {
      onUpdateCompany(updatedCompany);
    }

    // 2. Update Worker info if changed
    if (onUpdateWorker) {
      onUpdateWorker({
        ...currentWorker,
        fullName: workerFullName,
        enFullName: workerEnFullName,
        passportNumber: workerPassportNumber,
        nationality: workerNationality,
        enNationality: translateKurdishToEnglish(workerNationality),
        birthDate: workerBirthDate,
        passportExpiryDate: workerPassportExpiry,
        gender: workerGender,
        photoUrl: workerPhoto,
        companyName: workerAgency || companyName,
      });
    }

    // 3. Save CV Details & Custom Headings
    const customSettings: CvCustomSettings = {
      cvTitle: cvBannerTitle,
      cvEnTitle: cvBannerEnTitle,
      codePrefix,
      personalInfoTitle,
      languagesTitle,
      skillsTitle,
      experienceTitle,
      notesTitle,
      stampTitle,
      logoSize,
      qrCodeSize,
    };

    const cvDetails: WorkerCvDetails = {
      weightKg,
      heightCm,
      educationLevel,
      enEducationLevel: translateKurdishToEnglish(educationLevel),
      languages,
      skills,
      enSkills: skills.map(translateKurdishToEnglish),
      priorExperience,
      notes,
      enNotes: translateKurdishToEnglish(notes),
      customSettings,
    };

    onSaveCv(currentWorker.id, cvDetails);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Print CV
  const handlePrint = () => {
    window.print();
  };

  // Download CV as PNG image with pristine font rendering & Arabic ligatures
  const handleDownloadImage = async () => {
    if (!cvPrintRef.current) return;
    setIsExportingImage(true);
    try {
      // 1. Ensure web fonts (Vazirmatn) are completely loaded before capturing
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 80));

      const canvas = await html2canvas(cvPrintRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Attach font stylesheet inside cloned document
          const fontLink = clonedDoc.createElement('link');
          fontLink.rel = 'stylesheet';
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap';
          clonedDoc.head.appendChild(fontLink);

          const el = clonedDoc.querySelector('[data-cv-print]') as HTMLElement;
          if (el) {
            el.style.letterSpacing = '0px';
            el.style.fontFamily = "'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            const elements = el.querySelectorAll('*');
            elements.forEach((child) => {
              const htmlChild = child as HTMLElement;
              htmlChild.style.letterSpacing = '0px';
              htmlChild.style.wordSpacing = 'normal';
              if (!htmlChild.style.fontFamily) {
                htmlChild.style.fontFamily = "'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
              }
            });

            // Safeguard LTR / parenthesis elements so their direction and brackets remain pristine
            const ltrElements = el.querySelectorAll('[dir="ltr"]');
            ltrElements.forEach((child) => {
              const htmlChild = child as HTMLElement;
              htmlChild.style.direction = 'ltr';
              htmlChild.style.unicodeBidi = 'isolate';
              htmlChild.style.display = 'inline-block';
              htmlChild.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            });
          }
        },
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `CV_${(workerFullName || currentWorker.fullName).replace(/\s+/g, '_')}_${workerPassportNumber || currentWorker.passportNumber}.png`;
      link.click();
    } catch (err) {
      console.error('Failed generating CV image:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar & Worker Switcher */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 no-print">
        
        {/* Worker Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            هەڵبژاردنی کرێکار:
          </label>
          <div className="relative flex-1 sm:w-72">
            <select
              value={currentWorker.id}
              onChange={(e) => {
                const found = workers.find((w) => w.id === e.target.value);
                if (found) onSelectWorker(found);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.fullName} ({w.nationality} - {w.passportNumber})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Translation Mode & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Language Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCvLanguageMode('bilingual')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                cvLanguageMode === 'bilingual'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              دوو زمانی
            </button>
            <button
              onClick={() => setCvLanguageMode('english')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                cvLanguageMode === 'english'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setCvLanguageMode('kurdish')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                cvLanguageMode === 'kurdish'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              کوردی
            </button>
          </div>

          {/* A4 Single Page Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>قەبارەی پەڕە: ١ لاپەڕەی تەواوی A4</span>
          </div>

          {/* Save All Button */}
          <button
            onClick={handleSaveAll}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
              saveSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="پاشەکەوتکردنی هەموو گۆڕانکارییەکانی کۆمپانیا، کرێکار، سەردێڕەکان و سیڤی"
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saveSuccess ? 'هەموو گۆڕانکارییەکان پاشەکەوت کران!' : 'پاشەکەوتکردنی هەموو گۆڕانکارییەکان'}</span>
          </button>

          {/* Download as Image */}
          <button
            onClick={handleDownloadImage}
            disabled={isExportingImage}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95"
            title="داونلۆدکردنی تەواوی ئەم سیڤیە وەک وێنەی PNG بە کوالێتی بەرز"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingImage ? 'ئامادەکردنی وێنە...' : 'داونلۆد (PNG)'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95"
            title="پرێنتکردنی فەرمی و پاشەکەوتکردن وەک PDF"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>پرێنت و PDF</span>
          </button>

          {/* Reserve Directly */}
          <button
            onClick={() => onOpenReservationModal(currentWorker)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>حجزکردنی ئەم کرێکارە</span>
          </button>

        </div>

      </div>

      {/* Main Two-Column Layout: Left Edit Controls / Right Live A4 Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Complete Customization Controls Panel (no-print) */}
        <div className="lg:col-span-5 space-y-4 no-print">
          
          {/* Category Tabs for Customizing Every Section */}
          <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('company')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'company'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>کۆمپانیا و لۆگۆ</span>
            </button>

            <button
              onClick={() => setActiveTab('worker')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'worker'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>کرێکار و وێنە</span>
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'sections'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>سەردێڕی بەشەکان</span>
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'skills'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>شارەزایی کار</span>
            </button>

            <button
              onClick={() => setActiveTab('languages')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'languages'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>زمان و پێوانە</span>
            </button>

            <button
              onClick={() => setActiveTab('experience')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'experience'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>ئەزموونی دەرەکی</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'notes'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>تێبینی و مۆر</span>
            </button>
          </div>

          {/* TAB 1: COMPANY & LOGO CUSTOMIZATION */}
          {activeTab === 'company' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>دەستکاریکردنی ناوی کۆمپانیا و لۆگۆ</span>
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  ڕاستەوخۆ دەگۆڕێت
                </span>
              </div>

              {/* Logo Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  لۆگۆی کۆمپانیا:
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-600 p-0.5 bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                    {companyLogo && companyLogo.trim() ? (
                      <img src={companyLogo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-emerald-700 text-white font-bold text-xl flex items-center justify-center rounded-xl">
                        {companyName.charAt(0) || 'ک'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ئەپڵۆدکردنی لۆگۆ لە ئامێرەکەتەوە</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={companyLogo}
                      onChange={(e) => setCompanyLogo(e.target.value)}
                      placeholder="یان لینکی وێنەی لۆگۆ بنووسە..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Logo Size Control (Requested: "قەبارەی لۆگۆ لەسەر سیڤی بتوانم گەورە و بچوکی بکەم") */}
                <div className="pt-3 border-t dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      <span>قەبارەی لۆگۆ لەسەر سیڤی (گەورە و بچووککردن):</span>
                    </label>
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {logoSize}px
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">بچووک</span>
                    <input
                      type="range"
                      min="35"
                      max="160"
                      step="2"
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400">گەورە</span>
                  </div>

                  {/* Quick Size Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      { label: 'بچووک (48px)', size: 48 },
                      { label: 'ئاسایی (72px)', size: 72 },
                      { label: 'مامناوەند (96px)', size: 96 },
                      { label: 'گەورە (120px)', size: 120 },
                      { label: 'زۆر گەورە (150px)', size: 150 },
                    ].map((preset) => (
                      <button
                        key={preset.size}
                        type="button"
                        onClick={() => setLogoSize(preset.size)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                          logoSize === preset.size
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Company Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ناوی کۆمپانیا (کوردی):
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ناوی کۆمپانیا (ئینگلیزی):
                  </label>
                  <input
                    type="text"
                    value={companyEnName}
                    onChange={(e) => setCompanyEnName(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-left font-sans"
                  />
                </div>
              </div>

              {/* Company Activity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    چالاکی کۆمپانیا (کوردی):
                  </label>
                  <input
                    type="text"
                    value={companyActivity}
                    onChange={(e) => setCompanyActivity(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    چالاکی کۆمپانیا (ئینگلیزی):
                  </label>
                  <input
                    type="text"
                    value={companyEnActivity}
                    onChange={(e) => setCompanyEnActivity(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-left font-sans"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    مۆبایل ١:
                  </label>
                  <input
                    type="text"
                    value={companyPhone1}
                    onChange={(e) => setCompanyPhone1(e.target.value)}
                    dir="ltr"
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    مۆبایل ٢:
                  </label>
                  <input
                    type="text"
                    value={companyPhone2}
                    onChange={(e) => setCompanyPhone2(e.target.value)}
                    dir="ltr"
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    ژمارەی مۆڵەت:
                  </label>
                  <input
                    type="text"
                    value={companyLicense}
                    onChange={(e) => setCompanyLicense(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ناونیشانی فەرمی:
                </label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveAll}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>پاشەکەوتکردنی زانیاری کۆمپانیا لە سیستەم</span>
              </button>
            </div>
          )}

          {/* TAB 2: WORKER PROFILE DETAILS IN CV */}
          {activeTab === 'worker' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-800">
                <User className="w-4 h-4 text-emerald-600" />
                <span>دەستکاریکردنی زانیاری و وێنەی کرێکار لەناو سیڤی</span>
              </h3>

              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  وێنەی کرێکار:
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-20 rounded-2xl overflow-hidden border-2 border-emerald-600 p-0.5 bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                    {workerPhoto ? (
                      <img src={workerPhoto} alt="Worker" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center rounded-xl">
                        وێنە
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ئەپڵۆدکردنی وێنەی کەسی کرێکار</span>
                      <input type="file" accept="image/*" onChange={handleWorkerPhotoUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={workerPhoto}
                      onChange={(e) => setWorkerPhoto(e.target.value)}
                      placeholder="یان لینکی وێنە بنووسە..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ناوی تەواو (کوردی):
                  </label>
                  <input
                    type="text"
                    value={workerFullName}
                    onChange={(e) => setWorkerFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (English):
                  </label>
                  <input
                    type="text"
                    value={workerEnFullName}
                    onChange={(e) => setWorkerEnFullName(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-left font-sans"
                  />
                </div>
              </div>

              {/* Passport & Nationality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ژمارەی پاسەپۆرت:
                  </label>
                  <input
                    type="text"
                    value={workerPassportNumber}
                    onChange={(e) => setWorkerPassportNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ڕەگەزنامە (وڵات):
                  </label>
                  <input
                    type="text"
                    value={workerNationality}
                    onChange={(e) => setWorkerNationality(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Dates & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    لەدایکبوون:
                  </label>
                  <input
                    type="date"
                    value={workerBirthDate}
                    onChange={(e) => setWorkerBirthDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    بەسەرچوونی پاسەپۆرت:
                  </label>
                  <input
                    type="date"
                    value={workerPassportExpiry}
                    onChange={(e) => setWorkerPassportExpiry(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    ڕەگەز:
                  </label>
                  <select
                    value={workerGender}
                    onChange={(e) => setWorkerGender(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="مێ">مێ (Female)</option>
                    <option value="نێر">نێر (Male)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  کۆمپانیای پەیوەندیدار / Agency:
                </label>
                <input
                  type="text"
                  value={workerAgency}
                  onChange={(e) => setWorkerAgency(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Direct Booking QR Barcode Controls */}
              <div className="pt-3 border-t dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <QrIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>بارکۆدی حجزکردنی ڕاستەوخۆ (لەژێر وێنەی کرێکار):</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <input
                      type="checkbox"
                      checked={showQrCode}
                      onChange={(e) => setShowQrCode(e.target.checked)}
                      className="rounded accent-emerald-600 w-3.5 h-3.5"
                    />
                    <span>چالاکە</span>
                  </label>
                </div>

                {showQrCode && (
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        قەبارەی بارکۆد لەسەر سیڤی:
                      </span>
                      <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {qrCodeSize}px
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">بچووک</span>
                      <input
                        type="range"
                        min="45"
                        max="130"
                        step="2"
                        value={qrCodeSize}
                        onChange={(e) => setQrCodeSize(Number(e.target.value))}
                        className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400">گەورە</span>
                    </div>

                    {/* Quick Preset Buttons for Barcode */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { label: 'بچووک (55px)', size: 55 },
                        { label: 'ئاسایی (72px)', size: 72 },
                        { label: 'مامناوەند (90px)', size: 90 },
                        { label: 'گەورە (110px)', size: 110 },
                      ].map((preset) => (
                        <button
                          key={preset.size}
                          type="button"
                          onClick={() => setQrCodeSize(preset.size)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            qrCodeSize === preset.size
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM TITLES & HEADINGS FOR ALL CV SECTIONS */}
          {activeTab === 'sections' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-800">
                <Type className="w-4 h-4 text-emerald-600" />
                <span>دەستکاریکردنی سەردێڕ و دەقەکانی سەرجەم بەشەکانی سیڤی</span>
              </h3>

              {/* Main Banner Titles */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سەردێڕی فەرمی بانەری سیڤی (کوردی):
                  </label>
                  <input
                    type="text"
                    value={cvBannerTitle}
                    onChange={(e) => setCvBannerTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سەردێڕی فەرمی بانەر (ئینگلیزی):
                  </label>
                  <input
                    type="text"
                    value={cvBannerEnTitle}
                    onChange={(e) => setCvBannerEnTitle(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-left font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    دەقی ژمارەی کۆد / Code Prefix:
                  </label>
                  <input
                    type="text"
                    value={codePrefix}
                    onChange={(e) => setCodePrefix(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Section Sub-headings */}
              <div className="space-y-3 pt-2 border-t dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سەردێڕی بەشی زمانەکان:
                  </label>
                  <input
                    type="text"
                    value={languagesTitle}
                    onChange={(e) => setLanguagesTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سەردێڕی بەشی شارەزایی کارکردن:
                  </label>
                  <input
                    type="text"
                    value={skillsTitle}
                    onChange={(e) => setSkillsTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سەردێڕی بەشی ئەزموونی پێشینە لە وڵاتان:
                  </label>
                  <input
                    type="text"
                    value={experienceTitle}
                    onChange={(e) => setExperienceTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سەردێڕی بەشی تێبینی:
                  </label>
                  <input
                    type="text"
                    value={notesTitle}
                    onChange={(e) => setNotesTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سەردێڕی مۆر و واژۆی فەرمی:
                  </label>
                  <input
                    type="text"
                    value={stampTitle}
                    onChange={(e) => setStampTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: JOB SKILLS & CUSTOM SKILLS */}
          {activeTab === 'skills' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-800">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>شارەزایی کارکردن (بەشێوەی خاڵبەندی لە سیڤی)</span>
              </h3>

              {/* Add Custom Skill input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCustomSkill}
                  onChange={(e) => setNewCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                  placeholder="شارەزاییەکی نوێ بنووسە و کلیکی زیادکردن بکە..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>زیادکردن</span>
                </button>
              </div>

              {/* Selected skills list with delete option */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  شارەزاییە دیاریکراوەکان بۆ سیڤی (دەتوانیت بسڕیتەوە):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-emerald-700 hover:text-rose-600 p-0.5 rounded-full"
                        title="سڕینەوە"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div className="pt-2 border-t dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">
                  هەڵبژاردنی خێرا لە شارەزاییە سەرەکییەکان:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SKILLS_PRESETS.map((skill) => {
                    const isSelected = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LANGUAGES, EDUCATION & SPECS */}
          {activeTab === 'languages' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-800">
                <Languages className="w-4 h-4 text-emerald-600" />
                <span>زمانەکان، باڵا، کێش و بڕوانامە</span>
              </h3>

              {/* Height, Weight & Education */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    کێش (کگم):
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    باڵا (سم):
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    بڕوانامە:
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800"
                  >
                    {EDUCATION_LEVEL_PRESETS.map((ed) => (
                      <option key={ed} value={ed}>{ed}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Language Proficiency Table */}
              <div className="pt-2 border-t dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    لیستی زمانەکان و ئاستی شارەزایی:
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>زیادکردنی زمان</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {languages.map((l, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={l.language}
                        onChange={(e) => handleUpdateLanguage(idx, 'language', e.target.value)}
                        placeholder="زمان (کوردی، عەرەبی...)"
                        className="flex-1 px-2 py-1 rounded-lg border text-xs bg-white dark:bg-slate-900"
                      />
                      <select
                        value={l.level}
                        onChange={(e) => handleUpdateLanguage(idx, 'level', e.target.value)}
                        className="w-28 px-2 py-1 rounded-lg border text-xs bg-white dark:bg-slate-900"
                      >
                        <option value="نایاب">نایاب</option>
                        <option value="زۆر باش">زۆر باش</option>
                        <option value="باش">باش</option>
                        <option value="سەرەتایی">سەرەتایی</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRIOR WORK EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>ئەزموونی پێشینە لە وڵاتان (Previous Employment)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>زیادکردنی ئەزموون</span>
                </button>
              </div>

              <div className="space-y-3">
                {priorExperience.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    هیچ ئەزموونێکی پێشینە زیاد نەکراوە (First Timer).
                  </p>
                ) : (
                  priorExperience.map((exp) => (
                    <div key={exp.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={exp.country}
                          onChange={(e) => handleUpdateExperience(exp.id, 'country', e.target.value)}
                          placeholder="وڵات (نموونە: کوێت)"
                          className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-bold bg-white dark:bg-slate-800"
                        />
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleUpdateExperience(exp.id, 'duration', e.target.value)}
                          placeholder="ماوە (نموونە: ٢ ساڵ)"
                          className="w-28 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                        placeholder="ئەرک و کار (نموونە: چێشتلێنان و پاککردنەوە)"
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-800"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: NOTES & OFFICIAL STAMP */}
          {activeTab === 'notes' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-800">
                <Edit2 className="w-4 h-4 text-emerald-600" />
                <span>تێبینی کۆمپانیا و بەشی مۆری فەرمی</span>
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  دەقی تێبینی کۆمپانیا لەسەر سیڤی:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  placeholder="تێبینی دەربارەی کرێکار..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  دەقی بەشی مۆری فەرمی کۆمپانیا:
                </label>
                <input
                  type="text"
                  value={stampTitle}
                  onChange={(e) => setStampTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: The Actual A4 Printed CV Document */}
        <div className="lg:col-span-7 flex justify-center">
          <div 
            ref={cvPrintRef}
            data-cv-print="true"
            className="cv-sheet w-full max-w-[210mm] bg-white text-slate-900 border border-slate-300 shadow-2xl p-4 sm:p-5 rounded-2xl print:rounded-none print:shadow-none print:border-none print:p-2 print-p-0 print:max-w-none text-right font-sans flex flex-col justify-between"
            style={{ minHeight: '275mm', maxHeight: '286mm' }}
          >
            <div>
              {/* Header: Company Info, Logo, Kurdish & English Names */}
              <div className="border-b-2 border-emerald-700 pb-2 mb-2 flex items-center justify-between gap-3">
                
                {/* Kurdish Company details */}
                <div className="flex-1">
                  <h1 className="text-lg sm:text-xl font-black text-emerald-900 leading-tight">
                    {companyName}
                  </h1>
                  <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                    {companyActivity}
                  </p>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap gap-x-2.5 gap-y-0.5">
                    {companyLicense && <span>مۆڵەت: {companyLicense}</span>}
                    {companyPhone1 && <span>مۆبایل: {companyPhone1}</span>}
                    {companyAddress && <span>{companyAddress}</span>}
                  </div>
                </div>

                {/* Company Logo with adjustable size */}
                <div 
                  style={{ 
                    width: `${logoSize}px`, 
                    height: `${logoSize}px`,
                    minWidth: `${logoSize}px`,
                    minHeight: `${logoSize}px`,
                  }}
                  className="rounded-xl overflow-hidden border-2 border-emerald-600 p-0.5 bg-white shadow-xs flex-shrink-0 flex items-center justify-center transition-all duration-150"
                >
                  {companyLogo && companyLogo.trim() ? (
                    <img src={companyLogo} alt="Company Logo" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="w-full h-full bg-emerald-700 text-white font-bold text-xl flex items-center justify-center rounded-lg">
                      {companyName.charAt(0) || 'ک'}
                    </div>
                  )}
                </div>

                {/* English Company details */}
                <div className="flex-1 text-left hidden sm:block font-sans" dir="ltr">
                  <h2 className="text-sm sm:text-base font-extrabold text-emerald-950 leading-tight">
                    {companyEnName}
                  </h2>
                  <p className="text-[9px] text-slate-600 font-medium">
                    {companyEnActivity}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Tel: {companyPhone1} {companyPhone2 ? `/ ${companyPhone2}` : ''}
                  </p>
                </div>

              </div>

              {/* Document Title Banner */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white py-1 px-3 rounded-lg mb-2 flex items-center justify-between text-[11px] font-bold shadow-xs">
                <span>{cvBannerTitle}</span>
                <span className="font-mono text-emerald-200 text-[10px]">{cvBannerEnTitle}</span>
                <span>{codePrefix} {(workerPassportNumber || currentWorker.passportNumber).slice(-4)}</span>
              </div>

              {/* Worker Profile Overview: Photo, Key Specs & Dynamic QR Barcode */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-2 border-b border-slate-200">
                
                {/* Photo & Direct Booking QR Barcode Column */}
                <div className="sm:col-span-4 flex flex-col items-center">
                  <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-emerald-800 p-0.5 shadow-sm bg-slate-50 flex items-center justify-center">
                    {workerPhoto ? (
                      <img
                        src={workerPhoto}
                        alt={workerFullName || currentWorker.fullName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-base font-bold">
                        {(workerFullName || currentWorker.fullName).charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-1 text-center">
                    <span className="inline-block px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      ڕەگەز: {workerGender === 'مێ' ? (
                        <>مێ <BidiParen>FEMALE</BidiParen></>
                      ) : (
                        <>نێر <BidiParen>MALE</BidiParen></>
                      )}
                    </span>
                  </div>

                  {/* Direct Booking Barcode placed directly under worker photo, NO explanation underneath */}
                  {showQrCode && qrCodeDataUrl && qrCodeDataUrl.trim() ? (
                    <div 
                      onClick={() => onOpenReservationModal(currentWorker)}
                      className="mt-1.5 flex flex-col items-center cursor-pointer group"
                      title="بارکۆدی حجزکردنی ڕاستەوخۆ (Scan to Book)"
                    >
                      <div 
                        style={{
                          width: `${qrCodeSize}px`,
                          height: `${qrCodeSize}px`,
                          minWidth: `${qrCodeSize}px`,
                          minHeight: `${qrCodeSize}px`,
                        }}
                        className="p-0.5 bg-white rounded-lg border-2 border-emerald-700 shadow-xs flex items-center justify-center group-hover:scale-105 transition-all duration-150"
                      >
                        <img 
                          src={qrCodeDataUrl} 
                          alt="Booking QR" 
                          className="w-full h-full object-contain rounded-md" 
                        />
                      </div>
                      <span className="text-[9px] font-bold text-emerald-950 mt-0.5 flex items-center gap-1">
                        <QrIcon className="w-2.5 h-2.5 text-emerald-700" />
                        <span>بارکۆدی حجزکردن</span>
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Information Table (Bilingual) */}
                <div className="sm:col-span-8 flex flex-col justify-start">
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-[11px] text-right border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <td className="py-1 px-2.5 font-bold text-slate-700 w-32">ناوی تەواو / Name:</td>
                          <td className="py-1 px-2.5 font-bold text-slate-900">
                            {workerFullName || currentWorker.fullName}
                            {(workerEnFullName || currentWorker.enFullName) && (
                              <span className="text-slate-500 mr-1.5 text-[10px] font-medium">
                                <BidiParen>{workerEnFullName || currentWorker.enFullName}</BidiParen>
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1 px-2.5 font-bold text-slate-700">ژمارەی پاسەپۆرت / Passport:</td>
                          <td className="py-1 px-2.5 font-mono font-bold text-emerald-800">
                            {workerPassportNumber || currentWorker.passportNumber}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <td className="py-1 px-2.5 font-bold text-slate-700">ڕەگەزنامە / Nationality:</td>
                          <td className="py-1 px-2.5 font-bold text-slate-900">
                            {workerNationality || currentWorker.nationality}{' '}
                            <BidiParen className="text-slate-500 font-medium text-[10px]">
                              {translateKurdishToEnglish(workerNationality || currentWorker.nationality)}
                            </BidiParen>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1 px-2.5 font-bold text-slate-700">لەدایکبوون / DOB:</td>
                          <td className="py-1 px-2.5 font-medium text-slate-900">
                            {workerBirthDate || currentWorker.birthDate}{' '}
                            <span 
                              dir="ltr" 
                              style={{ unicodeBidi: 'isolate', display: 'inline-block' }} 
                              className="font-sans text-[10px] text-slate-500 font-medium"
                            >
                              (Age: {age} / <span dir="rtl">{age} ساڵ</span>)
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <td className="py-1 px-2.5 font-bold text-slate-700">بەسەرچوون / Expiry:</td>
                          <td className="py-1 px-2.5 font-medium text-slate-900">
                            {workerPassportExpiry || currentWorker.passportExpiryDate}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-1 px-2.5 font-bold text-slate-700">باڵا و کێش / Size:</td>
                          <td className="py-1 px-2.5 text-slate-900">
                            {heightCm} سم <BidiParen className="text-slate-500 text-[10px]">cm</BidiParen> / {weightKg} کگم <BidiParen className="text-slate-500 text-[10px]">kg</BidiParen>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <td className="py-1 px-2.5 font-bold text-slate-700">بڕوانامە / Education:</td>
                          <td className="py-1 px-2.5 text-slate-900">
                            {educationLevel}{' '}
                            <BidiParen className="text-slate-500 font-medium text-[10px]">
                              {translateKurdishToEnglish(educationLevel)}
                            </BidiParen>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2.5 font-bold text-slate-700">کۆمپانیا / Agency:</td>
                          <td className="py-1 px-2.5 font-bold text-emerald-700">
                            {workerAgency || companyName}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Languages & Skills Side by Side (Saves ~100px A4 vertical space) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-2 mb-1.5">
                
                {/* Languages (col-span-5) */}
                <div className="sm:col-span-5">
                  <h3 className="text-[11px] font-bold text-emerald-900 border-b border-emerald-600 pb-0.5 mb-1 flex items-center justify-between">
                    <span>{languagesTitle}</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-1">
                    {languages.map((l, i) => (
                      <div key={i} className="p-1 rounded-lg bg-slate-50 border border-slate-200 text-center">
                        <div className="font-bold text-[10px] text-slate-900 truncate">
                          {l.language} / {l.enLanguage}
                        </div>
                        <div className="text-[9px] text-emerald-700 font-semibold">
                          {l.level}{' '}
                          <BidiParen className="text-emerald-800 font-medium text-[9px]">
                            {l.enLevel}
                          </BidiParen>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills (col-span-7) */}
                <div className="sm:col-span-7">
                  <h3 className="text-[11px] font-bold text-emerald-900 border-b border-emerald-600 pb-0.5 mb-1">
                    <span>{skillsTitle}</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-1">
                    {skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-1.5 p-1 rounded-lg bg-emerald-50/50 border border-emerald-100 text-[10px]">
                        <Check className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Prior Experience History */}
              <div className="mt-1.5 mb-1.5">
                <h3 className="text-[11px] font-bold text-emerald-900 border-b border-emerald-600 pb-0.5 mb-1">
                  <span>{experienceTitle}</span>
                </h3>
                {priorExperience.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic py-1 px-2 bg-slate-50 rounded-lg">
                    کرێکاری تازەیە و پێشینەی کارکردنی دەرەکی نییە{' '}
                    <BidiParen className="text-slate-600 font-medium text-[9px]">
                      First Timer / New Applicant
                    </BidiParen>
                    .
                  </p>
                ) : (
                  <div className="space-y-1">
                    {priorExperience.map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between py-0.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px]">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>
                            {exp.country}{' '}
                            <BidiParen className="text-slate-500 font-medium text-[9px]">
                              {exp.enCountry}
                            </BidiParen>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-700 font-normal">
                            {exp.role}{' '}
                            <BidiParen className="text-slate-500 font-medium text-[9px]">
                              {exp.enRole}
                            </BidiParen>
                          </span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                          {exp.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes & Official Company Seal Box (Pinned to Bottom of A4) */}
            <div className="mt-2 pt-1.5 border-t border-slate-200 grid grid-cols-2 gap-3 items-end text-xs">
              <div>
                <span className="font-bold text-slate-700 text-[10px] block mb-0.5">{notesTitle}:</span>
                <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-200">
                  {notes || 'کرێکار پشکنینی پزیشکی و چاوپێکەوتنی سەرەتایی ئەنجامداوە و ئامادەیە بۆ وەرگرتن.'}
                </p>
              </div>

              {/* Seal & Signature stamp */}
              <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-slate-300 text-center">
                <span className="text-[9px] text-slate-400 mb-3">{stampTitle}</span>
                <div className="w-24 border-b border-slate-400"></div>
                <span className="text-[9px] font-bold text-emerald-900 mt-0.5">{companyName}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
