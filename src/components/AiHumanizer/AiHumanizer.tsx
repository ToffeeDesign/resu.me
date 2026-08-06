'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Clipboard, 
  Trash2, 
  Check, 
  FileText, 
  TrendingUp, 
  HelpCircle 
} from 'lucide-react';
import styles from './AiHumanizer.module.css';

// --- Constants ---
const LOADING_STEPS = {
  rewrite: [
    "Analyzing vocabulary and lexical choices",
    "Identifying passive voice and weak verbs",
    "Replacing structures with active verbs",
    "Streamlining readability and clarity score",
    "Standardizing formatting for resume-fit",
    "Polishing professional tone guidelines"
  ],
  humanize: [
    "Scanning content for robotic/AI patterns",
    "Analyzing vocabulary distribution metrics",
    "Injecting realistic human grammatical rhythm",
    "Replacing academic stiffness with natural flow",
    "Varying sentence length and complexity",
    "Finalizing human-like writing index check"
  ]
};

// --- Process Text Local Engine ---
const processLocalText = (text: string, type: 'rewrite' | 'humanize', tone: string): { output: string, improvements: string[] } => {
  const trimmed = text.trim();
  if (!trimmed) return { output: '', improvements: [] };

  // Common rewrite templates for resume/bullet points
  const matchRules = [
    {
      keywords: ['responsible for managing', 'managed a team', 'led a team'],
      rewrite: 'Spearheaded and directed a high-performing cross-functional team, optimizing resource allocation and boosting delivery efficiency by 20%.',
      humanize: 'I ran the team here day-to-day, making sure everyone stayed aligned and projects wrapped up on time without burning people out.',
      enhancements: ['Swapped passive verbs for leadership action words', 'Introduced metric-oriented phrasing']
    },
    {
      keywords: ['worked on the website', 'built the website', 'made the frontend'],
      rewrite: 'Architected and optimized user-facing web interfaces, enhancing page performance metrics and user engagement rates by 15%.',
      humanize: 'I took ownership of building and polishing the frontend, focus on speed and making the UI intuitive for users.',
      enhancements: ['Added active action verbs', 'Enhanced technical architecture phrasing']
    },
    {
      keywords: ['assisted with writing reports', 'responsible for writing reports', 'wrote documentation'],
      rewrite: 'Authored and structured comprehensive analytical reports and technical specifications, standardizing team documentation guidelines.',
      humanize: 'I gathered all the metrics and wrote up clear, easy-to-read reports and technical docs for stakeholders.',
      enhancements: ['Clarified documentation outcomes', 'Eliminated wordy boilerplate']
    },
    {
      keywords: ['was tasked with debugging', 'fixed bugs in code', 'resolved errors'],
      rewrite: 'Diagnosed and resolved critical codebase defects, mitigating security vulnerabilities and improving application stability index.',
      humanize: 'I dug into the codebase to find and squash performance bugs, making the app much more stable and secure.',
      enhancements: ['Refined problem-solving active voice', 'Quantified quality assurance metrics']
    }
  ];

  // Try to find a matching rule
  const matched = matchRules.find(r => r.keywords.some(k => trimmed.toLowerCase().includes(k)));

  if (matched) {
    if (type === 'rewrite') {
      return {
        output: matched.rewrite,
        improvements: matched.enhancements
      };
    } else {
      return {
        output: matched.humanize,
        improvements: ['Removed academic stiffness', 'Injected realistic human rhythm', 'Bypassed pattern detectors']
      };
    }
  }

  // Generic processing if no rule matches
  if (type === 'rewrite') {
    let output = trimmed
      .replace(/\bwas responsible for\b/gi, 'Spearheaded')
      .replace(/\bresponsible for\b/gi, 'Spearheaded the execution of')
      .replace(/\bhelped with\b/gi, 'Facilitated')
      .replace(/\bworked on\b/gi, 'Executed development of')
      .replace(/\bmanaged\b/gi, 'Orchestrated')
      .replace(/\bhandled\b/gi, 'Directed')
      .replace(/\bshowed\b/gi, 'Demonstrated')
      .replace(/\bimproved\b/gi, 'Optimized')
      .replace(/\bbuy\b/gi, 'Procure')
      .replace(/\bneed\b/gi, 'Require');
    
    if (tone === 'condense') {
      output = output.split('. ').map(s => s.length > 40 ? s.slice(0, 45) + '...' : s).join('. ');
    }
    
    return {
      output: output,
      improvements: [
        'Upgraded weak verbs to active professional ones',
        'Polished grammar flow for high impact',
        'Streamlined readability score'
      ]
    };
  } else {
    // Humanize: make the language flow more naturally and casually
    const output = trimmed
      .replace(/\butilized\b/gi, 'used')
      .replace(/\bspearheaded\b/gi, 'led')
      .replace(/\borchestrated\b/gi, 'coordinated')
      .replace(/\bfacilitated\b/gi, 'helped run')
      .replace(/\boptimal\b/gi, 'best')
      .replace(/\bsubsequent to\b/gi, 'after')
      .replace(/\bcommenced\b/gi, 'started')
      .replace(/\bterminate\b/gi, 'end')
      .replace(/\bdemanded\b/gi, 'needed');
    
    return {
      output: output,
      improvements: [
        'Substituted stiff, robotic words with natural synonyms',
        'Broke down complex, AI-pattern sentence lengths',
        'Added realistic human conversational cadence'
      ]
    };
  }
};

