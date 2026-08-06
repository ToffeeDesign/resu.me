'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  BarChart3,
  Wand2,
  Mail,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  Shield,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const { setLoginModalOpen, triggerLogin } = useResume();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    triggerLogin(() => {});
  };

  const features = [
    {
      icon: <FileText size={24} />,
      title: 'AI Resume Builder',
      desc: 'Build stunning, ATS-optimized resumes in minutes with guided section-by-section editing.',
    },
    {
      icon: <Mail size={24} />,
      title: 'AI Cover Letters',
      desc: 'Generate tailored cover letters that match your resume to any job description instantly.',
      badge: 'Beta',
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'ATS Match Score',
      desc: 'Compare your resume against job descriptions and get keyword optimization suggestions.',
      badge: 'Pro',
    },
    {
      icon: <Wand2 size={24} />,
      title: 'AI Rewrite & Humanizer',
      desc: 'Transform robotic bullet points into natural, professional language that impresses.',
    },
  ];

  const benefits = [
    'Free forever — your first resume costs nothing',
    'GCC & India job market optimized templates',
    'Real-time live preview as you type',
    'Export to PDF with one click',
    'Dark mode for comfortable editing',
    'Mobile-friendly responsive editor',
  ];

  return (
    <div className={styles.page}>
      {/* ── Navigation Bar ──────────────────────────────────────────── */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <div className={styles.logoIcon}>R</div>
            <span className={styles.logoText}>
              Resume<span className={styles.logoAccent}>AI</span>
            </span>
          </div>

          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#benefits" className={styles.navLink}>Why Us</a>
          </div>

          <div className={styles.navActions}>
            <button
              className={styles.loginBtn}
              onClick={() => setLoginModalOpen(true)}
            >
              Log in
            </button>
            <button
              className={styles.signupBtn}
              onClick={handleGetStarted}
            >
              Get Started Free
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>AI-Powered Resume Builder</span>
          </div>
          <h1 className={styles.heroTitle}>
            Build resumes that
            <br />
            <span className={styles.heroGradient}>land interviews</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Create ATS-optimized, professional resumes in minutes. 
            Purpose-built for job seekers in the UAE, Saudi Arabia, India, and beyond.
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.heroPrimary} onClick={handleGetStarted}>
              <Zap size={18} />
              Start Building — It&apos;s Free
            </button>
            <button className={styles.heroSecondary} onClick={() => setLoginModalOpen(true)}>
              I already have an account
            </button>
          </div>
          <div className={styles.heroTrust}>
            <div className={styles.heroStars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
            <span>Trusted by thousands of job seekers in GCC & India</span>
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────────────── */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Powerful Tools</span>
            <h2 className={styles.sectionTitle}>Everything you need to land the job</h2>
            <p className={styles.sectionDesc}>
              From resume building to ATS analysis — one platform for your entire job search.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureBody}>
                  <div className={styles.featureTitleRow}>
                    <h3 className={styles.featureTitle}>{f.title}</h3>
                    {f.badge && (
                      <span className={`${styles.featureBadge} ${f.badge === 'Pro' ? styles.featureBadgePro : ''}`}>
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits Section ────────────────────────────────────────── */}
      <section id="benefits" className={styles.benefits}>
        <div className={styles.sectionInner}>
          <div className={styles.benefitsLayout}>
            <div className={styles.benefitsText}>
              <span className={styles.sectionTag}>Why ResumeAI</span>
              <h2 className={styles.sectionTitle}>Designed for the modern job seeker</h2>
              <p className={styles.sectionDesc}>
                We built ResumeAI specifically for the GCC and Indian job markets, 
                with templates and tools that match what regional recruiters expect.
              </p>
              <ul className={styles.benefitsList}>
                {benefits.map((b, i) => (
                  <li key={i} className={styles.benefitItem}>
                    <CheckCircle2 size={18} className={styles.benefitCheck} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <button className={styles.benefitsCta} onClick={handleGetStarted}>
                Create Your Resume Now
                <ArrowRight size={16} />
              </button>
            </div>
            <div className={styles.benefitsVisual}>
              <div className={styles.benefitsCard}>
                <Shield size={40} className={styles.benefitsCardIcon} />
                <h3 className={styles.benefitsCardTitle}>ATS Optimized</h3>
                <p className={styles.benefitsCardDesc}>
                  Every template is tested against major Applicant Tracking Systems used by 
                  Fortune 500 companies and top GCC employers.
                </p>
                <div className={styles.benefitsMeter}>
                  <div className={styles.benefitsMeterFill} />
                  <span className={styles.benefitsMeterLabel}>98% ATS Pass Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────────────── */}
      <section className={styles.footerCta}>
        <div className={styles.footerCtaInner}>
          <h2 className={styles.footerCtaTitle}>Ready to build your perfect resume?</h2>
          <p className={styles.footerCtaDesc}>
            Join thousands of professionals who landed their dream jobs with ResumeAI.
          </p>
          <button className={styles.footerCtaBtn} onClick={handleGetStarted}>
            Get Started Free
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.logoIcon}>R</div>
            <span className={styles.logoText}>
              Resume<span className={styles.logoAccent}>AI</span>
            </span>
          </div>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} ResumeAI. AI-powered resume tools for GCC & India.
          </p>
        </div>
      </footer>
    </div>
  );
};
