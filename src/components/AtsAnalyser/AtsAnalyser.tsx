'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  Clipboard, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import styles from './AtsAnalyser.module.css';

// ─── Constants ─────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the',
  'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
  'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'd', 'll',
  'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn',
  'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'should', 'would', 'could', 'must', 'shouldnt',
  'wouldnt', 'couldnt', 'isnt', 'arent', 'wasnt', 'werent', 'hasnt', 'havent', 'hadnt'
]);

const GENERIC_WORDS = new Set([
  'experience', 'role', 'team', 'work', 'job', 'company', 'year', 'years', 'skills', 'responsibilities', 'responsibility',
  'candidate', 'position', 'description', 'resume', 'duties', 'requirement', 'requirements', 'successful', 'hiring',
  'manager', 'qualification', 'qualifications', 'support', 'help', 'join', 'opportunity', 'strong', 'excellent',
  'ability', 'proficient', 'professional', 'detail', 'details', 'ideal', 'looking', 'needed', 'needs', 'preferred',
  'plus', 'good', 'great', 'knowledge', 'understanding', 'working', 'using', 'used', 'use', 'high', 'highly', 'track',
  'record', 'proven', 'demonstrated', 'key', 'related', 'field', 'equivalent', 'relevant', 'degree', 'baccalaureate',
  'bachelor', 'bachelors', 'master', 'masters', 'phd', 'diploma', 'etc', 'etcetera', 'deliver', 'build', 'create',
  'manage', 'lead', 'design', 'develop', 'collaborate', 'improve', 'optimize', 'ensure'
]);

const SKILL_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'golang', 'rust',
  'html', 'css', 'sass', 'less', 'sql', 'nosql', 'graphql', 'api', 'apis', 'rest', 'soap', 'json', 'xml',
  'react', 'reactjs', 'nextjs', 'next.js', 'vue', 'vuejs', 'angular', 'svelte', 'jquery', 'bootstrap', 'tailwind', 'tailwindcss',
  'node.js', 'nodejs', 'express', 'expressjs', 'nestjs', 'django', 'flask', 'spring', 'laravel',
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'firebase', 'supabase', 'docker', 'kubernetes', 'k8s',
  'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'elasticsearch', 'dynamodb', 'oracle',
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'trello', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
  'webflow', 'wordpress', 'shopify', 'salesforce', 'hubspot', 'excel', 'powerpoint', 'word',
  'devops', 'ci/cd', 'jenkins', 'travis', 'circleci', 'terraform', 'ansible', 'unix', 'linux', 'bash', 'shell',
  'ui/ux', 'ui', 'ux', 'product design', 'visual design', 'graphic design', 'wireframing', 'prototyping', 'interaction design',
  'agile', 'scrum', 'kanban', 'project management', 'product management', 'marketing', 'seo', 'sem', 'copywriting', 'sales',
  'communication', 'leadership', 'teamwork', 'problem solving', 'collaboration', 'analytical', 'customer service',
  'finance', 'accounting', 'budgeting', 'human resources', 'recruitment', 'training', 'quality assurance', 'qa'
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function normalizeKeyword(word: string): string {
  let w = word.toLowerCase().trim();
  w = w.replace(/\.js$/, '').replace(/js$/, '');
  w = w.replace(/(?:ing|ed|ment|er|or|al|able|ive|ity|s|es)$/, '');
  return w;
}

