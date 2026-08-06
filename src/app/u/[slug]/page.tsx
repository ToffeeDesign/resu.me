'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Globe, 
  Link2, 
  Mail, 
  Phone, 
  Eye, 
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import styles from './page.module.css';
import { useResume, LinktreePage, Block } from '@/context/ResumeContext';
import { ConfettiButton } from '@/registry/magicui/confetti';
import { copyToClipboard } from '@/utils/clipboard';

// Inline brand SVGs for social icons to avoid lucide-react compile errors
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
  </svg>
);

const getWidgetColorConfig = (blockType: string, platform?: string) => {
  const plat = (platform || '').toLowerCase().trim();
  
  if (blockType === 'social') {
    if (plat === 'linkedin') return { brand: '#0077b5', tint: '#eef4f8' };
    if (plat === 'twitter' || plat === 'x') return { brand: '#0f1419', tint: '#e6f2ff' };
    if (plat === 'youtube') return { brand: '#ff0000', tint: '#fef2f2' };
    if (plat === 'instagram') return { brand: '#e1306c', tint: '#fff0f3' };
    if (plat === 'github') return { brand: '#181717', tint: '#f6f8fa' };
    if (plat === 'facebook') return { brand: '#1877f2', tint: '#ebf5ff' };
    if (plat === 'discord') return { brand: '#5865f2', tint: '#eef0fe' };
    if (plat === 'dribbble') return { brand: '#ea4c89', tint: '#fff0f3' };
    if (plat === 'behance') return { brand: '#0057ff', tint: '#e6eeff' };
    if (plat === 'pinterest') return { brand: '#bd081c', tint: '#fdf0f0' };
    if (plat === 'twitch') return { brand: '#9146ff', tint: '#f5f0ff' };
    if (plat === 'slack') return { brand: '#4a154b', tint: '#fdf0fd' };
    if (plat === 'whatsapp') return { brand: '#25d366', tint: '#effdf3' };
    if (plat === 'telegram') return { brand: '#2497d4', tint: '#eaf7fd' };
    if (plat === 'tiktok' || plat === 'tik_tok') return { brand: '#010101', tint: '#f6f6f6' };
    if (plat === 'medium') return { brand: '#090909', tint: '#f9f9f9' };
    if (plat === 'spotify') return { brand: '#1db954', tint: '#eefdf3' };
    if (plat === 'dropbox') return { brand: '#0061ff', tint: '#e6eeff' };
    if (plat === 'figma') return { brand: '#f24e1e', tint: '#fff1ed' };
    if (plat === 'gitlab') return { brand: '#fc6d26', tint: '#fff3ed' };
    if (plat === 'google') return { brand: '#4285f4', tint: '#ebf3fe' };
    return { brand: '#64748b', tint: '#f8fafc' };
  }
  
  if (blockType === 'link') return { brand: '#3b82f6', tint: '#eff6ff' };
  if (blockType === 'contact') return { brand: '#10b981', tint: '#ecfdf5' };
  if (blockType === 'video') return { brand: '#ef4444', tint: '#fef2f2' };
  if (blockType === 'text') return { brand: '#8b5cf6', tint: '#f5f3ff' };
  if (blockType === 'image') return { brand: '#a855f7', tint: '#faf5ff' };
  if (blockType === 'group') return { brand: '#64748b', tint: '#f8fafc' };
  
  return { brand: '#6e7cfa', tint: '#f5f6ff' };
};

