'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './MyResumesPage.module.css';
import { useResume, loadCoverLetterList, saveCoverLetterList, CoverLetterEntry, initialCoverLetterData } from '@/context/ResumeContext';
import { Pencil, Trash2, Copy, FileText, Zap, Layout, ArrowLeft, Eye, X } from 'lucide-react';

interface Props {
  onOpenCoverLetter: (entry: CoverLetterEntry) => void;
  onCreateNew: (templateId: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

interface CoverLetterTemplate {
  id: string;
  name: string;
  preview: React.ReactNode;
}

const templates: CoverLetterTemplate[] = [
  {
    id: 'scratch',
    name: 'Start from Scratch',
    preview: (
      <svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', background: 'white' }}>
        <rect width="210" height="297" fill="#fff" />
      </svg>
    )
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    preview: (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '12px', background: 'white', fontSize: '6px', color: '#4b5563', gap: '4px' }}>
        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '2px', color: '#111827' }}>SENDER NAME</div>
        <div style={{ fontSize: '4px', color: '#9ca3af' }}>123 Street Rd, City</div>
        <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Recipient Info</div>
        <div style={{ fontSize: '4px' }}>Hiring Manager, Company XYZ</div>
        <div style={{ marginTop: '12px', lineHeight: '1.4' }}>
          Dear Hiring Manager,
          <br />
          I am writing to express my strong interest in the role...
        </div>
      </div>
    )
  },
  {
    id: 'modern',
    name: 'Modern Accent',
    preview: (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: 'white' }}>
        <div style={{ width: '25%', background: '#1e293b', height: '100%', padding: '8px', color: 'white', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '5px', fontWeight: 'bold' }}>S.N.</div>
          <div style={{ fontSize: '3px', color: '#cbd5e1' }}>sender@mail.com</div>
        </div>
        <div style={{ width: '75%', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '6px', color: '#334155' }}>
          <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#0f172a' }}>COVER LETTER</div>
          <div style={{ fontSize: '4px', color: '#94a3b8' }}>July 14, 2026</div>
          <div style={{ marginTop: '8px', lineHeight: '1.4' }}>
            Dear Hiring Manager,
            <br />
            I am writing to express my strong interest...
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'creative',
    name: 'Creative Elegant',
    preview: (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: '12px', background: 'white', fontSize: '6px', color: '#475569', gap: '4px' }}>
        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #6366f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#1e293b' }}>SENDER NAME</div>
          <div style={{ fontSize: '4px' }}>sender@mail.com</div>
        </div>
        <div style={{ marginTop: '8px', lineHeight: '1.4' }}>
          Dear Hiring Manager,
          <br />
          I am writing to express my strong interest...
        </div>
      </div>
    )
  }
];

import { CoverLetterPreviewContent } from '../CoverLetterEditor/CoverLetterPreviewContent';
import editorStyles from '../CoverLetterEditor/CoverLetterEditor.module.css';

const MiniCoverLetterPreview: React.FC<{ entry: CoverLetterEntry }> = ({ entry }) => (
  <div style={{
    width: '215px',
    height: '304px',
    overflow: 'hidden',
    position: 'relative',
    background: '#fff',
    borderRadius: '4px',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)'
  }}>
    <div style={{
      width: '794px',
      height: '1123px',
      transform: 'scale(0.27078)',
      transformOrigin: 'top left',
      pointerEvents: 'none',
      userSelect: 'none',
    }}>
      <div className={editorStyles.a4Sheet} style={{ boxShadow: 'none', minHeight: '1123px', transform: 'none', padding: '60px 40px' }}>
        <CoverLetterPreviewContent data={entry.data} static />
      </div>
    </div>
  </div>
);

