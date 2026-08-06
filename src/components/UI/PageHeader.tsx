import React from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onMenuClick?: () => void;
  rightElement?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onMenuClick,
  rightElement,
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        {onMenuClick && (
          <button
            className={styles.menuBtn}
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        )}

        <div className={styles.titleSection}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subheading}>{subtitle}</p>}
        </div>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
};