const getSocialIconPath = (platform: string) => {
  const plat = platform.toLowerCase().trim();
  if (plat === 'twitter' || plat === 'x') return '/social-icons/Twitter.png';
  if (plat === '500px') return '/social-icons/500px.png';
  if (plat === 'adobe_portfolio' || plat === 'adobe portfolio') return '/social-icons/adobe_portfolio.png';
  if (plat === 'behance') return '/social-icons/behance.png';
  if (plat === 'discord') return '/social-icons/discord.png';
  if (plat === 'dribbble') return '/social-icons/dribbble.png';
  if (plat === 'dropbox') return '/social-icons/dropbox.png';
  if (plat === 'facebook') return '/social-icons/facebook.png';
  if (plat === 'figma') return '/social-icons/figma.png';
  if (plat === 'flickr') return '/social-icons/flickr.png';
  if (plat === 'github') return '/social-icons/github.png';
  if (plat === 'gitlab') return '/social-icons/gitlab.png';
  if (plat === 'google') return '/social-icons/google.png';
  if (plat === 'google_my_business' || plat === 'google my business') return '/social-icons/google_my_business.png';
  if (plat === 'instagram') return '/social-icons/instagram.png';
  if (plat === 'linkedin') return '/social-icons/linkedin.png';
  if (plat === 'medium') return '/social-icons/medium.png';
  if (plat === 'ok' || plat === 'ok.ru') return '/social-icons/ok.png';
  if (plat === 'pinterest') return '/social-icons/pinterest.png';
  if (plat === 'signal') return '/social-icons/signal.png';
  if (plat === 'skype') return '/social-icons/skype.png';
  if (plat === 'slack') return '/social-icons/slack.png';
  if (plat === 'telegram') return '/social-icons/telegram.png';
  if (plat === 'tik_tok' || plat === 'tiktok') return '/social-icons/tik_tok.png';
  if (plat === 'tumblr') return '/social-icons/tumblr.png';
  if (plat === 'twitch') return '/social-icons/twitch.png';
  if (plat === 'vimeo') return '/social-icons/vimeo.png';
  if (plat === 'vk') return '/social-icons/vk.png';
  if (plat === 'whatsapp') return '/social-icons/whatsapp.png';
  if (plat === 'yandex_zen' || plat === 'yandex zen') return '/social-icons/yandex_zen.png';
  if (plat === 'youtube') return '/social-icons/youtube.png';
  return '';
};

const getPlatformDisplayUrl = (url?: string, platform?: string) => {
  if (url) {
    try {
      const absoluteUrl = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(absoluteUrl);
      return urlObj.hostname.replace('www.', '');
    } catch {
      // ignore
    }
  }
  const plat = (platform || '').toLowerCase().trim();
  if (plat === 'youtube') return 'youtube.com';
  if (plat === 'linkedin') return 'linkedin.com';
  if (plat === 'twitter' || plat === 'x') return 'twitter.com';
  if (plat === 'instagram') return 'instagram.com';
  if (plat === 'github') return 'github.com';
  return `${plat || 'social'}.com`;
};

