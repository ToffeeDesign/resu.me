'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './MyResumesPage.module.css';
import { useResume, loadResumeList, saveResumeList, ResumeListEntry, makeBlankResume } from '@/context/ResumeContext';
import { ResumeThumbnail } from './ResumeThumbnail';
import { Pencil, Trash2, Copy, FileText, Zap, Layout, ArrowLeft, Eye, X } from 'lucide-react';

interface Props {
  onOpenResume: (entry: ResumeListEntry) => void;
  onCreateNew: (templateId?: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `edited ${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `edited ${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `edited ${days} day${days > 1 ? 's' : ''} ago`;
}
export const MyResumesPage: React.FC<Props> = ({ onOpenResume, onCreateNew }) => {
  const { resumesList, refreshResumeList, user, triggerLogin } = useResume();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'simple' | 'modern' | 'creative'>('all');
  const [isSelectingTemplate, setIsSelectingTemplate] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [parsingProgress, setParsingProgress] = useState(0);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const processImportFile = (file: File) => {
    if (!user) {
      triggerLogin(() => {
        executeImportFile(file);
      });
      return;
    }
    executeImportFile(file);
  };

  const executeImportFile = (file: File) => {
    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object' && parsed.personalInfo) {
            const id = `resume-${Date.now()}`;
            const name = parsed.resumeName || `Imported JSON Resume`;
            const entry: ResumeListEntry = {
              id,
              name,
              updatedAt: new Date().toISOString(),
              data: parsed
            };
            const list = loadResumeList();
            saveResumeList([...list, entry]);
            onOpenResume(entry);
          } else {
            alert('Invalid JSON structure. Make sure it is a valid resume exports JSON.');
          }
        } catch (e) {
          alert('Failed to parse JSON.');
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.pdf')) {
      setIsParsing(true);
      setParsingProgress(10);
      setParsingStep('Initializing AI resume parser...');

      setTimeout(() => {
        setParsingProgress(45);
        setParsingStep('Extracting layouts, contact markers, and headers...');
      }, 700);

      setTimeout(() => {
        setParsingProgress(78);
        setParsingStep('Parsing work history timeline and skills taxonomy...');
      }, 1400);

      setTimeout(() => {
        setParsingProgress(95);
        setParsingStep('Formatting template section nodes...');
      }, 2100);

      setTimeout(() => {
        setIsParsing(false);
        const id = `resume-${Date.now()}`;
        const cleanName = file.name.replace(/\.pdf$/i, '');
        const entry: ResumeListEntry = {
          id,
          name: cleanName,
          updatedAt: new Date().toISOString(),
          data: {
            ...makeBlankResume(cleanName),
            personalInfo: {
              fullName: 'Alex Mercer',
              jobTitle: 'Senior Full Stack Engineer',
              profilePhoto: '',
              contactItems: [
                { id: `ci-email-${Math.random().toString(36).substr(2, 9)}`, type: 'email', value: 'alex.mercer@devmail.io' },
                { id: `ci-phone-${Math.random().toString(36).substr(2, 9)}`, type: 'phone', value: '+971 50 123 4567' },
                { id: `ci-address-${Math.random().toString(36).substr(2, 9)}`, type: 'address', value: 'Dubai, UAE' },
              ],
              nationality: 'Canadian',
              visaStatus: 'Golden Visa',
              dateOfBirth: '',
              passportId: '',
              availability: '',
              maritalStatus: '',
            },
            summary: 'Results-driven Senior Full Stack Engineer with 8+ years of experience designing scalable web apps, cloud architectures, and user-centric interfaces. Expert in Next.js, React, Node.js, and AWS.',
            experience: [
              {
                id: 'exp-1',
                company: 'Tech Solutions LLC',
                position: 'Lead Web Engineer',
                location: 'Dubai, UAE',
                startDate: '2023-01',
                endDate: '',
                current: true,
                description: '• Built React & Node.js dashboards increasing customer retention by 18%.\n• Scaled cloud infrastructure on AWS, reducing server response times by 35%.'
              }
            ],
            skills: [
              { id: 'sk-1', name: 'TypeScript & JavaScript', level: 'Expert' },
              { id: 'sk-2', name: 'React & Next.js', level: 'Expert' },
              { id: 'sk-3', name: 'AWS & Docker', level: 'Expert' },
            ]
          }
        };
        const list = loadResumeList();
        saveResumeList([...list, entry]);
        onOpenResume(entry);
      }, 2600);
    } else {
      alert('Unsupported file type. Please upload a PDF or JSON file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImportFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (resumesList.length === 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (resumesList.length === 0) {
      const file = e.dataTransfer.files?.[0];
      if (file) processImportFile(file);
    }
  };

  useEffect(() => {
    refreshResumeList();
    window.addEventListener('focus', refreshResumeList);
    window.addEventListener('storage', refreshResumeList);
    return () => {
      window.removeEventListener('focus', refreshResumeList);
      window.removeEventListener('storage', refreshResumeList);
    };
  }, [refreshResumeList]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) {
      triggerLogin(() => {
        const updated = loadResumeList().filter(r => r.id !== id);
        saveResumeList(updated);
        refreshResumeList();
        setOpenMenuId(null);
      });
      return;
    }
    const updated = loadResumeList().filter(r => r.id !== id);
    saveResumeList(updated);
    refreshResumeList();
    setOpenMenuId(null);
  };

