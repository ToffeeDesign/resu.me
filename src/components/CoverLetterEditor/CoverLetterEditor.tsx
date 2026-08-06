'use client';

import React, { useState, useEffect } from 'react';
import styles from './CoverLetterEditor.module.css';
import dashboardStyles from '@/views/DashboardPage/DashboardPage.module.css';
import previewStyles from '@/components/ResumePreview/ResumePreview.module.css';
import { useResume, CoverLetterData, initialCoverLetterData, CONTACT_TYPE_LABELS, ContactType, ContactItem, CONTACT_TYPE_ICONS } from '@/context/ResumeContext';
import { ArrowLeft, Eye, Download, Layout, Edit3, Type, Palette, ChevronDown, User, Building, FileText, Upload, Link2, Check, GripVertical, CalendarDays, Contact2, Trash2, FileSignature } from 'lucide-react';
import { TextField } from '@/components/UI/TextField';
import { RichTextEditor } from '@/components/UI/RichTextEditor';
import { SignatureModal } from './SignatureModal';
import { CoverLetterPreviewContent } from './CoverLetterPreviewContent';

function getContactLink(type: string, value: string, url?: string): string {
  const destination = (url && url.trim()) || value.trim();
  if (type === 'email') return destination.startsWith('mailto:') ? destination : `mailto:${destination}`;
  if (type === 'phone') return destination.startsWith('tel:') ? destination : `tel:${destination}`;
  if (/^(https?:\/\/)/i.test(destination)) return destination;
  return `https://${destination}`;
}

interface Props {
  onBack: () => void;
}

const fontOptions = [
  { id: 'Inter', name: 'Inter (Sans-Serif)' },
  { id: 'Lora', name: 'Lora (Serif)' },
  { id: 'Montserrat', name: 'Montserrat (Modern)' },
  { id: 'Outfit', name: 'Outfit (Sleek)' },
  { id: 'Playfair Display', name: 'Playfair (Classic)' }
];

const colorOptions = [
  { id: '#4f46e5', name: 'Indigo' },
  { id: '#1e293b', name: 'Slate' },
  { id: '#059669', name: 'Emerald' },
  { id: '#dc2626', name: 'Crimson' },
  { id: '#d97706', name: 'Amber' }
];

