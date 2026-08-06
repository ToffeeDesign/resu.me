'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Contact item (dynamic, user-orderable) ────────────────────────────────
export type ContactType =
  | 'email'
  | 'phone'
  | 'address'
  | 'website'
  | 'linkedin'
  | 'github'
  | 'twitter'
  | 'instagram'
  | 'behance'
  | 'dribbble'
  | 'other';

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  website: 'Website / Portfolio',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  behance: 'Behance',
  dribbble: 'Dribbble',
  other: 'Other',
};

export const CONTACT_TYPE_ICONS: Record<ContactType, string> = {
  email: '✉',
  phone: '☎',
  address: '📍',
  website: '🔗',
  linkedin: '🔗',
  github: '🔗',
  twitter: '🔗',
  instagram: '🔗',
  behance: '🔗',
  dribbble: '🔗',
  other: '🔗',
};

export interface ContactItem {
  id: string;
  type: ContactType;
  value: string;
  label?: string;
  url?: string;
}

// ─── Other interfaces ──────────────────────────────────────────────────────
export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

// ─── Resume list entry (lightweight metadata + full data) ────────────────────
export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
}

// ─── Resume list entry (lightweight metadata + full data) ────────────────────
export interface ResumeListEntry {
  id: string;
  name: string;
  updatedAt: string; // ISO string
  data: ResumeData;
  userId?: string;
}
export interface ThemeConfig {
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundValue: string;
  fontFamily: string;
  blockRadius: number;
  blockShadow: boolean;
  accentColor: string;
  textColor: string;
  backgroundImageUrl?: string;
  backgroundBlur?: number;
}

export type BlockType = 'link' | 'social' | 'image' | 'video' | 'text' | 'contact' | 'title' | 'gallery' | 'group';
export type BlockSize = `${number}x${number}`;

export interface BlockData {
  title?: string;
  subtitle?: string;
  url?: string;
  icon?: string;
  platform?: string;
  username?: string;
  src?: string;
  alt?: string;
  embedUrl?: string;
  content?: string;
  email?: string;
  phone?: string;
  location?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large';
  visible?: boolean;
  items?: Array<{ id: string; title: string; url: string; platform?: string }>;
  groupBlocks?: Block[];
  bgColor?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  size: BlockSize;
  position: { x: number; y: number };
  data: BlockData;
  order: number;
}

export interface LinktreePage {
  id: string;
  userId?: string;
  slug: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  theme: ThemeConfig;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

const RESUME_LIST_KEY = 'resume_list_v1';
const COVER_LETTER_LIST_KEY = 'cover_letter_list_v1';
const LINKTREE_LIST_KEY = 'linktree_list_v1';

// --- IndexedDB Storage Helper ---
const DB_NAME = 'ResumeMakerDB';
const DB_VERSION = 1;
const STORE_NAME = 'KeyValueStore';

let dbInstance: IDBDatabase | null = null;

function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    if (typeof window === 'undefined') return reject('Window is undefined');

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

function dbGet<T>(key: string): Promise<T | null> {
  return getDb().then((db) => {
    return new Promise<T | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve((request.result as T) || null);
      request.onerror = () => reject(request.error);
    });
  }).catch(() => null);
}

function dbSet<T>(key: string, value: T): Promise<void> {
  return getDb().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// In-memory cache for synchronous operations
let cachedResumeList: ResumeListEntry[] = [];
let cachedCoverLetterList: CoverLetterEntry[] = [];

export function loadResumeList(): ResumeListEntry[] {
  return cachedResumeList;
}

export function saveResumeList(list: ResumeListEntry[]): void {
  cachedResumeList = list;
  if (typeof window !== 'undefined') {
    dbSet(RESUME_LIST_KEY, list).catch((err) => {
      console.error('Failed to save resumes to IndexedDB:', err);
    });
  }
}

export function loadCoverLetterList(): CoverLetterEntry[] {
  return cachedCoverLetterList;
}

export function saveCoverLetterList(list: CoverLetterEntry[]): void {
  cachedCoverLetterList = list;
  if (typeof window !== 'undefined') {
    dbSet(COVER_LETTER_LIST_KEY, list).catch((err) => {
      console.error('Failed to save cover letters to IndexedDB:', err);
    });
  }
}

let cachedLinktreeList: LinktreePage[] = [];

export function loadLinktreeList(): LinktreePage[] {
  return cachedLinktreeList;
}

export function saveLinktreeList(list: LinktreePage[]): void {
  cachedLinktreeList = list;
  if (typeof window !== 'undefined') {
    dbSet(LINKTREE_LIST_KEY, list).catch((err) => {
      console.error('Failed to save linktrees to IndexedDB:', err);
    });
  }
}

// ─── Resume Data ───────────────────────────────────────────────────────────
export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  link?: string;
  organization?: string;
  email?: string;
  phone?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  type: 'text' | 'list';
  content: string;
  items: CustomSectionItem[];
}

export interface CoverLetterData {
  name: string;
  templateId: string;
  senderInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    address: string;
    profilePhoto?: string;
    contactItems?: ContactItem[];
    nationality?: string;
    visaStatus?: string;
    dateOfBirth?: string;
    passportId?: string;
    availability?: string;
    maritalStatus?: string;
    showProfilePhoto?: boolean;
  };
  recipientInfo: {
    name: string;
    position: string;
    companyName: string;
    address: string;
  };
  date: string;
  subject: string;
  salutation: string;
  body: string;
  signOff: string;
  signature: string;
  signatureInfo?: {
    image?: string;
    name?: string;
    date?: string;
    place?: string;
  };
  primaryColor?: string;
  fontFamily?: string;
}

