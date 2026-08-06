'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { ResumeEditor } from '@/components/ResumeEditor/ResumeEditor';
import { CustomizePanel } from '@/components/CustomizePanel/CustomizePanel';
import { ResumePreview } from '@/components/ResumePreview/ResumePreview';
import { MyResumesPage } from '@/components/Dashboard/MyResumesPage';
import { MyCoverLettersPage } from '@/components/Dashboard/MyCoverLettersPage';
import { CoverLetterEditor } from '@/components/CoverLetterEditor/CoverLetterEditor';
import { useResume, makeBlankResume, loadResumeList, saveResumeList, ResumeListEntry } from '@/context/ResumeContext';
import { AtsAnalyser } from '@/components/AtsAnalyser/AtsAnalyser';
import { AiHumanizer } from '@/components/AiHumanizer/AiHumanizer';
import { LinktreeManager } from '@/components/Linktree/LinktreeManager';
import { LinktreeBuilder } from '@/components/Linktree/LinktreeBuilder';
import { PageHeader } from '@/components/UI/PageHeader';
import { Plus } from 'lucide-react';
import linktreeStyles from '@/components/Linktree/LinktreeManager.module.css';
import styles from './DashboardPage.module.css';

// ─── Top-level view type ──────────────────────────────────────────────────
type AppView = 'list' | 'editor';

