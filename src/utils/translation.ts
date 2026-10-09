/**
 * Translation dictionary and transliteration engine for Kurdish to US English
 * for CV Generation and Manpower Recruitment
 */

export const nationalityMap: Record<string, string> = {
  'فیلیپینی': 'Filipino',
  'فیلیپین': 'Philippines',
  'ئەندەنوسی': 'Indonesian',
  'ئەندەنوسیا': 'Indonesia',
  'ئیتیۆپی': 'Ethiopian',
  'ئیتیۆپیا': 'Ethiopia',
  'نیپاڵی': 'Nepalese',
  'نیپاڵ': 'Nepal',
  'هیندی': 'Indian',
  'هیندستان': 'India',
  'کینی': 'Kenyan',
  'کینیا': 'Kenya',
  'ئووگاندی': 'Ugandan',
  'ئووگاندا': 'Uganda',
  'سریلانکی': 'Sri Lankan',
  'سریلانکا': 'Sri Lanka',
  'بەنگلادیشی': 'Bangladeshi',
  'بەنگلادیش': 'Bangladesh',
  'غانی': 'Ghanaian',
  'غانە': 'Ghana',
  'ماداگاسکار': 'Madagascan',
  'نیجێری': 'Nigerian',
  'تایلەندی': 'Thai',
  'ڤێتنامی': 'Vietnamese',
  'مەغریبی': 'Moroccan',
  'مەغریب': 'Morocco',
  'تونسی': 'Tunisian',
  'تونس': 'Tunisia',
  'میسری': 'Egyptian',
  'میسر': 'Egypt',
  'ئوردنی': 'Jordanian',
  'ئوردن': 'Jordan',
  'ڕواندی': 'Rwandan',
  'ڕواندا': 'Rwanda',
  'تانزانی': 'Tanzanian',
  'تانزانیا': 'Tanzania',
  'ئۆزبەکی': 'Uzbek',
  'ئۆزبەکستان': 'Uzbekistan',
  'پاکستانی': 'Pakistani',
  'پاکستان': 'Pakistan',
  'سووری': 'Syrian',
  'سوریا': 'Syria',
  'لوبنانی': 'Lebanese',
  'کۆڵۆمبی': 'Colombian',
  'کۆڵۆمبیا': 'Colombia',
  'کامێرۆنی': 'Cameroonian',
  'کەنەدی': 'Canadian',
  'تورکی': 'Turkish',
  'تورکیا': 'Turkey',
  'عێراقی': 'Iraqi',
  'عێراق': 'Iraq',
};

export const skillsMap: Record<string, string> = {
  'خاوێنکردنەوە': 'General Cleaning & Housekeeping',
  'ماڵ خاوێنکردنەوە': 'House Cleaning & Sanitization',
  'خواردن دروستکردن': 'Cooking & Meal Preparation',
  'خواردنی عەرەبی': 'Arabic Cuisine Cooking',
  'بەخێوکردنی مناڵ': 'Babysitting & Childcare',
  'چاودێری ساوایان': 'Infant & Toddler Care',
  'چاودێری بەساڵاچووان': 'Elderly & Senior Care',
  'جل شوشتن و ئوتوو': 'Laundry & Ironing',
  'جل شوشتن': 'Washing Clothes',
  'ئوتووکردن': 'Ironing',
  'دورمان': 'Basic Sewing & Mending',
  'دورمانکاری': 'Tailoring & Alterations',
  'چاودێری ئاژەڵی ماڵی': 'Pet Care',
  'باخداری': 'Gardening & Plant Care',
  'قاپ شوشتن': 'Dishwashing & Kitchen Care',
  'سڕین و پاککردنەوەی زەوی': 'Mopping & Floor Care',
};

export const educationMap: Record<string, string> = {
  'سەرەتایی': 'Elementary School Graduate',
  'ناوەندی': 'Middle School / Junior High',
  'ئامادەیی': 'High School Graduate',
  'دبلۆم': 'Vocational Diploma',
  'بەکالۆریۆس': 'Bachelor\'s Degree',
  'زانکۆ': 'University Degree',
  'نەخوێندەوار': 'No Formal Schooling',
  'خوێندنەوە و نووسین': 'Literate (Basic Reading & Writing)',
};

export const languageNameMap: Record<string, string> = {
  'عەرەبی': 'Arabic',
  'ئینگلیزی': 'English (US)',
  'کوردی': 'Kurdish',
  'هیندی': 'Hindi',
  'تاگالۆگ': 'Tagalog',
  'سواهیلی': 'Swahili',
  'ئەمهەری': 'Amharic',
  'ئیندۆنیسی': 'Indonesian (Bahasa)',
  'فەرەنسی': 'French',
  'سینھالی': 'Sinhala',
};

export const languageLevelMap: Record<string, 'Fluent' | 'Very Good' | 'Good' | 'Fair'> = {
  'نایاب': 'Fluent',
  'زۆر باش': 'Very Good',
  'باش': 'Good',
  'سەرەتایی': 'Fair',
  'مامناوەند': 'Fair',
};

export const countryMap: Record<string, string> = {
  'کوێت': 'Kuwait',
  'ئیمارات': 'United Arab Emirates',
  'دوبەی': 'Dubai, UAE',
  'سعودیە': 'Saudi Arabia',
  'قەتەر': 'Qatar',
  'عومان': 'Oman',
  'بەحرەین': 'Bahrain',
  'لوبنان': 'Lebanon',
  'ئوردن': 'Jordan',
  'عێراق': 'Iraq',
  'کوردستان': 'Kurdistan Region',
  'هەولێر': 'Erbil, Kurdistan',
  'سلێمانی': 'Sulaymaniyah',
  'دهۆک': 'Duhok',
  'تورکیا': 'Turkey',
  'مالیزیا': 'Malaysia',
  'سینگاپور': 'Singapore',
  'یۆنان': 'Greece',
};

/**
 * Translates Kurdish text to English using mapped dictionary or intelligent fallback
 */
export function translateKurdishToEnglish(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();

  if (nationalityMap[trimmed]) return nationalityMap[trimmed];
  if (skillsMap[trimmed]) return skillsMap[trimmed];
  if (educationMap[trimmed]) return educationMap[trimmed];
  if (languageNameMap[trimmed]) return languageNameMap[trimmed];
  if (countryMap[trimmed]) return countryMap[trimmed];

  // Try matching substring or parts
  for (const [k, v] of Object.entries(nationalityMap)) {
    if (trimmed.includes(k)) return v;
  }
  for (const [k, v] of Object.entries(skillsMap)) {
    if (trimmed.includes(k)) return v;
  }
  for (const [k, v] of Object.entries(educationMap)) {
    if (trimmed.includes(k)) return v;
  }
  for (const [k, v] of Object.entries(countryMap)) {
    if (trimmed.includes(k)) return v;
  }

  return trimmed;
}

/**
 * Calculates exact age in years from YYYY-MM-DD
 */
export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const today = new Date();
  const birth = new Date(birthDateString);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
}

/**
 * Calculates days remaining until passport expiration
 */
export function getPassportRemainingDays(expiryDateString: string): number {
  if (!expiryDateString) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateString);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