export interface CoverLetterEntry {
  id: string;
  name: string;
  updatedAt: string;
  data: CoverLetterData;
  userId?: string;
}

export interface ResumeData {
  resumeName: string; // The customizable name of the resume file
  customSectionTitles: Record<string, string>; // Custom names for sections (e.g. "Work Experience" -> "Professional History")
  personalInfo: {
    fullName: string;
    jobTitle: string;
    profilePhoto: string;
    contactItems: ContactItem[];
    nationality: string;
    visaStatus: string;
    dateOfBirth: string;
    passportId: string;
    availability: string;
    maritalStatus: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  customSections?: CustomSection[];
  styling: {
    template: 'classic' | 'modern' | 'minimal' | 'sidebar';
    fontFamily: 'Inter' | 'Lora' | 'Montserrat' | 'Outfit' | 'Playfair Display';
    fontSize: 'sm' | 'md' | 'lg';
    spacing: 'compact' | 'normal' | 'loose';
    margins: 'compact' | 'normal' | 'loose';
    primaryColor: string;
    referencesSeparator?: '|' | '•' | '·' | '-';
  };
  sectionOrder: string[];
  disabledSections: string[];
  showProfilePhoto: boolean;
  languageStandard?: 'descriptive' | 'cefr' | 'ilr';
}

// ─── Initial data ──────────────────────────────────────────────────────────
const initialResumeData: ResumeData = {
  resumeName: 'Untitled Resume',
  customSectionTitles: {
    personal: 'Personal Details',
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    certifications: 'Certifications'
  },
  personalInfo: {
    fullName: 'Chavda Mahmadjakir',
    jobTitle: 'UI/UX & Graphic Designer',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    contactItems: [
      { id: 'ci-1', type: 'email', value: 'mahmadjakir.c@gmail.com' },
      { id: 'ci-2', type: 'phone', value: '+971 544501599' },
      { id: 'ci-3', type: 'address', value: 'Abu Dhabi, UAE' },
      { id: 'ci-4', type: 'website', value: 'mahmadjakir.design' },
    ],
    nationality: 'Indian',
    visaStatus: 'Employment Visa',
    dateOfBirth: '',
    passportId: '',
    availability: '',
    maritalStatus: 'Married',
  },
  summary: 'UI/UX Designer & Creative Director with 6+ years of experience specializing in user-centered design, UX strategy, and UI visual design. Strong expertise in designing intuitive, scalable, and high-impact digital experiences backed by usability testing and design systems. Proficient in Figma, Adobe Creative Suite, and prototyping tools.',
  experience: [
    {
      id: 'exp-1',
      company: 'Abu Dhabi Media Network (Param Info)',
      position: 'Sr. UI/UX and Graphic Designer',
      location: 'Abu Dhabi, UAE',
      startDate: '2024-04',
      endDate: '',
      current: true,
      description: '• Improved branding efficiency across collections by implementing it into Microsoft Power Apps for consistent design integration.\n• Supported the marketing team with conceptual ideation for marketing collateral, campaigns, and graphic content.\n• Designed graphics for 20+ Power Apps, contributing to the creation of a scalable design system to ensure consistent branding across applications.\n• Led the rebranding and UI/UX overhaul of the company\'s internal HRMS, enhancing user experience and accelerating platform adoption.',
    },
    {
      id: 'exp-2',
      company: 'IndiaNIC Infotech Limited',
      position: 'Senior UI/UX Designer',
      location: 'Ahmedabad, India',
      startDate: '2022-03',
      endDate: '2024-02',
      current: false,
      description: '• Developed high-fidelity prototypes and wireframes for mobile and web applications, resulting in a 30% faster approval cycle.\n• Collaborated with developers and product teams to launch 20+ trading features, improving user retention by 25%.\n• Conducted usability testing and user research, leading to data-driven UI enhancements that reduced drop-off rates by 20%.\n• Designed & scaled a design system improving consistency and reducing development time by 40%.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      school: 'B. H. Gardi College of Engineering & Technology',
      degree: 'Bachelor of Engineering in Information Technology',
      location: 'Rajkot, Gujarat, India',
      startDate: '2016-08',
      endDate: '2019-06',
      current: false,
      description: 'Graduated with First Class Honors. Core coursework in Software Engineering, Web Technologies, and Database Systems.',
    },
  ],
  skills: [
    { id: 'skill-1', name: 'UI/UX Design', level: 'Expert' },
    { id: 'skill-2', name: 'Figma & Adobe XD', level: 'Expert' },
    { id: 'skill-3', name: 'Wireframing & Prototyping', level: 'Expert' },
    { id: 'skill-4', name: 'Design Systems', level: 'Expert' },
    { id: 'skill-5', name: 'User Testing & Research', level: 'Expert' },
    { id: 'skill-6', name: 'Graphic Design', level: 'Expert' },
  ],
  languages: [
    { id: 'lang-1', name: 'English', proficiency: 'Fluent' },
    { id: 'lang-2', name: 'Hindi', proficiency: 'Native' },
    { id: 'lang-3', name: 'Gujarati', proficiency: 'Native' },
  ],
  certifications: [
    { id: 'cert-1', name: 'Google UX Design Professional Certificate', issuer: 'Coursera / Google', date: '2022-10', link: '' },
    { id: 'cert-2', name: 'Enterprise Design Thinking Practitioner', issuer: 'IBM', date: '2023-05', link: '' },
  ],
  customSections: [],
  styling: {
    template: 'classic',
    fontFamily: 'Outfit',
    fontSize: 'md',
    spacing: 'normal',
    margins: 'normal',
    primaryColor: '#3b82f6',
    referencesSeparator: '|',
  },
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages', 'certifications'],
  disabledSections: [],
  showProfilePhoto: true,
  languageStandard: 'descriptive',
};

export const initialCoverLetterData: CoverLetterData = {
  name: 'Untitled Cover Letter',
  templateId: 'minimal',
  senderInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    address: '',
    profilePhoto: '',
    contactItems: [],
    nationality: '',
    visaStatus: '',
    dateOfBirth: '',
    passportId: '',
    availability: '',
    maritalStatus: '',
    showProfilePhoto: true,
  },
  recipientInfo: {
    name: '',
    position: '',
    companyName: '',
    address: '',
  },
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  subject: 'Application for [Job Title] Role',
  salutation: 'Dear Hiring Manager,',
  body: 'I am writing to express my strong interest in the [Job Title] position at [Company Name]. With my background in [Your Field] and experience in [Your Skill], I am confident that I can make a significant contribution to your team.\n\nIn my previous role as [Your Current Position], I successfully [describe an achievement or responsibility]. I have developed strong skills in [skills or technologies], and I am passionate about [industry trends or company goals].\n\nThank you for your time and consideration. I look forward to the opportunity to discuss how my qualifications align with your needs in more detail.',
  signOff: 'Sincerely,',
  signature: '',
  signatureInfo: {
    image: '',
    name: '',
    date: '',
    place: '',
  },
  primaryColor: '#4f46e5',
  fontFamily: 'Inter',
};