function AITeaser({ title, desc, icon, onAccess }: { title: string; desc: string; icon: string; onAccess?: () => void }) {
  const { user, triggerLogin } = useResume();
  const handleUnlock = () => {
    if (!user) {
      triggerLogin(() => {
        if (onAccess) onAccess();
      });
    } else {
      if (onAccess) onAccess();
    }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
        <p style={{ color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>{desc}</p>
        <button 
          onClick={handleUnlock}
          style={{ padding: '10px 24px', borderRadius: 999, background: 'linear-gradient(135deg, hsl(247,85%,60%), hsl(247,85%,45%))', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          {user ? 'Unlocked • Access Feature' : 'Unlock with Pro AI Account'}
        </button>
      </div>
    </div>
  );
}

interface DashboardPageProps {
  initialTab?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ initialTab }) => {
  const {
    resumeData,
    updateResumeName,
    saveStatus,
    manualSave,
    loadResumeById,
    setActiveResumeId,
    resumesList,
    loginModalOpen,
    activeCoverLetterId,
    setActiveCoverLetterId,
    createNewCoverLetter,
    loadCoverLetterById,
    coverLettersList,
    linktreePages
  } = useResume();

  // ── View state ─────────────────────────────────────────────────────────
  const [view, setView] = useState<AppView>('list');
  const [activeTab, setActiveTab] = useState(initialTab || 'resume');
  const [atsActive, setAtsActive] = useState(false);
  const [resumeSubTab, setResumeSubTab] = useState<'overview' | 'content' | 'customize'>('content');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isCreatingLinktree, setIsCreatingLinktree] = useState(false);
  const [editingLinktreePageId, setEditingLinktreePageId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }, [darkMode]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.select();
  }, [editingName]);



  const toggleDarkMode = () => setDarkMode(!darkMode);

  // ── Header Props ───────────────────────────────────────────────────────
  const getHeaderProps = () => {
    switch (activeTab) {
      case 'resume':
        return {
          title: 'My Resumes',
          subtitle: (
            <>
              Your first resume is free forever. Need more than one resume?{' '}
              <span className={styles.upgradeLink}>Upgrade your plan</span>
            </>
          ),
        };
      case 'coverletter':
        return {
          title: 'My Cover Letters',
          subtitle: (
            <>
              Your first cover letter is free forever. Need more than one cover letter?{' '}
              <span className={styles.upgradeLink}>Upgrade your plan</span>
            </>
          ),
        };
      case 'tracker':
        return {
          title: 'Job Tracker',
          subtitle: 'Organize, search, and track all your applications and interviews.',
        };
      case 'ats':
        return {
          title: 'ATS Match Score',
          subtitle: 'Compare your resume against target job descriptions.',
        };
      case 'humanizer':
        return {
          title: 'AI Rewrite & Humanizer',
          subtitle: 'Humanize your profile descriptions and bullet points.',
        };
      case 'linktree':
        return {
          title: 'Your Link Pages',
          subtitle: 'Manage and monitor visitor analytics for your live profile cards.',
        };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const headerProps = getHeaderProps();

  // ── Navigation handlers ───────────────────────────────────────────────
  const openResume = (entry: ResumeListEntry) => {
    loadResumeById(entry);
    setView('editor');
    setResumeSubTab('content');
  };

  const createNewResume = (templateId?: string) => {
    const id = `resume-${Date.now()}`;
    const blank = makeBlankResume(`Resume ${loadResumeList().length + 1}`);
    if (templateId) {
      if (templateId === 'atlantic') {
        blank.styling.template = 'sidebar';
        blank.styling.primaryColor = '#1e3a5f';
      } else if (templateId === 'mercury') {
        blank.styling.template = 'modern';
        blank.styling.primaryColor = '#5533ff';
      } else if (templateId === 'minimal') {
        blank.styling.template = 'minimal';
        blank.styling.primaryColor = '#374151';
      } else if (templateId === 'classic') {
        blank.styling.template = 'classic';
        blank.styling.primaryColor = '#3b82f6';
      } else if (templateId === 'executive') {
        blank.styling.template = 'classic';
        blank.styling.primaryColor = '#92400e';
      } else if (templateId === 'neon') {
        blank.styling.template = 'classic';
        blank.styling.primaryColor = '#06b6d4';
      }
    }
    const list = loadResumeList();
    const entry: ResumeListEntry = { id, name: blank.resumeName, updatedAt: new Date().toISOString(), data: blank };
    saveResumeList([...list, entry]);
    loadResumeById(entry);
    setView('editor');
    setResumeSubTab('content');
  };

  const goBackToList = () => {
    setView('list');
    setActiveTab('resume');
    setAtsActive(false);
  };

  // ── Sidebar nav tab change ─────────────────────────────────────────────
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setAtsActive(false);
    setIsSidebarOpen(false);
    // Always show the list when switching to resume tab from sidebar
    if (tab === 'resume') setView('list');
  };

  if (activeTab === 'coverletter' && activeCoverLetterId !== null) {
    return <CoverLetterEditor onBack={() => setActiveCoverLetterId(null)} />;
  }

  if (activeTab === 'linktree' && editingLinktreePageId !== null) {
    return <LinktreeBuilder pageId={editingLinktreePageId} onBack={() => setEditingLinktreePageId(null)} />;
  }

  // ─────────────────────────────────────────────────────────────────────
  // LIST VIEW — My Resumes + Sidebar
  // ─────────────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className={`${styles.container} ${loginModalOpen ? styles.blurredBackground : ''}`}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <div className={styles.mainWrapper}>
          {((activeTab === 'resume' && resumesList.length === 0) || (activeTab === 'coverletter' && coverLettersList.length === 0) || activeTab === 'linktree') ? (
            <div className={`${styles.listPageHeader} ${styles.emptyOnboardingHeader}`}>
              <button
                className={styles.mobileMenuBtn}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle menu"
              >
                ☰
              </button>
            </div>
          ) : (
            <PageHeader
              title={headerProps.title}
              subtitle={headerProps.subtitle}
              onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          )}

          <div 
            style={{ 
              flex: 1, 
              display: (activeTab === 'ats' || activeTab === 'humanizer' || activeTab === 'linktree') ? 'flex' : 'block',
              flexDirection: (activeTab === 'ats' || activeTab === 'humanizer' || activeTab === 'linktree') ? 'column' : undefined,
              overflowY: (activeTab === 'ats' || activeTab === 'humanizer' || activeTab === 'linktree') ? 'hidden' : 'auto' 
            }}
          >
            {activeTab === 'resume' && (
              <MyResumesPage 
                onOpenResume={openResume} 
                onCreateNew={createNewResume} 
              />
            )}
            {activeTab === 'coverletter' && (
              <MyCoverLettersPage
                onOpenCoverLetter={(entry) => loadCoverLetterById(entry)}
                onCreateNew={(templateId) => createNewCoverLetter(templateId)}
              />
            )}
            {activeTab === 'tracker' && <AITeaser title="Job Application Tracker" desc="Organize, search, and track all your applications and upcoming interviews. Sync resumes directly to each job listing." icon="💼" />}
            {activeTab === 'ats' && <AtsAnalyser />}
            {activeTab === 'humanizer' && <AiHumanizer />}
            {activeTab === 'linktree' && (
              <LinktreeManager 
                isCreating={isCreatingLinktree} 
                setIsCreating={setIsCreatingLinktree} 
                editingPageId={editingLinktreePageId}
                setEditingPageId={setEditingLinktreePageId}
              />
            )}
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 149, 
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // EDITOR VIEW — focused workspace, no sidebar
  // ─────────────────────────────────────────────────────────────────────
  const saveBtnLabel = saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : 'Save';
  const saveBtnClass = `${styles.saveBtn} ${saveStatus === 'saving' ? styles.saveBtnSaving : ''} ${saveStatus === 'saved' ? styles.saveBtnSaved : ''}`;

  const renderResumeContent = () => {
    switch (resumeSubTab) {
      case 'overview':
        return (
          <div className={styles.overview}>
            <div className={styles.welcomeCard}>
              <h3 className={styles.welcomeTitle}>Welcome back, {resumeData.personalInfo.fullName?.split(' ')[0] || 'there'}</h3>
              <p className={styles.welcomeText}>
                Your resume is 85% complete. You can add another work experience, configure GCC-specific details, or test your ATS Match score with AI.
              </p>
            </div>
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statVal}>85%</span>
                <span className={styles.statLabel}>Completeness</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statVal}>78</span>
                <span className={styles.statLabel}>ATS Score (Estimate)</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statVal}>1</span>
                <span className={styles.statLabel}>Active Resumes</span>
              </div>
            </div>
            <div className={styles.quickActions}>
              <h4 style={{ fontWeight: 700, fontSize: '15px' }}>Quick Recommendations</h4>
              <div className={styles.actionGrid}>
                <button className={styles.actionBtn} onClick={() => setResumeSubTab('content')}>
                  <span className={styles.actionIcon}>📝</span>
                  <div className={styles.actionTextContainer}>
                    <span className={styles.actionTitle}>Add Visa Details</span>
                    <span className={styles.actionDesc}>Crucial for Gulf job applications</span>
                  </div>
                </button>
                <button className={styles.actionBtn} onClick={() => setResumeSubTab('customize')}>
                  <span className={styles.actionIcon}>🎨</span>
                  <div className={styles.actionTextContainer}>
                    <span className={styles.actionTitle}>Switch Font Style</span>
                    <span className={styles.actionDesc}>Try Outfit or Playfair Serif</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
      case 'content':
        return <ResumeEditor />;
      case 'customize':
        return <CustomizePanel />;
      default:
        return <ResumeEditor />;
    }
  };

  return (
    <div className={`${styles.editorContainer} ${loginModalOpen ? styles.blurredBackground : ''}`}>
      {/* Editor Topbar */}
      <header className={styles.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Back button */}
          <button
            className={styles.backBtn}
            onClick={goBackToList}
            aria-label="Back to My Resumes"
            title="Back to My Resumes"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>My Resumes</span>
          </button>

          <span className={styles.breadcrumbDivider}>›</span>

          {/* Resume name editor */}
          <div
            className={`${styles.resumeNameWrap} ${editingName ? styles.resumeNameEditing : ''}`}
            title="Double-click to rename resume"
          >
            {editingName ? (
              <input
                ref={nameInputRef}
                type="text"
                className={styles.resumeNameInput}
                value={resumeData.resumeName}
                onChange={(e) => updateResumeName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => { if (e.key === 'Enter') nameInputRef.current?.blur(); }}
                autoFocus
              />
            ) : (
              <span
                className={styles.resumeNameLabel}
                onDoubleClick={() => setEditingName(true)}
              >
                {resumeData.resumeName}
              </span>
            )}
          </div>
        </div>

        <div className={styles.topbarActions}>
          <button className={saveBtnClass} onClick={manualSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' && <span className={styles.savingSpinner} aria-hidden="true" />}
            {saveBtnLabel}
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className={styles.workspaceGrid}>
        {/* Editor pane */}
        <div className={styles.editorPaneWrapper}>
          <div className={styles.editorPanelHeader}>
            <div className={styles.editorTabs}>
              <button
                className={`${styles.editorTabBtn} ${resumeSubTab === 'overview' ? styles.editorTabActive : ''}`}
                onClick={() => setResumeSubTab('overview')}
              >Overview</button>
              <button
                className={`${styles.editorTabBtn} ${resumeSubTab === 'content' ? styles.editorTabActive : ''}`}
                onClick={() => setResumeSubTab('content')}
              >Edit Content</button>
              <button
                className={`${styles.editorTabBtn} ${resumeSubTab === 'customize' ? styles.editorTabActive : ''}`}
                onClick={() => setResumeSubTab('customize')}
              >Customize</button>
            </div>
          </div>
          <div className={styles.editorPaneContent}>
            {renderResumeContent()}
          </div>
        </div>

        {/* Preview pane */}
        <div className={`${styles.previewPaneWrapper} ${showMobilePreview ? styles.previewPaneVisible : ''}`}>
          <div className={styles.previewPaneContent}>
            <ResumePreview />
          </div>
        </div>
      </div>

      {/* Mobile preview toggle */}
      <div className={`${styles.mobilePreviewBar} no-print`}>
        <button
          className={styles.mobileToggleBtn}
          onClick={() => setShowMobilePreview(!showMobilePreview)}
        >
          {showMobilePreview ? '← Back to Editor' : '👁 Show Live Preview'}
        </button>
      </div>
    </div>
  );
};
