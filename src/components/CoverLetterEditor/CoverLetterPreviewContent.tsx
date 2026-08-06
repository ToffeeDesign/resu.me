'use client';

import React from 'react';
import styles from './CoverLetterEditor.module.css';
import { CoverLetterData, CONTACT_TYPE_ICONS, ContactType } from '@/context/ResumeContext';

function getContactLink(type: string, value: string, url?: string): string {
  const destination = (url && url.trim()) || value.trim();
  if (type === 'email') return destination.startsWith('mailto:') ? destination : `mailto:${destination}`;
  if (type === 'phone') return destination.startsWith('tel:') ? destination : `tel:${destination}`;
  if (/^(https?:\/\/)/i.test(destination)) return destination;
  return `https://${destination}`;
}

interface Props {
  data: CoverLetterData;
  /** Suppress interactive links (e.g. inside thumbnails) */
  static?: boolean;
}

export const CoverLetterPreviewContent: React.FC<Props> = ({ data, static: isStatic }) => {
  const {
    senderInfo,
    recipientInfo,
    date,
    subject,
    salutation,
    body,
    signOff,
    signature,
    templateId,
    signatureInfo,
  } = data;

  const primaryColor = data.primaryColor ?? '#4f46e5';
  const fontFamilyVal = data.fontFamily ?? 'Inter';

  const fontStyle = {
    fontFamily: fontFamilyVal === 'Inter' ? 'var(--font-system)' : fontFamilyVal,
  };

  const colorStyle = { color: primaryColor };

  // ─── Signature block ────────────────────────────────────────────────
  const renderSignature = () => {
    const sigInfo = signatureInfo || {};
    const hasImage = !!sigInfo.image;
    return (
      <div className={`${styles.previewSignatureBlock} ${hasImage ? styles.hasSignatureImg : styles.noSignatureImg}`}>
        <div className={styles.signOffText}>{signOff || 'Sincerely,'}</div>
        {hasImage && (
          <>
            <div className={styles.previewSignatureImageWrap}>
              <img src={sigInfo.image} alt="Signature" className={styles.previewSignatureImg} />
            </div>
            <div className={styles.previewSignatureLine} />
          </>
        )}
        <div className={styles.previewSignatureName}>
          {sigInfo.name || signature || senderInfo.fullName || 'Your Name'}
        </div>
        {(sigInfo.place || sigInfo.date) && (
          <div className={styles.previewSignatureMeta}>
            {[sigInfo.place, sigInfo.date].filter(Boolean).join(' | ')}
          </div>
        )}
      </div>
    );
  };

  // ─── Minimal / Classic contact items (inline row) ────────────────────
  const renderContactItems = () => {
    const items = senderInfo.contactItems || [];
    const renderLink = (type: string, value: string, url?: string, label?: string) => {
      if (isStatic || type === 'address') return <span>{value}</span>;
      return (
        <a href={getContactLink(type, value, url)} target="_blank" rel="noopener noreferrer">
          {type === 'other' && label ? `${label}: ` : ''}{value}
        </a>
      );
    };

    if (items.length === 0) {
      const fallback: Array<{ id: string; type: ContactType; value: string }> = [];
      if (senderInfo.email) fallback.push({ id: 'f-e', type: 'email', value: senderInfo.email });
      if (senderInfo.phone) fallback.push({ id: 'f-p', type: 'phone', value: senderInfo.phone });
      if (senderInfo.address) fallback.push({ id: 'f-a', type: 'address', value: senderInfo.address });
      return (
        <div className={styles.contactsRow}>
          {fallback.map(ci => (
            <span key={ci.id} className={styles.contactItem}>
              {CONTACT_TYPE_ICONS[ci.type]}{' '}
              {renderLink(ci.type, ci.value)}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className={styles.contactsRow}>
        {items.filter(ci => ci.value.trim()).map(ci => (
          <span key={ci.id} className={styles.contactItem}>
            {CONTACT_TYPE_ICONS[ci.type]}{' '}
            {renderLink(ci.type, ci.value, ci.url, ci.label)}
          </span>
        ))}
      </div>
    );
  };

  // ─── Modern sidebar contacts ─────────────────────────────────────────
  const renderModernContacts = () => {
    const items = senderInfo.contactItems || [];
    const renderVal = (type: string, value: string, url?: string) => {
      if (isStatic || type === 'address') return <span>{value}</span>;
      return (
        <a href={getContactLink(type, value, url)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
          {value}
        </a>
      );
    };

    if (items.length > 0) {
      return items.filter(ci => ci.value.trim()).map(ci => (
        <div key={ci.id} className={styles.modernContactGroup}>
          <div className={styles.modernContactLabel}>{CONTACT_TYPE_ICONS[ci.type]} {ci.type.toUpperCase()}</div>
          <div className={styles.modernContactValue}>{renderVal(ci.type, ci.value, ci.url)}</div>
        </div>
      ));
    }

    return (
      <>
        {senderInfo.email && (
          <div className={styles.modernContactGroup}>
            <div className={styles.modernContactLabel}>{CONTACT_TYPE_ICONS.email} EMAIL</div>
            <div className={styles.modernContactValue}>{renderVal('email', senderInfo.email)}</div>
          </div>
        )}
        {senderInfo.phone && (
          <div className={styles.modernContactGroup}>
            <div className={styles.modernContactLabel}>{CONTACT_TYPE_ICONS.phone} PHONE</div>
            <div className={styles.modernContactValue}>{renderVal('phone', senderInfo.phone)}</div>
          </div>
        )}
        {senderInfo.address && (
          <div className={styles.modernContactGroup}>
            <div className={styles.modernContactLabel}>{CONTACT_TYPE_ICONS.address} ADDRESS</div>
            <div className={styles.modernContactValue}><span>{senderInfo.address}</span></div>
          </div>
        )}
      </>
    );
  };

  // ─── Creative header contacts ────────────────────────────────────────
  const renderCreativeContacts = () => {
    const items = senderInfo.contactItems || [];
    const renderVal = (type: string, value: string, url?: string) => {
      if (isStatic || type === 'address') return <span>{value}</span>;
      return (
        <a href={getContactLink(type, value, url)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
          {value}
        </a>
      );
    };

    if (items.length > 0) {
      return items.filter(ci => ci.value.trim()).map(ci => (
        <div key={ci.id} className={styles.contactItem} style={{ justifyContent: 'flex-end', gap: '6px' }}>
          <span>{CONTACT_TYPE_ICONS[ci.type]}</span>
          {renderVal(ci.type, ci.value, ci.url)}
        </div>
      ));
    }

    return (
      <>
        {senderInfo.email && (
          <div className={styles.contactItem} style={{ justifyContent: 'flex-end', gap: '6px' }}>
            <span>{CONTACT_TYPE_ICONS.email}</span>
            {renderVal('email', senderInfo.email)}
          </div>
        )}
        {senderInfo.phone && (
          <div className={styles.contactItem} style={{ justifyContent: 'flex-end', gap: '6px' }}>
            <span>{CONTACT_TYPE_ICONS.phone}</span>
            {renderVal('phone', senderInfo.phone)}
          </div>
        )}
        {senderInfo.address && (
          <div className={styles.contactItem} style={{ justifyContent: 'flex-end', gap: '6px' }}>
            <span>{CONTACT_TYPE_ICONS.address}</span>
            <span>{senderInfo.address}</span>
          </div>
        )}
      </>
    );
  };

  // ─── Modern template ─────────────────────────────────────────────────
  if (templateId === 'modern') {
    return (
      <div className={styles.previewModern} style={fontStyle}>
        <div className={styles.modernSidebar} style={{ backgroundColor: primaryColor }}>
          {senderInfo.showProfilePhoto !== false && senderInfo.profilePhoto && (
            <img src={senderInfo.profilePhoto} alt="Profile" className={styles.modernProfilePhoto} />
          )}
          <div className={styles.modernSenderName}>{senderInfo.fullName || 'YOUR NAME'}</div>
          <div className={styles.modernSenderTitle}>{senderInfo.jobTitle || 'JOB TITLE'}</div>
          {renderModernContacts()}
        </div>
        <div className={styles.modernMain}>
          <div className={styles.modernMetaSection}>
            <div className={styles.modernDate}>{date}</div>
            <div className={styles.recipientBlock}>
              <div className={styles.toLabel}>TO:</div>
              <div className={styles.recipientName}>{recipientInfo.name || 'Recipient Name'}</div>
              <div className={styles.recipientTitle}>{recipientInfo.position || 'Position/Title'}</div>
              <div className={styles.recipientCompany}>{recipientInfo.companyName || 'Company Name'}</div>
              <div className={styles.recipientAddr}>{recipientInfo.address || 'Company Address'}</div>
            </div>
          </div>
          {subject && <div className={styles.subjectLine} style={{ borderLeftColor: primaryColor }}><strong>Subject:</strong> {subject}</div>}
          <div className={styles.letterContent}>
            <p className={styles.salutation}>{salutation}</p>
            <div className={styles.bodyPara} dangerouslySetInnerHTML={{ __html: body }} />
            {renderSignature()}
          </div>
        </div>
      </div>
    );
  }

  // ─── Creative template ───────────────────────────────────────────────
  if (templateId === 'creative') {
    return (
      <div className={styles.previewCreative} style={fontStyle}>
        <div className={styles.creativeHeader} style={{ borderBottomColor: primaryColor }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {senderInfo.showProfilePhoto !== false && senderInfo.profilePhoto && (
              <img src={senderInfo.profilePhoto} alt="Profile" className={styles.previewProfilePhoto} />
            )}
            <div>
              <div className={styles.creativeSenderName} style={{ color: primaryColor }}>{senderInfo.fullName || 'YOUR NAME'}</div>
              <div className={styles.creativeSenderTitle}>{senderInfo.jobTitle || 'JOB TITLE'}</div>
            </div>
          </div>
          <div className={styles.creativeSenderContact}>
            {renderCreativeContacts()}
          </div>
        </div>
        <div className={styles.creativeMain}>
          <div className={styles.creativeMetaGrid}>
            <div className={styles.recipientBlock}>
              <div className={styles.recipientName}>{recipientInfo.name || 'Recipient Name'}</div>
              <div className={styles.recipientTitle}>{recipientInfo.position || 'Position/Title'}</div>
              <div className={styles.recipientCompany}>{recipientInfo.companyName || 'Company Name'}</div>
              <div className={styles.recipientAddr}>{recipientInfo.address || 'Company Address'}</div>
            </div>
            <div className={styles.creativeDate} style={{ textAlign: 'right' }}>{date}</div>
          </div>
          {subject && <div className={styles.subjectLine} style={{ borderLeftColor: primaryColor }}><strong>Subject:</strong> {subject}</div>}
          <div className={styles.letterContent}>
            <p className={styles.salutation}>{salutation}</p>
            <div className={styles.bodyPara} dangerouslySetInnerHTML={{ __html: body }} />
            {renderSignature()}
          </div>
        </div>
      </div>
    );
  }

  // ─── Minimal / Clean (default) ───────────────────────────────────────
  return (
    <div className={styles.previewMinimal} style={fontStyle}>
      <div className={styles.minimalSenderBlock}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '12px' }}>
          {senderInfo.showProfilePhoto !== false && senderInfo.profilePhoto && (
            <img src={senderInfo.profilePhoto} alt="Profile" className={styles.previewProfilePhoto} />
          )}
          <div>
            <h1 className={styles.minimalSenderName} style={colorStyle}>{senderInfo.fullName || 'YOUR NAME'}</h1>
            <p className={styles.minimalSenderTitle}>{senderInfo.jobTitle || 'JOB TITLE'}</p>
          </div>
        </div>
        <div className={styles.minimalSenderMeta}>
          {renderContactItems()}
        </div>
        <div className={styles.divider} />
      </div>

      <div className={styles.minimalMain}>
        <div className={styles.minimalMetaRow}>
          <div className={styles.recipientBlock}>
            <div className={styles.recipientName}>{recipientInfo.name || 'Recipient Name'}</div>
            <div className={styles.recipientTitle}>{recipientInfo.position || 'Position/Title'}</div>
            <div className={styles.recipientCompany}>{recipientInfo.companyName || 'Company Name'}</div>
            <div className={styles.recipientAddr}>{recipientInfo.address || 'Company Address'}</div>
          </div>
          <div className={styles.minimalDate}>{date}</div>
        </div>
        {subject && <div className={styles.subjectLine}><strong>Subject:</strong> {subject}</div>}
        <div className={styles.letterContent}>
          <p className={styles.salutation}>{salutation}</p>
          <div className={styles.bodyPara} dangerouslySetInnerHTML={{ __html: body }} />
          {renderSignature()}
        </div>
      </div>
    </div>
  );
};
