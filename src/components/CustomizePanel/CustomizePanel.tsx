'use client';

import React from 'react';
import { useResume } from '@/context/ResumeContext';
import styles from './CustomizePanel.module.css';

export const CustomizePanel: React.FC = () => {
  const { resumeData, updateStyling } = useResume();
  const { template, fontFamily, fontSize, spacing, margins, primaryColor, referencesSeparator } = resumeData.styling;

  const templatesList = [
    { id: 'classic', label: 'Classic Clear', icon: '📄' },
    { id: 'sidebar', label: 'Atlantic Blue', icon: '📁' },
    { id: 'modern', label: 'Mercury Flow', icon: '✨' },
    { id: 'minimal', label: 'Minimalist Clean', icon: '🔍' },
  ] as const;

  const fontsList = [
    { id: 'Outfit', label: 'Outfit (Modern)', style: { fontFamily: 'Outfit, sans-serif' } },
    { id: 'Inter', label: 'Inter (Professional)', style: { fontFamily: 'Inter, sans-serif' } },
    { id: 'Montserrat', label: 'Montserrat (Creative)', style: { fontFamily: 'Montserrat, sans-serif' } },
    { id: 'Lora', label: 'Lora (Classic Serif)', style: { fontFamily: 'Lora, serif' } },
    { id: 'Playfair Display', label: 'Playfair (Elegant)', style: { fontFamily: 'Playfair Display, serif' } },
  ] as const;

  const colorPresets = [
    '#3b82f6', // Indigo Blue
    '#10b981', // Emerald Green
    '#6366f1', // Royal Purple
    '#f43f5e', // Rose Pink
    '#1e293b', // Slate Gray
    '#d97706', // Gulf Amber
  ];

  return (
    <div className={styles.panel}>
      {/* TEMPLATE */}
      <div className={styles.section}>
        <h3 className={styles.title}>Choose Template</h3>
        <div className={styles.grid}>
          {templatesList.map((item) => (
            <div
              key={item.id}
              onClick={() => updateStyling({ template: item.id })}
              className={`${styles.optionCard} ${template === item.id ? styles.optionCardActive : ''}`}
            >
              <div className={styles.templatePreview}>
                <span className={styles.templateIcon}>{item.icon}</span>
              </div>
              <span className={styles.templateLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TYPOGRAPHY */}
      <div className={styles.section}>
        <h3 className={styles.title}>Typography Font</h3>
        <div className={styles.grid}>
          {fontsList.map((f) => (
            <div
              key={f.id}
              onClick={() => updateStyling({ fontFamily: f.id })}
              className={`${styles.optionCard} ${fontFamily === f.id ? styles.optionCardActive : ''}`}
              style={f.style}
            >
              <span className={styles.fontLabel}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* COLOR SCHEME */}
      <div className={styles.section}>
        <h3 className={styles.title}>Theme Color</h3>
        <div className={styles.colorsRow}>
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() => updateStyling({ primaryColor: color })}
              className={`${styles.colorCircle} ${primaryColor === color ? styles.colorCircleActive : ''}`}
              style={{ backgroundColor: color }}
              aria-label={`Select theme color ${color}`}
            />
          ))}
        </div>
        <div className={styles.customColorPicker}>
          <input
            type="color"
            className={styles.colorInput}
            value={primaryColor}
            onChange={(e) => updateStyling({ primaryColor: e.target.value })}
          />
          <span className={styles.colorText}>Custom: {primaryColor.toUpperCase()}</span>
        </div>
      </div>

      {/* FONT SIZE */}
      <div className={styles.section}>
        <h3 className={styles.title}>Text Size</h3>
        <div className={styles.threeColGrid}>
          {(['sm', 'md', 'lg'] as const).map((sz) => (
            <button
              key={sz}
              onClick={() => updateStyling({ fontSize: sz })}
              className={`${styles.pillButton} ${fontSize === sz ? styles.pillButtonActive : ''}`}
            >
              {sz === 'sm' ? 'Small' : sz === 'md' ? 'Medium' : 'Large'}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION SPACING */}
      <div className={styles.section}>
        <h3 className={styles.title}>Line & Spacing</h3>
        <div className={styles.threeColGrid}>
          {(['compact', 'normal', 'loose'] as const).map((sp) => (
            <button
              key={sp}
              onClick={() => updateStyling({ spacing: sp })}
              className={`${styles.pillButton} ${spacing === sp ? styles.pillButtonActive : ''}`}
            >
              {sp.charAt(0).toUpperCase() + sp.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* PAGE MARGINS */}
      <div className={styles.section}>
        <h3 className={styles.title}>Page Margins</h3>
        <div className={styles.threeColGrid}>
          {(['compact', 'normal', 'loose'] as const).map((mg) => (
            <button
              key={mg}
              onClick={() => updateStyling({ margins: mg })}
              className={`${styles.pillButton} ${margins === mg ? styles.pillButtonActive : ''}`}
            >
              {mg.charAt(0).toUpperCase() + mg.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* REFERENCES SEPARATOR */}
      <div className={styles.section}>
        <h3 className={styles.title}>References Separator</h3>
        <div className={styles.fourColGrid}>
          {([
            { id: '|', label: 'Vertical Bar ( | )' },
            { id: '•', label: 'Bullet ( • )' },
            { id: '·', label: 'Dot ( · )' },
            { id: '-', label: 'Dash ( - )' },
          ] as const).map((sep) => (
            <button
              key={sep.id}
              onClick={() => updateStyling({ referencesSeparator: sep.id })}
              className={`${styles.pillButton} ${
                (referencesSeparator || '|') === sep.id ? styles.pillButtonActive : ''
              }`}
              title={sep.label}
            >
              {sep.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