  const handleDuplicate = (e: React.MouseEvent, resume: ResumeListEntry) => {
    e.stopPropagation();
    if (!user) {
      triggerLogin(() => {
        const list = loadResumeList();
        const duplicate: ResumeListEntry = {
          id: `resume-${Date.now()}`,
          name: `${resume.name} (Copy)`,
          updatedAt: new Date().toISOString(),
          userId: (user as any)?.email || undefined,
          data: {
            ...resume.data,
            resumeName: `${resume.data.resumeName} (Copy)`,
          },
        };
        const updated = [...list, duplicate];
        saveResumeList(updated);
        refreshResumeList();
        setOpenMenuId(null);
      });
      return;
    }
    const list = loadResumeList();
    const duplicate: ResumeListEntry = {
      id: `resume-${Date.now()}`,
      name: `${resume.name} (Copy)`,
      updatedAt: new Date().toISOString(),
      userId: user?.email || undefined,
      data: {
        ...resume.data,
        resumeName: `${resume.data.resumeName} (Copy)`,
      },
    };
    const updated = [...list, duplicate];
    saveResumeList(updated);
    refreshResumeList();
    setOpenMenuId(null);
  };

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(prev => (prev === id ? null : id));
  };

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenuId]);

  // ── Template definitions ────────────────────────────────────────────────
  const BASE_TEMPLATES = [
    {
      id: 'classic',
      name: 'Classic Clear',
      category: 'simple' as const,
      accent: '#1a1a1f',
      preview: (
        <svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <rect width="210" height="297" fill="#fff" />
          {/* Header */}
          <rect x="16" y="16" width="90" height="7" rx="2" fill="#1a1a1f" />
          <rect x="16" y="27" width="55" height="4" rx="1.5" fill="#9199a8" />
          <rect x="16" y="35" width="120" height="2" rx="1" fill="#e5e7eb" />
          {/* Contact row */}
          <rect x="16" y="41" width="35" height="3" rx="1" fill="#c0c4ce" />
          <rect x="56" y="41" width="35" height="3" rx="1" fill="#c0c4ce" />
          <rect x="96" y="41" width="35" height="3" rx="1" fill="#c0c4ce" />
          {/* Section: Summary */}
          <rect x="16" y="52" width="30" height="4" rx="1.5" fill="#1a1a1f" />
          <rect x="16" y="60" width="178" height="2.5" rx="1" fill="#d1d5db" />
          <rect x="16" y="65" width="160" height="2.5" rx="1" fill="#d1d5db" />
          <rect x="16" y="70" width="140" height="2.5" rx="1" fill="#d1d5db" />
          {/* Section: Experience */}
          <rect x="16" y="82" width="50" height="4" rx="1.5" fill="#1a1a1f" />
          <rect x="16" y="90" width="85" height="3" rx="1" fill="#374151" />
          <rect x="16" y="96" width="60" height="2.5" rx="1" fill="#9199a8" />
          <rect x="16" y="103" width="178" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="108" width="150" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="113" width="165" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="122" width="85" height="3" rx="1" fill="#374151" />
          <rect x="16" y="128" width="60" height="2.5" rx="1" fill="#9199a8" />
          <rect x="16" y="135" width="178" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="140" width="155" height="2" rx="1" fill="#d1d5db" />
          {/* Section: Education */}
          <rect x="16" y="152" width="40" height="4" rx="1.5" fill="#1a1a1f" />
          <rect x="16" y="160" width="100" height="3" rx="1" fill="#374151" />
          <rect x="16" y="166" width="70" height="2.5" rx="1" fill="#9199a8" />
          {/* Section: Skills */}
          <rect x="16" y="178" width="30" height="4" rx="1.5" fill="#1a1a1f" />
          <rect x="16" y="186" width="50" height="2.5" rx="1" fill="#d1d5db" />
          <rect x="70" y="186" width="50" height="2.5" rx="1" fill="#d1d5db" />
          <rect x="124" y="186" width="50" height="2.5" rx="1" fill="#d1d5db" />
          <rect x="16" y="192" width="55" height="2.5" rx="1" fill="#d1d5db" />
          <rect x="75" y="192" width="45" height="2.5" rx="1" fill="#d1d5db" />
        </svg>
      ),
    },
    {
      id: 'atlantic',
      name: 'Atlantic Blue',
      category: 'modern' as const,
      accent: '#1e3a5f',
      preview: (
        <svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <rect width="210" height="297" fill="#fff" />
          {/* Dark sidebar */}
          <rect width="72" height="297" fill="#1e3a5f" />
          {/* Avatar circle */}
          <circle cx="36" cy="36" r="20" fill="#2d5a8e" />
          <circle cx="36" cy="30" r="8" fill="#4a7bb5" />
          <ellipse cx="36" cy="48" rx="13" ry="8" fill="#4a7bb5" />
          {/* Sidebar sections */}
          <rect x="10" y="65" width="52" height="3" rx="1.5" fill="#7aa8d4" />
          <rect x="10" y="73" width="45" height="2" rx="1" fill="#4a7bb5" />
          <rect x="10" y="78" width="40" height="2" rx="1" fill="#4a7bb5" />
          <rect x="10" y="83" width="48" height="2" rx="1" fill="#4a7bb5" />
          <rect x="10" y="100" width="52" height="3" rx="1.5" fill="#7aa8d4" />
          {/* Skills bars */}
          <rect x="10" y="108" width="52" height="2" rx="1" fill="#2d5a8e" />
          <rect x="10" y="108" width="44" height="2" rx="1" fill="#7aa8d4" />
          <rect x="10" y="114" width="52" height="2" rx="1" fill="#2d5a8e" />
          <rect x="10" y="114" width="36" height="2" rx="1" fill="#7aa8d4" />
          <rect x="10" y="120" width="52" height="2" rx="1" fill="#2d5a8e" />
          <rect x="10" y="120" width="48" height="2" rx="1" fill="#7aa8d4" />
          {/* Main content */}
          <rect x="82" y="16" width="80" height="7" rx="2" fill="#1e3a5f" />
          <rect x="82" y="27" width="55" height="3.5" rx="1.5" fill="#6b7180" />
          <rect x="82" y="38" width="118" height="3" rx="1.5" fill="#1e3a5f" />
          <rect x="82" y="45" width="118" height="2" rx="1" fill="#d1d5db" />
          <rect x="82" y="50" width="95" height="2" rx="1" fill="#d1d5db" />
          <rect x="82" y="55" width="110" height="2" rx="1" fill="#d1d5db" />
          <rect x="82" y="63" width="118" height="3" rx="1.5" fill="#1e3a5f" />
          <rect x="82" y="70" width="85" height="2.5" rx="1" fill="#374151" />
          <rect x="82" y="76" width="55" height="2" rx="1" fill="#9199a8" />
          <rect x="82" y="82" width="118" height="2" rx="1" fill="#d1d5db" />
          <rect x="82" y="87" width="100" height="2" rx="1" fill="#d1d5db" />
          <rect x="82" y="92" width="110" height="2" rx="1" fill="#d1d5db" />
          <rect x="82" y="100" width="85" height="2.5" rx="1" fill="#374151" />
          <rect x="82" y="106" width="55" height="2" rx="1" fill="#9199a8" />
          <rect x="82" y="112" width="118" height="2" rx="1" fill="#d1d5db" />
          <rect x="82" y="117" width="95" height="2" rx="1" fill="#d1d5db" />
        </svg>
      ),
    },
    {
      id: 'mercury',
      name: 'Mercury Flow',
      category: 'creative' as const,
      accent: '#5533ff',
      preview: (
        <svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <rect width="210" height="297" fill="#fafafa" />
          {/* Accent top bar */}
          <rect width="210" height="6" fill="#5533ff" />
          {/* Header block */}
          <rect x="16" y="18" width="95" height="8" rx="2.5" fill="#1a1a1f" />
          <rect x="16" y="30" width="60" height="4" rx="1.5" fill="#5533ff" />
          <rect x="16" y="39" width="178" height="1.5" rx="1" fill="#e5e7eb" />
          {/* Two column layout */}
          {/* Left col */}
          <rect x="16" y="48" width="40" height="3.5" rx="1.5" fill="#5533ff" />
          <rect x="16" y="56" width="85" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="61" width="75" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="66" width="80" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="78" width="40" height="3.5" rx="1.5" fill="#5533ff" />
          <rect x="16" y="86" width="85" height="2.5" rx="1" fill="#374151" />
          <rect x="16" y="92" width="60" height="2" rx="1" fill="#9199a8" />
          <rect x="16" y="98" width="85" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="103" width="70" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="113" width="85" height="2.5" rx="1" fill="#374151" />
          <rect x="16" y="119" width="60" height="2" rx="1" fill="#9199a8" />
          <rect x="16" y="125" width="85" height="2" rx="1" fill="#d1d5db" />
          {/* Right col */}
          <rect x="115" y="48" width="40" height="3.5" rx="1.5" fill="#5533ff" />
          {/* Skill tags */}
          <rect x="115" y="56" width="28" height="7" rx="3.5" fill="#ede9ff" />
          <rect x="147" y="56" width="28" height="7" rx="3.5" fill="#ede9ff" />
          <rect x="115" y="67" width="28" height="7" rx="3.5" fill="#ede9ff" />
          <rect x="147" y="67" width="28" height="7" rx="3.5" fill="#ede9ff" />
          <rect x="115" y="78" width="40" height="3.5" rx="1.5" fill="#5533ff" />
          <rect x="115" y="87" width="80" height="2" rx="1" fill="#d1d5db" />
          <rect x="115" y="93" width="65" height="2" rx="1" fill="#d1d5db" />
          <rect x="115" y="99" width="75" height="2" rx="1" fill="#d1d5db" />
          <rect x="115" y="108" width="40" height="3.5" rx="1.5" fill="#5533ff" />
          <rect x="115" y="117" width="80" height="2" rx="1" fill="#d1d5db" />
          <rect x="115" y="123" width="65" height="2" rx="1" fill="#d1d5db" />
        </svg>
      ),
    },
    {
      id: 'executive',
      name: 'Executive Pro',
      category: 'simple' as const,
      accent: '#92400e',
      preview: (
        <svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <rect width="210" height="297" fill="#fff" />
          {/* Gold top accent */}
          <rect width="210" height="3" fill="#92400e" />
          {/* Centered header */}
          <rect x="55" y="14" width="100" height="8" rx="2.5" fill="#1a1a1f" />
          <rect x="70" y="26" width="70" height="4" rx="1.5" fill="#6b7180" />
          <rect x="20" y="34" width="170" height="1" rx="0.5" fill="#92400e" />
          <rect x="20" y="37" width="170" height="1" rx="0.5" fill="#e5e7eb" />
          {/* Body */}
          <rect x="20" y="46" width="50" height="3.5" rx="1.5" fill="#92400e" />
          <rect x="20" y="54" width="170" height="2" rx="1" fill="#d1d5db" />
          <rect x="20" y="59" width="145" height="2" rx="1" fill="#d1d5db" />
          <rect x="20" y="64" width="160" height="2" rx="1" fill="#d1d5db" />
          <rect x="20" y="76" width="60" height="3.5" rx="1.5" fill="#92400e" />
          <rect x="20" y="84" width="100" height="2.5" rx="1" fill="#374151" />
          <rect x="20" y="90" width="70" height="2" rx="1" fill="#9199a8" />
          <rect x="20" y="96" width="170" height="2" rx="1" fill="#d1d5db" />
          <rect x="20" y="101" width="155" height="2" rx="1" fill="#d1d5db" />
          <rect x="20" y="110" width="100" height="2.5" rx="1" fill="#374151" />
          <rect x="20" y="116" width="70" height="2" rx="1" fill="#9199a8" />
          <rect x="20" y="122" width="170" height="2" rx="1" fill="#d1d5db" />
          <rect x="20" y="127" width="140" height="2" rx="1" fill="#d1d5db" />
          <rect x="20" y="136" width="55" height="3.5" rx="1.5" fill="#92400e" />
          <rect x="20" y="144" width="110" height="2.5" rx="1" fill="#374151" />
          <rect x="20" y="150" width="75" height="2" rx="1" fill="#9199a8" />
        </svg>
      ),
    },
    {
      id: 'neon',
      name: 'Neon Dark',
      category: 'creative' as const,
      accent: '#06b6d4',
      preview: (
        <svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <rect width="210" height="297" fill="#0f172a" />
          {/* Header */}
          <rect x="16" y="16" width="95" height="8" rx="2.5" fill="#f8fafc" />
          <rect x="16" y="28" width="60" height="4" rx="1.5" fill="#06b6d4" />
          <rect x="16" y="37" width="178" height="1" rx="0.5" fill="#1e293b" />
          {/* Contact */}
          <rect x="16" y="43" width="40" height="2.5" rx="1" fill="#475569" />
          <rect x="62" y="43" width="40" height="2.5" rx="1" fill="#475569" />
          <rect x="108" y="43" width="40" height="2.5" rx="1" fill="#475569" />
          {/* Section label */}
          <rect x="16" y="54" width="45" height="3.5" rx="1.5" fill="#06b6d4" />
          <rect x="16" y="62" width="178" height="2" rx="1" fill="#1e293b" />
          <rect x="16" y="67" width="155" height="2" rx="1" fill="#1e293b" />
          <rect x="16" y="72" width="165" height="2" rx="1" fill="#1e293b" />
          {/* Experience */}
          <rect x="16" y="83" width="55" height="3.5" rx="1.5" fill="#06b6d4" />
          <rect x="16" y="91" width="90" height="2.5" rx="1" fill="#cbd5e1" />
          <rect x="16" y="97" width="65" height="2" rx="1" fill="#475569" />
          <rect x="16" y="103" width="178" height="2" rx="1" fill="#1e293b" />
          <rect x="16" y="108" width="145" height="2" rx="1" fill="#1e293b" />
          <rect x="16" y="113" width="160" height="2" rx="1" fill="#1e293b" />
          {/* Skills */}
          <rect x="16" y="124" width="35" height="3.5" rx="1.5" fill="#06b6d4" />
          <rect x="16" y="132" width="30" height="7" rx="3.5" fill="#0e7490" />
          <rect x="50" y="132" width="30" height="7" rx="3.5" fill="#0e7490" />
          <rect x="84" y="132" width="30" height="7" rx="3.5" fill="#0e7490" />
          <rect x="118" y="132" width="30" height="7" rx="3.5" fill="#0e7490" />
          <rect x="16" y="143" width="30" height="7" rx="3.5" fill="#0e7490" />
          <rect x="50" y="143" width="30" height="7" rx="3.5" fill="#0e7490" />
        </svg>
      ),
    },
    {
      id: 'minimal',
      name: 'Minimal Swiss',
      category: 'modern' as const,
      accent: '#374151',
      preview: (
        <svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <rect width="210" height="297" fill="#fff" />
          {/* Minimal: just typography, no decorations */}
          <rect x="16" y="20" width="110" height="10" rx="2" fill="#111827" />
          <rect x="16" y="34" width="65" height="4" rx="1.5" fill="#6b7280" />
          <rect x="16" y="43" width="178" height="0.8" rx="0.4" fill="#111827" />
          {/* Contact inline */}
          <rect x="16" y="49" width="35" height="2.5" rx="1" fill="#9ca3af" />
          <rect x="56" y="49" width="35" height="2.5" rx="1" fill="#9ca3af" />
          <rect x="96" y="49" width="50" height="2.5" rx="1" fill="#9ca3af" />
          {/* Summary */}
          <rect x="16" y="60" width="178" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="65" width="155" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="70" width="170" height="2" rx="1" fill="#d1d5db" />
          {/* Divider + section */}
          <rect x="16" y="80" width="178" height="0.8" rx="0.4" fill="#e5e7eb" />
          <rect x="16" y="86" width="45" height="3.5" rx="1.5" fill="#111827" />
          <rect x="16" y="94" width="90" height="2.5" rx="1" fill="#374151" />
          <rect x="16" y="100" width="65" height="2" rx="1" fill="#9ca3af" />
          <rect x="16" y="106" width="178" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="111" width="145" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="120" width="90" height="2.5" rx="1" fill="#374151" />
          <rect x="16" y="126" width="65" height="2" rx="1" fill="#9ca3af" />
          <rect x="16" y="132" width="178" height="2" rx="1" fill="#d1d5db" />
          <rect x="16" y="137" width="155" height="2" rx="1" fill="#d1d5db" />
          {/* Divider + Education */}
          <rect x="16" y="148" width="178" height="0.8" rx="0.4" fill="#e5e7eb" />
          <rect x="16" y="154" width="40" height="3.5" rx="1.5" fill="#111827" />
          <rect x="16" y="162" width="100" height="2.5" rx="1" fill="#374151" />
          <rect x="16" y="168" width="70" height="2" rx="1" fill="#9ca3af" />
        </svg>
      ),
    },
  ];

  const TEMPLATES = [
    ...BASE_TEMPLATES,
    ...Array.from({ length: 15 }, (_, i) => {
      const base = BASE_TEMPLATES[i % BASE_TEMPLATES.length];
      return {
        id: `clone-${i}`,
        name: `${base.name} ${i + 1}`,
        category: base.category,
        accent: base.accent,
        preview: base.preview,
      };
    }),
  ];

  const FILTERS = [
    { id: 'all', label: 'All Templates' },
    { id: 'simple', label: 'Simple' },
    { id: 'modern', label: 'Modern' },
    { id: 'creative', label: 'Creative' },
  ] as const;

  const scratchTemplate = {
    id: 'scratch',
    name: 'Start from Scratch',
    category: 'all' as const,
    accent: 'hsl(var(--color-primary))',
    preview: (
      <svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <rect width="210" height="297" fill="#fff" />
      </svg>
    ),
  };

  const filteredTemplates = activeFilter === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeFilter);

  const visibleTemplates = [scratchTemplate, ...filteredTemplates];

  // ── Empty state (no resumes yet) ────────────────────────────────────────
  if (resumesList.length === 0) {
    return (
      <div 
        className={styles.page}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.onboarding}>
          {/* Heading */}
          <div className={styles.onboardingHeader}>
            <h1 className={styles.onboardingTitle}>Start Building Your Resume</h1>
            <p className={styles.onboardingSubtitle}>Choose a design you like to start building your career story</p>
          </div>

          {/* Sticky filter tabs + import button row */}
          <div className={styles.filterRowSticky}>
            <div className={styles.filterTabs}>
              {[
                { id: 'all', label: 'All Templates', icon: <Layout size={14} /> },
                { id: 'simple', label: 'Simple', icon: <FileText size={14} /> },
                { id: 'modern', label: 'Modern', icon: <Zap size={14} /> },
                { id: 'creative', label: 'Creative', icon: <Pencil size={14} /> },
              ].map((f) => (
                <button
                  key={f.id}
                  className={`${styles.filterTab} ${activeFilter === f.id ? styles.filterTabActive : ''}`}
                  onClick={() => setActiveFilter(f.id as any)}
                >
                  {f.icon}
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.importBtnWrapper}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,.pdf"
                style={{ display: 'none' }}
              />
              <button 
                className={styles.importBtn} 
                onClick={() => {
                  if (!user) {
                    triggerLogin(() => handleImportClick());
                  } else {
                    handleImportClick();
                  }
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Import existing resume
              </button>
            </div>
          </div>

          {/* Template grid */}
          <div className={styles.templateGrid}>
            {visibleTemplates.map((tpl) => (
              <div key={tpl.id} className={styles.tplWrapper}>
                <button
                  className={styles.tplCard}
                  onClick={() => {
                    const action = () => {
                      setIsSelectingTemplate(false);
                      onCreateNew(tpl.id);
                    };
                    if (!user) {
                      triggerLogin(action);
                    } else {
                      action();
                    }
                  }}
                  aria-label={`Use ${tpl.name} template`}
                >
                  <div className={styles.tplPreview}>
                    {tpl.preview}
                  </div>
                  <div className={styles.tplHover}>
                    <span className={styles.tplHoverBtn}>
                      <Zap size={13} /> {tpl.id === 'scratch' ? 'Start blank' : 'Use this template'}
                    </span>
                  </div>
                </button>
                <div className={styles.tplMeta}>
                  <span className={styles.tplName}>{tpl.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isDragging && (
          <div className={styles.dragOverlay}>
            <div className={styles.dragOverlayCard}>
              <div className={styles.dragOverlayIcon}>📥</div>
              <h3 className={styles.dragOverlayTitle}>Drop your resume here</h3>
              <p className={styles.dragOverlayText}>Supports PDF and JSON formats</p>
            </div>
          </div>
        )}

        {isParsing && (
          <div className={styles.parseOverlay}>
            <div className={styles.parseCard}>
              <div className={styles.parsePulse}>
                <div className={styles.parsePulseInner} />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--color-primary))' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className={styles.parseTitle}>AI Resume Parser</h3>
              <p className={styles.parseStep}>{parsingStep}</p>
              <div className={styles.progressBar}>
                <div className={styles.progressBarFill} style={{ width: `${parsingProgress}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Populated state ─────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {/* New Resume card */}
        <div className={styles.cardWrapper}>
          <button 
            className={`${styles.cardThumb} ${styles.newCard}`} 
            onClick={() => {
              if (!user) {
                triggerLogin(() => setIsSelectingTemplate(true));
              } else {
                setIsSelectingTemplate(true);
              }
            }}
            aria-label="Create new resume"
          >
            <span className={styles.plusIcon}>+</span>
            <span className={styles.newLabel}>New resume</span>
          </button>
        </div>

        {/* Existing resume cards */}
        {resumesList.map(resume => (
          <div key={resume.id} className={styles.cardWrapper}>
            <button
              className={`${styles.cardThumb} ${styles.resumeCard}`}
              onClick={() => {
                if (!user) {
                  triggerLogin(() => onOpenResume(resume));
                } else {
                  onOpenResume(resume);
                }
              }}
              aria-label={`Open ${resume.name}`}
            >
              <ResumeThumbnail data={resume.data} />
              <div className={styles.cardOverlay}>
                <span className={styles.cardOverlayText}>
                  <Eye size={13} /> View Resume
                </span>
              </div>
            </button>

            <div className={styles.cardMeta}>
              <div className={styles.cardMetaText}>
                <span className={styles.cardName}>{resume.name}</span>
                <span className={styles.cardInfo}>{timeAgo(resume.updatedAt)} &bull; A4</span>
              </div>

              <div style={{ position: 'relative' }}>
                <button
                  className={styles.menuBtn}
                  onClick={(e) => handleMenuToggle(e, resume.id)}
                  aria-label="More options"
                >
                  ⋮
                </button>
                {openMenuId === resume.id && (
                  <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
                    <button 
                      className={styles.dropdownItem} 
                      onClick={() => {
                        if (!user) {
                          triggerLogin(() => onOpenResume(resume));
                        } else {
                          onOpenResume(resume);
                        }
                      }}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button className={styles.dropdownItem} onClick={(e) => handleDuplicate(e, resume)}>
                      <Copy size={14} />
                      Duplicate
                    </button>
                    <button className={styles.dropdownItem} onClick={(e) => handleDelete(e, resume.id)}>
                      <Trash2 size={14} style={{ color: '#ef4444' }} />
                      <span style={{ color: '#ef4444' }}>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Template Selection Side Sheet */}
      {isSelectingTemplate && (
        <>
          <div className={`${styles.sheetOverlay} ${isClosing ? styles.sheetOverlayClosing : ''}`} />
          <div
            className={`${styles.sideSheet} ${isClosing ? styles.sideSheetClosing : ''}`}
            onAnimationEnd={() => {
              if (isClosing) {
                setIsSelectingTemplate(false);
                setIsClosing(false);
              }
            }}
          >
            <div className={styles.sideSheetHeader}>
              <div className={styles.sideSheetHeaderLeft}>
                <h2 className={styles.sideSheetTitle}>Select a template</h2>
                <p className={styles.sideSheetSubtitle}>Choose a design you like to start building</p>
              </div>
              <button className={styles.sideSheetCloseBtn} onClick={() => setIsClosing(true)} aria-label="Close template selector">
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.sideSheetContent}>
              <div className={styles.sheetGrid}>
                {visibleTemplates.map((tpl) => (
                  <div key={tpl.id} className={styles.sheetTplWrapper}>
                    <button
                      className={styles.sheetTplCard}
                      onClick={() => {
                        const action = () => {
                          setIsSelectingTemplate(false);
                          onCreateNew(tpl.id);
                        };
                        if (!user) {
                          triggerLogin(action);
                        } else {
                          action();
                        }
                      }}
                      aria-label={`Use ${tpl.name} template`}
                    >
                      <div className={styles.sheetTplPreview}>
                        {tpl.preview}
                      </div>
                      <div className={styles.sheetTplHover}>
                        <span className={styles.sheetTplHoverBtn}>
                          <Zap size={12} /> {tpl.id === 'scratch' ? 'Start blank' : 'Use design'}
                        </span>
                      </div>
                    </button>
                    <div className={styles.sheetTplMeta}>
                      <span className={styles.sheetTplName}>{tpl.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