export const MyCoverLettersPage: React.FC<Props> = ({ onOpenCoverLetter, onCreateNew }) => {
  const {
    user,
    triggerLogin,
    coverLettersList,
    deleteCoverLetter,
    duplicateCoverLetter,
    updateCoverLetterName,
    refreshCoverLetterList,
  } = useResume();

  const [isSelectingTemplate, setIsSelectingTemplate] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Handle local delete action
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) {
      triggerLogin(() => {
        const list = loadCoverLetterList();
        const updated = list.filter(cl => cl.id !== id);
        saveCoverLetterList(updated);
        refreshCoverLetterList();
        setActiveMenuId(null);
      });
      return;
    }
    const list = loadCoverLetterList();
    const updated = list.filter(cl => cl.id !== id);
    saveCoverLetterList(updated);
    refreshCoverLetterList();
    setActiveMenuId(null);
  };

  // Handle menu click toggles
  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  // Close menus on click outside
  useEffect(() => {
    const closeAll = () => {
      setActiveMenuId(null);
    };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  // Rename handlers
  const startRename = (id: string, currentVal: string) => {
    setEditingId(id);
    setRenameValue(currentVal);
    setActiveMenuId(null);
  };

  const saveRename = (id: string) => {
    if (!renameValue.trim()) return;
    const list = loadCoverLetterList();
    const idx = list.findIndex(e => e.id === id);
    if (idx >= 0) {
      list[idx].name = renameValue;
      list[idx].data.name = renameValue;
      list[idx].updatedAt = new Date().toISOString();
      saveCoverLetterList(list);
      // If we are currently editing this in context, update its title
      updateCoverLetterName(renameValue);
    }
    setEditingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') saveRename(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className={styles.page}>
      {coverLettersList.length === 0 ? (
        /* Empty / Onboarding State */
        <div className={styles.onboarding}>
          <div className={styles.onboardingHeaderWithDivider}>
            <h1 className={styles.onboardingTitle}>Create Your Cover Letter</h1>
            <p className={styles.onboardingSubtitle}>Choose a professional template to match your resume style</p>
          </div>

          <div className={styles.templateGrid}>
            {templates.map((tpl) => (
              <div key={tpl.id} className={styles.tplWrapper}>
                <button
                  className={styles.tplCard}
                  onClick={() => {
                    const action = () => {
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
                  <div className={styles.tplPreview}>{tpl.preview}</div>
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
      ) : (
        /* Populated List State */
        <>

          <div className={styles.grid}>
            {/* New letter button card */}
            <div className={styles.cardWrapper}>
              <button
                className={`${styles.cardThumb} ${styles.newCard}`}
                onClick={() => setIsSelectingTemplate(true)}
                aria-label="Create new cover letter"
              >
                <span className={styles.plusIcon}>+</span>
                <span className={styles.newLabel}>New Letter</span>
              </button>
            </div>

            {/* Created cover letters */}
            {coverLettersList.map((cl) => {
              return (
                <div key={cl.id} className={styles.cardWrapper}>
                  <button
                    className={`${styles.cardThumb} ${styles.resumeCard}`}
                    onClick={() => {
                      if (!user) {
                        triggerLogin(() => onOpenCoverLetter(cl));
                      } else {
                        onOpenCoverLetter(cl);
                      }
                    }}
                    aria-label={`Open ${cl.name}`}
                  >
                    <div className={styles.tplPreview} style={{ pointerEvents: 'none' }}>
                      <MiniCoverLetterPreview entry={cl} />
                    </div>
                    <div className={styles.cardOverlay}>
                      <span className={styles.cardOverlayText}>
                        <Eye size={13} /> View Letter
                      </span>
                    </div>
                  </button>

                  <div className={styles.cardMeta}>
                    <div className={styles.cardMetaText}>
                      {editingId === cl.id ? (
                        <input
                          type="text"
                          className={styles.renameInput}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => saveRename(cl.id)}
                          onKeyDown={(e) => handleRenameKeyDown(e, cl.id)}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className={styles.cardName} onDoubleClick={() => startRename(cl.id, cl.name)}>
                          {cl.name}
                        </span>
                      )}
                      <span className={styles.cardInfo}>{timeAgo(cl.updatedAt)}</span>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button
                        className={styles.menuBtn}
                        onClick={(e) => handleMenuToggle(e, cl.id)}
                        aria-label="Cover letter options"
                      >
                        ⋮
                      </button>

                      {activeMenuId === cl.id && (
                        <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                          <button
                            className={styles.dropdownItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(cl.id, cl.name);
                            }}
                          >
                            <Pencil size={13} /> Rename
                          </button>
                          <button
                            className={styles.dropdownItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateCoverLetter(cl.id);
                              setActiveMenuId(null);
                            }}
                          >
                            <Copy size={13} /> Duplicate
                          </button>
                          <button
                            className={styles.dropdownItem}
                            onClick={(e) => handleDelete(e, cl.id)}
                          >
                            <Trash2 size={13} style={{ color: '#ef4444' }} />
                            <span style={{ color: '#ef4444' }}>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Side Sheet Template Selector */}
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
              <button
                className={styles.sideSheetCloseBtn}
                onClick={() => setIsClosing(true)}
                aria-label="Close template selector"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.sideSheetContent}>
              <div className={styles.sheetGrid}>
                {templates.map((tpl) => (
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
                      <div className={styles.sheetTplPreview}>{tpl.preview}</div>
                      <div className={styles.sheetTplHover}>
                        <span className={styles.sheetTplHoverBtn}>
                          <Zap size={12} /> {tpl.id === 'scratch' ? 'Start blank' : 'Use template'}
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
