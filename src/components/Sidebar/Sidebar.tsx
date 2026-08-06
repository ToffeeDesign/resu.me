'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Mail,
  ClipboardList,
  BarChart3,
  Wand2,
  Lock,
  Sparkles,
  Palette,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Link,
} from 'lucide-react';
import { useResume } from '@/context/ResumeContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  activeTab,
  setActiveTab,
  darkMode,
  toggleDarkMode,
}) => {
  const { user, setLoginModalOpen, logout, triggerLogin } = useResume();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const menuItems = [
    {
      id: 'resume',
      label: 'Resume Builder',
      icon: <FileText className={styles.navIcon} size={20} />,
    },
    {
      id: 'coverletter',
      label: 'Cover Letter',
      badge: 'AI Beta',
      icon: <Mail className={styles.navIcon} size={20} />,
    },
    {
      id: 'tracker',
      label: 'Job Tracker',
      icon: <ClipboardList className={styles.navIcon} size={20} />,
    },
    {
      id: 'ats',
      label: 'ATS Analyser',
      badge: 'Pro AI',
      pro: true,
      icon: <BarChart3 className={styles.navIcon} size={20} />,
    },
    {
      id: 'humanizer',
      label: 'AI Rewrite & Humanizer',
      icon: <Wand2 className={styles.navIcon} size={20} />,
    },
    {
      id: 'linktree',
      label: 'Linktree',
      badge: 'New',
      icon: <Link className={styles.navIcon} size={20} />,
    },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>R</div>
        <div className={styles.logoText}>
          Resume<span className={styles.logoSub}>AI</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isLocked = !user && (item.id === 'ats' || item.id === 'humanizer');
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isLocked) {
                  triggerLogin(() => setActiveTab(item.id));
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
            >
              <span className={styles.navLinkContent}>
                {item.icon}
                {item.label}
              </span>
              {(item.badge || isLocked) && (
                <span className={`${styles.badge} ${item.badge?.includes('Beta') ? styles.badgeBeta : ''} ${item.pro || isLocked ? styles.badgePro : ''}`}>
                  {isLocked && <Lock size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />}
                  {item.badge || 'Pro'}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile Popup Menu */}
      {isProfileMenuOpen && (
        <div ref={menuRef} className={styles.profileMenu} role="menu">
          <div className={styles.menuHeader} role="menuitem">
            <div className={styles.menuAvatarInitials}>C</div>
            <div className={styles.menuHeaderText}>
              <span className={styles.menuHeaderName}>Chavda</span>
              <span className={styles.menuHeaderPlan}>Free</span>
            </div>
            <ChevronRight size={14} className={styles.menuHeaderChevron} />
          </div>

          <div className={styles.menuDivider} />

          <button className={styles.menuItem} role="menuitem">
            <Sparkles size={16} className={styles.menuItemIcon} />
            <span>Upgrade plan</span>
          </button>

          <button className={styles.menuItem} role="menuitem">
            <Palette size={16} className={styles.menuItemIcon} />
            <span>Personalization</span>
          </button>

          <button className={styles.menuItem} role="menuitem">
            <User size={16} className={styles.menuItemIcon} />
            <span>Profile</span>
          </button>

          <button className={styles.menuItem} role="menuitem">
            <Settings size={16} className={styles.menuItemIcon} />
            <span>Settings</span>
          </button>

          <button 
            className={`${styles.menuItem} ${styles.themeMenuItem}`} 
            role="menuitem"
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun size={16} className={styles.menuItemIcon} /> : <Moon size={16} className={styles.menuItemIcon} />}
            <span>Dark mode</span>
            <div className={`${styles.menuSwitch} ${darkMode ? styles.menuSwitchActive : ''}`}>
              <div className={styles.menuSwitchThumb} />
            </div>
          </button>

          <div className={styles.menuDivider} />

          <button className={styles.menuItem} role="menuitem">
            <HelpCircle size={16} className={styles.menuItemIcon} />
            <span>Help</span>
            <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'hsl(var(--color-neutral-400))' }} />
          </button>

          <button
            className={styles.menuItem}
            role="menuitem"
            onClick={() => { logout(); setIsProfileMenuOpen(false); }}
          >
            <LogOut size={16} className={styles.menuItemIcon} />
            <span>Log out</span>
          </button>
        </div>
      )}

      <div className={styles.footer}>
        {user ? (
          <div className={styles.profileFooterRow}>
            <button
              className={styles.profileTrigger}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen}
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt="User avatar"
                className={styles.avatar}
              />
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{user.name}</span>
                <span className={styles.profilePlan}>Free</span>
              </div>
            </button>
            <button className={styles.upgradePill}>Upgrade</button>
          </div>
        ) : (
          <div className={styles.guestFooterRow}>
            <button 
              className={styles.loginBtn}
              onClick={() => setLoginModalOpen(true)}
            >
              Login
            </button>
            <button 
              className={styles.signupBtn}
              onClick={() => {
                setLoginModalOpen(true);
              }}
            >
              Signup
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
