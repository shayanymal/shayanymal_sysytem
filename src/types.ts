export type Role = 'admin' | 'manager' | 'staff' | 'driver';

export interface UserPermissions {
  canAddWorker: boolean;
  canEditWorker: boolean;
  canDeleteWorker: boolean;
  canReserveWorker: boolean;
  canCancelReservation: boolean;
  canBuildCv: boolean;
  canManageArchive: boolean;
  canManageVisas: boolean;
  canExportReports: boolean;
  canEditCompany: boolean;
  canManageUsers: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: Role;
  roleTitle: string;
  avatar?: string;
  permissions: UserPermissions;
  active: boolean;
  lastLogin?: string;
}

export interface CompanyProfile {
  name: string;
  enName: string;
  activity: string;
  enActivity: string;
  licenseNumber: string;
  phone1: string;
  phone2: string;
  address: string;
  enAddress: string;
  email: string;
  logo: string;
  establishedYear: string;
}

export interface LanguageSkill {
  language: string;
  enLanguage: string;
  level: 'نایاب' | 'زۆر باش' | 'باش' | 'سەرەتایی';
  enLevel: 'Fluent' | 'Very Good' | 'Good' | 'Fair';
}

export interface PriorExperience {
  id: string;
  country: string;
  enCountry: string;
  duration: string;
  enDuration: string;
  role: string;
  enRole: string;
}

export interface CvCustomSettings {
  cvTitle?: string;
  cvEnTitle?: string;
  codePrefix?: string;
  personalInfoTitle?: string;
  personalInfoEnTitle?: string;
  languagesTitle?: string;
  languagesEnTitle?: string;
  skillsTitle?: string;
  skillsEnTitle?: string;
  experienceTitle?: string;
  experienceEnTitle?: string;
  notesTitle?: string;
  stampTitle?: string;
  logoSize?: number;
  qrCodeSize?: number;
}

export interface WorkerCvDetails {
  weightKg?: number;
  heightCm?: number;
  educationLevel: string;
  enEducationLevel: string;
  languages: LanguageSkill[];
  skills: string[];
  enSkills: string[];
  priorExperience: PriorExperience[];
  notes?: string;
  enNotes?: string;
  customSettings?: CvCustomSettings;
}

export type PassportType = 'یەکێک لە کۆمپانیاکان' | 'z' | 'ئاسایی' | 'تایبەت';

export type ReceivedFrom = 'بەڕێوەبەر' | 'کارمەند' | 'شۆفێر' | 'ماڵەکە' | string;

export type WorkerStatus = 'active' | 'reserved' | 'archived';

export interface Worker {
  id: string;
  fullName: string;
  enFullName?: string;
  passportNumber: string;
  nationality: string;
  enNationality?: string;
  gender: 'مێ' | 'نێر';
  enGender: 'Female' | 'Male';
  birthDate: string; // YYYY-MM-DD
  passportExpiryDate: string; // YYYY-MM-DD
  sponsorName: string;
  enSponsorName?: string;
  receivedFrom: ReceivedFrom;
  receivedDate: string; // YYYY-MM-DD
  passportType: PassportType;
  companyName: string;
  photoUrl: string;
  passportPhotoUrl: string;
  status: WorkerStatus;
  createdAt: string;
  updatedAt: string;
  cvDetails?: WorkerCvDetails;
  reservation?: ReservationInfo;
  archiveData?: ArchiveRecordData;
  visaData?: VisaRecordData;
}

export interface ReservationInfo {
  customerFullName: string;
  customerPhone: string;
  reservedThrough: string;
  reservedAt: string; // ISO date-time
  nationalIdCardPhotoUrl?: string;
  informationCardPhotoUrl?: string;
  notes?: string;
  reservedByUserId?: string;
  reservedByUserName?: string;
}

export interface GovLetter {
  letterNumber: string;
  letterDate: string;
  documentPhotoUrl?: string;
  notes?: string;
}

export interface ArchiveRecordData {
  submissionDate: string;
  fingerprintDate: string;
  erbilLaborDept: GovLetter;
  generalLaborDept: GovLetter;
  socialSecurityDept: GovLetter;
  ministryOfLabor: GovLetter;
  status: 'لە پرۆسەدایە' | 'تەواوبوو' | 'ڕەتکرایەوە';
  finalNotes?: string;
  archivedAt: string;
}

export interface VisaRecordData {
  visaNumber: string;
  issueDate: string;
  expiryDate: string;
  visaDocumentUrl?: string;
  notes?: string;
  status: 'دەرچوو' | 'چاودێری' | 'بەسەرچوو';
  archivedToWorker?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'reservation' | 'passport_expiry' | 'age_warning' | 'visa' | 'info';
  workerId?: string;
  workerName?: string;
  createdAt: string;
  read: boolean;
}

export interface AppDataState {
  workers: Worker[];
  company: CompanyProfile;
  users: UserAccount[];
  notifications: AppNotification[];
  deletedWorkerIds?: string[];
}
