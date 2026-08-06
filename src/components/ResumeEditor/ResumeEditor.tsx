'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useResume, CONTACT_TYPE_LABELS, ContactType } from '@/context/ResumeContext';
import {
  Eye,
  EyeOff,
  Trash2,
  Search,
  GripVertical,
  User,
  Contact2,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages,
  Award,
  CalendarDays,
  FileText,
  Upload,
  ChevronDown,
  Link2,
  Check,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2Off,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eraser,
  Grid,
  X,
  Compass,
  FolderOpen,
  BookOpen,
  Trophy,
  Users,
  UserCheck,
  PlusCircle,
  FileSignature,
  Code2,
  Paintbrush,
  Database,
  Cloud,
  Terminal,
  Layers,
  Cpu,
  Globe,
  AppWindow,
  Workflow,
  Boxes,
} from 'lucide-react';
import styles from './ResumeEditor.module.css';
import { TextField } from '@/components/UI/TextField';

const POPULAR_TOOLS = [
  'Figma', 'Sketch', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe XD', 'Canva',
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
  'PHP', 'Swift', 'Kotlin', 'SQL', 'HTML5', 'CSS3', 'React', 'Angular', 'Vue.js',
  'Next.js', 'Nuxt.js', 'Svelte', 'Node.js', 'Express', 'Django', 'Flask',
  'Spring Boot', 'Laravel', 'Ruby on Rails', 'Tailwind CSS', 'Bootstrap',
  'AWS', 'Google Cloud (GCP)', 'Microsoft Azure', 'Docker', 'Kubernetes', 'Git',
  'GitHub', 'GitLab', 'Firebase', 'Supabase', 'Vercel', 'Netlify', 'PostgreSQL',
  'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Jira', 'Confluence', 'Slack', 'Postman',
  'VS Code', 'Xcode', 'Android Studio', 'Webpack', 'Vite', 'GraphQL'
];

const getToolIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('figma') || n.includes('sketch') || n.includes('photoshop') || n.includes('illustrator') || n.includes('design') || n.includes('canvas') || n.includes('xd') || n.includes('ui') || n.includes('ux') || n.includes('paint') || n.includes('gimp') || n.includes('canva')) {
    return <Paintbrush size={14} />;
  }
  if (n.includes('sql') || n.includes('postgres') || n.includes('mysql') || n.includes('mongo') || n.includes('db') || n.includes('redis') || n.includes('sqlite') || n.includes('oracle') || n.includes('supabase') || n.includes('firebase')) {
    return <Database size={14} />;
  }
  if (n.includes('aws') || n.includes('cloud') || n.includes('gcp') || n.includes('azure') || n.includes('vercel') || n.includes('netlify') || n.includes('heroku')) {
    return <Cloud size={14} />;
  }
  if (n.includes('git') || n.includes('docker') || n.includes('kubernetes') || n.includes('k8s') || n.includes('jenkins') || n.includes('cicd') || n.includes('terraform') || n.includes('ansible') || n.includes('bash') || n.includes('sh') || n.includes('shell') || n.includes('terminal')) {
    return <Terminal size={14} />;
  }
  if (n.includes('jira') || n.includes('confluence') || n.includes('trello') || n.includes('asana') || n.includes('slack') || n.includes('teams') || n.includes('zoom') || n.includes('notion') || n.includes('basecamp')) {
    return <Layers size={14} />;
  }
  if (n.includes('postman') || n.includes('insomnia') || n.includes('api') || n.includes('graphql') || n.includes('rest') || n.includes('swagger') || n.includes('fiddler') || n.includes('wireshark')) {
    return <Workflow size={14} />;
  }
  if (n.includes('react') || n.includes('angular') || n.includes('vue') || n.includes('svelte') || n.includes('next') || n.includes('nuxt') || n.includes('solid') || n.includes('ember') || n.includes('backbone') || n.includes('jquery')) {
    return <Boxes size={14} />;
  }
  if (n.includes('web') || n.includes('html') || n.includes('css') || n.includes('tailwind') || n.includes('bootstrap') || n.includes('sass') || n.includes('less') || n.includes('stylus')) {
    return <Globe size={14} />;
  }
  if (n.includes('app') || n.includes('ios') || n.includes('android') || n.includes('flutter') || n.includes('kotlin') || n.includes('swift') || n.includes('react native') || n.includes('electron') || n.includes('cordova')) {
    return <AppWindow size={14} />;
  }
  return <Code2 size={14} />;
};

const SectionTitleField = ({ sectionId, defaultTitle }: { sectionId: string; defaultTitle: string }) => {
  const { resumeData, updateSectionTitle } = useResume();
  const [editing, setEditing] = useState(false);
  const customTitles = resumeData.customSectionTitles || {};
  const title = customTitles[sectionId] || defaultTitle;

  // Do not allow renaming/editing of the Personal Information section. It should remain fixed and cannot be changed.
  if (sectionId === 'personal') {
    return (
      <span className={styles.sectionTitleStatic}>
        {title}
      </span>
    );
  }

  if (editing) {
    return (
      <div className={styles.sectionTitleFieldWrap} onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          className={styles.sectionTitleInput}
          value={title}
          onChange={(e) => updateSectionTitle(sectionId, e.target.value)}
          placeholder={defaultTitle}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditing(false);
            }
          }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <span
      className={styles.sectionTitleLabel}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="Double-click to rename"
    >
      {title}
    </span>
  );
};