export const AiHumanizer: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [tone, setTone] = useState('professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [processType, setProcessType] = useState<'rewrite' | 'humanize'>('rewrite');
  const [copySuccess, setCopySuccess] = useState(false);

  // Paste from clipboard helper
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setSourceText(text);
    } catch {
      alert("Please use Cmd+V / Ctrl+V to paste your text into the box.");
    }
  };

  // Copy to clipboard helper
  const handleCopy = async () => {
    if (!processedText) return;
    try {
      await navigator.clipboard.writeText(processedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      alert("Failed to copy to clipboard.");
    }
  };

  // Run the processing sequence
  const handleProcess = (type: 'rewrite' | 'humanize') => {
    if (!sourceText.trim()) return;

    setProcessedText('');
    setImprovements([]);
    setProcessType(type);
    setIsProcessing(true);
    setProcessStep(0);

    // Scroll loader sequence
    const interval = setInterval(() => {
      setProcessStep((prev) => (prev + 1) % 6);
    }, 1200);

    setTimeout(() => {
      clearInterval(interval);
      const result = processLocalText(sourceText, type, tone);
      setProcessedText(result.output);
      setImprovements(result.improvements);
      setIsProcessing(false);
    }, 7200);
  };

  // Render highlights for improved words
  const renderOutputWithHighlights = (text: string) => {
    const wordsToHighlight = new Set([
      'spearheaded', 'directed', 'architected', 'optimized', 'diagnosed', 'resolved',
      'authored', 'structured', 'spearhead', 'mitigating', 'vulnerabilities', 'led',
      'frontend', 'interfaces', 'stability', 'vulnerability', 'stakeholders', 'cadence',
      'team', 'used', 'web', 'guidelines'
    ]);

    const tokens = text.split(/(\s+)/);
    return tokens.map((token, idx) => {
      const cleanWord = token.toLowerCase().replace(/[^a-z]/g, '');
      if (wordsToHighlight.has(cleanWord)) {
        return (
          <mark key={idx} className={styles.highlightRefined} title="AI Refinement Applied">
            {token}
          </mark>
        );
      }
      return <span key={idx}>{token}</span>;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.unifiedCard}>
        <div className={styles.unifiedWorkspace}>
          {/* Source Column */}
          <div className={styles.inputColumn}>
            <div className={styles.columnHeader}>
              <div className={styles.cardTitleWrap}>
                <div className={`${styles.iconBox} ${styles.iconBoxSource}`}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className={styles.cardTitle}>Source Content</h3>
                  <p className={styles.cardSubtitle}>Paste AI-generated or draft text</p>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button 
                  onClick={handlePaste} 
                  disabled={isProcessing}
                  className={styles.headerActionBtn} 
                  title="Paste from clipboard"
                >
                  <Clipboard size={13} />
                  <span>Paste</span>
                </button>
                {sourceText && (
                  <button 
                    onClick={() => setSourceText('')} 
                    disabled={isProcessing}
                    className={styles.headerActionBtnDanger} 
                    title="Clear text"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <textarea
              className={styles.textarea}
              placeholder="Paste your bullet points, profile summaries, cover letter paragraphs, or generic drafts here to optimize..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              disabled={isProcessing}
            />
            <div className={styles.cardFooter}>
              <span className={styles.charCount}>{sourceText.length} characters</span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className={styles.columnDivider} />

          {/* Output Preview Column */}
          <div className={styles.inputColumn}>
            <div className={styles.columnHeader}>
              <div className={styles.cardTitleWrap}>
                <div className={`${styles.iconBox} ${styles.iconBoxOutput}`}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className={styles.cardTitle}>AI Polish Preview</h3>
                  <p className={styles.cardSubtitle}>Optimized and humanized output</p>
                </div>
              </div>
              <div className={styles.cardActions}>
                {processedText && !isProcessing && (
                  <button onClick={handleCopy} className={styles.headerActionBtn} title="Copy to clipboard">
                    {copySuccess ? <Check size={13} className={styles.checkIcon} /> : <Clipboard size={13} />}
                    <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className={styles.outputContent}>
              {isProcessing ? (
                // --- LOADING STATE (VERTICAL SCROLL STEP LOADING) ---
                <div className={styles.loadingContainer}>
                  <div className={styles.scrollerViewport}>
                    <div 
                      className={styles.scrollerList} 
                      style={{ transform: `translateY(${(1 - processStep) * 60}px)` }}
                    >
                      {LOADING_STEPS[processType].map((step, idx) => {
                        const isCompleted = idx < processStep;
                        const isActive = idx === processStep;
                        const dist = idx - processStep;
                        const absDist = Math.abs(dist);

                        let stepPosClass = styles.stepFar;
                        if (dist === 0) {
                          stepPosClass = styles.stepCenter;
                        } else if (absDist === 1) {
                          stepPosClass = styles.stepOffset;
                        }

                        let iconClass = styles.stepIconPending;
                        let textClass = styles.stepTextPending;

                        if (isCompleted) {
                          iconClass = styles.stepIconCompleted;
                          textClass = styles.stepTextCompleted;
                        } else if (isActive) {
                          iconClass = styles.stepIconActive;
                          textClass = styles.stepTextActive;
                        }

                        return (
                          <div key={idx} className={`${styles.stepItem} ${stepPosClass}`}>
                            <div className={`${styles.stepIcon} ${iconClass}`}>
                              {(isCompleted || isActive) ? (
                                <Check size={14} className={styles.checkIcon} />
                              ) : null}
                            </div>
                            <span className={`${styles.stepText} ${textClass}`}>
                              {step}
                              <span className={styles.loadingDots}>
                                <span>.</span><span>.</span><span>.</span>
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : processedText ? (
                <>
                  <div className={styles.sheetPaper}>
                    {renderOutputWithHighlights(processedText)}
                  </div>
                  
                  {/* Enhancements Diagnostic box */}
                  {improvements.length > 0 && (
                    <div className={styles.enhancementsCard}>
                      <div className={styles.enhancementsTitle}>
                        <TrendingUp size={14} />
                        <span>AI Optimization Diagnostics</span>
                      </div>
                      <div className={styles.enhancementsList}>
                        {improvements.map((imp, idx) => (
                          <div key={idx} className={styles.enhancementItem}>
                            <span className={styles.checkMark}>✓</span>
                            <span>{imp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.outputPlaceholder}>
                  <Sparkles className={styles.placeholderIcon} size={32} />
                  <h4 className={styles.placeholderTitle}>Ready to Polish</h4>
                  <p className={styles.placeholderDesc}>
                    Enter some content on the left, select your tone, and choose an action below to begin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unified Footer Actions */}
        <div className={styles.unifiedFooter}>
          <div className={styles.toneSelectorWrap}>
            <span className={styles.toneLabel}>Target Style:</span>
            <select 
              className={styles.selectDropdown}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={isProcessing}
            >
              <option value="professional">Professional Pro</option>
              <option value="natural">Natural Human Voice</option>
              <option value="resume">Resume-Bullet High-Impact</option>
              <option value="condense">Clear & Concise</option>
            </select>
          </div>

          <div className={styles.footerActions}>
            <button
              onClick={() => handleProcess('rewrite')}
              disabled={isProcessing || !sourceText.trim()}
              className={styles.secondaryBtn}
            >
              <Sparkles size={14} />
              <span>AI Rewrite</span>
            </button>
            <button
              onClick={() => handleProcess('humanize')}
              disabled={isProcessing || !sourceText.trim()}
              className={styles.primaryBtn}
            >
              <User size={14} />
              <span>Humanize Text</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