// ─── Blank resume factory ─────────────────────────────────────────────────
export function makeBlankResume(name = 'Untitled Resume'): ResumeData {
  return {
    ...initialResumeData,
    resumeName: name,
    personalInfo: {
      fullName: '',
      jobTitle: '',
      profilePhoto: '',
      contactItems: [
        { id: `ci-email-${Math.random().toString(36).substr(2, 9)}`, type: 'email', value: '' },
        { id: `ci-phone-${Math.random().toString(36).substr(2, 9)}`, type: 'phone', value: '' },
        { id: `ci-address-${Math.random().toString(36).substr(2, 9)}`, type: 'address', value: '' },
      ],
      nationality: '',
      visaStatus: '',
      dateOfBirth: '',
      passportId: '',
      availability: '',
      maritalStatus: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    customSections: [],
  };
}

// ─── Context type ──────────────────────────────────────────────────────────
interface ResumeContextType {
  resumeData: ResumeData;
  saveStatus: 'idle' | 'saving' | 'saved';
  manualSave: () => void;
  updateResumeName: (name: string) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  updatePersonalInfo: (info: Partial<ResumeData['personalInfo']>) => void;
  addContactItem: (type?: ContactType) => void;
  updateContactItem: (id: string, patch: Partial<ContactItem>) => void;
  deleteContactItem: (id: string) => void;
  reorderContactItems: (items: ContactItem[]) => void;
  updateSummary: (summary: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  deleteEducation: (id: string) => void;
  addSkill: () => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  addLanguage: () => void;
  updateLanguage: (id: string, lang: Partial<Language>) => void;
  deleteLanguage: (id: string) => void;
  reorderLanguages: (languages: Language[]) => void;
  updateLanguageStandard: (std: 'descriptive' | 'cefr' | 'ilr') => void;
  addCertification: () => void;
  updateCertification: (id: string, cert: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;
  addCustomSection: (title: string, type: 'text' | 'list', customId?: string) => void;
  updateCustomSection: (id: string, updated: Partial<CustomSection>) => void;
  deleteCustomSection: (id: string) => void;
  addCustomSectionItem: (sectionId: string, initialData?: Partial<CustomSectionItem>) => void;
  updateCustomSectionItem: (sectionId: string, itemId: string, updated: Partial<CustomSectionItem>) => void;
  deleteCustomSectionItem: (sectionId: string, itemId: string) => void;
  updateStyling: (styling: Partial<ResumeData['styling']>) => void;
  updateSectionOrder: (order: string[]) => void;
  toggleSectionEnabled: (sectionId: string) => void;
  toggleProfilePhoto: () => void;
  importResumeJSON: (json: string) => boolean;
  /** ID of the currently loaded resume in the list (null = unsaved/demo) */
  activeResumeId: string | null;
  setActiveResumeId: (id: string | null) => void;
  /** Persist current resumeData back into the list entry */
  persistToList: () => void;
  /** Load a specific resume from the list into the editor */
  loadResumeById: (entry: ResumeListEntry) => void;
  // ── Cover Letter Context Operations ──
  activeCoverLetterId: string | null;
  setActiveCoverLetterId: (id: string | null) => void;
  activeCoverLetterData: CoverLetterData | null;
  setActiveCoverLetterData: React.Dispatch<React.SetStateAction<CoverLetterData | null>>;
  coverLettersList: CoverLetterEntry[];
  createNewCoverLetter: (templateId: string, name?: string) => void;
  loadCoverLetterById: (entry: CoverLetterEntry) => void;
  deleteCoverLetter: (id: string) => void;
  duplicateCoverLetter: (id: string) => void;
  updateCoverLetterName: (name: string) => void;
  manualSaveCoverLetter: () => void;
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  triggerLogin: (onSuccess: () => void) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  loginSuccessCallback: (() => void) | null;
  setLoginSuccessCallback: (cb: (() => void) | null) => void;
  resumesList: ResumeListEntry[];
  refreshResumeList: () => void;
  refreshCoverLetterList: () => void;
  // ── Linktree Context Operations ──
  linktreePages: LinktreePage[];
  refreshLinktreeList: () => void;
  saveLinktreePage: (page: LinktreePage) => void;
  deleteLinktreePage: (id: string) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// ─── Helper: merge saved data safely ──────────────────────────────────────
export function mergeWithInitial(parsed: Partial<ResumeData>): ResumeData {
  const pi = parsed.personalInfo || {};
  return {
    ...initialResumeData,
    ...parsed,
    resumeName: parsed.resumeName || initialResumeData.resumeName,
    customSectionTitles: {
      ...initialResumeData.customSectionTitles,
      ...(parsed.customSectionTitles || {}),
    },
    personalInfo: {
      ...initialResumeData.personalInfo,
      ...pi,
      contactItems: (() => {
        const rawItems = (pi as any).contactItems;
        // Explicitly provided array (even empty) → always use it as-is
        if (Array.isArray(rawItems)) return rawItems;
        // Legacy format migration (old keys: email, phone, location, website)
        const legacy: ContactItem[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const old = pi as any;
        if (old.email) legacy.push({ id: `ci-m-email`, type: 'email', value: old.email });
        if (old.phone) legacy.push({ id: `ci-m-phone`, type: 'phone', value: old.phone });
        if (old.location) legacy.push({ id: `ci-m-addr`, type: 'address', value: old.location });
        if (old.website) legacy.push({ id: `ci-m-web`, type: 'website', value: old.website });
        return legacy.length > 0 ? legacy : initialResumeData.personalInfo.contactItems;
      })(),
    },
    sectionOrder: parsed.sectionOrder || initialResumeData.sectionOrder,
    disabledSections: parsed.disabledSections || [],
    showProfilePhoto: parsed.showProfilePhoto !== undefined ? parsed.showProfilePhoto : true,
    styling: { ...initialResumeData.styling, ...(parsed.styling || {}) },
  };
}

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);

  // ── Auth states ─────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginSuccessCallback, setLoginSuccessCallback] = useState<(() => void) | null>(null);
  const [resumesList, setResumesList] = useState<ResumeListEntry[]>([]);

  // ── Cover Letter states ──
  const [coverLettersList, setCoverLettersList] = useState<CoverLetterEntry[]>([]);
  const [activeCoverLetterId, setActiveCoverLetterId] = useState<string | null>(null);
  const [activeCoverLetterData, setActiveCoverLetterData] = useState<CoverLetterData | null>(null);

  const refreshResumeList = useCallback(() => {
    const list = loadResumeList();
    if (user?.email) {
      setResumesList(list.filter(entry => entry.userId === user.email));
    } else {
      setResumesList(list.filter(entry => !entry.userId));
    }
  }, [user]);

  const refreshCoverLetterList = useCallback(() => {
    const list = loadCoverLetterList();
    if (user?.email) {
      setCoverLettersList(list.filter(entry => entry.userId === user.email));
    } else {
      setCoverLettersList(list.filter(entry => !entry.userId));
    }
  }, [user]);

  // ── Linktree states and methods ──
  const [linktreePages, setLinktreePages] = useState<LinktreePage[]>([]);

  const refreshLinktreeList = useCallback(() => {
    const list = loadLinktreeList();
    if (user?.email) {
      setLinktreePages(list.filter(entry => entry.userId === user.email));
    } else {
      setLinktreePages(list.filter(entry => !entry.userId));
    }
  }, [user]);

  const saveLinktreePage = useCallback((page: LinktreePage) => {
    const list = loadLinktreeList();
    const idx = list.findIndex(e => e.id === page.id);
    const updatedPage = {
      ...page,
      updatedAt: new Date().toISOString(),
      userId: user?.email || undefined
    };
    if (idx >= 0) {
      list[idx] = updatedPage;
    } else {
      list.push(updatedPage);
    }
    saveLinktreeList(list);
    refreshLinktreeList();
  }, [user, refreshLinktreeList]);

  const deleteLinktreePage = useCallback((id: string) => {
    const list = loadLinktreeList();
    const updatedList = list.filter(e => e.id !== id);
    saveLinktreeList(updatedList);
    refreshLinktreeList();
  }, [refreshLinktreeList]);



  // ── Load Auth and Resumes on mount ──────────────────────────────────────
  useEffect(() => {
    // Load user state
    const savedUser = localStorage.getItem('auth_user_v1');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }

    const loadFromStore = async () => {
      try {
        // Resumes load
        let dbResumes = await dbGet<ResumeListEntry[]>(RESUME_LIST_KEY);
        if (!dbResumes) {
          const localRaw = localStorage.getItem(RESUME_LIST_KEY);
          dbResumes = localRaw ? JSON.parse(localRaw) : [];
          await dbSet(RESUME_LIST_KEY, dbResumes);
        }
        cachedResumeList = dbResumes || [];

        // Legacy migration
        const legacy = localStorage.getItem('resume_maker_data');
        if (legacy && cachedResumeList.length === 0) {
          try {
            const parsed = JSON.parse(legacy);
            if (parsed && typeof parsed === 'object' && parsed.personalInfo) {
              const merged = mergeWithInitial(parsed);
              const entry: ResumeListEntry = {
                id: 'resume-migrated',
                name: merged.resumeName || 'Resume 1',
                updatedAt: new Date().toISOString(),
                data: merged,
              };
              cachedResumeList = [entry];
              await dbSet(RESUME_LIST_KEY, cachedResumeList);
              setResumeData(merged);
              setActiveResumeId(entry.id);
            }
          } catch (e) {
            console.error('Failed to migrate resume data', e);
          }
        }

        // Cover Letters load
        let dbCoverLetters = await dbGet<CoverLetterEntry[]>(COVER_LETTER_LIST_KEY);
        if (!dbCoverLetters) {
          const localRaw = localStorage.getItem(COVER_LETTER_LIST_KEY);
          dbCoverLetters = localRaw ? JSON.parse(localRaw) : [];
          await dbSet(COVER_LETTER_LIST_KEY, dbCoverLetters);
        }
        cachedCoverLetterList = dbCoverLetters || [];

        // Linktrees load
        let dbLinktrees = await dbGet<LinktreePage[]>(LINKTREE_LIST_KEY);
        if (!dbLinktrees) {
          const localRaw = localStorage.getItem(LINKTREE_LIST_KEY);
          dbLinktrees = localRaw ? JSON.parse(localRaw) : [];
          await dbSet(LINKTREE_LIST_KEY, dbLinktrees);
        }
        cachedLinktreeList = (dbLinktrees || []).map(p => ({
          ...p,
          theme: {
            ...p.theme,
            blockRadius: p.theme.blockRadius ?? 20,
          }
        }));

        refreshResumeList();
        refreshCoverLetterList();
        refreshLinktreeList();
      } catch (err) {
        console.error('Error loading data from IndexedDB:', err);
        try {
          const rawRes = localStorage.getItem(RESUME_LIST_KEY);
          cachedResumeList = rawRes ? JSON.parse(rawRes) : [];
          const rawCl = localStorage.getItem(COVER_LETTER_LIST_KEY);
          cachedCoverLetterList = rawCl ? JSON.parse(rawCl) : [];
          const rawLt = localStorage.getItem(LINKTREE_LIST_KEY);
          cachedLinktreeList = rawLt ? JSON.parse(rawLt) : [];
          refreshResumeList();
          refreshCoverLetterList();
          refreshLinktreeList();
        } catch {}
      } finally {
        setHydrated(true);
      }
    };

    loadFromStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh lists whenever hydrated or user changes
  useEffect(() => {
    if (hydrated) {
      refreshResumeList();
      refreshCoverLetterList();
      refreshLinktreeList();
    }
  }, [hydrated, user, refreshResumeList, refreshCoverLetterList, refreshLinktreeList]);

  // ── Auth Actions ────────────────────────────────────────────────────────
  const login = (email: string, name?: string) => {
    const defaultName = name || email.split('@')[0];
    const newUser = { name: defaultName, email, isLoggedIn: true };
    setUser(newUser);
    localStorage.setItem('auth_user_v1', JSON.stringify(newUser));

    // Link guest resumes to this logged-in user!
    const list = loadResumeList();
    const newList = list.map(entry => {
      if (!entry.userId) {
        entry.userId = email;
      }
      return entry;
    });
    saveResumeList(newList);
    refreshResumeList();

    // Link guest cover letters to this logged-in user!
    const clList = loadCoverLetterList();
    const newClList = clList.map(entry => {
      if (!entry.userId) {
        entry.userId = email;
      }
      return entry;
    });
    saveCoverLetterList(newClList);
    refreshCoverLetterList();

    // Link guest linktrees to this logged-in user!
    const ltList = loadLinktreeList();
    const newLtList = ltList.map(entry => {
      if (!entry.userId) {
        entry.userId = email;
      }
      return entry;
    });
    saveLinktreeList(newLtList);
    refreshLinktreeList();

    setLoginModalOpen(false);

    // Run callback if deferred
    if (loginSuccessCallback) {
      loginSuccessCallback();
      setLoginSuccessCallback(null);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user_v1');
    setActiveResumeId(null);
    setResumeData(initialResumeData);
    setActiveCoverLetterId(null);
    setActiveCoverLetterData(null);
    refreshLinktreeList();
  };

  const triggerLogin = useCallback((onSuccess: () => void) => {
    setLoginSuccessCallback(() => onSuccess);
    setLoginModalOpen(true);
  }, []);

  // Auto-save with visual feedback — saves into the list entry if one is active
  useEffect(() => {
    if (!hydrated) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      if (activeResumeId) {
        const list = loadResumeList();
        const idx = list.findIndex(e => e.id === activeResumeId);
        const entry: ResumeListEntry = {
          id: activeResumeId,
          name: resumeData.resumeName,
          updatedAt: new Date().toISOString(),
          data: resumeData,
          userId: user?.email || undefined,
        };
        if (idx >= 0) list[idx] = entry; else list.push(entry);
        saveResumeList(list);
        refreshResumeList();
      }
      setSaveStatus('saved');
      const reset = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(reset);
    }, 600);
    return () => clearTimeout(timer);
  }, [hydrated, resumeData, activeResumeId, user, refreshResumeList]);

  const manualSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      if (activeResumeId) {
        const list = loadResumeList();
        const idx = list.findIndex(e => e.id === activeResumeId);
        const entry: ResumeListEntry = { 
          id: activeResumeId, 
          name: resumeData.resumeName, 
          updatedAt: new Date().toISOString(), 
          data: resumeData,
          userId: user?.email || undefined,
        };
        if (idx >= 0) list[idx] = entry; else list.push(entry);
        saveResumeList(list);
        refreshResumeList();
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 400);
  };

  const persistToList = useCallback(() => {
    if (!activeResumeId) return;
    const list = loadResumeList();
    const idx = list.findIndex(e => e.id === activeResumeId);
    const entry: ResumeListEntry = { 
      id: activeResumeId, 
      name: resumeData.resumeName, 
      updatedAt: new Date().toISOString(), 
      data: resumeData,
      userId: user?.email || undefined,
    };
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    saveResumeList(list);
    refreshResumeList();
  }, [activeResumeId, resumeData, user, refreshResumeList]);

  const loadResumeById = useCallback((entry: ResumeListEntry) => {
    setResumeData(mergeWithInitial(entry.data));
    setActiveResumeId(entry.id);
  }, []);

  // ── Rename functions ──────────────────────────────────────────────────────
  const updateResumeName = (name: string) => {
    setResumeData((prev) => ({ ...prev, resumeName: name }));
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSectionTitles: {
        ...prev.customSectionTitles,
        [sectionId]: title,
      },
    }));
  };

  // ── Personal info ────────────────────────────────────────────────────────
  const updatePersonalInfo = (info: Partial<ResumeData['personalInfo']>) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }));
  };

  // ── Contact items ────────────────────────────────────────────────────────
  const addContactItem = (type: ContactType = 'email') => {
    const newItem: ContactItem = { id: `ci-${Date.now()}`, type, value: '' };
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        contactItems: [...prev.personalInfo.contactItems, newItem],
      },
    }));
  };

  const updateContactItem = (id: string, patch: Partial<ContactItem>) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        contactItems: prev.personalInfo.contactItems.map((ci) =>
          ci.id === id ? { ...ci, ...patch } : ci
        ),
      },
    }));
  };

  const deleteContactItem = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        contactItems: prev.personalInfo.contactItems.filter((ci) => ci.id !== id),
      },
    }));
  };

  const reorderContactItems = (items: ContactItem[]) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, contactItems: items },
    }));
  };

  // ── Summary ──────────────────────────────────────────────────────────────
  const updateSummary = (summary: string) => {
    setResumeData((prev) => ({ ...prev, summary }));
  };

  // ── Experience ───────────────────────────────────────────────────────────
  const addExperience = () => {
    const newExp: Experience = { id: `exp-${Date.now()}`, company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' };
    setResumeData((prev) => ({ ...prev, experience: [...prev.experience, newExp] }));
  };
  const updateExperience = (id: string, updatedExp: Partial<Experience>) => {
    setResumeData((prev) => ({ ...prev, experience: prev.experience.map((e) => (e.id === id ? { ...e, ...updatedExp } : e)) }));
  };
  const deleteExperience = (id: string) => {
    setResumeData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  };

  // ── Education ────────────────────────────────────────────────────────────
  const addEducation = () => {
    const newEdu: Education = { id: `edu-${Date.now()}`, school: '', degree: '', location: '', startDate: '', endDate: '', current: false, description: '' };
    setResumeData((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  };
  const updateEducation = (id: string, updatedEdu: Partial<Education>) => {
    setResumeData((prev) => ({ ...prev, education: prev.education.map((e) => (e.id === id ? { ...e, ...updatedEdu } : e)) }));
  };
  const deleteEducation = (id: string) => {
    setResumeData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  };

  // ── Skills ───────────────────────────────────────────────────────────────
  const addSkill = () => {
    setResumeData((prev) => ({ ...prev, skills: [...prev.skills, { id: `skill-${Date.now()}`, name: '', level: '' }] }));
  };
  const updateSkill = (id: string, updatedSkill: Partial<Skill>) => {
    setResumeData((prev) => ({ ...prev, skills: prev.skills.map((s) => (s.id === id ? { ...s, ...updatedSkill } : s)) }));
  };
  const deleteSkill = (id: string) => {
    setResumeData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s.id !== id) }));
  };

  const addLanguage = () => {
    const std = resumeData.languageStandard || 'descriptive';
    const defaultProf = std === 'descriptive' ? 'Fluent' : std === 'cefr' ? 'B2' : '3 – Professional Working Proficiency';
    setResumeData((prev) => ({ ...prev, languages: [...prev.languages, { id: `lang-${Date.now()}`, name: '', proficiency: defaultProf }] }));
  };
  const updateLanguage = (id: string, updatedLang: Partial<Language>) => {
    setResumeData((prev) => ({ ...prev, languages: prev.languages.map((l) => (l.id === id ? { ...l, ...updatedLang } : l)) }));
  };
  const deleteLanguage = (id: string) => {
    setResumeData((prev) => ({ ...prev, languages: prev.languages.filter((l) => l.id !== id) }));
  };
  const reorderLanguages = (languages: Language[]) => {
    setResumeData((prev) => ({ ...prev, languages }));
  };
  const updateLanguageStandard = (standard: 'descriptive' | 'cefr' | 'ilr') => {
    setResumeData((prev) => {
      const updatedLanguages = prev.languages.map((lang) => ({
        ...lang,
        proficiency: getProficiencyForStandard(lang.proficiency, standard),
      }));
      return {
        ...prev,
        languageStandard: standard,
        languages: updatedLanguages,
      };
    });
  };

  // ── Certifications ───────────────────────────────────────────────────────
  const addCertification = () => {
    setResumeData((prev) => ({ ...prev, certifications: [...prev.certifications, { id: `cert-${Date.now()}`, name: '', issuer: '', date: '', link: '' }] }));
  };
  const updateCertification = (id: string, updatedCert: Partial<Certification>) => {
    setResumeData((prev) => ({ ...prev, certifications: prev.certifications.map((c) => (c.id === id ? { ...c, ...updatedCert } : c)) }));
  };
  const deleteCertification = (id: string) => {
    setResumeData((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c.id !== id) }));
  };

  // ── Custom Sections ──────────────────────────────────────────────────────
  const addCustomSection = (title: string, type: 'text' | 'list', customId?: string) => {
    const id = customId || `custom-${Date.now()}`;
    setResumeData((prev) => {
      const exists = (prev.customSections || []).some((s) => s.id === id);
      let nextCustomSections = prev.customSections || [];
      if (!exists) {
        const newSection: CustomSection = {
          id,
          title,
          type,
          content: '',
          items: type === 'list' ? [{ id: `item-${Date.now()}`, title: '', subtitle: '', date: '', description: '' }] : []
        };
        nextCustomSections = [...nextCustomSections, newSection];
      }

      const order = prev.sectionOrder.includes(id) ? prev.sectionOrder : [...prev.sectionOrder, id];
      const disabled = (prev.disabledSections || []).filter((s) => s !== id);

      return {
        ...prev,
        customSections: nextCustomSections,
        sectionOrder: order,
        disabledSections: disabled
      };
    });
  };

  const updateCustomSection = (id: string, updated: Partial<CustomSection>) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((sec) =>
        sec.id === id ? { ...sec, ...updated } : sec
      )
    }));
  };

  const deleteCustomSection = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter((sec) => sec.id !== id),
      sectionOrder: prev.sectionOrder.filter((secId) => secId !== id)
    }));
  };

  const addCustomSectionItem = (sectionId: string, initialData?: Partial<CustomSectionItem>) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              items: [...sec.items, { id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, title: '', subtitle: '', date: '', description: '', ...initialData }]
            }
          : sec
      )
    }));
  };

  const updateCustomSectionItem = (sectionId: string, itemId: string, updated: Partial<CustomSectionItem>) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              items: sec.items.map((item) => (item.id === itemId ? { ...item, ...updated } : item))
            }
          : sec
      )
    }));
  };

  const deleteCustomSectionItem = (sectionId: string, itemId: string) => {
    setResumeData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              items: sec.items.filter((item) => item.id !== itemId)
            }
          : sec
      )
    }));
  };

  // ── Styling / order / visibility ─────────────────────────────────────────
  const updateStyling = (styling: Partial<ResumeData['styling']>) => {
    setResumeData((prev) => ({ ...prev, styling: { ...prev.styling, ...styling } }));
  };
  const updateSectionOrder = (order: string[]) => {
    setResumeData((prev) => ({ ...prev, sectionOrder: order }));
  };
  const toggleSectionEnabled = (sectionId: string) => {
    setResumeData((prev) => {
      const disabled = prev.disabledSections || [];
      const isDisabled = disabled.includes(sectionId);
      return { ...prev, disabledSections: isDisabled ? disabled.filter((s) => s !== sectionId) : [...disabled, sectionId] };
    });
  };
  const toggleProfilePhoto = () => {
    setResumeData((prev) => ({ ...prev, showProfilePhoto: !prev.showProfilePhoto }));
  };

  // ── Import ───────────────────────────────────────────────────────────────
  const importResumeJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data && typeof data === 'object' && data.personalInfo) {
        setResumeData(mergeWithInitial(data));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // ── Cover Letter Actions ──
  const createNewCoverLetter = useCallback((templateId: string, name = 'Untitled Cover Letter') => {
    const newCl: CoverLetterData = {
      ...initialCoverLetterData,
      name,
      templateId: templateId === 'scratch' ? 'minimal' : templateId,
    };
    const newEntry: CoverLetterEntry = {
      id: `cl-${Math.random().toString(36).substr(2, 9)}`,
      name,
      updatedAt: new Date().toISOString(),
      data: newCl,
      userId: user?.email || undefined,
    };
    const list = loadCoverLetterList();
    list.push(newEntry);
    saveCoverLetterList(list);
    refreshCoverLetterList();
    setActiveCoverLetterId(newEntry.id);
    setActiveCoverLetterData(newCl);
  }, [user, refreshCoverLetterList]);

  const loadCoverLetterById = useCallback((entry: CoverLetterEntry) => {
    setActiveCoverLetterData(entry.data);
    setActiveCoverLetterId(entry.id);
  }, []);

  const deleteCoverLetter = useCallback((id: string) => {
    const list = loadCoverLetterList();
    const updated = list.filter(e => e.id !== id);
    saveCoverLetterList(updated);
    refreshCoverLetterList();
    if (activeCoverLetterId === id) {
      setActiveCoverLetterId(null);
      setActiveCoverLetterData(null);
    }
  }, [activeCoverLetterId, refreshCoverLetterList]);

  const duplicateCoverLetter = useCallback((id: string) => {
    const list = loadCoverLetterList();
    const match = list.find(e => e.id === id);
    if (!match) return;

    const newEntry: CoverLetterEntry = {
      ...match,
      id: `cl-${Math.random().toString(36).substr(2, 9)}`,
      name: `${match.name} (Copy)`,
      updatedAt: new Date().toISOString(),
      data: {
        ...match.data,
        name: `${match.data.name} (Copy)`,
      },
    };
    list.push(newEntry);
    saveCoverLetterList(list);
    refreshCoverLetterList();
  }, [refreshCoverLetterList]);

  const updateCoverLetterName = useCallback((name: string) => {
    if (!activeCoverLetterId) return;
    setActiveCoverLetterData(prev => prev ? { ...prev, name } : null);
  }, [activeCoverLetterId]);

  // Cover Letter Auto-save Effect
  useEffect(() => {
    if (!hydrated) return;
    if (!activeCoverLetterId || !activeCoverLetterData) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const list = loadCoverLetterList();
      const idx = list.findIndex(e => e.id === activeCoverLetterId);
      const entry: CoverLetterEntry = {
        id: activeCoverLetterId,
        name: activeCoverLetterData.name,
        updatedAt: new Date().toISOString(),
        data: activeCoverLetterData,
        userId: user?.email || undefined,
      };
      if (idx >= 0) list[idx] = entry; else list.push(entry);
      saveCoverLetterList(list);
      refreshCoverLetterList();
      setSaveStatus('saved');
      const reset = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(reset);
    }, 600);
    return () => clearTimeout(timer);
  }, [hydrated, activeCoverLetterData, activeCoverLetterId, user, refreshCoverLetterList]);

  const manualSaveCoverLetter = useCallback(() => {
    if (!activeCoverLetterId || !activeCoverLetterData) return;
    setSaveStatus('saving');
    const list = loadCoverLetterList();
    const idx = list.findIndex(e => e.id === activeCoverLetterId);
    const entry: CoverLetterEntry = {
      id: activeCoverLetterId,
      name: activeCoverLetterData.name,
      updatedAt: new Date().toISOString(),
      data: activeCoverLetterData,
      userId: user?.email || undefined,
    };
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    saveCoverLetterList(list);
    refreshCoverLetterList();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [activeCoverLetterId, activeCoverLetterData, user, refreshCoverLetterList]);

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        saveStatus,
        manualSave,
        updateResumeName,
        updateSectionTitle,
        updatePersonalInfo,
        addContactItem,
        updateContactItem,
        deleteContactItem,
        reorderContactItems,
        updateSummary,
        addExperience,
        updateExperience,
        deleteExperience,
        addEducation,
        updateEducation,
        deleteEducation,
        addSkill,
        updateSkill,
        deleteSkill,
        addLanguage,
        updateLanguage,
        deleteLanguage,
        reorderLanguages,
        updateLanguageStandard,
        addCertification,
        updateCertification,
        deleteCertification,
        addCustomSection,
        updateCustomSection,
        deleteCustomSection,
        addCustomSectionItem,
        updateCustomSectionItem,
        deleteCustomSectionItem,
        updateStyling,
        updateSectionOrder,
        toggleSectionEnabled,
        toggleProfilePhoto,
        importResumeJSON,
        activeResumeId,
        setActiveResumeId,
        persistToList,
        loadResumeById,
        activeCoverLetterId,
        setActiveCoverLetterId,
        activeCoverLetterData,
        setActiveCoverLetterData,
        coverLettersList,
        createNewCoverLetter,
        loadCoverLetterById,
        deleteCoverLetter,
        duplicateCoverLetter,
        updateCoverLetterName,
        manualSaveCoverLetter,
        user,
        login,
        logout,
        triggerLogin,
        loginModalOpen,
        setLoginModalOpen,
        loginSuccessCallback,
        setLoginSuccessCallback,
        resumesList,
        refreshResumeList,
        refreshCoverLetterList,
        // ── Linktree Context Operations ──
        linktreePages,
        refreshLinktreeList,
        saveLinktreePage,
        deleteLinktreePage,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) throw new Error('useResume must be used within a ResumeProvider');
  return context;
};

