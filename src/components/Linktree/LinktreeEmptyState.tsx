import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Layers,
  FileText,
  Globe,
  Mail
} from 'lucide-react';
import styles from './LinktreeManager.module.css';
import { useResume, LinktreePage } from '@/context/ResumeContext';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
// comment learning-1
export function LinktreeEmptyState({
  onCreatePage,
  onCancel
}: {
  onCreatePage: (slug: string) => void;
  onCancel?: () => void;
}) {
  const { user } = useResume();
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('resumemaker.app/u/');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(`${window.location.host}/u/`);
    }
  }, []);

  // Pre-fill slug if user is logged in
  useEffect(() => {
    if (user?.name) {
      setSlug(user.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slug.trim()) {
      onCreatePage(slug.trim().toLowerCase());
    }
  };

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&fit=crop&q=80'
  ];

  return (
    <div className={styles.heroWrapper}>
      {/* Left Section - Onboarding & Form Details */}
      <div className={styles.leftCol}>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className={styles.featureBadge}
            style={{ cursor: 'pointer', border: 'none', outline: 'none' }}
          >
            <ArrowLeft size={11} style={{ marginRight: 6 }} />
            Back to dashboard
          </button>
        ) : (
          <div className={styles.featureBadge}>
            <Sparkles size={11} style={{ marginRight: 6 }} />
            Link in Bio Feature
          </div>
        )}

        <h1 className={styles.headline}>
          Create one beautiful page for all your links.
        </h1>

        <p className={styles.subtitle}>
          Share your portfolio, resume, social profiles, projects, and everything that matters through a single professional link.
        </p>

        {/* Username form input */}
        <form onSubmit={handleSubmit} className={styles.usernameCard}>
          <div className={styles.usernameInputRow}>
            <span className={styles.usernamePrefix}>{domain}</span>
            <input
              type="text"
              className={styles.usernameInput}
              placeholder="yourname"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              required
            />
            <button
              type="submit"
              className={styles.usernameCreateBtn}
              disabled={!slug.trim()}
            >
              Create Page
            </button>
          </div>
          <span className={styles.usernameHelper}>
            Your personalized link page will be available instantly.
          </span>
        </form>

        <div className={styles.ctaBtnGroup}>
          <button onClick={() => onCreatePage(slug || 'portfolio')} className={styles.primaryBtn}>
            Create Your Link Page <ArrowRight size={14} />
          </button>
          <button type="button" className={styles.secondaryBtn} onClick={() => onCreatePage('design-template')}>
            Explore Templates
          </button>
        </div>

        {/* Social Proof Avatars overlap stack */}
        <div className={styles.socialProofRow}>
          <div className={styles.avatarStack}>
            {avatars.map((url, i) => (
              <img
                key={i}
                src={url}
                className={styles.avatarCircle}
                alt={`User avatar ${i + 1}`}
              />
            ))}
          </div>
          <span className={styles.socialProofText}>
            Loved by <span className={styles.socialProofHighlight}>7,500+ professionals</span>
          </span>
        </div>
      </div>

      {/* Right Section - Floating Cards Animation */}
      <div className={styles.rightCol}>
        {/* CSS Mockup Mobile Phone */}
        <div className={styles.phoneMockup}>
          <div className={styles.phoneAvatar}>✨</div>
          <h2 className={styles.phoneName}>{user?.name || 'Zoé Williams'}</h2>
          <p className={styles.phoneBio}>Product Designer & Developer. Building interactive web tools. Sharing my design journey.</p>

          <div className={styles.phoneSocialRow}>
            <span className={styles.phoneSocialCircle}>🐦</span>
            <span className={styles.phoneSocialCircle}>📸</span>
            <span className={styles.phoneSocialCircle}>📁</span>
          </div>

          <div className={styles.phoneBtnList}>
            <div className={styles.phoneBtn}>📂 My Portfolio</div>
            <div className={styles.phoneBtn}>📄 Interactive Resume</div>
            <div className={styles.phoneBtn}>✉ Get in Touch</div>
          </div>
        </div>

        {/* Floating cards with micro-animations */}
        <div className={`${styles.floatingCard} ${styles.floatingCard1}`}>
          <div className={styles.cardIconBox} style={{ backgroundColor: '#181717' }}>
            <GithubIcon style={{ width: 11, height: 11 }} />
          </div>
          GitHub Page
        </div>

        <div className={`${styles.floatingCard} ${styles.floatingCard2}`}>
          <div className={styles.cardIconBox} style={{ backgroundColor: '#0077b5' }}>
            <LinkedinIcon style={{ width: 11, height: 11 }} />
          </div>
          LinkedIn Profile
        </div>

        <div className={`${styles.floatingCard} ${styles.floatingCard3}`}>
          <div className={styles.cardIconBox} style={{ backgroundColor: '#2563eb' }}>
            <FileText size={11} />
          </div>
          Interactive Resume
        </div>

        <div className={`${styles.floatingCard} ${styles.floatingCard4}`}>
          <div className={styles.cardIconBox} style={{ backgroundColor: '#e21d48' }}>
            <Globe size={11} />
          </div>
          Latest Website
        </div>
      </div>
    </div>
  );
}