const renderSocialIcon = (platform: string, size: number = 28) => {
  const iconPath = getSocialIconPath(platform);
  const iconStyle = { width: size, height: size, objectFit: 'contain' as const, display: 'block', borderRadius: size <= 22 ? 6 : 8, flexShrink: 0 };
  if (iconPath) {
    return <img src={iconPath} alt={platform} style={iconStyle} />;
  }
  return (
    <div style={{ 
      width: size, 
      height: size, 
      borderRadius: size <= 22 ? 6 : 8, 
      backgroundColor: '#f1f5f9', 
      color: '#64748b', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Globe style={{ width: size / 2, height: size / 2 }} />
    </div>
  );
};

export default function PublicLinktreePage() {
  const params = useParams();
  const router = useRouter();
  const { linktreePages } = useResume();
  
  const slug = params?.slug as string;
  const [copied, setCopied] = useState(false);

  const page = linktreePages.find(p => p.slug.toLowerCase() === slug?.toLowerCase());

  const handleCopyLink = async () => {
    if (typeof window !== 'undefined') {
      const success = await copyToClipboard(window.location.href);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!page) {
    return (
      <div className={styles.container} style={{ background: '#f3f4f6' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Globe size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', margin: '0 0 8px' }}>Page Not Found</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>
            The bio-link page "Resu.me/{slug}" is available to claim!
          </p>
          <button 
            onClick={() => router.push('/')} 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              padding: '10px 20px', 
              backgroundColor: '#1f2937', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '13px', 
              fontWeight: 700, 
              cursor: 'pointer' 
            }}
          >
            <ArrowLeft size={14} /> Claim this page
          </button>
        </div>
      </div>
    );
  }

  const getSizeSpans = (size: Block['size']) => {
    const [c, r] = size.split('x').map(Number);
    return { cols: c || 1, rows: r || 1 };
  };

  const compactBlocksRows = (blocks: Block[]): Block[] => {
    if (blocks.length === 0) return blocks;
    
    let sortedBlocks = [...blocks];
    
    const getMaxY = (blks: Block[]) => {
      if (blks.length === 0) return 0;
      return Math.max(...blks.map(b => {
        const spans = getSizeSpans(b.size);
        return b.position.y + spans.rows;
      }));
    };

    let r = 0;
    while (r < getMaxY(sortedBlocks)) {
      const isRowOccupied = sortedBlocks.some(b => {
        const spans = getSizeSpans(b.size);
        const startY = b.position.y;
        const endY = b.position.y + spans.rows;
        return r >= startY && r < endY;
      });

      if (!isRowOccupied) {
        let shifted = false;
        sortedBlocks = sortedBlocks.map(b => {
          if (b.position.y > r) {
            shifted = true;
            return {
              ...b,
              position: {
                ...b.position,
                y: b.position.y - 1
              }
            };
          }
          return b;
        });
        
        if (!shifted) {
          break;
        }
      } else {
        r++;
      }
    }

    return sortedBlocks;
  };

  const renderBlock = (block: Block) => {
    const spans = getSizeSpans(block.size);
    const isInteractive = ['link', 'social', 'contact'].includes(block.type) || (block.type === 'image' && !!block.data.url);

    // High fidelity widget desaturated background styling
    const colorConfig = getWidgetColorConfig(block.type, block.data.platform);
    let blockBg = block.data.bgColor || colorConfig.tint;
    let brandColor = colorConfig.brand;
    let logoBg = colorConfig.brand;
    let logoColor = 'white';
    let buttonLabel = 'Visit';
    
    if (block.type === 'social') {
      const plat = block.data.platform || '';
      if (plat === 'linkedin') buttonLabel = 'Connect';
      else if (plat === 'twitter' || plat === 'x') buttonLabel = 'Follow';
      else if (plat === 'youtube') buttonLabel = 'Subscribe';
      else if (plat === 'instagram') buttonLabel = 'Follow';
      else if (plat === 'github') buttonLabel = 'Connect';
    }

    // Grid cell styling overrides
    const gridStyle: React.CSSProperties = {
      gridColumn: block.type === 'title' ? undefined : `span ${spans.cols}`,
      gridRow: block.type === 'title' ? undefined : `span ${spans.rows}`,
      width: block.type === 'title' ? `${(spans.cols / 4) * 100}%` : undefined,
      borderRadius: `${page.theme.blockRadius}px`,
      border: block.type === 'title' ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: block.type === 'title' ? 'none' : (page.theme.blockShadow ? '0 4px 12px rgba(0, 0, 0, 0.03)' : 'none'),
      backgroundColor: block.type === 'title' ? 'transparent' : blockBg,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: block.type === 'title' ? '4px 0' : '16px',
      boxSizing: 'border-box',
      alignSelf: block.type === 'title' ? 'start' : undefined
    };

    const handleBlockClick = () => {
      if (block.data.url) {
        window.open(block.data.url, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <div
        key={block.id}
        style={gridStyle}
        data-cols={spans.cols}
        data-rows={spans.rows}
        onClick={isInteractive ? handleBlockClick : undefined}
        className={`${styles.blockWrapper} ${isInteractive ? styles.blockWrapperInteractive : ''}`}
      >
        {/* Render block components */}
        <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' }}>
          {block.type === 'title' && (
            <div 
              className={styles.titleBlock}
              style={{ 
                justifyContent: block.data.align === 'center' ? 'center' : block.data.align === 'right' ? 'flex-end' : 'flex-start',
                color: page.theme.backgroundValue.includes('#ffffff') ? '#333' : 'white',
                width: '100%',
                padding: '12px 0 6px 0'
              }}
            >
              <h3 
                style={{ 
                  margin: 0, 
                  fontWeight: 800,
                  fontSize: block.data.size === 'small' ? '13px' : block.data.size === 'large' ? '20px' : '15px',
                  opacity: 0.9,
                  letterSpacing: '-0.02em',
                  fontFamily: page.theme.fontFamily || 'Inter'
                }}
              >
                {block.data.title || 'Category'}
              </h3>
            </div>
          )}

          {block.type === 'text' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
              <p className={styles.widgetBodyText} style={{ fontFamily: page.theme.fontFamily || 'Inter', color: page.theme.backgroundValue.includes('#ffffff') ? '#374151' : '#e2e8f0' }}>{block.data.content}</p>
            </div>
          )}

          {block.type === 'link' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <div className={styles.widgetLogoSquare} style={{ backgroundColor: logoBg, color: brandColor }}>
                <Globe size={18} />
              </div>
              <div style={{ width: '100%', marginTop: 'auto' }}>
                <span 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    color: page.theme.backgroundValue.includes('#ffffff') ? '#1f2937' : '#ffffff', 
                    lineHeight: 1.25, 
                    wordBreak: 'break-word',
                    textAlign: 'left',
                    display: 'block'
                  }}
                >
                  {block.data.title || 'My Link'}
                </span>
              </div>
            </div>
          )}

          {block.type === 'social' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              {renderSocialIcon(block.data.platform || '')}
              <div style={{ width: '100%', marginTop: 'auto' }}>
                <span 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    color: page.theme.backgroundValue.includes('#ffffff') ? '#1f2937' : '#ffffff', 
                    lineHeight: 1.25, 
                    wordBreak: 'break-word',
                    textAlign: 'left',
                    display: 'block'
                  }}
                >
                  {block.data.username || page.displayName}
                </span>
              </div>
            </div>
          )}

          {block.type === 'group' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', pointerEvents: 'auto' }}>
              {block.data.title && (
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: '6px', color: 'inherit' }}>
                  {block.data.title}
                </span>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '6px', flex: 1, minHeight: 0 }}>
                {Array.from({ length: 4 }).map((_, idx) => {
                  const child = block.data.groupBlocks?.[idx];
                  if (!child) {
                    return (
                      <div 
                        key={`empty-${idx}`} 
                        style={{ 
                          border: '1px dashed rgba(0,0,0,0.08)', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '9px',
                          color: '#aaa',
                          background: 'rgba(0,0,0,0.01)'
                        }}
                      >
                        Empty
                      </div>
                    );
                  }
                  
                  const isChildInteractive = ['link', 'social', 'contact'].includes(child.type) || (child.type === 'image' && child.data.url);
                  let childLogoBg = '#f1f5f9';
                  let childBrandColor = '#64748b';
                  if (child.type === 'social') {
                    const childPlat = child.data.platform || '';
                    if (childPlat === 'linkedin') { childLogoBg = '#eef4f8'; childBrandColor = '#0a66c2'; }
                    else if (childPlat === 'twitter') { childLogoBg = '#e8f5fe'; childBrandColor = '#1da1f2'; }
                    else if (childPlat === 'youtube') { childLogoBg = '#ffe6e6'; childBrandColor = '#ff0000'; }
                    else if (childPlat === 'instagram') { childLogoBg = '#ffeef4'; childBrandColor = '#e1306c'; }
                    else if (childPlat === 'github') { childLogoBg = '#f3f4f6'; childBrandColor = '#181717'; }
                  }
                  
                  return (
                    <div 
                      key={child.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (child.data.url) {
                          window.open(child.data.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className={`${styles.groupWidgetSquare} ${isChildInteractive ? styles.groupWidgetSquareInteractive : ''}`}
                      style={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px', textAlign: 'center', padding: '4px' }}>
                        {child.type === 'social' ? (
                          renderSocialIcon(child.data.platform || '', 22)
                        ) : (
                          <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: childLogoBg, color: childBrandColor, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Globe size={11} />
                          </div>
                        )}
                        <span style={{ fontSize: '9px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', color: '#1f2937' }}>
                          {child.type === 'social' ? (child.data.platform ? child.data.platform.charAt(0).toUpperCase() + child.data.platform.slice(1) : 'Social') : (child.data.title || 'Link')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {block.type === 'image' && (
            <div style={{ 
              height: '100%', 
              width: '100%',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: `${page.theme.blockRadius}px`
            }}>
              {block.data.src ? (
                <>
                  <img 
                    src={block.data.src} 
                    alt={block.data.alt || 'Widget Image'} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      borderRadius: `${page.theme.blockRadius}px`
                    }}
                  />
                  {block.data.title && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                      padding: '24px 12px 10px 12px',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 700,
                      textAlign: 'left',
                      wordBreak: 'break-word',
                      pointerEvents: 'none',
                      fontFamily: page.theme.fontFamily || 'Inter'
                    }}>
                      {block.data.title}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '24px', color: '#9ca3af', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={24} />
                  <span>No Image Uploaded</span>
                </div>
              )}
            </div>
          )}

          {block.type === 'video' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: '-16px', overflow: 'hidden', borderRadius: `${page.theme.blockRadius}px` }}>
              <iframe 
                src={block.data.embedUrl} 
                style={{ border: 'none', width: '100%', height: '100%' }}
                title="Video embed"
              />
            </div>
          )}

          {block.type === 'contact' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: 4, color: '#444' }}>
              <span style={{ fontSize: 11, fontWeight: 700 }}>✉ Contact Details</span>
              {block.data.email && <span style={{ fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.data.email}</span>}
              {block.data.phone && <span style={{ fontSize: 10 }}>{block.data.phone}</span>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={styles.container} 
      style={{ 
        background: page.theme.backgroundType === 'image' ? '#0f172a' : page.theme.backgroundValue,
        color: (page.theme.backgroundType === 'image' || !page.theme.backgroundValue.includes('#ffffff')) ? '#ffffff' : '#1f2937',
        fontFamily: page.theme.fontFamily || 'Inter',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {page.theme.backgroundType === 'image' && page.theme.backgroundImageUrl && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${page.theme.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${page.theme.backgroundBlur || 0}px)`,
            transform: 'scale(1.1)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      )}
      <div className={styles.bentoSheet}>
        <div className={styles.bentoSplitLayout}>
          {/* Left profile Column */}
          <div className={styles.profileCol}>
            <div className={styles.avatar}>
              {page.avatarUrl ? (
                <img 
                  src={page.avatarUrl} 
                  alt={page.displayName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                />
              ) : (
                page.displayName ? page.displayName.charAt(0).toUpperCase() : '👤'
              )}
            </div>
            <h1 className={styles.displayName}>{page.displayName}</h1>
            {page.bio && <p className={styles.bioText}>{page.bio}</p>}
            
            <ConfettiButton
              onClick={handleCopyLink}
              className={styles.copyUrlBox}
              options={{
                particleCount: 80,
                spread: 60,
                colors: ['#5555f7', '#60a5fa', '#34d399', '#f43f5e', '#fbbf24', '#a855f7']
              }}
            >
              <span>{copied ? '✓ Copied' : `🔗 Resu.me/${page.slug}`}</span>
            </ConfettiButton>
          </div>

          {/* Right Column (Header + Snapping Content Grid Canvas) */}
          <div className={styles.rightCol}>
            {/* Header Row Container */}
            {page.blocks.filter(b => b.type === 'title').length > 0 && (
              <div className={styles.headerRow}>
                {page.blocks.filter(b => b.type === 'title').map(renderBlock)}
              </div>
            )}

            {/* Right widgets Grid */}
            <div className={styles.gridCanvas}>
              {(() => {
                const contentBlocks = page.blocks.filter(b => b.type !== 'title');
                const minY = contentBlocks.length > 0 ? Math.min(...contentBlocks.map(b => b.position.y)) : 0;
                let normalizedBlocks = minY > 0 
                  ? contentBlocks.map(b => ({ ...b, position: { ...b.position, y: b.position.y - minY } }))
                  : contentBlocks;
                normalizedBlocks = compactBlocksRows(normalizedBlocks);

                // Sort blocks by position for consistent order in responsive views
                const sortedBlocks = [...normalizedBlocks].sort((a, b) => {
                  if (a.position.y !== b.position.y) return a.position.y - b.position.y;
                  return a.position.x - b.position.x;
                });

                return sortedBlocks.map(renderBlock);
              })()}
            </div>
          </div>

          {/* Dummy hidden wrapper to skip the old map loop compilation */}
          <div style={{ display: 'none' }}>
            {(() => {
              const minY = 0;
              let normalizedBlocks: Block[] = [];
              return normalizedBlocks.map((block) => {
                const spans = getSizeSpans(block.size);
                const isInteractive = ['link', 'social', 'contact'].includes(block.type) || (block.type === 'image' && !!block.data.url);

                // High fidelity widget desaturated background styling
                let blockBg = 'white';
                let logoBg = '#f1f5f9';
                let logoColor = '#64748b';
                let brandColor = '#64748b';
                let buttonLabel = 'Visit';
                
                if (block.type === 'social') {
                  const plat = block.data.platform || '';
                  if (plat === 'linkedin') {
                    blockBg = '#eef4f8'; logoBg = '#0077b5'; logoColor = 'white'; brandColor = '#0077b5'; buttonLabel = 'Connect';
                  } else if (plat === 'twitter') {
                    blockBg = '#e8f5fe'; logoBg = '#1da1f2'; logoColor = 'white'; brandColor = '#1da1f2'; buttonLabel = 'Follow';
                  } else if (plat === 'youtube') {
                    blockBg = '#fef2f2'; logoBg = '#ff0000'; logoColor = 'white'; brandColor = '#ff0000'; buttonLabel = 'Subscribe';
                  } else if (plat === 'instagram') {
                    blockBg = '#fff0f3'; logoBg = '#e1306c'; logoColor = 'white'; brandColor = '#e1306c'; buttonLabel = 'Follow';
                  } else if (plat === 'github') {
                    blockBg = '#f6f8fa'; logoBg = '#181717'; logoColor = 'white'; brandColor = '#181717'; buttonLabel = 'Connect';
                  }
                }

                // Grid cell styling overrides
                const gridStyle: React.CSSProperties = {
                  gridColumn: `span ${spans.cols}`,
                  gridRow: `span ${spans.rows}`,
                  borderRadius: `${page.theme.blockRadius}px`,
                  border: block.type === 'title' ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: block.type === 'title' ? 'none' : (page.theme.blockShadow ? '0 4px 12px rgba(0, 0, 0, 0.03)' : 'none'),
                  backgroundColor: block.type === 'title' ? 'transparent' : blockBg,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: block.type === 'title' ? '4px 0' : '16px',
                  boxSizing: 'border-box',
                  alignSelf: block.type === 'title' ? 'start' : undefined
                };

                const handleBlockClick = () => {
                  if (block.data.url) {
                    window.open(block.data.url, '_blank', 'noopener,noreferrer');
                  }
                };

                return (
                  <div
                    key={block.id}
                    style={gridStyle}
                    onClick={isInteractive ? handleBlockClick : undefined}
                    className={`${styles.blockWrapper} ${isInteractive ? styles.blockWrapperInteractive : ''}`}
                  >
                    {/* Render block components */}
                    <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' }}>
                      {block.type === 'title' && (
                        <div 
                          className={styles.titleBlock}
                          style={{ 
                            justifyContent: block.data.align === 'center' ? 'center' : block.data.align === 'right' ? 'flex-end' : 'flex-start',
                            color: page.theme.backgroundValue.includes('#ffffff') ? '#333' : 'white'
                          }}
                        >
                          <h3 
                            style={{ 
                              margin: 0, 
                              fontWeight: 800,
                              fontSize: block.data.size === 'small' ? '12px' : block.data.size === 'large' ? '18px' : '14px',
                              opacity: 0.9
                            }}
                          >
                            {block.data.title || 'Category'}
                          </h3>
                        </div>
                      )}

                      {block.type === 'group' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', pointerEvents: 'auto' }}>
                          {block.data.title && (
                            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: '6px', color: 'inherit' }}>
                              {block.data.title}
                            </span>
                          )}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '6px', flex: 1, minHeight: 0 }}>
                            {Array.from({ length: 4 }).map((_, idx) => {
                              const child = block.data.groupBlocks?.[idx];
                              if (!child) {
                                return (
                                  <div 
                                    key={`empty-${idx}`} 
                                    style={{ 
                                      border: '1px dashed rgba(0,0,0,0.08)', 
                                      borderRadius: '8px', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      fontSize: '9px',
                                      color: '#aaa',
                                      background: 'rgba(0,0,0,0.01)'
                                    }}
                                  >
                                    Empty
                                  </div>
                                );
                              }

                              let childBg = '#f8fafc';
                              let childColor = '#334155';
                              if (child.type === 'social') {
                                const plat = child.data.platform || '';
                                if (plat === 'linkedin') { childBg = '#eef4f8'; childColor = '#0077b5'; }
                                else if (plat === 'twitter') { childBg = '#e8f5fe'; childColor = '#1da1f2'; }
                                else if (plat === 'youtube') { childBg = '#fef2f2'; childColor = '#ff0000'; }
                                else if (plat === 'instagram') { childBg = '#fff0f3'; childColor = '#e1306c'; }
                                else if (plat === 'github') { childBg = '#f6f8fa'; childColor = '#181717'; }
                              }

                              const handleChildClick = (e: React.MouseEvent) => {
                                e.stopPropagation();
                                if (child.data.url) {
                                  window.open(child.data.url, '_blank', 'noopener,noreferrer');
                                }
                              };

                              return (
                                <div 
                                  key={child.id}
                                  onClick={handleChildClick}
                                  style={{ 
                                    background: childBg, 
                                    color: childColor, 
                                    borderRadius: '8px', 
                                    padding: '4px 6px', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'center', 
                                    position: 'relative',
                                    border: '1px solid rgba(0,0,0,0.04)',
                                    cursor: child.data.url ? 'pointer' : 'default',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <span style={{ fontSize: '9px', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {child.type === 'social' ? (child.data.platform?.toUpperCase() || 'SOCIAL') : (child.data.title || 'Link')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {block.type === 'link' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                          <div className={styles.widgetHeader}>
                            <div className={styles.widgetLogoBox} style={{ background: brandColor, color: 'white' }}>
                              <Link2 size={13} />
                            </div>
                            <span className={styles.widgetTitle}>{block.data.title || 'My Link'}</span>
                          </div>
                        </div>
                      )}
                      {block.type === 'social' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                          {renderSocialIcon(block.data.platform || '')}
                          <div style={{ width: '100%', marginTop: 'auto' }}>
                            <span 
                              style={{ 
                                fontSize: '12px', 
                                fontWeight: 700, 
                                color: page.theme.backgroundValue.includes('#ffffff') ? '#1f2937' : '#ffffff', 
                                lineHeight: 1.25, 
                                wordBreak: 'break-word',
                                textAlign: 'left',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {block.data.username || page.displayName}
                            </span>
                          </div>
                        </div>
                      )}

                      {block.type === 'text' && (
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                          <p className={styles.widgetBodyText} style={{ fontStyle: 'italic', fontWeight: 500, color: '#374151' }}>
                            "{block.data.content || 'Standout quote'}"
                          </p>
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div style={{ 
                          width: 'calc(100% + 32px)',
                          height: 'calc(100% + 32px)',
                          margin: '-16px', 
                          overflow: 'hidden', 
                          borderRadius: `${page.theme.blockRadius}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          {block.data.src && (
                            <>
                              <img 
                                src={block.data.src} 
                                alt={block.data.alt || 'Widget Image'} 
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                  borderRadius: `${page.theme.blockRadius}px`
                                }}
                              />
                              {block.data.title && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                                  padding: '24px 12px 10px 12px',
                                  color: 'white',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textAlign: 'left',
                                  wordBreak: 'break-word',
                                  pointerEvents: 'none',
                                  fontFamily: page.theme.fontFamily || 'Inter'
                                }}>
                                  {block.data.title}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {block.type === 'video' && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: '-16px', overflow: 'hidden', borderRadius: `${page.theme.blockRadius}px` }}>
                          <iframe 
                            src={block.data.embedUrl} 
                            style={{ border: 'none', width: '100%', height: '100%' }}
                            title="Video embed"
                          />
                        </div>
                      )}

                      {block.type === 'contact' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: 4, color: '#444' }}>
                          <span style={{ fontSize: 11, fontWeight: 700 }}>✉ Contact Details</span>
                          {block.data.email && <span style={{ fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.data.email}</span>}
                          {block.data.phone && <span style={{ fontSize: 10 }}>{block.data.phone}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            })()}
          </div>
        </div>

        {/* Public page branding footer */}
        <div className={styles.publicFooter}>
          <a href="/" className={styles.publicFooterLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Create your own Bio Page
          </a>
        </div>
      </div>
    </div>
  );
}
