'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useResume, CONTACT_TYPE_ICONS, ResumeData, mergeWithInitial } from '@/context/ResumeContext';
import {
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
  Link2
} from 'lucide-react';
import styles from './ResumePreview.module.css';

const MM_TO_PX = 3.779527559;
const PAGE_W_PX = Math.round(210 * MM_TO_PX); // ~794px
const PAGE_H_PX = Math.round(297 * MM_TO_PX); // ~1123px
const MARGIN_PX: Record<string, number> = {
  compact: Math.round(15 * MM_TO_PX),
  normal:  Math.round(20 * MM_TO_PX),
  loose:   Math.round(25 * MM_TO_PX),
};
// Minimum px of remaining space on a page before we push a section to the next page.
// ~3 lines: section heading + rule + first entry header.
const MIN_SECTION_ROOM = 110;

function getContactLink(type: string, value: string, url?: string): string {
  const destination = (url && url.trim()) || value.trim();
  if (type === 'email') return destination.startsWith('mailto:') ? destination : `mailto:${destination}`;
  if (type === 'phone') return destination.startsWith('tel:') ? destination : `tel:${destination}`;
  if (/^(https?:\/\/)/i.test(destination)) return destination;
  return `https://${destination}`;
}

function formatLanguageProficiency(proficiency: string, standard?: string): string {
  if (!proficiency) return '';
  if (standard === 'ilr') {
    const match = proficiency.match(/^(\d)/);
    if (match) {
      return `ILR ${match[1]}`;
    }
  }
  return proficiency;
}

const getToolIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('figma') || n.includes('sketch') || n.includes('photoshop') || n.includes('illustrator') || n.includes('design') || n.includes('canvas') || n.includes('xd') || n.includes('ui') || n.includes('ux') || n.includes('paint') || n.includes('gimp') || n.includes('canva')) {
    return <Paintbrush size={11} />;
  }
  if (n.includes('sql') || n.includes('postgres') || n.includes('mysql') || n.includes('mongo') || n.includes('db') || n.includes('redis') || n.includes('sqlite') || n.includes('oracle') || n.includes('supabase') || n.includes('firebase')) {
    return <Database size={11} />;
  }
  if (n.includes('aws') || n.includes('cloud') || n.includes('gcp') || n.includes('azure') || n.includes('vercel') || n.includes('netlify') || n.includes('heroku')) {
    return <Cloud size={11} />;
  }
  if (n.includes('git') || n.includes('docker') || n.includes('kubernetes') || n.includes('k8s') || n.includes('jenkins') || n.includes('cicd') || n.includes('terraform') || n.includes('ansible') || n.includes('bash') || n.includes('sh') || n.includes('shell') || n.includes('terminal')) {
    return <Terminal size={11} />;
  }
  if (n.includes('jira') || n.includes('confluence') || n.includes('trello') || n.includes('asana') || n.includes('slack') || n.includes('teams') || n.includes('zoom') || n.includes('notion') || n.includes('basecamp')) {
    return <Layers size={11} />;
  }
  if (n.includes('postman') || n.includes('insomnia') || n.includes('api') || n.includes('graphql') || n.includes('rest') || n.includes('swagger') || n.includes('fiddler') || n.includes('wireshark')) {
    return <Workflow size={11} />;
  }
  if (n.includes('react') || n.includes('angular') || n.includes('vue') || n.includes('svelte') || n.includes('next') || n.includes('nuxt') || n.includes('solid') || n.includes('ember') || n.includes('backbone') || n.includes('jquery')) {
    return <Boxes size={11} />;
  }
  if (n.includes('web') || n.includes('html') || n.includes('css') || n.includes('tailwind') || n.includes('bootstrap') || n.includes('sass') || n.includes('less') || n.includes('stylus')) {
    return <Globe size={11} />;
  }
  if (n.includes('app') || n.includes('ios') || n.includes('android') || n.includes('flutter') || n.includes('kotlin') || n.includes('swift') || n.includes('react native') || n.includes('electron') || n.includes('cordova')) {
    return <AppWindow size={11} />;
  }
  return <Code2 size={11} />;
};