function getProficiencyForStandard(prof: string, standard: 'descriptive' | 'cefr' | 'ilr'): string {
  const descriptiveOpts = ['Native', 'Bilingual', 'Fluent', 'Advanced', 'Professional Working', 'Intermediate', 'Conversational', 'Basic', 'Beginner'];
  const cefrOpts = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const ilrOpts = [
    '0 – No Proficiency',
    '1 – Elementary Proficiency',
    '2 – Limited Working Proficiency',
    '3 – Professional Working Proficiency',
    '4 – Full Professional Proficiency',
    '5 – Native or Bilingual Proficiency'
  ];

  if (standard === 'descriptive') {
    if (descriptiveOpts.includes(prof)) return prof;
    // Map CEFR/ILR to Descriptive
    if (prof === 'C2' || prof.startsWith('5')) return 'Native';
    if (prof === 'C1' || prof.startsWith('4')) return 'Professional Working';
    if (prof === 'B2' || prof.startsWith('3')) return 'Fluent';
    if (prof === 'B1' || prof.startsWith('2')) return 'Intermediate';
    if (prof === 'A2' || prof.startsWith('1')) return 'Conversational';
    return 'Beginner';
  } else if (standard === 'cefr') {
    if (cefrOpts.includes(prof)) return prof;
    // Map Descriptive/ILR to CEFR
    if (prof === 'Native' || prof === 'Bilingual' || prof.startsWith('5')) return 'C2';
    if (prof === 'Fluent' || prof === 'Advanced' || prof.startsWith('4')) return 'C1';
    if (prof === 'Professional Working' || prof.startsWith('3')) return 'B2';
    if (prof === 'Intermediate' || prof.startsWith('2')) return 'B1';
    if (prof === 'Conversational' || prof.startsWith('1')) return 'A2';
    return 'A1';
  } else {
    if (ilrOpts.includes(prof)) return prof;
    // Map Descriptive/CEFR to ILR
    if (prof === 'Native' || prof === 'Bilingual' || prof === 'C2') return '5 – Native or Bilingual Proficiency';
    if (prof === 'Fluent' || prof === 'Advanced' || prof === 'C1') return '4 – Full Professional Proficiency';
    if (prof === 'Professional Working' || prof === 'B2') return '3 – Professional Working Proficiency';
    if (prof === 'Intermediate' || prof === 'B1') return '2 – Limited Working Proficiency';
    if (prof === 'Conversational' || prof === 'A2') return '1 – Elementary Proficiency';
    return '0 – No Proficiency';
  }
}