export const CoverLetterEditor: React.FC<Props> = ({ onBack }) => {
  const {
    activeCoverLetterId,
    activeCoverLetterData,
    setActiveCoverLetterData,
    saveStatus,
    manualSaveCoverLetter
  } = useResume();

  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [activeSection, setActiveSection] = useState<string>('sender.profile');
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [contactDragId, setContactDragId] = useState<string | null>(null);
  const [activeUrlInputId, setActiveUrlInputId] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setActiveSection((prev) => {
      if (prev.startsWith(section)) {
        return '';
      }
      if (section === 'sender') return 'sender.profile';
      return section;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert('Photo file size should be less than 1MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => updateSenderInfo({ profilePhoto: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = () => {
    updateSenderInfo({ profilePhoto: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert('Photo file size should be less than 1MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => updateSenderInfo({ profilePhoto: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const updateSignatureInfo = (patch: Partial<NonNullable<CoverLetterData['signatureInfo']>>) => {
    setActiveCoverLetterData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        signatureInfo: {
          ...(prev.signatureInfo || { image: '', name: '', date: '', place: '' }),
          ...patch
        }
      };
    });
  };

  const handleSignatureRemove = () => {
    updateSignatureInfo({ image: '' });
  };

  const addContactItem = (type: any = 'email') => {
    const newItem = {
      id: `ci-${Math.random().toString(36).substr(2, 9)}`,
      type,
      value: '',
      url: ''
    };
    updateSenderInfo({
      contactItems: [...(activeCoverLetterData?.senderInfo.contactItems || []), newItem]
    });
  };

  const deleteContactItem = (id: string) => {
    updateSenderInfo({
      contactItems: (activeCoverLetterData?.senderInfo.contactItems || []).filter(item => item.id !== id)
    });
  };

  const updateContactItem = (id: string, patch: any) => {
    updateSenderInfo({
      contactItems: (activeCoverLetterData?.senderInfo.contactItems || []).map(item =>
        item.id === id ? { ...item, ...patch } : item
      )
    });
  };

  const handleContactDragStart = (e: React.DragEvent, id: string) => {
    setContactDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleContactDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    if (contactDragId === null || contactDragId === overId) return;
    const items = [...(activeCoverLetterData?.senderInfo.contactItems || [])];
    const dragIndex = items.findIndex(item => item.id === contactDragId);
    const overIndex = items.findIndex(item => item.id === overId);
    if (dragIndex === -1 || overIndex === -1) return;
    const temp = items[dragIndex];
    items.splice(dragIndex, 1);
    items.splice(overIndex, 0, temp);
    updateSenderInfo({ contactItems: items });
  };

  const handleContactDragEnd = () => {
    setContactDragId(null);
  };

  // Custom typography states — derived from persisted data, synced back on change
  const fontFamily = (activeCoverLetterData?.fontFamily as 'Inter' | 'Lora' | 'Montserrat' | 'Outfit' | 'Playfair Display') ?? 'Inter';
  const primaryColor = activeCoverLetterData?.primaryColor ?? '#4f46e5';

  // Initialize nameVal and date when activeCoverLetterData changes
  useEffect(() => {
    if (activeCoverLetterData) {
      setNameVal(activeCoverLetterData.name);
      if (!activeCoverLetterData.date) {
        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        setActiveCoverLetterData(prev => {
          if (!prev || prev.date) return prev;
          return { ...prev, date: currentDate };
        });
      }
    }
  }, [activeCoverLetterId, activeCoverLetterData]);

  if (!activeCoverLetterId || !activeCoverLetterData) {
    return (
      <div className={styles.emptyState}>
        <p>No active cover letter selected.</p>
        <button onClick={onBack} className={styles.backBtn}>Go Back</button>
      </div>
    );
  }

  const updateData = (patch: Partial<CoverLetterData>) => {
    setActiveCoverLetterData((prev) => {
      if (!prev) return null;
      return { ...prev, ...patch };
    });
  };

  const setFontFamily = (val: 'Inter' | 'Lora' | 'Montserrat' | 'Outfit' | 'Playfair Display') =>
    updateData({ fontFamily: val });
  const setPrimaryColor = (val: string) =>
    updateData({ primaryColor: val });

  const updateSenderInfo = (patch: Partial<CoverLetterData['senderInfo']>) => {
    setActiveCoverLetterData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        senderInfo: { ...prev.senderInfo, ...patch }
      };
    });
  };

  const updateRecipientInfo = (patch: Partial<CoverLetterData['recipientInfo']>) => {
    setActiveCoverLetterData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        recipientInfo: { ...prev.recipientInfo, ...patch }
      };
    });
  };

  const handleNameSave = () => {
    if (nameVal.trim()) {
      updateData({ name: nameVal });
    }
    setEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') {
      setNameVal(activeCoverLetterData.name);
      setEditingName(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={dashboardStyles.editorContainer}>
      <header className={`${dashboardStyles.topbar} no-print`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Back button */}
          <button
            className={dashboardStyles.backBtn}
            onClick={onBack}
            aria-label="Back to My Cover Letters"
            title="Back to My Cover Letters"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>My Cover Letters</span>
          </button>

          <span className={dashboardStyles.breadcrumbDivider}>›</span>

          {/* Cover Letter name editor */}
          <div
            className={`${dashboardStyles.resumeNameWrap} ${editingName ? dashboardStyles.resumeNameEditing : ''}`}
            title="Double-click to rename cover letter"
          >
            {editingName ? (
              <input
                type="text"
                className={dashboardStyles.resumeNameInput}
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleNameKeyDown}
                autoFocus
              />
            ) : (
              <span
                className={dashboardStyles.resumeNameLabel}
                onDoubleClick={() => setEditingName(true)}
              >
                {activeCoverLetterData.name}
              </span>
            )}
          </div>


        </div>

        <div className={dashboardStyles.topbarActions}>
          <button
            type="button"
            className={`${dashboardStyles.saveBtn} ${dashboardStyles.saveBtnSecondary} ${saveStatus === 'saving' ? dashboardStyles.saveBtnSaving : ''} ${saveStatus === 'saved' ? dashboardStyles.saveBtnSaved : ''}`}
            onClick={manualSaveCoverLetter}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' && <span className={dashboardStyles.savingSpinner} aria-hidden="true" />}
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Save'}
          </button>
          <button className={dashboardStyles.saveBtn} onClick={handlePrint}>
            <Download size={14} />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      <div className={dashboardStyles.workspaceGrid}>
        {/* Left Side: Inputs */}
        <div className={`${dashboardStyles.editorPaneWrapper} no-print`}>
          <div className={dashboardStyles.editorPanelHeader}>
            <div className={dashboardStyles.editorTabs}>
              <button
                className={`${dashboardStyles.editorTabBtn} ${activeTab === 'content' ? dashboardStyles.editorTabActive : ''}`}
                onClick={() => setActiveTab('content')}
              >
                Edit Content
              </button>
              <button
                className={`${dashboardStyles.editorTabBtn} ${activeTab === 'design' ? dashboardStyles.editorTabActive : ''}`}
                onClick={() => setActiveTab('design')}
              >
                Customize
              </button>
            </div>
          </div>

          <div className={`${dashboardStyles.editorPaneContent} ${styles.paneScroll}`}>
            {activeTab === 'design' ? (
              <div className={styles.designTab}>
                <div className={styles.sectionTitle}>
                  <Layout size={15} /> Template Style
                </div>
                <div className={styles.templateOptions}>
                  <button
                    className={`${styles.tplSelectCard} ${activeCoverLetterData.templateId === 'minimal' ? styles.tplSelectActive : ''}`}
                    onClick={() => updateData({ templateId: 'minimal' })}
                  >
                    Minimal Clean
                  </button>
                  <button
                    className={`${styles.tplSelectCard} ${activeCoverLetterData.templateId === 'modern' ? styles.tplSelectActive : ''}`}
                    onClick={() => updateData({ templateId: 'modern' })}
                  >
                    Modern Accent
                  </button>
                  <button
                    className={`${styles.tplSelectCard} ${activeCoverLetterData.templateId === 'creative' ? styles.tplSelectActive : ''}`}
                    onClick={() => updateData({ templateId: 'creative' })}
                  >
                    Creative Elegant
                  </button>
                </div>

                <div className={styles.sectionTitle} style={{ marginTop: '24px' }}>
                  <Type size={15} /> Typography Font
                </div>
                <div className={styles.selectWrapper}>
                  <select
                    className={styles.selectInput}
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as any)}
                  >
                    {fontOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.sectionTitle} style={{ marginTop: '24px' }}>
                  <Palette size={15} /> Theme Color
                </div>
                <div className={styles.colorPickerRow}>
                  {colorOptions.map(opt => (
                    <button
                      key={opt.id}
                      className={`${styles.colorCircle} ${primaryColor === opt.id ? styles.colorCircleActive : ''}`}
                      style={{ backgroundColor: opt.id }}
                      onClick={() => setPrimaryColor(opt.id)}
                      title={opt.name}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.contentTab}>
                {/* Sender Information */}
                <div className={styles.sectionCard}>
                  <div className={styles.sectionHeader} onClick={() => toggleSection('sender')}>
                    <div className={styles.sectionTitleContainer}>
                      <User className={styles.sectionIcon} size={22} />
                      <div className={styles.sectionTitleDescriptionWrap}>
                        <span className={styles.sectionTitle}>Sender Information</span>
                        <p className={styles.sectionDescription}>Profile, contact info, and additional details</p>
                      </div>
                    </div>
                    <ChevronDown className={`${styles.chevron} ${activeSection.startsWith('sender') ? styles.chevronOpen : ''}`} size={16} />
                  </div>

                  {activeSection.startsWith('sender') && (
                    <div className={styles.sectionContent} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* ── 1. PROFILE INFORMATION ──────────────────────────────────── */}
                      <div className={styles.subSectionHeader} onClick={() => setActiveSection('sender.profile')}>
                        <div className={styles.subSectionTitle}>
                          <span className={styles.subSectionIcon}>
                            <User size={15} />
                          </span>
                          Profile Information
                        </div>
                        <ChevronDown className={`${styles.chevron} ${activeSection === 'sender.profile' ? styles.chevronOpen : ''}`} size={16} />
                      </div>

                      {activeSection === 'sender.profile' && (
                        <div className={styles.subSectionContent}>
                          <div className={styles.grid}>
                            {/* Profile Photo */}
                            <div className={styles.photoUploadContainer}>
                              <label className={styles.label}>
                                Profile Photo (Optional)
                                <label
                                  className={styles.toggleSwitch}
                                  onClick={(e) => e.stopPropagation()}
                                  title={(activeCoverLetterData.senderInfo.showProfilePhoto ?? true) ? 'Hide photo from cover letter' : 'Show photo in cover letter'}
                                  style={{ marginLeft: '8px', verticalAlign: 'middle' }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={activeCoverLetterData.senderInfo.showProfilePhoto ?? true}
                                    onChange={() => updateSenderInfo({ showProfilePhoto: !(activeCoverLetterData.senderInfo.showProfilePhoto ?? true) })}
                                  />
                                  <span className={styles.toggleSlider}></span>
                                </label>
                              </label>
                              <input type="file" accept="image/*" onChange={handlePhotoUpload} ref={fileInputRef} style={{ display: 'none' }} />
                              {activeCoverLetterData.senderInfo.profilePhoto ? (
                                <div className={styles.photoPreviewWrap}>
                                  <img src={activeCoverLetterData.senderInfo.profilePhoto} alt="Profile" className={styles.photoPreview} />
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
                              value={activeCoverLetterData.senderInfo.fullName}
                              onChange={(e) => updateSenderInfo({ fullName: e.target.value })}
                              placeholder="e.g. Chavda Mahmadjakir"
                            />
                            <TextField
                              label="Designation / Job Title"
                              value={activeCoverLetterData.senderInfo.jobTitle}
                              onChange={(e) => updateSenderInfo({ jobTitle: e.target.value })}
                              placeholder="e.g. Senior UI/UX & Graphic Designer"
                            />
                          </div>
                        </div>
                      )}

                      {/* ── 2. CONTACT INFORMATION ──────────────────────────────────── */}
                      <div className={styles.subSectionHeader} onClick={() => setActiveSection('sender.contact')}>
                        <div className={styles.subSectionTitle}>
                          <span className={styles.subSectionIcon}>
                            <Contact2 size={15} />
                          </span>
                          Contact Information
                        </div>
                        <ChevronDown className={`${styles.chevron} ${activeSection === 'sender.contact' ? styles.chevronOpen : ''}`} size={16} />
                      </div>

                      {activeSection === 'sender.contact' && (
                        <div className={styles.subSectionContent}>
                          <p className={styles.subSectionHint}>
                            Drag <GripVertical size={14} /> to reorder. Add any contact method — phone, email, social media, or custom link.
                          </p>

                          <div className={styles.contactItemList}>
                            {(activeCoverLetterData.senderInfo.contactItems || []).map((ci) => (
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
                                      type="text"
                                      className={styles.input}
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

                          <button
                            type="button"
                            className={styles.addContactFullWidthBtn}
                            onClick={() => addContactItem('email')}
                          >
                            + Add Contact Item
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* Recipient Information */}
                <div className={styles.sectionCard} style={{ marginTop: '16px' }}>
                  <div className={styles.sectionHeader} onClick={() => toggleSection('recipient')}>
                    <div className={styles.sectionTitleContainer}>
                      <Building className={styles.sectionIcon} size={22} />
                      <div className={styles.sectionTitleDescriptionWrap}>
                        <span className={styles.sectionTitle}>Recipient Information</span>
                        <p className={styles.sectionDescription}>Date, company, recruiter contact person, and address</p>
                      </div>
                    </div>
                    <ChevronDown className={`${styles.chevron} ${activeSection === 'recipient' ? styles.chevronOpen : ''}`} size={16} />
                  </div>

                  {activeSection === 'recipient' && (
                    <div className={styles.sectionContent}>
                      <div className={styles.grid}>
                        <TextField
                          label="Contact Person"
                          value={activeCoverLetterData.recipientInfo.name}
                          onChange={(e) => updateRecipientInfo({ name: e.target.value })}
                          placeholder="Hiring Manager"
                          fullWidth={true}
                        />
                        <TextField
                          label="Position / Department"
                          value={activeCoverLetterData.recipientInfo.position}
                          onChange={(e) => updateRecipientInfo({ position: e.target.value })}
                          placeholder="Engineering Recruitment Team"
                          fullWidth={true}
                        />
                        <TextField
                          label="Company Name"
                          value={activeCoverLetterData.recipientInfo.companyName}
                          onChange={(e) => updateRecipientInfo({ companyName: e.target.value })}
                          placeholder="Tech Corp Inc."
                          fullWidth={true}
                        />
                        <TextField
                          label="Address"
                          value={activeCoverLetterData.recipientInfo.address}
                          onChange={(e) => updateRecipientInfo({ address: e.target.value })}
                          placeholder="Dubai Internet City, Dubai"
                          fullWidth={true}
                        />
                        <TextField
                          label="Date"
                          value={activeCoverLetterData.date}
                          onChange={(e) => updateData({ date: e.target.value })}
                          fullWidth={true}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Letter Content */}
                <div className={styles.sectionCard} style={{ marginTop: '16px' }}>
                  <div className={styles.sectionHeader} onClick={() => toggleSection('content')}>
                    <div className={styles.sectionTitleContainer}>
                      <FileText className={styles.sectionIcon} size={22} />
                      <div className={styles.sectionTitleDescriptionWrap}>
                        <span className={styles.sectionTitle}>Letter Content</span>
                        <p className={styles.sectionDescription}>Subject line, salutation, and letter body</p>
                      </div>
                    </div>
                    <ChevronDown className={`${styles.chevron} ${activeSection === 'content' ? styles.chevronOpen : ''}`} size={16} />
                  </div>

                  {activeSection === 'content' && (
                    <div className={styles.sectionContent}>
                      <div className={styles.grid}>
                        <TextField
                          label="Subject Line"
                          value={activeCoverLetterData.subject}
                          onChange={(e) => updateData({ subject: e.target.value })}
                          placeholder="Application for Job..."
                          fullWidth={true}
                        />
                        <TextField
                          label="Salutation"
                          value={activeCoverLetterData.salutation}
                          onChange={(e) => updateData({ salutation: e.target.value })}
                          fullWidth={true}
                        />
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                          <label className={styles.inputLabel} style={{ marginBottom: '8px', display: 'block' }}>Letter Body</label>
                          <RichTextEditor
                            id={activeCoverLetterId}
                            value={activeCoverLetterData.body}
                            onChange={(val) => updateData({ body: val })}
                            minHeight="220px"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Signature */}
                <div className={styles.sectionCard} style={{ marginTop: '16px' }}>
                  <div className={styles.sectionHeader} onClick={() => toggleSection('signature_section')}>
                    <div className={styles.sectionTitleContainer}>
                      <FileSignature className={styles.sectionIcon} size={22} />
                      <div className={styles.sectionTitleDescriptionWrap}>
                        <span className={styles.sectionTitle}>Signature</span>
                        <p className={styles.sectionDescription}>Upload signature image and printed sign-off details</p>
                      </div>
                    </div>
                    <ChevronDown className={`${styles.chevron} ${activeSection === 'signature_section' ? styles.chevronOpen : ''}`} size={16} />
                  </div>

                  {activeSection === 'signature_section' && (
                    <div className={styles.sectionContent}>
                      <div className={styles.grid}>
                        {/* Signature Upload */}
                        <div className={styles.photoUploadContainer} style={{ gridColumn: 'span 2' }}>
                          <label className={styles.label}>Signature Image</label>
                          {(activeCoverLetterData.signatureInfo?.image) ? (
                            <div className={styles.photoPreviewWrap}>
                              <img src={activeCoverLetterData.signatureInfo.image} alt="Signature Preview" className={styles.signaturePreview} />
                              <div className={styles.photoActions}>
                                <button type="button" className={styles.photoBtnChange} onClick={() => setIsSignatureModalOpen(true)}>Edit Signature</button>
                                <button type="button" className={styles.photoBtnRemove} onClick={handleSignatureRemove}>Remove</button>
                              </div>
                            </div>
                          ) : (
                            <div className={styles.photoDropzone} onClick={() => setIsSignatureModalOpen(true)}>
                              <Upload className={styles.uploadIcon} size={24} />
                              <div className={styles.uploadText}><strong>Click to create / upload</strong></div>
                              <div className={styles.uploadSubtext}>Draw signature or upload a transparent PNG</div>
                            </div>
                          )}
                        </div>

                        <TextField
                          label="Full name"
                          value={activeCoverLetterData.signatureInfo?.name || ''}
                          onChange={(e) => updateSignatureInfo({ name: e.target.value })}
                          placeholder="Your printed name"
                          fullWidth={true}
                        />
                        <TextField
                          label="Place"
                          value={activeCoverLetterData.signatureInfo?.place || ''}
                          onChange={(e) => updateSignatureInfo({ place: e.target.value })}
                          placeholder="e.g. Dubai"
                        />
                        <TextField
                          label="Date"
                          value={activeCoverLetterData.signatureInfo?.date || ''}
                          onChange={(e) => updateSignatureInfo({ date: e.target.value })}
                          placeholder="Enter date"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Page Preview */}
        <div className={`${previewStyles.previewPanel} ${showMobilePreview ? previewStyles.previewPaneVisible : ''}`}>
          <div className={`${previewStyles.toolbar} no-print`}>
            <span className={previewStyles.toolbarTitle}>Cover Letter Preview (Simulated A4 Sheet)</span>
            <div className={previewStyles.controlsGroup}>
              <div className={styles.compactZoomControl}>
                <button
                  className={styles.compactZoomBtn}
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  title="Zoom Out"
                  disabled={zoom <= 50}
                >
                  —
                </button>
                <span className={styles.compactZoomValue}>{zoom}%</span>
                <button
                  className={styles.compactZoomBtn}
                  onClick={() => setZoom(Math.min(120, zoom + 10))}
                  title="Zoom In"
                  disabled={zoom >= 120}
                >
                  ＋
                </button>
              </div>
            </div>
          </div>

          <div className={previewStyles.pageContainer}>
            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className={`${styles.a4Sheet} ${styles.pageSheetWrapper}`}>
                <CoverLetterPreviewContent data={activeCoverLetterData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <div className={`${styles.mobileToggleBar} no-print`}>
        <button
          className={styles.mobileToggleBtn}
          onClick={() => setShowMobilePreview(!showMobilePreview)}
        >
          {showMobilePreview ? '← Edit Form' : '👁 Show Preview'}
        </button>
      </div>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={(url) => updateSignatureInfo({ image: url })}
        initialImage={activeCoverLetterData.signatureInfo?.image}
      />
    </div>
  );
};
