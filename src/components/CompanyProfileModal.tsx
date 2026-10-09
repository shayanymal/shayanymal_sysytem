import React, { useState } from 'react';
import { Building2, X, Upload, Check, Globe, Phone, MapPin, Mail, Award } from 'lucide-react';
import { CompanyProfile } from '../types';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  onSaveCompany: (updated: CompanyProfile) => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  isOpen,
  onClose,
  company,
  onSaveCompany,
}) => {
  const [name, setName] = useState(company.name);
  const [enName, setEnName] = useState(company.enName);
  const [activity, setActivity] = useState(company.activity);
  const [enActivity, setEnActivity] = useState(company.enActivity);
  const [licenseNumber, setLicenseNumber] = useState(company.licenseNumber);
  const [phone1, setPhone1] = useState(company.phone1);
  const [phone2, setPhone2] = useState(company.phone2);
  const [address, setAddress] = useState(company.address);
  const [enAddress, setEnAddress] = useState(company.enAddress);
  const [email, setEmail] = useState(company.email);
  const [logo, setLogo] = useState(company.logo);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setLogo(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (presetName: 'شایانی ماڵ' | 'نجوم للتنظيف') => {
    if (presetName === 'شایانی ماڵ') {
      setName('شایانی ماڵ بۆ دەستی کاری بیانی');
      setEnName('Shayani Mal Recruitment & Manpower Services');
      setActivity('دابینکردنی دەستی کاری بیانی و یاسایی بۆ ماڵان و کۆمپانیاکان');
      setEnActivity('Provision of Legal & Qualified Domestic & Manpower Workers');
      setLicenseNumber('م/٤٤٩١ بەڕێوەبەرایەتی گشتی کار');
      setPhone1('0750 123 4567');
      setAddress('هەولێر - شەقامی ٦٠ مەتری - بەرامبەر نەخۆشخانەی فریاکەوتن');
    } else {
      setName('کۆمپانیای نجوم للتنظيف و خزمەتگوزاری');
      setEnName('Nujoom Cleaning & Domestic Manpower Services');
      setActivity('خزمەتگوزاری پاککردنەوە و دابینکردنی کرێکاری ماڵان');
      setEnActivity('General Cleaning & Domestic Workers Services');
      setLicenseNumber('م/٢٠٣٨ وەزارەتی کار و کاروباری کۆمەڵایەتی');
      setPhone1('0750 888 9900');
      setAddress('هەولێر - بەختیاری - شەقامی ١٠٠ مەتری');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCompany({
      name: name.trim(),
      enName: enName.trim(),
      activity: activity.trim(),
      enActivity: enActivity.trim(),
      licenseNumber: licenseNumber.trim(),
      phone1: phone1.trim(),
      phone2: phone2.trim(),
      address: address.trim(),
      enAddress: enAddress.trim(),
      email: email.trim(),
      logo,
      establishedYear: company.establishedYear || '2019',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-right my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                پرۆفایلی فەرمی کۆمپانیا
              </h3>
              <p className="text-xs text-slate-500">
                ئەم زانیاریانە و لۆگۆ ڕاستەوخۆ دەچنە سەر لاپەڕەی سیڤی A4 و راپۆرتەکان
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Preset Buttons */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              هەڵبژاردنی نموونەی کۆمپانیا:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect('شایانی ماڵ')}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-200 transition"
              >
                شایانی ماڵ
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('نجوم للتنظيف')}
                className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 text-xs font-bold hover:bg-teal-200 transition"
              >
                نجوم للتنظيف
              </button>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-white p-1 flex-shrink-0 shadow-sm">
              {logo && logo.trim() ? (
                <img src={logo} alt="Company logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white font-bold text-xl rounded-xl">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <span className="text-xs font-bold block mb-1">لۆگۆی کۆمپانیا (Company Logo)</span>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>ئەپڵۆدی لۆگۆی نوێ</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          {/* Company Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">ناوی کۆمپانیا بە کوردی *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">ناوی کۆمپانیا بە ئینگلیزی (English Name) *</label>
              <input
                type="text"
                required
                value={enName}
                onChange={(e) => setEnName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 font-sans"
              />
            </div>
          </div>

          {/* Activity / Field */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">بواری چالاکی بە کوردی *</label>
              <input
                type="text"
                required
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">بواری چالاکی بە ئینگلیزی (Activity in English)</label>
              <input
                type="text"
                value={enActivity}
                onChange={(e) => setEnActivity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 font-sans"
              />
            </div>
          </div>

          {/* License & Phone numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">ژمارەی مۆڵەت *</label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">ژمارەی مۆبایل ١ *</label>
              <input
                type="tel"
                required
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">ژمارەی مۆبایل ٢</label>
              <input
                type="tel"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">ناونیشان بە کوردی *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">ناونیشان بە ئینگلیزی (Address in English)</label>
              <input
                type="text"
                value={enAddress}
                onChange={(e) => setEnAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-800 font-sans"
              />
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border text-xs font-semibold"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              پاشەکەوتکردن
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