export const ResumeEditor: React.FC = () => {
  const {
    resumeData,
    activeResumeId,
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
    updateSectionOrder,
    toggleSectionEnabled,
    toggleProfilePhoto,
  } = useResume();

  const disabledSections = resumeData.disabledSections || [];
  const showProfilePhoto = resumeData.showProfilePhoto !== false;
  const customTitles = resumeData.customSectionTitles || {};

  // Focused editing experience: Only one section / personal subsection is expanded at a time
  // State holds the currently active path (e.g. 'personal.profile', 'personal.contact', 'personal.additional', 'summary', 'experience', etc.)
  const [activeSection, setActiveSection] = useState<string>('personal.profile');
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState<'text' | 'list'>('list');
  const [toolsSearchQuery, setToolsSearchQuery] = useState('');
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [toolsActiveIndex, setToolsActiveIndex] = useState<number>(-1);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const [sectionToDelete, setSectionToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleteUnderstand, setDeleteUnderstand] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target as Node)) {
        setShowToolsDropdown(false);
        setToolsActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [contactDragId, setContactDragId] = useState<string | null>(null);
  const [languageDragId, setLanguageDragId] = useState<string | null>(null);
  const [newContactType, setNewContactType] = useState<ContactType>('email');
  const [activeUrlInputId, setActiveUrlInputId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const richTextRef = useRef<HTMLDivElement>(null);
  const initialSummaryHtml = useRef<string>('');
  const lastResumeId = useRef<string>('');

  const [showSummaryLinkPopover, setShowSummaryLinkPopover] = useState(false);
  const [summaryLinkUrl, setSummaryLinkUrl] = useState('');
  const savedSelectionRange = useRef<Range | null>(null);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    bulletList: false,
    numberedList: false,
    link: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
  });

  const updateActiveFormats = () => {
    if (typeof document === 'undefined') return;
    
    let linkActive = false;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).startContainer;
      while (node && node.nodeName !== 'DIV' && node.nodeName !== 'BODY') {
        if (node.nodeName === 'A') {
          linkActive = true;
          break;
        }
        node = node.parentNode;
      }
    }

    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      bulletList: document.queryCommandState('insertUnorderedList'),
      numberedList: document.queryCommandState('insertOrderedList'),
      link: linkActive,
      alignLeft: document.queryCommandState('justifyLeft'),
      alignCenter: document.queryCommandState('justifyCenter'),
      alignRight: document.queryCommandState('justifyRight'),
      alignJustify: document.queryCommandState('justifyFull'),
    });
  };

  const handleApplyLink = () => {
    if (savedSelectionRange.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRange.current);
      }
    }
    document.execCommand('createLink', false, summaryLinkUrl);
    setShowSummaryLinkPopover(false);
    setSummaryLinkUrl('');
    if (richTextRef.current) {
      updateSummary(richTextRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const handleCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (richTextRef.current) {
      updateSummary(richTextRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const handleClearFormatting = () => {
    document.execCommand('removeFormat', false);
    document.execCommand('unlink', false);
    document.execCommand('formatBlock', false, 'p');
    document.execCommand('justifyLeft', false);
    if (richTextRef.current) {
      updateSummary(richTextRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  useEffect(() => {
    if (richTextRef.current && richTextRef.current.innerHTML !== resumeData.summary) {
      richTextRef.current.innerHTML = resumeData.summary || '';
    }
  }, [activeResumeId, resumeData.summary]);

  useEffect(() => {
    if (activeSection === 'personal.contact') {
      const contactItems = resumeData.personalInfo.contactItems || [];
      const hasEmail = contactItems.some(item => item.type === 'email');
      const hasPhone = contactItems.some(item => item.type === 'phone');
      const hasAddress = contactItems.some(item => item.type === 'address');

      if (!hasEmail || !hasPhone || !hasAddress) {
        const updatedItems = [...contactItems];
        if (!hasEmail) {
          updatedItems.push({ id: `ci-email-${Math.random().toString(36).substr(2, 9)}`, type: 'email', value: '' });
        }
        if (!hasPhone) {
          updatedItems.push({ id: `ci-phone-${Math.random().toString(36).substr(2, 9)}`, type: 'phone', value: '' });
        }
        if (!hasAddress) {
          updatedItems.push({ id: `ci-address-${Math.random().toString(36).substr(2, 9)}`, type: 'address', value: '' });
        }
        updatePersonalInfo({ contactItems: updatedItems });
      }
    }
  }, [activeSection, resumeData.personalInfo.contactItems, updatePersonalInfo]);

  const handleRichTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    updateSummary(e.currentTarget.innerHTML);
    updateActiveFormats();
  };

  const toggleSection = (section: string) => {
    setActiveSection((prev) => (prev.startsWith(section) ? '' : section));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert('Photo file size should be less than 1MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => updatePersonalInfo({ profilePhoto: ev.target?.result as string });
    reader.readAsDataURL(file);
  };
  const handlePhotoRemove = () => {
    updatePersonalInfo({ profilePhoto: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }
    if (file.size > 1024 * 1024) { alert('Photo file size should be less than 1MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => updatePersonalInfo({ profilePhoto: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  // Section drag
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };
  const handleDragEnd = () => setDraggedIndex(null);
  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const newOrder = [...resumeData.sectionOrder];
    const item = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, item);
    updateSectionOrder(newOrder);
    setDraggedIndex(targetIndex);
  };

  // Contact item drag
  const handleContactDragStart = (e: React.DragEvent, id: string) => {
    setContactDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleContactDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!contactDragId || contactDragId === targetId) return;
    const items = [...resumeData.personalInfo.contactItems];
    const fromIdx = items.findIndex((c) => c.id === contactDragId);
    const toIdx = items.findIndex((c) => c.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    reorderContactItems(items);
  };
  const handleContactDragEnd = () => setContactDragId(null);

  // Language item drag
  const handleLanguageDragStart = (e: React.DragEvent, id: string) => {
    setLanguageDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleLanguageDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!languageDragId || languageDragId === targetId) return;
    const items = [...resumeData.languages];
    const fromIdx = items.findIndex((l) => l.id === languageDragId);
    const toIdx = items.findIndex((l) => l.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    reorderLanguages(items);
  };
  const handleLanguageDragEnd = () => setLanguageDragId(null);

  // Toggle switch component
  const EyeToggleBtn = ({ sectionId }: { sectionId: string }) => {
    const isEnabled = !disabledSections.includes(sectionId);
    return (
      <label
        className={styles.toggleSwitch}
        onClick={(e) => e.stopPropagation()}
        title={isEnabled ? 'Hide from resume' : 'Show in resume'}
      >
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={() => toggleSectionEnabled(sectionId)}
        />
        <span className={styles.toggleSlider}></span>
      </label>
    );
  };

  const Chevron = ({ open }: { open: boolean }) => (
    <ChevronDown className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} size={16} />
  );




  return (
    <div className={styles.editor}>

      {/* ═══════════════════════════════════════════════════════════════════
          PERSONAL DETAILS  (fixed — not draggable)
      ═══════════════════════════════════════════════════════════════════ */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('personal')}>
          <div className={styles.sectionTitleContainer} onClick={(e) => e.stopPropagation()}>
            <User className={styles.sectionIcon} size={22} />
            <div>
              <SectionTitleField sectionId="personal" defaultTitle="Personal Details" />
              <p className={styles.sectionDescription}>Profile, contact info, and additional details</p>
            </div>
          </div>
          <Chevron open={activeSection.startsWith('personal')} />
        </div>

        {activeSection.startsWith('personal') && (
          <div className={styles.sectionContent}>

            {/* ── 1. PROFILE INFORMATION ──────────────────────────────────── */}
            <div className={styles.subSectionHeader} onClick={() => setActiveSection('personal.profile')}>
              <div className={styles.subSectionTitle}>
                <span className={styles.subSectionIcon}>
                  <User size={15} />
                </span>
                Profile Information
              </div>
              <Chevron open={activeSection === 'personal.profile'} />
            </div>

            {activeSection === 'personal.profile' && (
              <div className={styles.subSectionContent}>
                <div className={styles.grid}>
                  {/* Profile Photo */}
                  <div className={styles.photoUploadContainer}>
                    <label className={styles.label}>
                      Profile Photo (Optional)
                      <label
                        className={styles.toggleSwitch}
                        onClick={(e) => e.stopPropagation()}
                        title={showProfilePhoto ? 'Hide photo from resume' : 'Show photo in resume'}
                        style={{ marginLeft: '8px', verticalAlign: 'middle' }}
                      >
                        <input
                          type="checkbox"
                          checked={showProfilePhoto}
                          onChange={toggleProfilePhoto}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} ref={fileInputRef} style={{ display: 'none' }} />
                    {resumeData.personalInfo.profilePhoto ? (
                      <div className={styles.photoPreviewWrap}>
                        <img src={resumeData.personalInfo.profilePhoto} alt="Profile" className={styles.photoPreview} />
                        <div className={styles.photoActions}>
                          <button type="button" className={styles.photoBtnChange} onClick={() => fileInputRef.current?.click()}>Change Photo</button>
                          <button type="button" className={styles.photoBtnRemove} onClick={handlePhotoRemove}>Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.photoDropzone} onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={handlePhotoDrop}>
                        <Upload className={styles.uploadIcon} size={24} />
                        <div className={styles.uploadText}><strong>Click to upload</strong> or drag and drop</div>
                        <div className={styles.uploadSubtext}>PNG or JPG (Recommended square, up to 1MB)</div>
                      </div>
                    )}
                  </div>

                  <TextField
                    label="Full Name"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                    placeholder="e.g. Chavda Mahmadjakir"
                  />
                  <TextField
                    label="Designation / Job Title"
                    value={resumeData.personalInfo.jobTitle}
                    onChange={(e) => updatePersonalInfo({ jobTitle: e.target.value })}
                    placeholder="e.g. UI/UX Designer"
                  />
                </div>
              </div>
            )}

            {/* ── 2. CONTACT INFORMATION ──────────────────────────────────── */}
            <div className={styles.subSectionHeader} onClick={() => setActiveSection('personal.contact')}>
              <div className={styles.subSectionTitle}>
                <span className={styles.subSectionIcon}>
                  <Contact2 size={15} />
                </span>
                Contact Information
              </div>
              <Chevron open={activeSection === 'personal.contact'} />
            </div>

            {activeSection === 'personal.contact' && (
              <div className={styles.subSectionContent}>
                <p className={styles.subSectionHint}>
                  Drag <GripVertical size={14} /> to reorder. Add any contact method — phone, email, social media, or custom link.
                </p>

                <div className={styles.contactItemList}>
                  {resumeData.personalInfo.contactItems.map((ci) => (
                    <div key={ci.id} className={styles.contactItemContainer}>
                      <div
                        className={`${styles.contactItemRow} ${contactDragId === ci.id ? styles.dragging : ''}`}
                        draggable
                        onDragStart={(e) => handleContactDragStart(e, ci.id)}
                        onDragOver={(e) => handleContactDragOver(e, ci.id)}
                        onDragEnd={handleContactDragEnd}
                      >
                        <span className={styles.contactDragHandle} title="Drag to reorder">
                          <GripVertical size={16} />
                        </span>

                        <select
                          className={`${styles.select} ${styles.contactTypeSelect}`}
                          value={ci.type}
                          onChange={(e) => updateContactItem(ci.id, { type: e.target.value as ContactType })}
                        >
                          {(Object.keys(CONTACT_TYPE_LABELS) as ContactType[]).map((t) => (
                            <option key={t} value={t}>{CONTACT_TYPE_LABELS[t]}</option>
                          ))}
                        </select>

                        {ci.type === 'other' && (
                          <input
                            type="text" className={styles.input}
                            style={{ maxWidth: '110px', flexShrink: 0 }}
                            value={ci.label || ''}
                            onChange={(e) => updateContactItem(ci.id, { label: e.target.value })}
                            placeholder="Label"
                          />
                        )}

                        <div className={styles.inputWithIconContainer}>
                          <input
                            type={ci.type === 'email' ? 'email' : 'text'}
                            className={`${styles.input} ${styles.contactValueInput}`}
                            value={ci.value}
                            onChange={(e) => updateContactItem(ci.id, { value: e.target.value })}
                            placeholder={
                              ci.type === 'email' ? 'name@domain.com' :
                              ci.type === 'phone' ? '+971 50 123 4567' :
                              ci.type === 'address' ? 'Abu Dhabi, UAE' :
                              ci.type === 'website' ? 'portfolio.com' :
                              ci.type === 'linkedin' ? 'linkedin.com/in/handle' :
                              ci.type === 'github' ? 'github.com/handle' :
                              ci.type === 'twitter' ? '@handle' :
                              ci.type === 'instagram' ? '@handle' :
                              ci.type === 'behance' ? 'behance.net/handle' :
                              ci.type === 'dribbble' ? 'dribbble.com/handle' :
                              'Enter value'
                            }
                          />

                          {ci.type !== 'email' && ci.type !== 'phone' && ci.type !== 'address' && (
                            <button
                              type="button"
                              className={`${styles.inputIconBtn} ${ci.url ? styles.inputIconBtnLinked : ''}`}
                              onClick={() => setActiveUrlInputId(prev => prev === ci.id ? null : ci.id)}
                              title="Edit target link URL"
                            >
                              <Link2 size={13} />
                            </button>
                          )}

                          {/* Link Popover */}
                          {activeUrlInputId === ci.id && ci.type !== 'email' && ci.type !== 'phone' && ci.type !== 'address' && (
                            <div className={styles.linkPopover} onClick={(e) => e.stopPropagation()}>
                              <div className={styles.popoverTitle}>Link URL</div>
                              <div className={styles.popoverRow}>
                                <input
                                  type="text"
                                  className={styles.popoverInput}
                                  value={ci.url || ''}
                                  onChange={(e) => updateContactItem(ci.id, { url: e.target.value })}
                                  placeholder="Enter Link"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      setActiveUrlInputId(null);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  className={styles.popoverCheckBtn}
                                  onClick={() => setActiveUrlInputId(null)}
                                  title="Apply"
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <button type="button" className={styles.deleteBtn} onClick={() => deleteContactItem(ci.id)} title="Remove">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add contact */}
                <button
                  type="button"
                  className={styles.addContactFullWidthBtn}
                  onClick={() => addContactItem('email')}
                >
                  + Add Contact Item
                </button>
              </div>
            )}

            {/* ── 3. ADDITIONAL INFORMATION ───────────────────────────────── */}
            <div className={styles.subSectionHeader} onClick={() => setActiveSection('personal.additional')}>
              <div className={styles.subSectionTitle}>
                <span className={styles.subSectionIcon}>
                  <CalendarDays size={15} />
                </span>
                Additional Information
              </div>
              <Chevron open={activeSection === 'personal.additional'} />
            </div>

            {activeSection === 'personal.additional' && (
              <div className={styles.subSectionContent}>
                <p className={styles.subSectionHint}>Optional — commonly required for GCC & South Asia applications.</p>
                <div className={styles.grid}>
                  <TextField
                    label="Nationality"
                    value={resumeData.personalInfo.nationality}
                    onChange={(e) => updatePersonalInfo({ nationality: e.target.value })}
                    placeholder="e.g. Indian, Emirati"
                  />
                  <TextField
                    label="Visa Status"
                    value={resumeData.personalInfo.visaStatus}
                    onChange={(e) => updatePersonalInfo({ visaStatus: e.target.value })}
                    placeholder="e.g. Employment Visa, Visit Visa"
                  />
                  <TextField
                    type="date"
                    label="Date of Birth"
                    value={resumeData.personalInfo.dateOfBirth}
                    onChange={(e) => updatePersonalInfo({ dateOfBirth: e.target.value })}
                  />
                  <TextField
                    label="Passport / ID Number"
                    value={resumeData.personalInfo.passportId}
                    onChange={(e) => updatePersonalInfo({ passportId: e.target.value })}
                    placeholder="e.g. A12345678"
                  />
                  <TextField
                    label="Availability"
                    value={resumeData.personalInfo.availability}
                    onChange={(e) => updatePersonalInfo({ availability: e.target.value })}
                    placeholder="e.g. Immediately, 30 days notice"
                  />
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Marital Status</label>
                    <select className={styles.select}
                      value={resumeData.personalInfo.maritalStatus}
                      onChange={(e) => updatePersonalInfo({ maritalStatus: e.target.value })}
                    >
                      <option value="">Select status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          DYNAMIC REORDERABLE SECTIONS
      ═══════════════════════════════════════════════════════════════════ */}
      {resumeData.sectionOrder.map((sectionId, index) => {
        const isExpanded = activeSection === sectionId;
        switch (sectionId) {
          case 'summary':
            return (
              <div key="summary" className={`${styles.sectionCard} ${draggedIndex === index ? styles.dragging : ''}`} onDragOver={(e) => handleDragOver(e, index)}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('summary')}>
                  <div className={styles.sectionTitleContainer} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.dragHandle} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnd={handleDragEnd} title="Drag to reorder">
                      <GripVertical size={18} />
                    </div>
                    <FileText className={styles.sectionIcon} size={22} />
                    <div>
                      <SectionTitleField sectionId="summary" defaultTitle="Professional Summary" />
                      <p className={styles.sectionDescription}>Brief overview of your career and skills</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EyeToggleBtn sectionId="summary" />
                    <Chevron open={isExpanded} />
                  </div>
                </div>
                {isExpanded && (
                  <div className={styles.sectionContent}>
                    <div className={styles.inputGroup} style={{ marginTop: '16px' }}>
                      <label className={styles.label}>Summary</label>
                      <div className={styles.richTextContainer}>
                        <div className={styles.toolbarRow}>
                          <button
                            type="button"
                            className={`${styles.toolbarBtn} ${activeFormats.bold ? styles.toolbarBtnActive : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommand('bold');
                            }}
                            title="Bold (Ctrl+B)"
                          >
                            <Bold size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.toolbarBtn} ${activeFormats.italic ? styles.toolbarBtnActive : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommand('italic');
                            }}
                            title="Italic (Ctrl+I)"
                          >
                            <Italic size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.toolbarBtn} ${activeFormats.underline ? styles.toolbarBtnActive : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommand('underline');
                            }}
                            title="Underline (Ctrl+U)"
                          >
                            <Underline size={14} />
                          </button>
                          
                          <div className={styles.toolbarDivider} />
                          
                          <button
                            type="button"
                            className={`${styles.toolbarBtn} ${activeFormats.bulletList ? styles.toolbarBtnActive : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommand('insertUnorderedList');
                            }}
                            title="Bullet List"
                          >
                            <List size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.toolbarBtn} ${activeFormats.numberedList ? styles.toolbarBtnActive : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommand('insertOrderedList');
                            }}
                            title="Numbered List"
                          >
                            <ListOrdered size={14} />
                          </button>
                          
                          <div className={styles.toolbarDivider} />

                          <div className={styles.toolbarPopoverContainer}>
                            <button
                              type="button"
                              className={`${styles.toolbarBtn} ${activeFormats.link ? styles.toolbarBtnActive : ''}`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                const sel = window.getSelection();
                                if (sel && sel.rangeCount > 0) {
                                  savedSelectionRange.current = sel.getRangeAt(0);
                                } else {
                                  savedSelectionRange.current = null;
                                }
                                setShowSummaryLinkPopover(prev => !prev);
                              }}
                              title="Add Link"
                            >
                              <Link2 size={14} />
                            </button>

                            {showSummaryLinkPopover && (
                              <div className={styles.summaryLinkPopover} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.popoverTitle}>Link URL</div>
                                <div className={styles.popoverRow}>
                                  <input
                                    type="text"
                                    className={styles.popoverInput}
                                    value={summaryLinkUrl}
                                    onChange={(e) => setSummaryLinkUrl(e.target.value)}
                                    placeholder="Enter Link"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleApplyLink();
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className={styles.popoverCheckBtn}
                                    onClick={handleApplyLink}
                                    title="Apply"
                                  >
                                    <Check size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            className={styles.toolbarBtn}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommand('unlink');
                            }}
                            title="Remove Link"
                          >
                            <Link2Off size={14} />
                          </button>

                          <div className={styles.toolbarDivider} />

                          <button
                            type="button"
                            className={`${styles.toolbarBtn} ${activeFormats.alignLeft ? styles.toolbarBtnActive : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommand('justifyLeft');
                            }}
                            title="Align Left"
                          >
                            <AlignLeft size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.toolbarBtn} ${activeFormats.alignCenter ? styles.toolbarBtnActive : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommand('justifyCenter');
                            }}
                            title="Align Center"
                          >
                            <AlignCenter size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.toolbarBtn} ${activeFormats.alignRight ? styles.toolbarBtnActive : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommand('justifyRight');
                            }}
                            title="Align Right"
                          >
                            <AlignRight size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.toolbarBtn} ${activeFormats.alignJustify ? styles.toolbarBtnActive : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommand('justifyFull');
                            }}
                            title="Justify"
                          >
                            <AlignJustify size={14} />
                          </button>

                          <div className={styles.toolbarDivider} />

                          <button
                            type="button"
                            className={styles.toolbarBtn}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleClearFormatting();
                            }}
                            title="Clear Formatting"
                          >
                            <Eraser size={14} />
                          </button>
                        </div>
                        <div
                          ref={richTextRef}
                          className={styles.richTextEditor}
                          contentEditable={true}
                          onInput={handleRichTextChange}
                          onSelect={updateActiveFormats}
                          suppressContentEditableWarning={true}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );

          case 'experience':
            return (
              <div key="experience" className={`${styles.sectionCard} ${draggedIndex === index ? styles.dragging : ''}`} onDragOver={(e) => handleDragOver(e, index)}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('experience')}>
                  <div className={styles.sectionTitleContainer} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.dragHandle} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnd={handleDragEnd} title="Drag to reorder">
                      <GripVertical size={18} />
                    </div>
                    <Briefcase className={styles.sectionIcon} size={22} />
                    <div>
                      <SectionTitleField sectionId="experience" defaultTitle="Work Experience" />
                      <p className={styles.sectionDescription}>List your relevant previous jobs</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EyeToggleBtn sectionId="experience" />
                    <Chevron open={isExpanded} />
                  </div>
                </div>
                {isExpanded && (
                  <div className={styles.sectionContent}>
                    <div className={styles.cardList}>
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className={styles.itemCard}>
                          <div className={styles.itemCardHeader}>
                            <span className={styles.itemTitle}>{exp.position || 'Position'} {exp.company ? `@ ${exp.company}` : ''}</span>
                            <button className={styles.deleteBtn} onClick={() => deleteExperience(exp.id)}><Trash2 size={16} /></button>
                          </div>
                          <div className={styles.grid}>
                            <TextField
                              label="Company Name"
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                              placeholder="e.g. Param Info"
                            />
                            <TextField
                              label="Job Title / Role"
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                              placeholder="e.g. Sr. Graphic Designer"
                            />
                            <TextField
                              label="Location"
                              value={exp.location}
                              onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                              placeholder="e.g. Dubai, UAE"
                            />
                            <TextField
                              type="month"
                              label="Start Date"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                            />
                            <TextField
                              type="month"
                              label="End Date"
                              value={exp.endDate}
                              disabled={exp.current}
                              onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                            />
                            <div className={styles.inputGroup} style={{ justifyContent: 'center' }}><label className={styles.checkboxLabel}><input type="checkbox" className={styles.checkbox} checked={exp.current} onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })} />I currently work here</label></div>
                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                               <label className={styles.label}>Description / Responsibilities</label>
                               <ExperienceDescriptionEditor
                                 id={exp.id}
                                 value={exp.description}
                                 onChange={(val) => updateExperience(exp.id, { description: val })}
                               />
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className={styles.addBtn} onClick={addExperience}>+ Add Experience Item</button>
                  </div>
                )}
              </div>
            );

          case 'education':
            return (
              <div key="education" className={`${styles.sectionCard} ${draggedIndex === index ? styles.dragging : ''}`} onDragOver={(e) => handleDragOver(e, index)}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('education')}>
                  <div className={styles.sectionTitleContainer} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.dragHandle} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnd={handleDragEnd} title="Drag to reorder">
                      <GripVertical size={18} />
                    </div>
                    <GraduationCap className={styles.sectionIcon} size={22} />
                    <div>
                      <SectionTitleField sectionId="education" defaultTitle="Education" />
                      <p className={styles.sectionDescription}>Degrees, colleges and academic history</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EyeToggleBtn sectionId="education" />
                    <Chevron open={isExpanded} />
                  </div>
                </div>
                {isExpanded && (
                  <div className={styles.sectionContent}>
                    <div className={styles.cardList}>
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className={styles.itemCard}>
                          <div className={styles.itemCardHeader}>
                            <span className={styles.itemTitle}>{edu.degree || 'Degree'} {edu.school ? `@ ${edu.school}` : ''}</span>
                            <button className={styles.deleteBtn} onClick={() => deleteEducation(edu.id)}><Trash2 size={16} /></button>
                          </div>
                          <div className={styles.grid}>
                            <TextField
                              label="School / University"
                              value={edu.school}
                              onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                              placeholder="e.g. B. H. Gardi College"
                            />
                            <TextField
                              label="Degree / Specialization"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                              placeholder="e.g. B.E. in IT"
                            />
                            <TextField
                              label="Location"
                              value={edu.location}
                              onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                              placeholder="e.g. Rajkot, India"
                            />
                            <TextField
                              type="month"
                              label="Start Date"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                            />
                            <TextField
                              type="month"
                              label="End Date"
                              value={edu.endDate}
                              disabled={edu.current}
                              onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                            />
                            <div className={styles.inputGroup} style={{ justifyContent: 'center' }}><label className={styles.checkboxLabel}><input type="checkbox" className={styles.checkbox} checked={edu.current} onChange={(e) => updateEducation(edu.id, { current: e.target.checked, endDate: e.target.checked ? '' : edu.endDate })} />I currently study here</label></div>
                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}><label className={styles.label}>Description / Key achievements</label><textarea className={styles.textarea} value={edu.description} onChange={(e) => updateEducation(edu.id, { description: e.target.value })} placeholder="e.g. Graduated with Honors..." /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className={styles.addBtn} onClick={addEducation}>+ Add Education Item</button>
                  </div>
                )}
              </div>
            );

          case 'skills':
            return (
              <div key="skills" className={`${styles.sectionCard} ${draggedIndex === index ? styles.dragging : ''}`} onDragOver={(e) => handleDragOver(e, index)}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('skills')}>
                  <div className={styles.sectionTitleContainer} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.dragHandle} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnd={handleDragEnd} title="Drag to reorder">
                      <GripVertical size={18} />
                    </div>
                    <Wrench className={styles.sectionIcon} size={22} />
                    <div>
                      <SectionTitleField sectionId="skills" defaultTitle="Skills" />
                      <p className={styles.sectionDescription}>List your technical and soft skills</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EyeToggleBtn sectionId="skills" />
                    <Chevron open={isExpanded} />
                  </div>
                </div>
                {isExpanded && (
                  <div className={styles.sectionContent}>
                    <div className={styles.cardList}>
                      {resumeData.skills.map((skill) => (
                        <div key={skill.id} className={styles.itemCard}>
                          <div className={styles.itemCardHeader}>
                            <span className={styles.itemTitle}>{skill.name || 'Skill Category'}</span>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => deleteSkill(skill.id)}
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className={styles.grid} style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
                            <TextField
                              label="Skill Category"
                              value={skill.name}
                              onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                              placeholder="e.g. UI/UX Design, Programming Languages"
                            />
                            <div className={styles.inputGroup}>
                              <label className={styles.label}>Description / Details</label>
                              <textarea
                                className={styles.input}
                                style={{ height: '70px', padding: '8px', resize: 'vertical' }}
                                value={skill.level || ''}
                                onChange={(e) => updateSkill(skill.id, { level: e.target.value })}
                                placeholder="e.g. Figma, Adobe Illustrator, Prototyping, Wireframing (separate with commas or write custom details)"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className={styles.addBtn} onClick={addSkill} style={{ marginTop: '16px' }}>
                      + Add Skill Item
                    </button>
                  </div>
                )}
              </div>
            );

          case 'languages':
            return (
              <div key="languages" className={`${styles.sectionCard} ${draggedIndex === index ? styles.dragging : ''}`} onDragOver={(e) => handleDragOver(e, index)}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('languages')}>
                  <div className={styles.sectionTitleContainer} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.dragHandle} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnd={handleDragEnd} title="Drag to reorder">
                      <GripVertical size={18} />
                    </div>
                    <Languages className={styles.sectionIcon} size={22} />
                    <div>
                      <SectionTitleField sectionId="languages" defaultTitle="Languages" />
                      <p className={styles.sectionDescription}>Language fluency and proficiency levels</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EyeToggleBtn sectionId="languages" />
                    <Chevron open={isExpanded} />
                  </div>
                </div>
                {isExpanded && (
                  <div className={styles.sectionContent}>
                    <div className={styles.inputGroup} style={{ marginBottom: '16px' }}>
                      <label className={styles.label}>Proficiency Standard</label>
                      <div className={styles.segmentedControl}>
                        <button
                          type="button"
                          className={`${styles.segmentedBtn} ${(resumeData.languageStandard || 'descriptive') === 'descriptive' ? styles.segmentedBtnActive : ''}`}
                          onClick={() => updateLanguageStandard('descriptive')}
                        >
                          Descriptive
                        </button>
                        <button
                          type="button"
                          className={`${styles.segmentedBtn} ${(resumeData.languageStandard || 'descriptive') === 'cefr' ? styles.segmentedBtnActive : ''}`}
                          onClick={() => updateLanguageStandard('cefr')}
                        >
                          CEFR
                        </button>
                        <button
                          type="button"
                          className={`${styles.segmentedBtn} ${(resumeData.languageStandard || 'descriptive') === 'ilr' ? styles.segmentedBtnActive : ''}`}
                          onClick={() => updateLanguageStandard('ilr')}
                        >
                          ILR
                        </button>
                      </div>
                    </div>

                    <div className={styles.contactItemList}>
                      {resumeData.languages.map((lang) => {
                        const options = getProficiencyOptions(resumeData.languageStandard || 'descriptive');
                        return (
                          <div key={lang.id} className={styles.contactItemContainer}>
                            <div
                              className={`${styles.contactItemRow} ${languageDragId === lang.id ? styles.dragging : ''}`}
                              draggable
                              onDragStart={(e) => handleLanguageDragStart(e, lang.id)}
                              onDragOver={(e) => handleLanguageDragOver(e, lang.id)}
                              onDragEnd={handleLanguageDragEnd}
                            >
                              <span className={styles.contactDragHandle} title="Drag to reorder">
                                <GripVertical size={16} />
                              </span>

                              <SearchableLanguageInput
                                value={lang.name}
                                onChange={(val) => updateLanguage(lang.id, { name: val })}
                              />
                              <select
                                className={`${styles.select} ${styles.contactTypeSelect}`}
                                style={{ minWidth: '160px' }}
                                value={lang.proficiency}
                                onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value })}
                              >
                                {options.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className={styles.deleteBtn}
                                onClick={() => deleteLanguage(lang.id)}
                                title="Remove"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      className={styles.addContactFullWidthBtn}
                      onClick={addLanguage}
                      style={{ marginTop: '16px' }}
                    >
                      + Add Language
                    </button>
                  </div>
                )}
              </div>
            );

          case 'certifications':
            return (
              <div key="certifications" className={`${styles.sectionCard} ${draggedIndex === index ? styles.dragging : ''}`} onDragOver={(e) => handleDragOver(e, index)}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('certifications')}>
                  <div className={styles.sectionTitleContainer} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.dragHandle} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnd={handleDragEnd} title="Drag to reorder">
                      <GripVertical size={18} />
                    </div>
                    <Award className={styles.sectionIcon} size={22} />
                    <div>
                      <SectionTitleField sectionId="certifications" defaultTitle="Certifications" />
                      <p className={styles.sectionDescription}>Courses, exams, and professional awards</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EyeToggleBtn sectionId="certifications" />
                    <Chevron open={isExpanded} />
                  </div>
                </div>
                {isExpanded && (
                  <div className={styles.sectionContent}>
                    <div className={styles.cardList}>
                      {resumeData.certifications.map((cert) => (
                        <div key={cert.id} className={styles.itemCard}>
                          <div className={styles.itemCardHeader}>
                            <span className={styles.itemTitle}>{cert.name || 'Certification Name'}</span>
                            <button className={styles.deleteBtn} onClick={() => deleteCertification(cert.id)}><Trash2 size={16} /></button>
                          </div>
                          <div className={styles.grid}>
                            <div className={styles.inputGroup}>
                              <label className={styles.label}>Certification Title</label>
                              <div className={styles.inputWithIconContainer} style={{ position: 'relative' }}>
                                <input
                                  type="text"
                                  className={`${styles.input} ${styles.contactValueInput}`}
                                  value={cert.name}
                                  onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                                  placeholder="e.g. Google UX Design"
                                />
                                <button
                                  type="button"
                                  className={`${styles.inputIconBtn} ${cert.link ? styles.inputIconBtnLinked : ''}`}
                                  onClick={() => setActiveUrlInputId(prev => prev === cert.id ? null : cert.id)}
                                  title="Edit certificate verification link"
                                >
                                  <Link2 size={13} />
                                </button>

                                {activeUrlInputId === cert.id && (
                                  <div className={styles.linkPopover} onClick={(e) => e.stopPropagation()}>
                                    <div className={styles.popoverTitle}>Certificate Link URL</div>
                                    <div className={styles.popoverRow}>
                                      <input
                                        type="text"
                                        className={styles.popoverInput}
                                        value={cert.link || ''}
                                        onChange={(e) => updateCertification(cert.id, { link: e.target.value })}
                                        placeholder="Enter Link"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            setActiveUrlInputId(null);
                                          }
                                        }}
                                      />
                                      <button
                                        type="button"
                                        className={styles.popoverCheckBtn}
                                        onClick={() => setActiveUrlInputId(null)}
                                        title="Apply"
                                      >
                                        <Check size={14} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <TextField
                              label="Issuing Organization"
                              value={cert.issuer}
                              onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                              placeholder="e.g. IBM"
                            />
                            <TextField
                              type="month"
                              label="Completion Date"
                              value={cert.date}
                              onChange={(e) => updateCertification(cert.id, { date: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className={styles.addBtn} onClick={addCertification}>+ Add Certification Item</button>
                  </div>
                )}
              </div>
            );

          default: {
            if (sectionId.startsWith('custom-')) {
              const sec = (resumeData.customSections || []).find((s) => s.id === sectionId);
              if (!sec) return null;
              const isExpanded = activeSection === sec.id;
              return (
                <div key={sec.id} className={`${styles.sectionCard} ${draggedIndex === index ? styles.dragging : ''}`} onDragOver={(e) => handleDragOver(e, index)}>
                  <div className={styles.sectionHeader} onClick={() => toggleSection(sec.id)}>
                    <div className={styles.sectionTitleContainer} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.dragHandle} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnd={handleDragEnd} title="Drag to reorder">
                        <GripVertical size={18} />
                      </div>
                      <Grid className={styles.sectionIcon} size={22} style={{ color: '#3b82f6' }} />
                      <div>
                        <SectionTitleField sectionId={sec.id} defaultTitle={sec.title} />
                        <p className={styles.sectionDescription}>
                          Custom {sec.type === 'text' ? 'text block' : 'list'} section. Double-click to rename.
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        style={{ color: '#ef4444', marginRight: '4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSectionToDelete({ id: sec.id, title: customTitles[sec.id] || sec.title });
                          setDeleteUnderstand(false);
                        }}
                        title="Delete Custom Section"
                      >
                        <Trash2 size={16} />
                      </button>
                      <EyeToggleBtn sectionId={sec.id} />
                      <Chevron open={isExpanded} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.sectionContent}>
                      {sec.type === 'text' ? (
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Section Content</label>
                          <ExperienceDescriptionEditor
                            id={sec.id}
                            value={sec.content}
                            onChange={(html) => updateCustomSection(sec.id, { content: html })}
                          />
                        </div>
                      ) : sec.id === 'custom-tools' ? (
                        <div className={styles.toolsEditorContainer}>
                          <div className={styles.toolsSearchWrapper} ref={toolsDropdownRef}>
                            {(() => {
                              const filteredTools = POPULAR_TOOLS.filter(t => 
                                t.toLowerCase().includes(toolsSearchQuery.toLowerCase()) &&
                                !sec.items.some(item => item.title.toLowerCase() === t.toLowerCase())
                              );
                              
                              const showCustomOption = toolsSearchQuery.trim() !== '' && 
                                !POPULAR_TOOLS.some(t => t.toLowerCase() === toolsSearchQuery.trim().toLowerCase()) && 
                                !sec.items.some(item => item.title.toLowerCase() === toolsSearchQuery.trim().toLowerCase());
                                
                              const dropdownItems = [...filteredTools];
                              if (showCustomOption) {
                                dropdownItems.push(`ADD_CUSTOM_SECTION_ITEM:${toolsSearchQuery.trim()}`);
                              }
                              
                              const handleToolsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (!showToolsDropdown || dropdownItems.length === 0) return;
                                
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setToolsActiveIndex(prev => (prev < dropdownItems.length - 1 ? prev + 1 : 0));
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  setToolsActiveIndex(prev => (prev > 0 ? prev - 1 : dropdownItems.length - 1));
                                } else if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (toolsActiveIndex >= 0 && toolsActiveIndex < dropdownItems.length) {
                                    const selectedItem = dropdownItems[toolsActiveIndex];
                                    if (selectedItem.startsWith('ADD_CUSTOM_SECTION_ITEM:')) {
                                      const customTitle = selectedItem.replace('ADD_CUSTOM_SECTION_ITEM:', '');
                                      addCustomSectionItem(sec.id, { title: customTitle });
                                    } else {
                                      addCustomSectionItem(sec.id, { title: selectedItem });
                                    }
                                    setToolsSearchQuery('');
                                    setToolsActiveIndex(-1);
                                    setShowToolsDropdown(false);
                                  } else if (toolsSearchQuery.trim() !== '') {
                                    const exists = sec.items.some(item => item.title.toLowerCase() === toolsSearchQuery.trim().toLowerCase());
                                    if (!exists) {
                                      addCustomSectionItem(sec.id, { title: toolsSearchQuery.trim() });
                                    }
                                    setToolsSearchQuery('');
                                    setToolsActiveIndex(-1);
                                    setShowToolsDropdown(false);
                                  }
                                } else if (e.key === 'Escape') {
                                  setShowToolsDropdown(false);
                                  setToolsActiveIndex(-1);
                                }
                              };
                              
                              return (
                                <>
                                  <div className={styles.searchInputWithIcon}>
                                    <Search size={16} className={styles.searchIcon} />
                                    <input
                                      type="text"
                                      className={`${styles.input} ${styles.inputWithSearchIcon}`}
                                      value={toolsSearchQuery}
                                      onChange={(e) => {
                                        setToolsSearchQuery(e.target.value);
                                        setShowToolsDropdown(true);
                                        setToolsActiveIndex(-1);
                                      }}
                                      onFocus={() => setShowToolsDropdown(true)}
                                      onKeyDown={handleToolsKeyDown}
                                      placeholder="Search or type a tool (e.g. Figma, React, Docker)..."
                                    />
                                  </div>
                                  
                                  {showToolsDropdown && dropdownItems.length > 0 && (
                                    <div className={styles.toolsDropdown}>
                                      {dropdownItems.map((item, idx) => {
                                        const isCustom = item.startsWith('ADD_CUSTOM_SECTION_ITEM:');
                                        const title = isCustom ? item.replace('ADD_CUSTOM_SECTION_ITEM:', '') : item;
                                        const isActive = idx === toolsActiveIndex;
                                        
                                        return (
                                          <div
                                            key={item}
                                            className={`${styles.toolsDropdownItem} ${isActive ? styles.toolsDropdownItemActive : ''}`}
                                            onMouseEnter={() => setToolsActiveIndex(idx)}
                                            onClick={() => {
                                              addCustomSectionItem(sec.id, { title });
                                              setToolsSearchQuery('');
                                              setToolsActiveIndex(-1);
                                              setShowToolsDropdown(false);
                                            }}
                                          >
                                            {isCustom ? (
                                              <span>Add "<strong>{title}</strong>"</span>
                                            ) : (
                                              <>
                                                <span className={styles.toolsDropdownIcon}>
                                                  {getToolIcon(title)}
                                                </span>
                                                <span>{title}</span>
                                              </>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          <div className={styles.toolsChipsContainer}>
                            {sec.items.length === 0 ? (
                              <p className={styles.noToolsText}>No tools or technologies added yet. Use the search field above to add.</p>
                            ) : (
                              sec.items.map(item => (
                                <div key={item.id} className={styles.toolChip}>
                                  <span className={styles.toolChipIcon}>
                                    {getToolIcon(item.title)}
                                  </span>
                                  <span className={styles.toolChipText}>{item.title}</span>
                                  <button
                                    type="button"
                                    className={styles.toolChipDeleteBtn}
                                    onClick={() => deleteCustomSectionItem(sec.id, item.id)}
                                    title={`Delete ${item.title}`}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : sec.id === 'custom-references' ? (
                        <div>
                          <div className={styles.cardList}>
                            {sec.items.map((item) => (
                              <div key={item.id} className={styles.itemCard}>
                                <div className={styles.itemCardHeader}>
                                  <span className={styles.itemTitle}>{item.title || 'Reference Name'}</span>
                                  <button
                                    type="button"
                                    className={styles.deleteBtn}
                                    onClick={() => deleteCustomSectionItem(sec.id, item.id)}
                                    title="Remove item"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                <div className={styles.grid}>
                                  <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Name</label>
                                    <div className={styles.inputWithIconContainer}>
                                      <input
                                        type="text"
                                        className={`${styles.input} ${styles.contactValueInput}`}
                                        value={item.title}
                                        onChange={(e) => updateCustomSectionItem(sec.id, item.id, { title: e.target.value })}
                                        placeholder="e.g. John Doe"
                                      />
                                      <button
                                        type="button"
                                        className={`${styles.inputIconBtn} ${item.link ? styles.inputIconBtnLinked : ''}`}
                                        onClick={() => setActiveUrlInputId(prev => prev === item.id ? null : item.id)}
                                        title="Edit target link URL"
                                      >
                                        <Link2 size={13} />
                                      </button>

                                      {activeUrlInputId === item.id && (
                                        <div className={styles.linkPopover} onClick={(e) => e.stopPropagation()}>
                                          <div className={styles.popoverTitle}>Link URL</div>
                                          <div className={styles.popoverRow}>
                                            <input
                                              type="text"
                                              className={styles.popoverInput}
                                              value={item.link || ''}
                                              onChange={(e) => updateCustomSectionItem(sec.id, item.id, { link: e.target.value })}
                                              placeholder="Enter Link"
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  setActiveUrlInputId(null);
                                                }
                                              }}
                                            />
                                            <button
                                              type="button"
                                              className={styles.popoverCheckBtn}
                                              onClick={() => setActiveUrlInputId(null)}
                                              title="Apply"
                                            >
                                              <Check size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <TextField
                                    label="Designation"
                                    value={item.subtitle || ''}
                                    onChange={(e) => updateCustomSectionItem(sec.id, item.id, { subtitle: e.target.value })}
                                    placeholder="e.g. Senior Manager"
                                  />
                                  <TextField
                                    label="Organization"
                                    value={item.organization || ''}
                                    onChange={(e) => updateCustomSectionItem(sec.id, item.id, { organization: e.target.value })}
                                    placeholder="e.g. Tech Corp"
                                  />
                                  <TextField
                                    type="email"
                                    label="Email"
                                    value={item.email || ''}
                                    onChange={(e) => updateCustomSectionItem(sec.id, item.id, { email: e.target.value })}
                                    placeholder="e.g. referee@example.com"
                                  />
                                  <TextField
                                    label="Phone Number"
                                    value={item.phone || ''}
                                    onChange={(e) => updateCustomSectionItem(sec.id, item.id, { phone: e.target.value })}
                                    placeholder="e.g. +1 234 567 890"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className={styles.addBtn} onClick={() => addCustomSectionItem(sec.id)}>+ Add Reference Item</button>
                        </div>
                      ) : sec.id === 'custom-interests' ? (
                        <div>
                          <div className={styles.cardList}>
                            {sec.items.map((item) => (
                              <div key={item.id} className={styles.itemCard}>
                                <div className={styles.itemCardHeader}>
                                  <span className={styles.itemTitle}>{item.title || 'Interest / Hobby'}</span>
                                  <button
                                    type="button"
                                    className={styles.deleteBtn}
                                    onClick={() => deleteCustomSectionItem(sec.id, item.id)}
                                    title="Remove item"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                <div className={styles.grid}>
                                  <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Interest</label>
                                    <div className={styles.inputWithIconContainer}>
                                      <input
                                        type="text"
                                        className={`${styles.input} ${styles.contactValueInput}`}
                                        value={item.title}
                                        onChange={(e) => updateCustomSectionItem(sec.id, item.id, { title: e.target.value })}
                                        placeholder="Enter Interest / Hobby"
                                      />
                                      <button
                                        type="button"
                                        className={`${styles.inputIconBtn} ${item.link ? styles.inputIconBtnLinked : ''}`}
                                        onClick={() => setActiveUrlInputId(prev => prev === item.id ? null : item.id)}
                                        title="Edit target link URL"
                                      >
                                        <Link2 size={13} />
                                      </button>

                                      {activeUrlInputId === item.id && (
                                        <div className={styles.linkPopover} onClick={(e) => e.stopPropagation()}>
                                          <div className={styles.popoverTitle}>Link URL</div>
                                          <div className={styles.popoverRow}>
                                            <input
                                              type="text"
                                              className={styles.popoverInput}
                                              value={item.link || ''}
                                              onChange={(e) => updateCustomSectionItem(sec.id, item.id, { link: e.target.value })}
                                              placeholder="Enter Link"
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  setActiveUrlInputId(null);
                                                }
                                              }}
                                            />
                                            <button
                                              type="button"
                                              className={styles.popoverCheckBtn}
                                              onClick={() => setActiveUrlInputId(null)}
                                              title="Apply"
                                            >
                                              <Check size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Additional information</label>
                                    <ExperienceDescriptionEditor
                                      id={item.id}
                                      value={item.description || ''}
                                      onChange={(html) => updateCustomSectionItem(sec.id, item.id, { description: html })}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className={styles.addBtn} onClick={() => addCustomSectionItem(sec.id)}>+ Add Interest Item</button>
                        </div>
                      ) : (
                        <div>
                          <div className={styles.cardList}>
                            {sec.items.map((item) => (
                              <div key={item.id} className={styles.itemCard}>
                                <div className={styles.itemCardHeader}>
                                    <span className={styles.itemTitle}>{item.title || 'Item Title'}</span>
                                    <button
                                      type="button"
                                      className={styles.deleteBtn}
                                      onClick={() => deleteCustomSectionItem(sec.id, item.id)}
                                      title="Remove item"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  <div className={styles.grid}>
                                    <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                      <label className={styles.label}>Title</label>
                                      <div className={styles.inputWithIconContainer}>
                                        <input
                                          type="text"
                                          className={`${styles.input} ${styles.contactValueInput}`}
                                          value={item.title}
                                          onChange={(e) => updateCustomSectionItem(sec.id, item.id, { title: e.target.value })}
                                          placeholder="e.g. Project Name, Award Name"
                                        />
                                        <button
                                          type="button"
                                          className={`${styles.inputIconBtn} ${item.link ? styles.inputIconBtnLinked : ''}`}
                                          onClick={() => setActiveUrlInputId(prev => prev === item.id ? null : item.id)}
                                          title="Edit target link URL"
                                        >
                                          <Link2 size={13} />
                                        </button>

                                        {activeUrlInputId === item.id && (
                                          <div className={styles.linkPopover} onClick={(e) => e.stopPropagation()}>
                                            <div className={styles.popoverTitle}>Link URL</div>
                                            <div className={styles.popoverRow}>
                                              <input
                                                type="text"
                                                className={styles.popoverInput}
                                                value={item.link || ''}
                                                onChange={(e) => updateCustomSectionItem(sec.id, item.id, { link: e.target.value })}
                                                placeholder="Enter Link"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') {
                                                    setActiveUrlInputId(null);
                                                  }
                                                }}
                                              />
                                              <button
                                                type="button"
                                                className={styles.popoverCheckBtn}
                                                onClick={() => setActiveUrlInputId(null)}
                                                title="Apply"
                                              >
                                                <Check size={14} />
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <TextField
                                      label="Subtitle / Institution"
                                      value={item.subtitle || ''}
                                      onChange={(e) => updateCustomSectionItem(sec.id, item.id, { subtitle: e.target.value })}
                                      placeholder="e.g. Organization, Client"
                                    />
                                    <TextField
                                      label="Date / Period"
                                      value={item.date || ''}
                                      onChange={(e) => updateCustomSectionItem(sec.id, item.id, { date: e.target.value })}
                                      placeholder="e.g. Jan 2026, 2025 - Present"
                                    />
                                    <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                                      <label className={styles.label}>Description / Details</label>
                                      <ExperienceDescriptionEditor
                                        id={item.id}
                                        value={item.description || ''}
                                        onChange={(html) => updateCustomSectionItem(sec.id, item.id, { description: html })}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          <button
                            type="button"
                            className={styles.addBtn}
                            onClick={() => addCustomSectionItem(sec.id)}
                            style={{ marginTop: '16px' }}
                          >
                            + Add Item
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          }
        }
      })}

      <button
        type="button"
        className={styles.addAnotherSectionBtn}
        onClick={() => {
          setShowCustomConfig(false);
          setIsAddSectionOpen(true);
        }}
      >
        + Add New Section
      </button>

      {/* Add Content Drawer Overlay */}
      <div
        className={`${styles.drawerBackdrop} ${isAddSectionOpen ? styles.drawerBackdropOpen : ''}`}
        onClick={() => setIsAddSectionOpen(false)}
      >
        <div
          className={`${styles.drawerPanel} ${isAddSectionOpen ? styles.drawerPanelOpen : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.drawerHeader}>
            <div>
              <h3 className={styles.drawerTitle}>Add content</h3>
              <p className={styles.drawerSubtitle}>Select a section to add to your resume</p>
            </div>
            <button className={styles.drawerCloseBtn} onClick={() => setIsAddSectionOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.drawerContent}>
            {showCustomConfig ? (
              /* Inline Custom Section Config inside Drawer */
              <div className={styles.customConfigForm}>
                <h4 className={styles.configTitle}>Configure Custom Section</h4>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Section Title</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Projects, Volunteer Work, Interests"
                    autoFocus
                  />
                </div>
                <div className={styles.inputGroup} style={{ marginTop: '12px' }}>
                  <label className={styles.label}>Layout Type</label>
                  <div className={styles.segmentedControl}>
                    <button
                      type="button"
                      className={`${styles.segmentedBtn} ${customType === 'list' ? styles.segmentedBtnActive : ''}`}
                      onClick={() => setCustomType('list')}
                    >
                      Structured List
                    </button>
                    <button
                      type="button"
                      className={`${styles.segmentedBtn} ${customType === 'text' ? styles.segmentedBtnActive : ''}`}
                      onClick={() => setCustomType('text')}
                    >
                      Rich Text Block
                    </button>
                  </div>
                </div>
                <div className={styles.configActions}>
                  <button
                    type="button"
                    className={styles.cancelConfigBtn}
                    onClick={() => setShowCustomConfig(false)}
                  >
                    Back to list
                  </button>
                  <button
                    type="button"
                    className={styles.addConfigBtn}
                    disabled={!customTitle.trim()}
                    onClick={() => {
                      addCustomSection(customTitle.trim(), customType);
                      setCustomTitle('');
                      setCustomType('list');
                      setShowCustomConfig(false);
                      setIsAddSectionOpen(false);
                    }}
                  >
                    Add Section
                  </button>
                </div>
              </div>
            ) : (
              /* Grid of available/added sections */
              <div className={styles.drawerGrid}>
                {[
                  { id: 'summary', title: 'Professional Summary', description: 'Brief overview of your career, skills, and goals.', icon: <FileText size={18} />, isCore: true },
                  { id: 'experience', title: 'Work Experience', description: 'List your relevant previous jobs and accomplishments.', icon: <Briefcase size={18} />, isCore: true },
                  { id: 'education', title: 'Education', description: 'Add your degrees, schools, and academic history.', icon: <GraduationCap size={18} />, isCore: true },
                  { id: 'skills', title: 'Skills', description: 'Add your hard and soft skills that help you stand out.', icon: <Wrench size={18} />, isCore: true },
                  { id: 'languages', title: 'Languages', description: 'Add your languages and proficiency standards.', icon: <Languages size={18} />, isCore: true },
                  { id: 'certifications', title: 'Certifications', description: 'Add your industry certificates, licenses, or courses.', icon: <Award size={18} />, isCore: true },
                  { id: 'custom-tools', title: 'Tools & Technologies', description: 'List the software, programs, or developer tools you master.', icon: <Grid size={18} />, isCore: false, type: 'list' as const },
                  { id: 'custom-interests', title: 'Interests', description: 'Add relevant personal interests and hobbies.', icon: <Compass size={18} />, isCore: false, type: 'list' as const },
                  { id: 'custom-projects', title: 'Projects', description: 'Highlight key projects, contributions, or achievements.', icon: <FolderOpen size={18} />, isCore: false, type: 'list' as const },
                  { id: 'custom-courses', title: 'Courses', description: 'Include academic courses or online programs completed.', icon: <BookOpen size={18} />, isCore: false, type: 'list' as const },
                  { id: 'custom-awards', title: 'Awards', description: 'List awards, honors, and recognitions received.', icon: <Trophy size={18} />, isCore: false, type: 'list' as const },
                  { id: 'custom-organizations', title: 'Organizations', description: 'Add memberships, associations, or volunteering roles.', icon: <Users size={18} />, isCore: false, type: 'list' as const },
                  { id: 'custom-publications', title: 'Publications', description: 'Highlight academic papers, books, or articles published.', icon: <BookOpen size={18} />, isCore: false, type: 'list' as const },
                  { id: 'custom-references', title: 'References', description: 'List professional references and contact details.', icon: <UserCheck size={18} />, isCore: false, type: 'list' as const },
                  { id: 'custom-declaration', title: 'Declaration', description: 'Add a formal declaration statement at the end.', icon: <FileSignature size={18} />, isCore: false, type: 'text' as const },
                  { id: 'custom-user', title: 'Custom Section', description: 'Add a custom section for anything else you need.', icon: <PlusCircle size={18} />, isCore: false }
                ].map((sec) => {
                  const isAdded = sec.id === 'custom-user' ? false : (
                    sec.isCore
                      ? !disabledSections.includes(sec.id)
                      : (resumeData.sectionOrder.includes(sec.id) && !disabledSections.includes(sec.id))
                  );
                  
                  return (
                    <div
                      key={sec.id}
                      className={`${styles.drawerCard} ${isAdded ? styles.drawerCardDisabled : ''}`}
                      onClick={() => {
                        if (isAdded) return;
                        if (sec.id === 'custom-user') {
                          setShowCustomConfig(true);
                        } else if (sec.isCore) {
                          toggleSectionEnabled(sec.id);
                          setIsAddSectionOpen(false);
                        } else {
                          addCustomSection(sec.title, sec.type || 'list', sec.id);
                          setIsAddSectionOpen(false);
                        }
                      }}
                    >
                      <div className={styles.drawerCardIcon}>
                        {sec.icon}
                      </div>
                      <div className={styles.drawerCardBody}>
                        <div className={styles.drawerCardHeaderRow}>
                          <span className={styles.drawerCardTitle}>{sec.title}</span>
                          {isAdded && (
                            <span className={styles.drawerCardStatusTag}>
                              <Check size={11} strokeWidth={3} /> Added
                            </span>
                          )}
                        </div>
                        <p className={styles.drawerCardDescription}>{sec.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Section Confirmation Modal */}
      {sectionToDelete && (
        <div className={styles.modalBackdrop} onClick={() => setSectionToDelete(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setSectionToDelete(null)}>
              <X size={18} />
            </button>
            <h3 className={styles.modalTitle}>Delete "{sectionToDelete.title}" section?</h3>
            <p className={styles.modalSubtitle}>
              This will permanently delete this section and all its entries. This action can't be undone.
            </p>
            
            <label className={styles.modalCheckboxLabel}>
              <input
                type="checkbox"
                className={styles.modalCheckbox}
                checked={deleteUnderstand}
                onChange={(e) => setDeleteUnderstand(e.target.checked)}
              />
              <span className={styles.modalCheckboxText}>I understand, continue.</span>
            </label>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setSectionToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalDeleteBtn}
                disabled={!deleteUnderstand}
                onClick={() => {
                  deleteCustomSection(sectionToDelete.id);
                  setSectionToDelete(null);
                }}
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExperienceDescriptionEditor: React.FC<{
  id: string;
  value: string;
  onChange: (val: string) => void;
}> = ({ id, value, onChange }) => {
  const richTextRef = useRef<HTMLDivElement>(null);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedSelectionRange = useRef<Range | null>(null);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    bulletList: false,
    numberedList: false,
    link: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
  });

  const updateActiveFormats = () => {
    if (typeof document === 'undefined') return;
    
    let linkActive = false;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).startContainer;
      while (node && node.nodeName !== 'DIV' && node.nodeName !== 'BODY') {
        if (node.nodeName === 'A') {
          linkActive = true;
          break;
        }
        node = node.parentNode;
      }
    }

    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      bulletList: document.queryCommandState('insertUnorderedList'),
      numberedList: document.queryCommandState('insertOrderedList'),
      link: linkActive,
      alignLeft: document.queryCommandState('justifyLeft'),
      alignCenter: document.queryCommandState('justifyCenter'),
      alignRight: document.queryCommandState('justifyRight'),
      alignJustify: document.queryCommandState('justifyFull'),
    });
  };

  const handleApplyLink = () => {
    if (savedSelectionRange.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRange.current);
      }
    }
    document.execCommand('createLink', false, linkUrl);
    setShowLinkPopover(false);
    setLinkUrl('');
    if (richTextRef.current) {
      onChange(richTextRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const handleCommand = (command: string, valueStr: string = '') => {
    document.execCommand(command, false, valueStr);
    if (richTextRef.current) {
      onChange(richTextRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const handleClearFormatting = () => {
    document.execCommand('removeFormat', false);
    document.execCommand('unlink', false);
    document.execCommand('formatBlock', false, 'p');
    document.execCommand('justifyLeft', false);
    if (richTextRef.current) {
      onChange(richTextRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  useEffect(() => {
    if (richTextRef.current && richTextRef.current.innerHTML !== value) {
      richTextRef.current.innerHTML = value || '';
    }
  }, [id, value]);

  const handleRichTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
    updateActiveFormats();
  };

  return (
    <div className={styles.richTextContainer}>
      <div className={styles.toolbarRow}>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.bold ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('bold');
          }}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.italic ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('italic');
          }}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.underline ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('underline');
          }}
          title="Underline"
        >
          <Underline size={14} />
        </button>
        
        <div className={styles.toolbarDivider} />
        
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.bulletList ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('insertUnorderedList');
          }}
          title="Bullet List"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.numberedList ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('insertOrderedList');
          }}
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </button>
        
        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarPopoverContainer}>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.link ? styles.toolbarBtnActive : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              const sel = window.getSelection();
              if (sel && sel.rangeCount > 0) {
                savedSelectionRange.current = sel.getRangeAt(0);
              } else {
                savedSelectionRange.current = null;
              }
              setShowLinkPopover(prev => !prev);
            }}
            title="Add Link"
          >
            <Link2 size={14} />
          </button>

          {showLinkPopover && (
            <div className={styles.summaryLinkPopover} onClick={(e) => e.stopPropagation()}>
              <div className={styles.popoverTitle}>Link URL</div>
              <div className={styles.popoverRow}>
                <input
                  type="text"
                  className={styles.popoverInput}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter Link"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyLink();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.popoverCheckBtn}
                  onClick={handleApplyLink}
                  title="Apply"
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.toolbarBtn}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('unlink');
          }}
          title="Remove Link"
        >
          <Link2Off size={14} />
        </button>

        <div className={styles.toolbarDivider} />

        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.alignLeft ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('justifyLeft');
          }}
          title="Align Left"
        >
          <AlignLeft size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.alignCenter ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('justifyCenter');
          }}
          title="Align Center"
        >
          <AlignCenter size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.alignRight ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('justifyRight');
          }}
          title="Align Right"
        >
          <AlignRight size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.alignJustify ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('justifyFull');
          }}
          title="Justify"
        >
          <AlignJustify size={14} />
        </button>

        <div className={styles.toolbarDivider} />

        <button
          type="button"
          className={styles.toolbarBtn}
          onMouseDown={(e) => {
            e.preventDefault();
            handleClearFormatting();
          }}
          title="Clear Formatting"
        >
          <Eraser size={14} />
        </button>
      </div>
      <div
        ref={richTextRef}
        className={styles.richTextEditor}
        contentEditable={true}
        onInput={handleRichTextChange}
        onSelect={updateActiveFormats}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

function getProficiencyOptions(standard: 'descriptive' | 'cefr' | 'ilr'): string[] {
  if (standard === 'cefr') {
    return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  }
  if (standard === 'ilr') {
    return [
      '0 – No Proficiency',
      '1 – Elementary Proficiency',
      '2 – Limited Working Proficiency',
      '3 – Professional Working Proficiency',
      '4 – Full Professional Proficiency',
      '5 – Native or Bilingual Proficiency'
    ];
  }
  return [
    'Native',
    'Bilingual',
    'Fluent',
    'Advanced',
    'Professional Working',
    'Intermediate',
    'Conversational',
    'Basic',
    'Beginner'
  ];
}

const SearchableLanguageInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const languagesList = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Gujarati', 'Bengali', 
    'Punjabi', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Turkish', 'Vietnamese', 
    'Polish', 'Dutch', 'Swedish', 'Norwegian', 'Finnish', 'Danish', 'Malay', 
    'Indonesian', 'Thai'
  ];

  const filteredLanguages = languagesList.filter((lang) =>
    lang.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={styles.searchableDropdownContainer}>
      <input
        type="text"
        className={styles.input}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search or enter language..."
        style={{ width: '100%' }}
      />
      {isOpen && filteredLanguages.length > 0 && (
        <ul className={styles.searchableDropdownList}>
          {filteredLanguages.map((lang) => (
            <li
              key={lang}
              className={styles.searchableDropdownItem}
              onClick={() => {
                onChange(lang);
                setSearch(lang);
                setIsOpen(false);
              }}
            >
              {lang}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
