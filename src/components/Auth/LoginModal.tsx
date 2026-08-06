'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import styles from './LoginModal.module.css';

export const LoginModal: React.FC = () => {
  const { loginModalOpen, setLoginModalOpen, login } = useResume();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'google' | 'email' | null>(null);
  const [error, setError] = useState('');
  const [shouldShake, setShouldShake] = useState(false);
  const [isIntro, setIsIntro] = useState(true);

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!loginModalOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setIsLoading(false);
      setLoadingType(null);
      setError('');
      setShouldShake(false);
    } else {
      setIsIntro(true);
    }
  }, [loginModalOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && loginModalOpen) {
        setLoginModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loginModalOpen, setLoginModalOpen]);

  // Handle click outside modal card
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShouldShake(true);
    }
  };

  if (!loginModalOpen) return null;

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setLoadingType('google');
    setError('');
    setTimeout(() => {
      // Simulate successful Google Login
      login('chavda@gmail.com', 'Chavda');
    }, 1200);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setLoadingType('email');
    setError('');

    setTimeout(() => {
      // Simulate email login/signup
      login(email, isSignUp ? name : undefined);
    }, 1000);
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClickOutside}>
      <div 
        ref={modalRef} 
        className={`${styles.modalCard} ${isIntro ? styles.entrance : ''} ${shouldShake ? styles.shake : ''}`} 
        onAnimationEnd={(e) => {
          if (e.animationName.includes('cardSlideUp')) {
            setIsIntro(false);
          } else if (e.animationName.includes('shake')) {
            setShouldShake(false);
          }
        }}
        role="dialog" 
        aria-modal="true"
      >
        {/* Close Button */}
        <button 
          className={styles.closeBtn} 
          onClick={() => setLoginModalOpen(false)}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.logoIcon}>R</div>
          <h2 className={styles.title}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className={styles.subtitle}>
            {isSignUp 
              ? 'Sign up to download your resume and save progress permanently.' 
              : 'Log in to download your resume and sync your edits.'}
          </p>
        </div>

        {/* Google Sign-In Button */}
        <button 
          className={styles.googleBtn} 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading && loadingType === 'google' ? (
            <span className={styles.spinner} />
          ) : (
            <svg className={styles.googleSvg} viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.65 15 1 12 1 7.21 1 3.15 3.75 1.17 7.74l3.85 2.99C5.97 7.42 8.76 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-2 3.74-4.94 3.74-8.55z"
              />
              <path
                fill="#FBBC05"
                d="M5.02 10.73c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.17 7.38C.42 8.87 0 10.53 0 12.27s.42 3.4 1.17 4.89l3.85-2.99c-.23-.69-.36-1.42-.36-2.18z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.68-2.33 1.09-3.96 1.09-3.24 0-6.03-2.38-7.01-5.69l-3.85 2.99C3.15 20.25 7.21 23 12 23z"
              />
            </svg>
          )}
          <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          {isSignUp && (
            <div className={styles.inputGroup}>
              <label htmlFor="auth-name" className={styles.inputLabel}>Full Name</label>
              <input
                id="auth-name"
                type="text"
                className={styles.inputField}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="auth-email" className={styles.inputLabel}>Email Address</label>
            <input
              id="auth-email"
              type="email"
              className={styles.inputField}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="auth-password" className={styles.inputLabel}>Password</label>
            <input
              id="auth-password"
              type="password"
              className={styles.inputField}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading && loadingType === 'email' ? (
              <div className={styles.spinner} />
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Modal Footer */}
        <div className={styles.footer}>
          <button 
            className={styles.toggleModeBtn}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            disabled={isLoading}
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};
