import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  Copy, 
  Trash2, 
  Eye, 
  Check, 
  Globe,
  Edit2
} from 'lucide-react';
import styles from './LinktreeManager.module.css';
import { useResume, LinktreePage } from '@/context/ResumeContext';
import { copyToClipboard } from '@/utils/clipboard';

interface LinktreeDashboardProps {
  pages: LinktreePage[];
  onEdit: (page: LinktreePage) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export function LinktreeDashboard({ pages, onEdit, onDelete, onCreateNew }: LinktreeDashboardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [domain, setDomain] = useState('resumemaker.app/u/');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(`${window.location.host}/u/`);
    }
  }, []);

  const handleCopyLink = async (page: LinktreePage) => {
    const fullUrl = `http://${domain}${page.slug}`;
    const success = await copyToClipboard(fullUrl);
    if (success) {
      setCopiedId(page.id);
      setShowToast(true);
      setTimeout(() => setCopiedId(null), 2500);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div>
      <div className={styles.dashGrid}>
        {/* Dashed Create New Page Card */}
        <div 
          onClick={onCreateNew} 
          className={styles.dashCard} 
          style={{ 
            border: '2px dashed #cbd5e1', 
            background: 'transparent', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '120px', 
            cursor: 'pointer',
            boxShadow: 'none'
          }}
        >
          <Plus size={24} style={{ color: '#64748b', marginBottom: 8 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Create New Page</span>
        </div>

        {pages.map(page => (
          <div key={page.id} className={styles.dashCard}>
            <div className={styles.dashCardHeader}>
              <div className={styles.dashCardAvatar}>
                {page.avatarUrl ? (
                  <img 
                    src={page.avatarUrl} 
                    alt={page.displayName || 'Profile Avatar'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : page.displayName ? (
                  page.displayName.charAt(0).toUpperCase()
                ) : (
                  '👤'
                )}
              </div>
              <div className={styles.dashCardInfo}>
                <span className={styles.dashCardName}>{page.displayName}</span>
                <span className={styles.dashCardUrl}>{domain}{page.slug}</span>
              </div>
            </div>

            {/* Simulated Analytics metrics */}
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555' }}>
                <Eye size={13} style={{ opacity: 0.7 }} />
                <span><strong>0</strong> Views</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555' }}>
                <Globe size={13} style={{ opacity: 0.7 }} />
                <span><strong>0</strong> Clicks</span>
              </div>
            </div>

            <div className={styles.dashCardFooter}>
              <a 
                href={`/u/${page.slug}`} 
                target="_blank" 
                rel="noreferrer" 
                className={styles.viewLiveBtn}
              >
                <span>View Live</span>
                <ArrowUpRight size={14} style={{ strokeWidth: 2.5 }} />
              </a>

              <div className={styles.dashCardActions}>
                <button 
                  onClick={() => onEdit(page)} 
                  className={styles.actionBtn}
                  title="Edit page profile details"
                >
                  <Edit2 size={13} />
                </button>

                <button 
                  onClick={() => handleCopyLink(page)} 
                  className={styles.actionBtn}
                  title="Copy link to clipboard"
                >
                  {copiedId === page.id ? <Check size={13} style={{ color: 'green' }} /> : <Copy size={13} />}
                </button>
                
                <button 
                  onClick={() => onDelete(page.id)} 
                  className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                  title="Delete profile page"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showToast && (
        <div className={styles.toastNotification}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Check size={12} style={{ color: 'white', strokeWidth: 3 }} />
          </div>
          <span>Live Link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}