export const AtsAnalyser: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [hasReport, setHasReport] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Analysis results
  const [matchScore, setMatchScore] = useState(0);
  const [matchingKeywords, setMatchingKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [activeMissingHighlight, setActiveMissingHighlight] = useState<string | null>(null);

  // Reset states
  const handleReset = () => {
    setHasReport(false);
    setActiveMissingHighlight(null);
    setAnalysisStep(0);
  };

  // Clipboard Helpers
  const handlePasteJD = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setJobDescription(text);
    } catch {
      alert("Please use Cmd+V / Ctrl+V to paste your text into the box.");
    }
  };

  const handlePasteResume = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setResumeText(text);
    } catch {
      alert("Please use Cmd+V / Ctrl+V to paste your text into the box.");
    }
  };

  // Perform Analysis with sequenced steps
  const handleAnalyze = () => {
    if (!jobDescription.trim() || !resumeText.trim()) return;

    setIsAnalysing(true);
    setAnalysisStep(0);

    const intervalId = setInterval(() => {
      setAnalysisStep((prev) => (prev + 1) % 6);
    }, 1667);

    setTimeout(() => {
      clearInterval(intervalId);
      
      // 1. Extract JD Keywords
      const jdWords = jobDescription.toLowerCase().split(/[\s,.:;()/\-\[\]{}'"]+/);
      const jdKeywordsMap = new Map<string, number>();

      jdWords.forEach(w => {
        if (w.length < 3) return;
        if (STOP_WORDS.has(w) || GENERIC_WORDS.has(w)) return;
        jdKeywordsMap.set(w, (jdKeywordsMap.get(w) || 0) + 1);
      });

      const jdLower = jobDescription.toLowerCase();
      SKILL_KEYWORDS.forEach(skill => {
        if (jdLower.includes(skill)) {
          jdKeywordsMap.set(skill, (jdKeywordsMap.get(skill) || 0) + 3);
        }
      });

      const jdKeywords = Array.from(jdKeywordsMap.entries())
        .filter(([word, score]) => score >= 2 || SKILL_KEYWORDS.includes(word))
        .map(([word]) => word);

      const uniqueJdKeywords = Array.from(new Set(jdKeywords));

      // 2. Extract Resume Keywords
      const resumeLower = resumeText.toLowerCase();
      const resumeWords = resumeLower.split(/[\s,.:;()/\-\[\]{}'"]+/);
      const resumeKeywordsMap = new Map<string, number>();

      resumeWords.forEach(w => {
        if (w.length < 3) return;
        if (STOP_WORDS.has(w) || GENERIC_WORDS.has(w)) return;
        resumeKeywordsMap.set(w, (resumeKeywordsMap.get(w) || 0) + 1);
      });

      SKILL_KEYWORDS.forEach(skill => {
        if (resumeLower.includes(skill)) {
          resumeKeywordsMap.set(skill, (resumeKeywordsMap.get(skill) || 0) + 3);
        }
      });

      const resumeKeywords = Array.from(resumeKeywordsMap.keys());

      // 3. Compare & compute lists
      const matchedList: string[] = [];
      const missingList: string[] = [];

      uniqueJdKeywords.forEach(jdKey => {
        const jdStem = normalizeKeyword(jdKey);
        
        const hasMatch = resumeKeywords.some(rKey => {
          return normalizeKeyword(rKey) === jdStem || rKey.includes(jdKey) || jdKey.includes(rKey);
        }) || resumeWords.includes(jdKey) || resumeWords.includes(jdStem);

        if (hasMatch) {
          matchedList.push(jdKey);
        } else {
          missingList.push(jdKey);
        }
      });

      const totalJd = uniqueJdKeywords.length;
      const score = totalJd > 0 ? Math.round((matchedList.length / totalJd) * 100) : 0;

      setMatchScore(score);
      setMatchingKeywords(matchedList);
      setMissingKeywords(missingList);
      setHasReport(true);
      setIsAnalysing(false);
    }, 10000);
  };

  const handleMissingKeywordClick = (keyword: string) => {
    setActiveMissingHighlight(keyword);
    setTimeout(() => {
      const el = document.getElementById(`missing-${normalizeKeyword(keyword)}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add(styles.flashActive);
        setTimeout(() => el.classList.remove(styles.flashActive), 1500);
      }
    }, 100);
  };

  const renderHighlightedText = (
    text: string,
    matchKeys: string[],
    missKeys: string[],
    isJobDesc: boolean
  ) => {
    const tokens = text.split(/([\s,.:;()/\-\[\]{}'"]+)/);
    const matchStems = new Set(matchKeys.map(normalizeKeyword));
    const missStems = new Set(missKeys.map(normalizeKeyword));

    return tokens.map((token, index) => {
      if (!token || /[\s,.:;()/\-\[\]{}'"]+/.test(token)) {
        return <span key={index}>{token}</span>;
      }

      const stem = normalizeKeyword(token);

      if (matchStems.has(stem)) {
        return (
          <mark key={index} className={styles.highlightMatch}>
            {token}
          </mark>
        );
      }

      if (isJobDesc && missStems.has(stem)) {
        const isSelected = activeMissingHighlight && normalizeKeyword(activeMissingHighlight) === stem;
        return (
          <mark
            key={index}
            id={isSelected ? `missing-${stem}` : undefined}
            className={`${styles.highlightMissing} ${isSelected ? styles.highlightActive : ''}`}
          >
            {token}
          </mark>
        );
      }

      return <span key={index}>{token}</span>;
    });
  };

  return (
    <div className={styles.container}>
      {!hasReport ? (
        isAnalysing ? (
          // ─── LOADING STATE (VERTICAL SCROLLING STEPS) ──────────────────────
          <div className={styles.unifiedCard}>
            <div className={styles.loadingContainer}>
              <div className={styles.scrollerViewport}>
                <div 
                  className={styles.scrollerList} 
                  style={{ transform: `translateY(${(1 - analysisStep) * 60}px)` }}
                >
                  {[
                    "Initializing AI neural network",
                    "Understanding the given job description",
                    "Identifying important ATS skills",
                    "Looking for keyword variations",
                    "Parsing resume content",
                    "Identifying relevant soft skills"
                  ].map((step, idx) => {
                    const isCompleted = idx < analysisStep;
                    const isActive = idx === analysisStep;
                    const dist = idx - analysisStep;
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
          </div>
        ) : (
          // ─── INPUT STATE (UNIFIED CONTAINER) ────────────────────────────────
          <div className={styles.unifiedCard}>
            <div className={styles.unifiedWorkspace}>
              {/* Job Description Column */}
              <div className={styles.inputColumn}>
                <div className={styles.columnHeader}>
                  <div className={styles.cardTitleWrap}>
                    <div className={`${styles.iconBox} ${styles.iconBoxJD}`}>
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <h3 className={styles.cardTitle}>Job Description</h3>
                      <p className={styles.cardSubtitle}>Paste requirements or role details</p>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={handlePasteJD} className={styles.headerActionBtn} title="Paste from clipboard">
                      <Clipboard size={13} />
                      <span>Paste</span>
                    </button>
                    {jobDescription && (
                      <button onClick={() => setJobDescription('')} className={styles.headerActionBtnDanger} title="Clear text">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="jdInput"
                  className={styles.textarea}
                  placeholder="Paste requirements, responsibilities, technical prerequisites here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <div className={styles.cardFooter}>
                  <span className={styles.charCount}>{jobDescription.length} characters</span>
                </div>
              </div>

              {/* Vertical Divider Line */}
              <div className={styles.columnDivider} />

              {/* Resume Text Column */}
              <div className={styles.inputColumn}>
                <div className={styles.columnHeader}>
                  <div className={styles.cardTitleWrap}>
                    <div className={`${styles.iconBox} ${styles.iconBoxResume}`}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <h3 className={styles.cardTitle}>Resume Text</h3>
                      <p className={styles.cardSubtitle}>Paste your resume plain text</p>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={handlePasteResume} className={styles.headerActionBtn} title="Paste from clipboard">
                      <Clipboard size={13} />
                      <span>Paste</span>
                    </button>
                    {resumeText && (
                      <button onClick={() => setResumeText('')} className={styles.headerActionBtnDanger} title="Clear text">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="resumeInput"
                  className={styles.textarea}
                  placeholder="Paste your plain text resume content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <div className={styles.cardFooter}>
                  <span className={styles.charCount}>{resumeText.length} characters</span>
                </div>
              </div>
            </div>

            {/* Unified Action Footer */}
            <div className={styles.unifiedFooter}>
              <button
                onClick={handleAnalyze}
                disabled={isAnalysing || !jobDescription.trim() || !resumeText.trim()}
                className={styles.primaryBtn}
              >
                {isAnalysing ? (
                  <>
                    <span className={styles.spinner} />
                    <span>Analysing Compatibility…</span>
                  </>
                ) : (
                  <span>Run Match Analysis</span>
                )}
              </button>
            </div>
          </div>
        )
      ) : (
        // ─── REPORT STATE (REDESIGNED) ─────────────────────────────────────
        <div className={styles.reportWrapper}>
          <div className={styles.reportHeaderCard}>
            <div className={styles.reportInfoWrap}>
              <div className={styles.sparkIconBox}>
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className={styles.reportTitle}>ATS Compatibility Report</h2>
                <p className={styles.reportSubtitle}>Review match diagnostics and keyword gaps below.</p>
              </div>
            </div>
            <button onClick={handleReset} className={styles.secondaryBtn}>
              <RefreshCw size={13} style={{ marginRight: 6 }} />
              Analyze Another
            </button>
          </div>

          {/* Summary Dashboard Grid */}
          <div className={styles.dashboardGrid}>
            <div className={styles.scoreCard}>
              <h4 className={styles.cardHeader}>Match Score</h4>
              <div className={styles.scoreContainer}>
                <div className={styles.progressCircleWrap}>
                  <svg className={styles.progressCircle} viewBox="0 0 36 36">
                    <path
                      className={styles.circleBg}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={styles.circleStroke}
                      strokeDasharray={`${matchScore}, 100`}
                      style={{
                        stroke: matchScore >= 70 ? 'hsl(145, 65%, 42%)' : matchScore >= 40 ? 'hsl(35, 90%, 50%)' : 'hsl(0, 75%, 55%)'
                      }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className={styles.scoreText}>{matchScore}%</div>
                </div>
                <div className={styles.scoreStatus}>
                  {matchScore >= 70 ? (
                    <span className={styles.statusExcellent}>Strong Compatibility</span>
                  ) : matchScore >= 40 ? (
                    <span className={styles.statusMedium}>Moderate Compatibility</span>
                  ) : (
                    <span className={styles.statusPoor}>Low Compatibility</span>
                  )}
                  <p className={styles.scoreNote}>
                    {matchScore >= 70 
                      ? 'Your resume is highly optimized for this target role!' 
                      : 'Integrate the missing keywords list to raise match compatibility.'}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.keywordCard}>
              <div className={styles.keywordCardHeader}>
                <div className={styles.successDot} />
                <h4 className={styles.cardHeader}>Matching Keywords ({matchingKeywords.length})</h4>
              </div>
              <p className={styles.cardDesc}>These keywords are already present in your resume.</p>
              <div className={styles.chipGrid}>
                {matchingKeywords.length > 0 ? (
                  matchingKeywords.map((kw, i) => (
                    <span key={i} className={styles.chipMatch}>
                      <Check size={11} style={{ marginRight: 3 }} /> {kw}
                    </span>
                  ))
                ) : (
                  <span className={styles.emptyNote}>No matching keywords detected.</span>
                )}
              </div>
            </div>

            <div className={styles.keywordCard}>
              <div className={styles.keywordCardHeader}>
                <div className={styles.warningDot} />
                <h4 className={styles.cardHeader}>Missing Keywords ({missingKeywords.length})</h4>
              </div>
              <p className={styles.cardDesc}>
                Click any tag to scroll directly to its context in the Job Description.
              </p>
              <div className={styles.chipGrid}>
                {missingKeywords.length > 0 ? (
                  missingKeywords.map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => handleMissingKeywordClick(kw)}
                      className={`${styles.chipMissingBtn} ${activeMissingHighlight === kw ? styles.chipMissingActive : ''}`}
                    >
                      <AlertCircle size={10} style={{ marginRight: 3 }} /> {kw}
                    </button>
                  ))
                ) : (
                  <span className={styles.emptyNote}>All major keywords found! Great job.</span>
                )}
              </div>
            </div>
          </div>

          {/* Highlight Viewer Section (Simulated A4 Paper Sheets) */}
          <div className={styles.highlightViewerGrid}>
            <div className={styles.viewerCol}>
              <h3 className={styles.viewerTitle}>Job Description Context</h3>
              <div className={styles.sheetPaper}>
                <div className={styles.viewerTextScroll}>
                  {renderHighlightedText(jobDescription, matchingKeywords, missingKeywords, true)}
                </div>
              </div>
            </div>

            <div className={styles.viewerCol}>
              <h3 className={styles.viewerTitle}>Your Resume Highlights</h3>
              <div className={styles.sheetPaper}>
                <div className={styles.viewerTextScroll}>
                  {renderHighlightedText(resumeText, matchingKeywords, [], false)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