export const ResumePreview: React.FC<{ data?: ResumeData; isThumbnail?: boolean }> = ({ data, isThumbnail = false }) => {
  const { resumeData: activeResumeData, user, triggerLogin } = useResume();
  const rawResumeData = data || activeResumeData;
  const resumeData = React.useMemo(() => mergeWithInitial(rawResumeData), [rawResumeData]);
  const { template, fontFamily, fontSize, spacing, margins, primaryColor } = resumeData.styling;

  const disabledSections = resumeData.disabledSections || [];
  const showProfilePhoto  = resumeData.showProfilePhoto !== false;
  const customSectionTitles = resumeData.customSectionTitles || {};

  const [zoom, setZoom] = useState(85);
  const [pages, setPages] = useState(1);
  // sectionSpacers: px of whitespace to insert BEFORE a section so it starts at the top of the next page.
  const [sectionSpacers, setSectionSpacers] = useState<Record<string, number>>({});
  const contentDetectorRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!user) {
      triggerLogin(() => {
        window.print();
      });
    } else {
      window.print();
    }
  };

  const getMarginClass  = () => margins === 'compact' ? styles.marginCompact  : margins === 'loose' ? styles.marginLoose  : styles.marginNormal;
  const getSpacingClass = () => spacing === 'compact' ? styles.spaceCompact   : spacing === 'loose' ? styles.spaceLoose   : styles.spaceNormal;
  const getFontSizeClass= () => fontSize === 'sm'     ? styles.sizeSm         : fontSize === 'lg'   ? styles.sizeLg       : styles.sizeMd;

  const getFontFamily = () => {
    switch (fontFamily) {
      case 'Lora':             return 'Lora, Georgia, serif';
      case 'Montserrat':       return 'Montserrat, sans-serif';
      case 'Outfit':           return 'Outfit, sans-serif';
      case 'Playfair Display': return 'Playfair Display, serif';
      default:                 return 'var(--font-system)';
    }
  };

  const getSectionTitle = (id: string, def: string) => customSectionTitles[id] || def;

  const marginPx    = MARGIN_PX[margins] ?? MARGIN_PX.normal;
  const contentAreaH = PAGE_H_PX - marginPx * 2; // usable height per page slice

  // ─────────────────────────────────────────────────────────────
  // Measure section positions in the hidden detector and compute
  // any spacers needed to keep sections from splitting at the top.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!contentDetectorRef.current) return;

    const els = Array.from(
      contentDetectorRef.current.querySelectorAll<HTMLElement>('[data-section]')
    );

    const newSpacers: Record<string, number> = {};
    let accumulated = 0; // total extra px added so far (shifts subsequent sections)

    for (const el of els) {
      const adjustedTop = el.offsetTop + accumulated;
      const posInPage   = adjustedTop % contentAreaH;
      const remaining   = contentAreaH - posInPage;

      // If the section starts too close to the bottom, push it to the next page
      if (posInPage > 0 && remaining < MIN_SECTION_ROOM) {
        newSpacers[el.dataset.section!] = remaining;
        accumulated += remaining;
      }
    }

    setSectionSpacers(newSpacers);

    const totalHeight = contentDetectorRef.current.scrollHeight + accumulated;
    setPages(Math.max(1, Math.ceil(totalHeight / contentAreaH)));
  }, [resumeData, template, fontFamily, fontSize, spacing, margins, contentAreaH]);

  // ─────────────────────────────────────────────────────────────
  // Helper: optional spacer div before a section
  // ─────────────────────────────────────────────────────────────
  const spacerBefore = (sectionId: string, include: boolean) =>
    include && sectionSpacers[sectionId]
      ? <div key={`sp-${sectionId}`} style={{ height: sectionSpacers[sectionId] }} aria-hidden="true" />
      : null;

  // ─────────────────────────────────────────────────────────────
  // Classic body content
  // withSpacers=true  → actual page render (includes spacer divs)
  // withSpacers=false → hidden detector (raw layout, no spacers)
  // ─────────────────────────────────────────────────────────────
  const renderClassicBody = (withSpacers = false) => (
    <>
      <header data-section="__header" className={styles.headerSection}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '8px' }}>
          {showProfilePhoto && resumeData.personalInfo.profilePhoto && (
            <img src={resumeData.personalInfo.profilePhoto} alt="Profile Avatar" className={styles.classicProfilePhoto} />
          )}
          <div>
            <h1 className={styles.userName}>{resumeData.personalInfo.fullName}</h1>
            <p className={styles.userTitle}>{resumeData.personalInfo.jobTitle}</p>
          </div>
        </div>
        {resumeData.personalInfo.contactItems?.filter(ci => ci.value.trim()).length > 0 && (
          <div className={styles.contactsRow}>
            {resumeData.personalInfo.contactItems.filter(ci => ci.value.trim()).map(ci => (
              <span key={ci.id} className={styles.contactItem}>
                {CONTACT_TYPE_ICONS[ci.type]}{' '}
                {ci.type === 'address' ? (
                  <span>{ci.value}</span>
                ) : (
                  <a href={getContactLink(ci.type, ci.value, ci.url)} target="_blank" rel="noopener noreferrer">
                    {ci.type === 'other' && ci.label ? `${ci.label}: ` : ''}{ci.value}
                  </a>
                )}
              </span>
            ))}
          </div>
        )}
        {(resumeData.personalInfo.nationality || resumeData.personalInfo.visaStatus ||
          resumeData.personalInfo.maritalStatus || resumeData.personalInfo.dateOfBirth ||
          resumeData.personalInfo.passportId   || resumeData.personalInfo.availability) && (
          <div className={styles.gccRow}>
            {resumeData.personalInfo.nationality   && <span>Nationality: <strong>{resumeData.personalInfo.nationality}</strong></span>}
            {resumeData.personalInfo.visaStatus    && <span>Visa: <strong>{resumeData.personalInfo.visaStatus}</strong></span>}
            {resumeData.personalInfo.maritalStatus && <span>Marital: <strong>{resumeData.personalInfo.maritalStatus}</strong></span>}
            {resumeData.personalInfo.dateOfBirth   && <span>DOB: <strong>{resumeData.personalInfo.dateOfBirth}</strong></span>}
            {resumeData.personalInfo.availability  && <span>Available: <strong>{resumeData.personalInfo.availability}</strong></span>}
          </div>
        )}
      </header>

      {resumeData.sectionOrder.map((sectionId) => {
        switch (sectionId) {

          case 'summary':
            if (disabledSections.includes('summary') || !resumeData.summary) return null;
            return (
              <React.Fragment key="summary">
                {spacerBefore('summary', withSpacers)}
                <section data-section="summary" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('summary', 'Professional Summary')}</h2>
                  <div className={styles.summaryText} dangerouslySetInnerHTML={{ __html: resumeData.summary }} />
                </section>
              </React.Fragment>
            );

          case 'experience':
            if (disabledSections.includes('experience') || !resumeData.experience.length) return null;
            return (
              <React.Fragment key="experience">
                {spacerBefore('experience', withSpacers)}
                <section data-section="experience" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('experience', 'Work Experience')}</h2>
                  <div className={styles.itemsList}>
                    {resumeData.experience.map(exp => (
                      <div key={exp.id} className={styles.avoidBreak}>
                        <div className={styles.itemHeader}>
                          <div className={styles.companyRow}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
                          <div className={styles.dateRow}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                        </div>
                        <div className={styles.roleRow}>{exp.position}</div>
                        {exp.description && <div className={styles.itemDesc} dangerouslySetInnerHTML={{ __html: exp.description }} />}
                      </div>
                    ))}
                  </div>
                </section>
              </React.Fragment>
            );

          case 'education':
            if (disabledSections.includes('education') || !resumeData.education.length) return null;
            return (
              <React.Fragment key="education">
                {spacerBefore('education', withSpacers)}
                <section data-section="education" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('education', 'Education')}</h2>
                  <div className={styles.itemsList}>
                    {resumeData.education.map(edu => (
                      <div key={edu.id} className={styles.avoidBreak}>
                        <div className={styles.itemHeader}>
                          <div className={styles.companyRow}>{edu.school}{edu.location ? ` | ${edu.location}` : ''}</div>
                          <div className={styles.dateRow}>{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</div>
                        </div>
                        <div className={styles.roleRow}>{edu.degree}</div>
                        {edu.description && <p className={styles.itemDesc}>{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              </React.Fragment>
            );

          case 'skills':
            if (disabledSections.includes('skills') || !resumeData.skills.length) return null;
            return (
              <React.Fragment key="skills">
                {spacerBefore('skills', withSpacers)}
                <section data-section="skills" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('skills', 'Skills')}</h2>
                  <div className={styles.skillsContainerGrid}>
                    {resumeData.skills.filter(s => s.name.trim()).map(skill => {
                      return (
                        <div key={skill.id} className={styles.skillCategoryBlock}>
                          <div className={styles.skillCategoryTitle}>{skill.name}</div>
                          {skill.level && <div className={styles.skillCategoryDesc}>{skill.level}</div>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </React.Fragment>
            );

          case 'languages':
            if (disabledSections.includes('languages') || !resumeData.languages.length) return null;
            return (
              <React.Fragment key="languages">
                {spacerBefore('languages', withSpacers)}
                <section data-section="languages" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('languages', 'Languages')}</h2>
                  <div className={styles.langsContainer}>
                    {resumeData.languages.filter(l => l.name.trim()).map(lang => (
                      <div key={lang.id} className={styles.langItem}>
                        <span className={styles.langLabel}>{lang.name}</span>
                        <span className={styles.langVal}>{formatLanguageProficiency(lang.proficiency, resumeData.languageStandard)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </React.Fragment>
            );

          case 'certifications':
            if (disabledSections.includes('certifications') || !resumeData.certifications.length) return null;
            return (
              <React.Fragment key="certifications">
                {spacerBefore('certifications', withSpacers)}
                <section data-section="certifications" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('certifications', 'Certifications')}</h2>
                  <div className={styles.itemsList}>
                    {resumeData.certifications.filter(c => c.name.trim()).map(cert => (
                      <div key={cert.id} className={`${styles.itemHeader} ${styles.avoidBreak}`}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {cert.link ? (
                            <a
                              href={getContactLink('website', cert.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.certLink}
                              style={{ color: primaryColor }}
                            >
                              {cert.name}
                              <Link2 size={13} className={styles.certLinkIcon} />
                            </a>
                          ) : (
                            <span style={{ fontWeight: 600, fontSize: 'calc(var(--base-size) - 1px)' }}>{cert.name}</span>
                          )}
                          <span style={{ fontSize: 'calc(var(--base-size) - 2px)', color: '#4b5563' }}>{cert.issuer}</span>
                        </div>
                        <span className={styles.dateRow}>{cert.date}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </React.Fragment>
            );

          default: {
            if (sectionId.startsWith('custom-')) {
              if (disabledSections.includes(sectionId)) return null;
              const sec = (resumeData.customSections || []).find((s) => s.id === sectionId);
              if (!sec) return null;
              
              const hasContent = sec.type === 'text' ? sec.content.trim() : sec.items.some(item => item.title.trim());
              if (!hasContent) return null;

              return (
                <React.Fragment key={sec.id}>
                  {spacerBefore(sec.id, withSpacers)}
                  <section data-section={sec.id} className={styles.sectionBlock}>
                    <h2 className={styles.sectionTitle}>{customSectionTitles[sec.id] || sec.title}</h2>
                    {sec.type === 'text' ? (
                      <div className={styles.summaryText} dangerouslySetInnerHTML={{ __html: sec.content }} />
                    ) : sec.id === 'custom-tools' ? (
                      <div className={styles.toolsChipsPreviewContainer}>
                        {sec.items.filter(item => item.title.trim()).map(item => (
                          <div key={item.id} className={styles.toolPreviewChip}>
                            <span className={styles.toolPreviewChipIcon}>
                              {getToolIcon(item.title)}
                            </span>
                            <span className={styles.toolPreviewChipText}>{item.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : sec.id === 'custom-references' ? (
                      <div className={styles.itemsList}>
                        {sec.items.filter(item => item.title.trim()).map(item => {
                          const separator = resumeData.styling.referencesSeparator || '|';
                          const detailsNodes: React.ReactNode[] = [];

                          if (item.subtitle) {
                            detailsNodes.push(<span key="desig">{item.subtitle}</span>);
                          }
                          if (item.organization) {
                            detailsNodes.push(<span key="org">{item.organization}</span>);
                          }

                          if (item.email) {
                            detailsNodes.push(
                              <a key="email" href={`mailto:${item.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {item.email}
                              </a>
                            );
                          }

                          if (item.phone) {
                            detailsNodes.push(<span key="phone">{item.phone}</span>);
                          }

                          return (
                            <div key={item.id} className={styles.avoidBreak} style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '10px' }}>
                              <div style={{ fontWeight: 600, fontSize: 'calc(var(--base-size) - 1px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {item.link ? (
                                  <a
                                    href={getContactLink('website', item.link)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.certLink}
                                    style={{ color: primaryColor, fontWeight: 600 }}
                                  >
                                    {item.title}
                                    <Link2 size={12} className={styles.certLinkIcon} />
                                  </a>
                                ) : (
                                  <span>{item.title}</span>
                                )}
                              </div>
                              {detailsNodes.length > 0 && (
                                <div style={{ fontSize: 'calc(var(--base-size) - 2px)', color: '#4b5563', lineHeight: 1.4, wordBreak: 'break-all' }}>
                                  {detailsNodes.reduce<React.ReactNode[]>((acc, current, idx) => {
                                    if (idx === 0) return [current];
                                    return [...acc, ` ${separator} `, current];
                                  }, [])}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : sec.id === 'custom-interests' ? (
                      <div className={styles.itemsList}>
                        {(() => {
                          const stripHtml = (html: string) => {
                            if (!html) return '';
                            let text = html.replace(/<[^>]*>/g, '');
                            text = text
                              .replace(/&nbsp;/g, ' ')
                              .replace(/&amp;/g, '&')
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>')
                              .replace(/&quot;/g, '"')
                              .replace(/&#39;/g, "'");
                            return text.trim();
                          };
                          
                          const interestNodes: React.ReactNode[] = [];

                          sec.items.filter(item => item.title.trim()).forEach((item) => {
                            const cleanDesc = stripHtml(item.description || '');
                            
                            const titleNode = item.link ? (
                              <a
                                key={`link-${item.id}`}
                                href={getContactLink('website', item.link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.certLink}
                                style={{ color: primaryColor, fontWeight: 600 }}
                              >
                                {item.title}
                                <Link2 size={12} className={styles.certLinkIcon} />
                              </a>
                            ) : (
                              <strong key={`title-${item.id}`} style={{ fontWeight: 600 }}>{item.title}</strong>
                            );

                            interestNodes.push(
                              <span key={item.id} className={styles.avoidBreak}>
                                {titleNode}
                                {cleanDesc && ` — ${cleanDesc}`}
                              </span>
                            );
                          });

                          if (interestNodes.length === 0) return null;

                          return (
                            <div style={{ fontSize: 'calc(var(--base-size) - 1px)', lineHeight: 1.6, color: '#1f2937' }}>
                              {interestNodes.reduce<React.ReactNode[]>((acc, current, idx) => {
                                if (idx === 0) return [current];
                                return [...acc, <span key={`sep-${idx}`} style={{ color: '#d1d5db', margin: '0 8px' }}>|</span>, current];
                              }, [])}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className={styles.itemsList}>
                        {sec.items.filter(item => item.title.trim()).map(item => (
                          <div key={item.id} className={styles.avoidBreak}>
                            <div className={styles.itemHeader}>
                              {item.link ? (
                                <a
                                  href={getContactLink('website', item.link)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.certLink}
                                  style={{ color: primaryColor, fontWeight: 600 }}
                                >
                                  {item.title}
                                  <Link2 size={13} className={styles.certLinkIcon} />
                                </a>
                              ) : (
                                <div className={styles.companyRow}>{item.title}</div>
                              )}
                              {item.date && <div className={styles.dateRow}>{item.date}</div>}
                            </div>
                            {item.subtitle && <div className={styles.roleRow} style={{ color: '#4b5563', fontSize: 'calc(var(--base-size) - 2px)' }}>{item.subtitle}</div>}
                            {item.description && <div className={styles.itemDesc} dangerouslySetInnerHTML={{ __html: item.description }} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </React.Fragment>
              );
            }
            return null;
          }
        }
      })}
    </>
  );

  // ─────────────────────────────────────────────────────────────
  // Sidebar left column
  // ─────────────────────────────────────────────────────────────
  const renderSidebarLeft = () => (
    <>
      {showProfilePhoto && resumeData.personalInfo.profilePhoto && (
        <img
          src={resumeData.personalInfo.profilePhoto}
          alt="Profile Avatar"
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px', border: '3px solid white' }}
        />
      )}
      <h1 className={styles.userName} style={{ color: 'white', fontSize: 'calc(var(--title-size) - 4px)' }}>
        {resumeData.personalInfo.fullName}
      </h1>
      <p className={styles.userTitle} style={{ color: '#e5e7eb', fontSize: 'calc(var(--base-size) - 1px)' }}>
        {resumeData.personalInfo.jobTitle}
      </p>
      {resumeData.personalInfo.contactItems?.filter(ci => ci.value.trim()).length > 0 && (
        <div className={styles.contactsRow} style={{ marginTop: '20px' }}>
          {resumeData.personalInfo.contactItems.filter(ci => ci.value.trim()).map(ci => (
            <div key={ci.id} className={styles.contactItem}>
              {CONTACT_TYPE_ICONS[ci.type]}{' '}
              {ci.type === 'address' ? (
                <span>{ci.value}</span>
              ) : (
                <a href={getContactLink(ci.type, ci.value, ci.url)} target="_blank" rel="noopener noreferrer">
                  {ci.type === 'other' && ci.label ? `${ci.label}: ` : ''}{ci.value}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
      {(resumeData.personalInfo.nationality || resumeData.personalInfo.visaStatus ||
        resumeData.personalInfo.maritalStatus || resumeData.personalInfo.availability) && (
        <div className={styles.contactsRow} style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
          {resumeData.personalInfo.nationality   && <div>Nationality: {resumeData.personalInfo.nationality}</div>}
          {resumeData.personalInfo.visaStatus    && <div>Visa: {resumeData.personalInfo.visaStatus}</div>}
          {resumeData.personalInfo.maritalStatus && <div>Status: {resumeData.personalInfo.maritalStatus}</div>}
          {resumeData.personalInfo.availability  && <div>Available: {resumeData.personalInfo.availability}</div>}
        </div>
      )}
      {!disabledSections.includes('languages') && resumeData.languages.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2 className={styles.sectionTitle} style={{ borderBottomColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            {getSectionTitle('languages', 'Languages')}
          </h2>
          {resumeData.languages.map(lang => (
            <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'calc(var(--base-size) - 2px)', color: '#e5e7eb', marginTop: '6px' }}>
              <span>{lang.name}</span>
              <span>{formatLanguageProficiency(lang.proficiency, resumeData.languageStandard)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ─────────────────────────────────────────────────────────────
  // Sidebar right column (same pattern as classic body)
  // ─────────────────────────────────────────────────────────────
  const renderSidebarRight = (withSpacers = false) => (
    <>
      {resumeData.sectionOrder.filter(id => id !== 'languages').map((sectionId) => {
        switch (sectionId) {

          case 'summary':
            if (disabledSections.includes('summary') || !resumeData.summary) return null;
            return (
              <React.Fragment key="summary">
                {spacerBefore('summary', withSpacers)}
                <section data-section="summary" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('summary', 'Summary')}</h2>
                  <div className={styles.summaryText} dangerouslySetInnerHTML={{ __html: resumeData.summary }} />
                </section>
              </React.Fragment>
            );

          case 'experience':
            if (disabledSections.includes('experience') || !resumeData.experience.length) return null;
            return (
              <React.Fragment key="experience">
                {spacerBefore('experience', withSpacers)}
                <section data-section="experience" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('experience', 'Experience')}</h2>
                  <div className={styles.itemsList}>
                    {resumeData.experience.map(exp => (
                      <div key={exp.id} className={styles.avoidBreak}>
                        <div className={styles.itemHeader}>
                          <div className={styles.companyRow}>{exp.company}</div>
                          <div className={styles.dateRow}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                        </div>
                        <div className={styles.roleRow}>{exp.position}</div>
                        {exp.description && <div className={styles.itemDesc} dangerouslySetInnerHTML={{ __html: exp.description }} />}
                      </div>
                    ))}
                  </div>
                </section>
              </React.Fragment>
            );

          case 'education':
            if (disabledSections.includes('education') || !resumeData.education.length) return null;
            return (
              <React.Fragment key="education">
                {spacerBefore('education', withSpacers)}
                <section data-section="education" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('education', 'Education')}</h2>
                  <div className={styles.itemsList}>
                    {resumeData.education.map(edu => (
                      <div key={edu.id} className={styles.avoidBreak}>
                        <div className={styles.itemHeader}>
                          <div className={styles.companyRow}>{edu.school}</div>
                          <div className={styles.dateRow}>{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</div>
                        </div>
                        <div className={styles.roleRow}>{edu.degree}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </React.Fragment>
            );

          case 'skills':
            if (disabledSections.includes('skills') || !resumeData.skills.length) return null;
            return (
              <React.Fragment key="skills">
                {spacerBefore('skills', withSpacers)}
                <section data-section="skills" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('skills', 'Skills')}</h2>
                  <div className={styles.skillsContainerGrid}>
                    {resumeData.skills.filter(s => s.name.trim()).map(skill => {
                      return (
                        <div key={skill.id} className={styles.skillCategoryBlock}>
                          <div className={styles.skillCategoryTitle}>{skill.name}</div>
                          {skill.level && <div className={styles.skillCategoryDesc}>{skill.level}</div>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </React.Fragment>
            );

          case 'certifications':
            if (disabledSections.includes('certifications') || !resumeData.certifications.length) return null;
            return (
              <React.Fragment key="certifications">
                {spacerBefore('certifications', withSpacers)}
                <section data-section="certifications" className={styles.sectionBlock}>
                  <h2 className={styles.sectionTitle}>{getSectionTitle('certifications', 'Certifications')}</h2>
                  <div className={styles.itemsList}>
                    {resumeData.certifications.filter(c => c.name.trim()).map(cert => (
                      <div key={cert.id} className={`${styles.itemHeader} ${styles.avoidBreak}`}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {cert.link ? (
                            <a
                              href={getContactLink('website', cert.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.certLink}
                              style={{ color: primaryColor }}
                            >
                              {cert.name}
                              <Link2 size={13} className={styles.certLinkIcon} />
                            </a>
                          ) : (
                            <span style={{ fontWeight: 600, fontSize: 'calc(var(--base-size) - 1px)' }}>{cert.name}</span>
                          )}
                          <span style={{ fontSize: 'calc(var(--base-size) - 2px)', color: '#4b5563' }}>{cert.issuer}</span>
                        </div>
                        <span className={styles.dateRow}>{cert.date}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </React.Fragment>
            );

          default: {
            if (sectionId.startsWith('custom-')) {
              if (disabledSections.includes(sectionId)) return null;
              const sec = (resumeData.customSections || []).find((s) => s.id === sectionId);
              if (!sec) return null;
              
              const hasContent = sec.type === 'text' ? sec.content.trim() : sec.items.some(item => item.title.trim());
              if (!hasContent) return null;

              return (
                <React.Fragment key={sec.id}>
                  {spacerBefore(sec.id, withSpacers)}
                  <section data-section={sec.id} className={styles.sectionBlock}>
                    <h2 className={styles.sectionTitle}>{customSectionTitles[sec.id] || sec.title}</h2>
                    {sec.type === 'text' ? (
                      <div className={styles.summaryText} dangerouslySetInnerHTML={{ __html: sec.content }} />
                    ) : sec.id === 'custom-tools' ? (
                      <div className={styles.toolsChipsPreviewContainer}>
                        {sec.items.filter(item => item.title.trim()).map(item => (
                          <div key={item.id} className={styles.toolPreviewChip}>
                            <span className={styles.toolPreviewChipIcon}>
                              {getToolIcon(item.title)}
                            </span>
                            <span className={styles.toolPreviewChipText}>{item.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : sec.id === 'custom-references' ? (
                      <div className={styles.itemsList}>
                        {sec.items.filter(item => item.title.trim()).map(item => {
                          const separator = resumeData.styling.referencesSeparator || '|';
                          const detailsNodes: React.ReactNode[] = [];

                          if (item.subtitle) {
                            detailsNodes.push(<span key="desig">{item.subtitle}</span>);
                          }
                          if (item.organization) {
                            detailsNodes.push(<span key="org">{item.organization}</span>);
                          }

                          if (item.email) {
                            detailsNodes.push(
                              <a key="email" href={`mailto:${item.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {item.email}
                              </a>
                            );
                          }

                          if (item.phone) {
                            detailsNodes.push(<span key="phone">{item.phone}</span>);
                          }

                          return (
                            <div key={item.id} className={styles.avoidBreak} style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '10px' }}>
                              <div style={{ fontWeight: 600, fontSize: 'calc(var(--base-size) - 1px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {item.link ? (
                                  <a
                                    href={getContactLink('website', item.link)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.certLink}
                                    style={{ color: primaryColor, fontWeight: 600 }}
                                  >
                                    {item.title}
                                    <Link2 size={12} className={styles.certLinkIcon} />
                                  </a>
                                ) : (
                                  <span>{item.title}</span>
                                )}
                              </div>
                              {detailsNodes.length > 0 && (
                                <div style={{ fontSize: 'calc(var(--base-size) - 2px)', color: '#4b5563', lineHeight: 1.4, wordBreak: 'break-all' }}>
                                  {detailsNodes.reduce<React.ReactNode[]>((acc, current, idx) => {
                                    if (idx === 0) return [current];
                                    return [...acc, ` ${separator} `, current];
                                  }, [])}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : sec.id === 'custom-interests' ? (
                      <div className={styles.itemsList}>
                        {(() => {
                          const stripHtml = (html: string) => {
                            if (!html) return '';
                            let text = html.replace(/<[^>]*>/g, '');
                            text = text
                              .replace(/&nbsp;/g, ' ')
                              .replace(/&amp;/g, '&')
                              .replace(/&lt;/g, '<')
                              .replace(/&gt;/g, '>')
                              .replace(/&quot;/g, '"')
                              .replace(/&#39;/g, "'");
                            return text.trim();
                          };
                          
                          const interestNodes: React.ReactNode[] = [];

                          sec.items.filter(item => item.title.trim()).forEach((item) => {
                            const cleanDesc = stripHtml(item.description || '');
                            
                            const titleNode = item.link ? (
                              <a
                                key={`link-${item.id}`}
                                href={getContactLink('website', item.link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.certLink}
                                style={{ color: primaryColor, fontWeight: 600 }}
                              >
                                {item.title}
                                <Link2 size={12} className={styles.certLinkIcon} />
                              </a>
                            ) : (
                              <strong key={`title-${item.id}`} style={{ fontWeight: 600 }}>{item.title}</strong>
                            );

                            interestNodes.push(
                              <span key={item.id} className={styles.avoidBreak}>
                                {titleNode}
                                {cleanDesc && ` — ${cleanDesc}`}
                              </span>
                            );
                          });

                          if (interestNodes.length === 0) return null;

                          return (
                            <div style={{ fontSize: 'calc(var(--base-size) - 1px)', lineHeight: 1.6, color: '#1f2937' }}>
                              {interestNodes.reduce<React.ReactNode[]>((acc, current, idx) => {
                                if (idx === 0) return [current];
                                return [...acc, <span key={`sep-${idx}`} style={{ color: '#d1d5db', margin: '0 8px' }}>|</span>, current];
                              }, [])}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className={styles.itemsList}>
                        {sec.items.filter(item => item.title.trim()).map(item => (
                          <div key={item.id} className={styles.avoidBreak}>
                            <div className={styles.itemHeader}>
                              {item.link ? (
                                <a
                                  href={getContactLink('website', item.link)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.certLink}
                                  style={{ color: primaryColor, fontWeight: 600 }}
                                >
                                  {item.title}
                                  <Link2 size={13} className={styles.certLinkIcon} />
                                </a>
                              ) : (
                                <div className={styles.companyRow}>{item.title}</div>
                              )}
                              {item.date && <div className={styles.dateRow}>{item.date}</div>}
                            </div>
                            {item.subtitle && <div className={styles.roleRow} style={{ color: '#4b5563', fontSize: 'calc(var(--base-size) - 2px)' }}>{item.subtitle}</div>}
                            {item.description && <div className={styles.itemDesc} dangerouslySetInnerHTML={{ __html: item.description }} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </React.Fragment>
              );
            }
            return null;
          }
        }
      })}
    </>
  );

  // ─────────────────────────────────────────────────────────────
  // Hidden detector: renders raw content (no spacers) so we can
  // measure each section's natural offsetTop.
  // ─────────────────────────────────────────────────────────────
  const renderHiddenDetector = () => (
    <div
      ref={contentDetectorRef}
      className={`${getSpacingClass()} ${getFontSizeClass()}`}
      style={{
        position: 'absolute',
        top: 0,
        left: '-9999px',
        width: `${PAGE_W_PX - marginPx * 2}px`,
        padding: 0,
        boxSizing: 'border-box',
        visibility: 'hidden',
        pointerEvents: 'none',
        fontFamily: getFontFamily(),
        ...({ '--theme-primary': primaryColor } as React.CSSProperties),
      }}
    >
      {template === 'sidebar' ? renderSidebarRight(false) : renderClassicBody(false)}
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Classic page — content window with margin inset + spacer-aware content
  // ─────────────────────────────────────────────────────────────
  const renderClassicPage = (pageIndex: number) => {
    const topOffset = pageIndex * contentAreaH;
    return (
      <div
        key={pageIndex}
        className={`${styles.a4Page} ${getSpacingClass()} ${getFontSizeClass()}`}
        style={{ fontFamily: getFontFamily(), '--theme-primary': primaryColor } as React.CSSProperties}
      >
        <div className={styles.pageContentWindow} style={{ inset: `${marginPx}px` }}>
          <div style={{ transform: `translateY(-${topOffset}px)` }}>
            {renderClassicBody(true)}
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // Sidebar page
  // ─────────────────────────────────────────────────────────────
  const renderSidebarPage = (pageIndex: number) => {
    const topOffset = pageIndex * contentAreaH;
    return (
      <div
        key={pageIndex}
        className={`${styles.a4Page} ${styles.sidebarTemplateGrid} ${getSpacingClass()} ${getFontSizeClass()}`}
        style={{ fontFamily: getFontFamily(), '--theme-primary': primaryColor } as React.CSSProperties}
      >
        <div className={styles.templateSidebar} style={{ backgroundColor: primaryColor, overflow: 'hidden' }}>
          <div style={{ padding: `${marginPx}px`, transform: `translateY(-${topOffset}px)` }}>
            {renderSidebarLeft()}
          </div>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, padding: `${marginPx}px`, boxSizing: 'border-box' }}>
            <div style={{ transform: `translateY(-${topOffset}px)` }}>
              {renderSidebarRight(true)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isThumbnail) {
    const scale = 215 / PAGE_W_PX;
    return (
      <div
        style={{
          width: '215px',
          height: '304px',
          overflow: 'hidden',
          position: 'relative',
          background: 'white',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {template === 'sidebar' ? renderSidebarPage(0) : renderClassicPage(0)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.previewPanel}>
      <div className={`${styles.toolbar} no-print`}>
        <span className={styles.toolbarTitle}>Resume Preview (Simulated A4 Sheet)</span>
        <div className={styles.controlsGroup}>
          <button className={styles.toolbarBtn} onClick={() => setZoom(Math.max(50, zoom - 10))} title="Zoom Out">➖</button>
          <span className={styles.zoomValue}>{zoom}%</span>
          <button className={styles.toolbarBtn} onClick={() => setZoom(Math.min(120, zoom + 10))} title="Zoom In">➕</button>
          <button className={`${styles.toolbarBtn} ${styles.downloadBtn}`} onClick={handlePrint}>
            <span>⬇ Download PDF</span>
          </button>
        </div>
      </div>

      {renderHiddenDetector()}

      <div className={styles.pageContainer}>
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Array.from({ length: pages }, (_, i) =>
            template === 'sidebar' ? renderSidebarPage(i) : renderClassicPage(i)
          )}
        </div>
      </div>
    </div>
  );
};
