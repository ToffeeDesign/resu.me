import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';

import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Check,
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  X,
  Image as ImageIcon, 
  Video as VideoIcon, 
  Link2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  Heading, 
  Grid, 
  User, 
  Paintbrush, 
  Layers,
  Pencil,
  Monitor,
  Tablet,
  Smartphone,
  Sliders
} from 'lucide-react';
import styles from './LinktreeBuilder.module.css';
import { useResume, LinktreePage, Block, BlockType, BlockSize } from '@/context/ResumeContext';
import { TextField } from '@/components/UI/TextField';
import { ConfettiButton } from '@/registry/magicui/confetti';
import { copyToClipboard } from '@/utils/clipboard';
import { ColorPicker } from './ColorPicker';

export const getWidgetColorConfig = (blockType: string, platform?: string) => {
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

interface LinktreeBuilderProps {
  pageId: string;
  onBack: () => void;
}

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

const renderSocialIcon = (platform: string) => {
  const iconPath = getSocialIconPath(platform);
  const iconStyle = { width: 28, height: 28, objectFit: 'contain' as const, display: 'block', borderRadius: 6, flexShrink: 0 };

  if (iconPath) {
    return <img src={iconPath} alt={platform} style={iconStyle} />;
  }

  return (
    <div style={{ 
      width: 28, 
      height: 28, 
      borderRadius: 8, 
      backgroundColor: '#f1f5f9', 
      color: '#64748b', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Globe style={{ width: 14, height: 14 }} />
    </div>
  );
};

const resolveLayoutOverlaps = (blocks: Block[], activeBlockId: string): Block[] => {
  const activeBlock = blocks.find(b => b.id === activeBlockId);
  if (!activeBlock) return blocks;

  const otherBlocks = blocks
    .filter(b => b.id !== activeBlockId && b.data.visible !== false)
    .sort((a, b) => {
      if (a.position.y !== b.position.y) return a.position.y - b.position.y;
      return a.position.x - b.position.x;
    });

  const hiddenBlocks = blocks.filter(b => b.data.visible === false);
  const placed: Block[] = [{ ...activeBlock }];

  const checkOverlap = (x: number, y: number, cols: number, rows: number) => {
    if (x + cols > 4) return true;
    return placed.some(p => {
      const [pCols, pRows] = p.size.split('x').map(Number);
      return !(
        x + cols <= p.position.x ||
        p.position.x + pCols <= x ||
        y + rows <= p.position.y ||
        p.position.y + pRows <= y
      );
    });
  };

  otherBlocks.forEach(block => {
    const [bCols, bRows] = block.size.split('x').map(Number);

    let targetX = block.position.x;
    let targetY = block.position.y;

    while (checkOverlap(targetX, targetY, bCols, bRows)) {
      targetX++;
      if (targetX >= 4) {
        targetX = 0;
        targetY++;
      }
    }

    placed.push({
      ...block,
      position: { x: targetX, y: targetY }
    });
  });

  return blocks.map(originalBlock => {
    const resolved = placed.find(p => p.id === originalBlock.id);
    return resolved ? resolved : originalBlock;
  });
};

export function LinktreeBuilder({ pageId, onBack }: LinktreeBuilderProps) {
  const { linktreePages, saveLinktreePage: rawSaveLinktreePage } = useResume();
  const activePage = linktreePages.find(p => p.id === pageId);

  const saveLinktreePage = useCallback((updatedPage: LinktreePage) => {
    let normalizedBlocks = updatedPage.blocks;
    if (updatedPage.blocks.length > 0) {
      const minY = Math.min(...updatedPage.blocks.map(b => b.position.y));
      if (minY > 0) {
        normalizedBlocks = updatedPage.blocks.map(b => ({
          ...b,
          position: { ...b.position, y: b.position.y - minY }
        }));
      }
    }
    rawSaveLinktreePage({
      ...updatedPage,
      blocks: normalizedBlocks,
      updatedAt: new Date().toISOString()
    });
  }, [rawSaveLinktreePage]);

  // Expanded sections state tracker
  const [expandedSection, setExpandedSection] = useState<'profile' | 'theme' | 'add'>('profile');
  const [activeEditingBlockId, setActiveEditingBlockId] = useState<string | null>(null);
  const [profileLinkCopied, setProfileLinkCopied] = useState(false);
  // State to manage contextual popover positioning and boundary correction
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    zIndex: 999,
    width: '315px',
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Device Mode Preview Viewports
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('linktreeDeviceMode') as any) || 'desktop';
    }
    return 'desktop';
  });

  // Guest view vs Editor mode preview
  const [previewMode, setPreviewMode] = useState<'edit' | 'live'>('edit');

  // Intelligent dynamic popover positioning to prevent boundary clipping
  useLayoutEffect(() => {
    if (!activeEditingBlockId || !popoverRef.current) return;

    const popover = popoverRef.current;
    const viewport = popover.closest(`.${styles.browserViewport}`);
    if (!viewport) return;

    const updatePosition = () => {
      const popoverRect = popover.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();

      const newStyle: React.CSSProperties = {
        position: 'absolute',
        zIndex: 999,
        width: '315px',
      };

      // Check if popover top overflows viewport top border
      const verticalOverflowTop = popoverRect.top < viewportRect.top + 16;
      const horizontalOverflowLeft = popoverRect.left < viewportRect.left + 16;
      const horizontalOverflowRight = popoverRect.right > viewportRect.right - 16;

      if (verticalOverflowTop) {
        newStyle.top = 'calc(100% + 12px)';
        newStyle.bottom = 'auto';
      } else {
        newStyle.bottom = 'calc(100% + 12px)';
        newStyle.top = 'auto';
      }

      if (horizontalOverflowLeft) {
        newStyle.left = '0px';
        newStyle.transform = 'none';
        popover.style.setProperty('--popover-transform-start', 'translate(0, 8px) scale(0.95)');
        popover.style.setProperty('--popover-transform-end', 'translate(0, 0) scale(1)');
      } else if (horizontalOverflowRight) {
        newStyle.right = '0px';
        newStyle.left = 'auto';
        newStyle.transform = 'none';
        popover.style.setProperty('--popover-transform-start', 'translate(0, 8px) scale(0.95)');
        popover.style.setProperty('--popover-transform-end', 'translate(0, 0) scale(1)');
      } else {
        newStyle.left = '50%';
        newStyle.transform = 'translateX(-50%)';
        popover.style.setProperty('--popover-transform-start', 'translate(-50%, 8px) scale(0.95)');
        popover.style.setProperty('--popover-transform-end', 'translate(-50%, 0) scale(1)');
      }

      setPopoverStyle(newStyle);
    };

    updatePosition();

    // Recalculate position dynamically if popover content changes height
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });
    resizeObserver.observe(popover);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeEditingBlockId]);

  const handleSwitchDevice = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setDeviceMode(mode);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('linktreeDeviceMode', mode);
    }
  };

  // Custom Hex Color Picker
  const [customHex, setCustomHex] = useState('#ffffff');

  useEffect(() => {
    if (activePage && activePage.theme.backgroundType === 'solid' && activePage.theme.backgroundValue.startsWith('#')) {
      setCustomHex(activePage.theme.backgroundValue);
    }
  }, [activePage?.theme.backgroundValue, activePage?.theme.backgroundType]);

  // Custom Presets State (localStorage backed)
  const [customSolids, setCustomSolids] = useState<{ id: string; name: string; value: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('linktree_custom_solids');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [customGradients, setCustomGradients] = useState<{ id: string; name: string; value: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('linktree_custom_gradients');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Creator Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'solid' | 'gradient'>('solid');
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState<{ type: 'solid' | 'gradient'; id: string | null; name: string; value: string } | null>(null);
  
  // Custom Solid Color Editor State
  const [modalSolidColor, setModalSolidColor] = useState('#6366F1');

  // Custom Gradient Editor State
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientAngle, setGradientAngle] = useState(135);
  const [gradientStops, setGradientStops] = useState<{ color: string; offset: number }[]>([
    { color: '#6366F1', offset: 0 },
    { color: '#EC4899', offset: 100 }
  ]);
  const [selectedStopIdx, setSelectedStopIdx] = useState<number>(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const offset = Math.round((clickX / rect.width) * 100);
    
    if (gradientStops.length >= 5) return;
    
    const newStop = { color: '#3b82f6', offset };
    const updated = [...gradientStops, newStop].sort((a, b) => a.offset - b.offset);
    setGradientStops(updated);
    
    const newIdx = updated.findIndex(s => s.offset === offset);
    setSelectedStopIdx(newIdx >= 0 ? newIdx : 0);
  };

  const handleStopMouseDown = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setSelectedStopIdx(idx);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const dragX = moveEvent.clientX - rect.left;
      const offset = Math.max(0, Math.min(100, Math.round((dragX / rect.width) * 100)));
      
      setGradientStops(prev => {
        const updated = prev.map((s, i) => i === idx ? { ...s, offset } : s);
        return updated;
      });
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      setGradientStops(prev => {
        const sorted = [...prev].sort((a, b) => a.offset - b.offset);
        const currentStop = prev[idx];
        const newIdx = sorted.findIndex(s => s.color === currentStop.color && s.offset === currentStop.offset);
        if (newIdx >= 0) {
          setSelectedStopIdx(newIdx);
        }
        return sorted;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSaveCustomPreset = () => {
    const name = newPresetName.trim() || (modalMode === 'solid' ? 'Custom Solid' : 'Custom Gradient');

    if (modalMode === 'solid') {
      const value = modalSolidColor;
      if (editingPreset?.id) {
        // Update existing custom solid
        const updated = customSolids.map(p => p.id === editingPreset.id ? { ...p, name, value } : p);
        setCustomSolids(updated);
        if (typeof window !== 'undefined') localStorage.setItem('linktree_custom_solids', JSON.stringify(updated));
      } else {
        const newPreset = { id: Date.now().toString(), name, value };
        const updated = [...customSolids, newPreset];
        setCustomSolids(updated);
        if (typeof window !== 'undefined') localStorage.setItem('linktree_custom_solids', JSON.stringify(updated));
      }
      handleUpdateTheme({ backgroundType: 'solid', backgroundValue: value });
    } else {
      const stopsStr = gradientStops
        .slice()
        .sort((a, b) => a.offset - b.offset)
        .map(stop => `${stop.color} ${stop.offset}%`)
        .join(', ');
      const val = gradientType === 'linear' 
        ? `linear-gradient(${gradientAngle}deg, ${stopsStr})`
        : `radial-gradient(circle, ${stopsStr})`;

      if (editingPreset?.id) {
        // Update existing custom gradient
        const updated = customGradients.map(p => p.id === editingPreset.id ? { ...p, name, value: val } : p);
        setCustomGradients(updated);
        if (typeof window !== 'undefined') localStorage.setItem('linktree_custom_gradients', JSON.stringify(updated));
      } else {
        const newPreset = { id: Date.now().toString(), name, value: val };
        const updated = [...customGradients, newPreset];
        setCustomGradients(updated);
        if (typeof window !== 'undefined') localStorage.setItem('linktree_custom_gradients', JSON.stringify(updated));
      }
      handleUpdateTheme({ backgroundType: 'gradient', backgroundValue: val });
    }

    setIsModalOpen(false);
    setNewPresetName('');
    setEditingPreset(null);
  };

  const handleDeleteCustomPreset = (type: 'solid' | 'gradient', id: string | null) => {
    if (!id) return;
    if (type === 'solid') {
      const updated = customSolids.filter(p => p.id !== id);
      setCustomSolids(updated);
      if (typeof window !== 'undefined') localStorage.setItem('linktree_custom_solids', JSON.stringify(updated));
    } else {
      const updated = customGradients.filter(p => p.id !== id);
      setCustomGradients(updated);
      if (typeof window !== 'undefined') localStorage.setItem('linktree_custom_gradients', JSON.stringify(updated));
    }
  };

  // Parse a gradient CSS value back into stops + type + angle for editing
  const parseGradientValue = (val: string) => {
    const isRadial = val.startsWith('radial-gradient');
    const type: 'linear' | 'radial' = isRadial ? 'radial' : 'linear';
    let angle = 135;
    const stopsStr = val.replace(/^(linear|radial)-gradient\([^,]+,\s*/, '').replace(/\)$/, '');
    if (!isRadial) {
      const angleMatch = val.match(/(\d+)deg/);
      if (angleMatch) angle = parseInt(angleMatch[1]);
    }
    const stops = stopsStr.split(',').map(s => {
      const parts = s.trim().split(/\s+/);
      const color = parts[0];
      const offset = parts[1] ? parseInt(parts[1]) : 0;
      return { color, offset };
    }).filter(s => s.color.startsWith('#'));
    return { type, angle, stops: stops.length >= 2 ? stops : [{ color: '#6366f1', offset: 0 }, { color: '#ec4899', offset: 100 }] };
  };

  const openPresetEditor = (mode: 'solid' | 'gradient', preset: { id: string | null; name: string; value: string }) => {
    setModalMode(mode);
    setEditingPreset({ type: mode, ...preset });
    setNewPresetName(preset.name);
    if (mode === 'solid') {
      setModalSolidColor(preset.value);
    } else {
      const parsed = parseGradientValue(preset.value);
      setGradientType(parsed.type);
      setGradientAngle(parsed.angle);
      setGradientStops(parsed.stops);
      setSelectedStopIdx(0);
    }
    setIsModalOpen(true);
  };

  // Drag and resize canvas metrics
  const [dragBlockId, setDragBlockId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartCoords, setDragStartCoords] = useState({ x: 0, y: 0 });
  const [dragInitialBlockCoords, setDragInitialBlockCoords] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const cellWidthRef = useRef(112);
  const cellHeightRef = useRef(112);

  // Resize block sizes metrics
  const [resizeBlockId, setResizeBlockId] = useState<string | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState<BlockSize>('1x1');
  const [resizeSpans, setResizeSpans] = useState<{ cols: number; rows: number }>({ cols: 1, rows: 1 });

  // Sanitize legacy sizes if any
  useEffect(() => {
    if (activePage && activePage.blocks.some(b => b.id.includes('linkedin') && b.size === '1x2')) {
      const sanitizedBlocks = activePage.blocks.map(b => b.id.includes('linkedin') ? { ...b, size: '1x1' as const } : b);
      saveLinktreePage({
        ...activePage,
        blocks: sanitizedBlocks
      });
    }
  }, [activePage, saveLinktreePage]);

  if (!activePage) {
    return (
      <div className={styles.container}>
        <p>No active Linktree profile details found. Please go back.</p>
        <button onClick={onBack} className={styles.secondaryBtn}>Go Back</button>
      </div>
    );
  }

  const handleUpdateProfile = (fields: Partial<LinktreePage>) => {
    saveLinktreePage({
      ...activePage,
      ...fields
    });
  };

  const handleUpdateTheme = (fields: Partial<LinktreePage['theme']>) => {
    saveLinktreePage({
      ...activePage,
      theme: {
        ...activePage.theme,
        ...fields
      }
    });
  };

  const getSizeSpans = (size: BlockSize) => {
    const [c, r] = size.split('x').map(Number);
    return { cols: c || 1, rows: r || 1 };
  };

  // Add block helper
  const handleAddBlock = (type: BlockType) => {
    const defaultData: Block['data'] = { visible: true };
    if (type === 'social') {
      defaultData.platform = 'twitter';
      defaultData.url = 'https://twitter.com';
    } else if (type === 'link') {
      defaultData.title = 'Custom Link';
      defaultData.url = 'https://link.com';
      defaultData.icon = 'Globe';
    } else if (type === 'title') {
      defaultData.title = 'New Category Section';
      defaultData.size = 'medium';
      defaultData.align = 'left';
    } else if (type === 'text') {
      defaultData.content = 'A standout tagline quote card...';
    } else if (type === 'image') {
      defaultData.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300';
      defaultData.alt = 'Uploaded image';
      defaultData.url = '';
      defaultData.align = 'center';
    } else if (type === 'video') {
      defaultData.embedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    } else if (type === 'contact') {
      defaultData.email = 'hello@example.com';
      defaultData.phone = '+1234567890';
    } else if (type === 'group') {
      defaultData.title = 'My Block Group';
      defaultData.groupBlocks = [];
    }

    // Find grid vacancy
    let targetX = 0;
    let targetY = 0;
    let vacant = false;

    while (!vacant && targetY < 4) {
      const occupied = activePage.blocks.some(b => {
        if (!b.data.visible) return false;
        const spans = getSizeSpans(b.size);
        const bx = b.position.x;
        const by = b.position.y;
        return (
          targetX >= bx && targetX < bx + spans.cols &&
          targetY >= by && targetY < by + spans.rows
        );
      });

      if (!occupied) {
        vacant = true;
      } else {
        targetX++;
        if (targetX >= 4) {
          targetX = 0;
          targetY++;
        }
      }
    }

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      size: type === 'title' ? '4x1' : type === 'group' ? '2x2' : type === 'social' ? '1x1' : (type === 'link' || type === 'contact' || type === 'text') ? '2x1' : '1x1',
      position: { x: targetX, y: targetY },
      data: defaultData,
      order: activePage.blocks.length
    };

    saveLinktreePage({
      ...activePage,
      blocks: [...activePage.blocks, newBlock]
    });
  };

  const handleUpdateBlockData = (blockId: string, data: Partial<Block['data']>) => {
    saveLinktreePage({
      ...activePage,
      blocks: activePage.blocks.map(b => b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b)
    });
  };

  const handleUpdateBlockSize = (blockId: string, size: BlockSize) => {
    const updatedBlocks = activePage.blocks.map(b => b.id === blockId ? { ...b, size } : b);
    const resolvedBlocks = resolveLayoutOverlaps(updatedBlocks, blockId);
    saveLinktreePage({
      ...activePage,
      blocks: resolvedBlocks
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleUpdateBlockData(blockId, { src: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDuplicateBlock = (block: Block) => {
    const duplicated: Block = {
      ...block,
      id: `block-dup-${Date.now()}`,
      position: { x: (block.position.x + 1) % 3, y: block.position.y + 1 },
      order: activePage.blocks.length
    };
    saveLinktreePage({
      ...activePage,
      blocks: [...activePage.blocks, duplicated]
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    saveLinktreePage({
      ...activePage,
      blocks: activePage.blocks.filter(b => b.id !== blockId)
    });
  };

  const handleRemoveFromGroup = (groupId: string, childId: string) => {
    const group = activePage.blocks.find(b => b.id === groupId);
    const child = group?.data.groupBlocks?.find(c => c.id === childId);
    if (group && child) {
      // Find vacancy in main grid
      let targetX = 0;
      let targetY = 0;
      let vacant = false;
      while (!vacant && targetY < 4) {
        const occupied = activePage.blocks.some(b => {
          if (!b.data.visible) return false;
          const spans = getSizeSpans(b.size);
          return (
            targetX >= b.position.x && targetX < b.position.x + spans.cols &&
            targetY >= b.position.y && targetY < b.position.y + spans.rows
          );
        });
        if (!occupied) vacant = true;
        else {
          targetX++;
          if (targetX >= 4) { targetX = 0; targetY++; }
        }
      }
      const restoredBlock: Block = {
        ...child,
        position: { x: targetX, y: targetY }
      };
      saveLinktreePage({
        ...activePage,
        blocks: [
          ...activePage.blocks.map(b => b.id === groupId ? { ...b, data: { ...b.data, groupBlocks: b.data.groupBlocks?.filter(c => c.id !== childId) } } : b),
          restoredBlock
        ]
      });
    }
  };

  const renderBlockEditor = (block: Block) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {block.type === 'title' && (
          <>
            <TextField 
              label="Title Text"
              value={block.data.title || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { title: e.target.value })}
              placeholder="Title Text"
              fullWidth
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <div className={styles.selectWrapper} style={{ flex: 1 }}>
                <select 
                  className={styles.inputField}
                  value={block.data.size || 'medium'}
                  onChange={(e) => handleUpdateBlockData(block.id, { size: e.target.value as any })}
                >
                  <option value="small">Small size</option>
                  <option value="medium">Medium size</option>
                  <option value="large">Large size</option>
                </select>
              </div>
              <div className={styles.selectWrapper} style={{ flex: 1 }}>
                <select 
                  className={styles.inputField}
                  value={block.data.align || 'left'}
                  onChange={(e) => handleUpdateBlockData(block.id, { align: e.target.value as any })}
                >
                  <option value="left">Align Left</option>
                  <option value="center">Align Center</option>
                  <option value="right">Align Right</option>
                </select>
              </div>
            </div>
          </>
        )}

        {block.type === 'link' && (
          <>
            <TextField 
              label="Link Title"
              value={block.data.title || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { title: e.target.value })}
              placeholder="Link Title"
              fullWidth
            />
            <TextField 
              label="Link URL"
              value={block.data.url || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { url: e.target.value })}
              placeholder="https://yourlink.com"
              fullWidth
            />
          </>
        )}

        {block.type === 'social' && (
          <>
            <div className={styles.selectWrapper}>
              <select
                className={styles.inputField}
                value={block.data.platform || 'twitter'}
                onChange={(e) => handleUpdateBlockData(block.id, { platform: e.target.value })}
              >
                <option value="500px">500px</option>
                <option value="adobe_portfolio">Adobe Portfolio</option>
                <option value="behance">Behance</option>
                <option value="discord">Discord</option>
                <option value="dribbble">Dribbble</option>
                <option value="dropbox">Dropbox</option>
                <option value="facebook">Facebook</option>
                <option value="figma">Figma</option>
                <option value="flickr">Flickr</option>
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
                <option value="google">Google</option>
                <option value="google_my_business">Google My Business</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="medium">Medium</option>
                <option value="ok">OK.ru</option>
                <option value="pinterest">Pinterest</option>
                <option value="signal">Signal</option>
                <option value="skype">Skype</option>
                <option value="slack">Slack</option>
                <option value="telegram">Telegram</option>
                <option value="tik_tok">TikTok</option>
                <option value="tumblr">Tumblr</option>
                <option value="twitter">X / Twitter</option>
                <option value="twitch">Twitch</option>
                <option value="vimeo">Vimeo</option>
                <option value="vk">VK</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="yandex_zen">Yandex Zen</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <TextField 
              label="Label / Description"
              value={block.data.username || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { username: e.target.value })}
              placeholder="e.g. Chavda mahmadjakir"
              fullWidth
            />
            <TextField 
              label="Profile Link URL"
              value={block.data.url || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { url: e.target.value })}
              placeholder="Profile Link URL"
              fullWidth
            />
          </>
        )}

        {block.type === 'group' && (
          <>
            <TextField 
              label="Group Title (Optional)"
              value={block.data.title || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { title: e.target.value })}
              placeholder="Group Title (Optional)"
              fullWidth
            />
            <div style={{ marginTop: 2 }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#666' }}>Nested Blocks (Max 4)</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                <button 
                  type="button" 
                  onClick={() => {
                    const updated = [...(block.data.groupBlocks || [])];
                    if (updated.length < 4) {
                      updated.push({
                        id: `block-child-${Date.now()}`,
                        type: 'social',
                        size: '1x1',
                        position: { x: 0, y: 0 },
                        data: { platform: 'twitter', url: 'https://twitter.com', visible: true },
                        order: updated.length
                      });
                      handleUpdateBlockData(block.id, { groupBlocks: updated });
                    }
                  }}
                  className={styles.overlayBtn}
                  style={{ fontSize: '9px', padding: '2px 6px', width: 'auto', height: 'auto' }}
                  disabled={(block.data.groupBlocks?.length || 0) >= 4}
                >
                  + Social
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    const updated = [...(block.data.groupBlocks || [])];
                    if (updated.length < 4) {
                      updated.push({
                        id: `block-child-${Date.now()}`,
                        type: 'link',
                        size: '1x1',
                        position: { x: 0, y: 0 },
                        data: { title: 'Nested Link', url: 'https://link.com', visible: true },
                        order: updated.length
                      });
                      handleUpdateBlockData(block.id, { groupBlocks: updated });
                    }
                  }}
                  className={styles.overlayBtn}
                  style={{ fontSize: '9px', padding: '2px 6px', width: 'auto', height: 'auto' }}
                  disabled={(block.data.groupBlocks?.length || 0) >= 4}
                >
                  + Link
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, maxHeight: '120px', overflowY: 'auto' }}>
                {(block.data.groupBlocks || []).map((child) => (
                  <div key={child.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', background: '#fafafa', border: '1px solid #eee', borderRadius: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>{child.type === 'social' ? child.data.platform : child.data.title}</span>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button 
                        type="button"
                        onClick={() => handleRemoveFromGroup(block.id, child.id)} 
                        className={styles.overlayBtn} 
                        style={{ padding: 0, fontSize: '9px', width: 16, height: 16 }}
                      >
                        ←
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = (block.data.groupBlocks || []).filter(c => c.id !== child.id);
                          handleUpdateBlockData(block.id, { groupBlocks: updated });
                        }} 
                        className={`${styles.overlayBtn} ${styles.overlayBtnDanger}`} 
                        style={{ padding: 0, fontSize: '9px', width: 16, height: 16 }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {block.type === 'text' && (
          <textarea 
            className={styles.inputField} 
            style={{ minHeight: '50px', fontSize: '11px' }}
            value={block.data.content || ''} 
            onChange={(e) => handleUpdateBlockData(block.id, { content: e.target.value })}
            placeholder="Quote text content"
          />
        )}

        {block.type === 'image' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--color-neutral-600))' }}>Image File</label>
            
            {/* Interactive Preview Box and Actions */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div 
                onClick={() => {
                  if (block.data.src) {
                    handleUpdateBlockData(block.id, { src: '' });
                  } else {
                    const el = document.getElementById(`image-upload-${block.id}`);
                    el?.click();
                  }
                }}
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  backgroundColor: '#f3f4f6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1.5px solid #e5e7eb',
                  flexShrink: 0,
                  position: 'relative',
                  cursor: 'pointer'
                }}
                className={styles.smartAvatarCircle}
              >
                {block.data.src ? (
                  <img 
                    src={block.data.src} 
                    alt="Image Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#9ca3af' }}>
                    🖼️
                  </span>
                )}
                
                <div className={styles.avatarHoverOverlay} style={{ borderRadius: '8px' }}>
                  {block.data.src ? (
                    <Trash2 size={18} style={{ color: 'white' }} />
                  ) : (
                    <Plus size={18} style={{ color: 'white' }} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                <span style={{ fontSize: '11px', color: 'hsl(var(--color-neutral-500))', lineHeight: '1.4' }}>
                  Click preview image to upload or delete.<br />
                  Supports PNG, JPG, JPEG. Max 5MB.
                </span>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              id={`image-upload-${block.id}`}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleImageUpload(e, block.id)}
            />

            <TextField 
              label="Image Title / Label"
              value={block.data.title || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { title: e.target.value })}
              placeholder="e.g. My Workspace Layout"
              fullWidth
            />

            <TextField 
              label="Alt Text description"
              value={block.data.alt || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { alt: e.target.value })}
              placeholder="Alt description for screen readers"
              fullWidth
            />

            <TextField 
              label="Redirect URL (Optional)"
              value={block.data.url || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { url: e.target.value })}
              placeholder="https://example.com"
              fullWidth
            />
          </div>
        )}

        {block.type === 'video' && (
          <TextField 
            label="YouTube Video Link"
            value={block.data.embedUrl || ''} 
            onChange={(e) => handleUpdateBlockData(block.id, { embedUrl: e.target.value })}
            placeholder="YouTube Embed iframe src link"
            fullWidth
          />
        )}

        {block.type === 'contact' && (
          <>
            <TextField 
              label="Email Address"
              value={block.data.email || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { email: e.target.value })}
              placeholder="email@example.com"
              fullWidth
            />
            <TextField 
              label="Phone Number"
              value={block.data.phone || ''} 
              onChange={(e) => handleUpdateBlockData(block.id, { phone: e.target.value })}
              placeholder="Phone Contact Details"
              fullWidth
            />
          </>
        )}
        {block.type !== 'title' && (
          <div className={styles.formGroup} style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid hsl(var(--color-neutral-200))' }}>
            <label className={styles.formLabel}>Widget Background Color</label>
            <ColorPicker
              color={block.data.bgColor || getWidgetColorConfig(block.type, block.data.platform).tint}
              onChange={(newVal) => handleUpdateBlockData(block.id, { bgColor: newVal })}
            />
          </div>
        )}
      </div>
    );
  };

  // Drag handles
  const handleBlockMouseDown = (e: React.MouseEvent, block: Block) => {
    if (resizeBlockId) return;
    const canvasEl = document.querySelector(`.${styles.gridCanvas}`);
    if (canvasEl) {
      const rect = canvasEl.getBoundingClientRect();
      const cellW = (rect.width - 36) / 4;
      cellWidthRef.current = cellW + 12;
      cellHeightRef.current = 112;
    }
    setDragBlockId(block.id);
    setDragStartCoords({ x: e.clientX, y: e.clientY });
    setDragInitialBlockCoords({ x: block.position.x, y: block.position.y });
    setDragOffset({ x: 0, y: 0 });
    e.preventDefault();
  };

  // Resize handles
  const handleResizeMouseDown = (e: React.MouseEvent, block: Block) => {
    e.stopPropagation();
    e.preventDefault();
    const canvasEl = document.querySelector(`.${styles.gridCanvas}`);
    if (canvasEl) {
      const rect = canvasEl.getBoundingClientRect();
      const cellW = (rect.width - 36) / 4;
      cellWidthRef.current = cellW + 12;
      cellHeightRef.current = 112;
    }
    setResizeBlockId(block.id);
    setResizeStartSize(block.size);
    setResizeSpans(getSizeSpans(block.size));
    setDragStartCoords({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragBlockId) {
        const deltaX = e.clientX - dragStartCoords.x;
        const deltaY = e.clientY - dragStartCoords.y;
        
        // Snap grid coordinates divisor matching cells measured dynamically
        const gridDiffX = Math.round(deltaX / cellWidthRef.current);
        const gridDiffY = Math.round(deltaY / cellHeightRef.current);

        setDragOffset({ x: gridDiffX, y: gridDiffY });
      }

      if (resizeBlockId) {
        const deltaX = e.clientX - dragStartCoords.x;
        const deltaY = e.clientY - dragStartCoords.y;

        const currentSpans = getSizeSpans(resizeStartSize);
        const additionalCols = Math.round(deltaX / cellWidthRef.current);
        const additionalRows = Math.round(deltaY / cellHeightRef.current);

        const resizingBlock = activePage.blocks.find(b => b.id === resizeBlockId);
        const newCols = Math.max(1, Math.min(4, currentSpans.cols + additionalCols));
        const newRows = resizingBlock?.type === 'title' 
          ? 1 
          : Math.max(1, Math.min(4, currentSpans.rows + additionalRows));

        setResizeSpans({ cols: newCols, rows: newRows });
      }
    };

    const handleMouseUp = () => {
      if (dragBlockId) {
        const block = activePage.blocks.find(b => b.id === dragBlockId);
        if (block) {
          if (dragOffset.x === 0 && dragOffset.y === 0) {
            setDragBlockId(null);
            setDragOffset({ x: 0, y: 0 });
            return;
          }

          const spans = getSizeSpans(block.size);
          const finalX = Math.max(0, Math.min(4 - spans.cols, dragInitialBlockCoords.x + dragOffset.x));
          const finalY = Math.max(0, Math.min(4 - spans.rows, dragInitialBlockCoords.y + dragOffset.y));

          // Check if dropped onto a group block
          const targetGroup = activePage.blocks.find(b => {
            if (b.type !== 'group' || b.id === dragBlockId) return false;
            const gSpans = getSizeSpans(b.size);
            return (
              finalX >= b.position.x && finalX < b.position.x + gSpans.cols &&
              finalY >= b.position.y && finalY < b.position.y + gSpans.rows
            );
          });

          if (targetGroup && (targetGroup.data.groupBlocks?.length || 0) < 4) {
            const updatedGroupBlocks = [...(targetGroup.data.groupBlocks || []), { ...block, position: { x: 0, y: 0 } }];
            saveLinktreePage({
              ...activePage,
              blocks: activePage.blocks
                .filter(b => b.id !== dragBlockId)
                .map(b => b.id === targetGroup.id ? { ...b, data: { ...b.data, groupBlocks: updatedGroupBlocks } } : b)
            });
          } else {
            const updatedBlocks = activePage.blocks.map(b => b.id === dragBlockId ? { ...b, position: { x: finalX, y: finalY } } : b);
            const resolvedBlocks = resolveLayoutOverlaps(updatedBlocks, dragBlockId);
            saveLinktreePage({
              ...activePage,
              blocks: resolvedBlocks
            });
          }
        }
        setDragBlockId(null);
      }

      if (resizeBlockId) {
        const finalSize: BlockSize = `${resizeSpans.cols}x${resizeSpans.rows}`;
        const updatedBlocks = activePage.blocks.map(b => b.id === resizeBlockId ? { ...b, size: finalSize } : b);
        const resolvedBlocks = resolveLayoutOverlaps(updatedBlocks, resizeBlockId);
        saveLinktreePage({
          ...activePage,
          blocks: resolvedBlocks
        });
        setResizeBlockId(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragBlockId, dragStartCoords, dragInitialBlockCoords, dragOffset, resizeBlockId, resizeStartSize, resizeSpans, activePage, saveLinktreePage]);



  const defaultSolids = [
    { name: 'Pure Snow', value: '#ffffff' },
    { name: 'Dark Velvet', value: '#0f172a' },
    { name: 'Soft Gray', value: '#f3f4f6' },
    { name: 'Ocean Blue', value: '#3b82f6' },
    { name: 'Emerald', value: '#10b981' }
  ];

  const defaultGradients = [
    { name: 'Pastel Dream', value: 'linear-gradient(135deg, #fef08a 0%, #f472b6 100%)' },
    { name: 'Deep Purple', value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
    { name: 'Sunset Orange', value: 'linear-gradient(135deg, #f97316 0%, #e11d48 100%)' },
    { name: 'Forest Mint', value: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' },
    { name: 'Midnight', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }
  ];

  return (
    <div className={styles.editorContainer} onClick={() => setSelectedBlockId(null)}>
      {/* Editor Topbar */}
      <header className={styles.topbar} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Back button */}
          <button
            className={styles.backBtn}
            onClick={onBack}
            aria-label="Back to Link Pages"
            title="Back to Link Pages"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>My Link Pages</span>
          </button>

          <span className={styles.breadcrumbDivider}>›</span>

          {/* Page Link label */}
          <div className={styles.resumeNameWrap} title="Your Linktree Address">
            <span className={styles.resumeNameLabel}>
              Resu.me/{activePage.slug}
            </span>
          </div>
        </div>

        <div className={styles.topbarActions}>
          {/* Inline Device Preview Toggle */}
          <button
            type="button"
            onClick={() => handleSwitchDevice(deviceMode === 'desktop' ? 'mobile' : 'desktop')}
            className={styles.deviceInlineSingleBtnTopbar}
            title={`Switch to ${deviceMode === 'desktop' ? 'Mobile' : 'Desktop'} Preview`}
          >
            {deviceMode === 'desktop' ? <Smartphone size={16} /> : <Monitor size={16} />}
          </button>

          <a 
            href={`/u/${activePage.slug}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.saveBtn}
            style={{ textDecoration: 'none' }}
          >
            View Live Page
          </a>
        </div>
      </header>

      {/* Main Workspace Split */}
      <div className={styles.builderWrapper}>
        {/* Left Editor Panel */}
        <div className={styles.editorPanel} onClick={(e) => e.stopPropagation()}>
          {activeEditingBlockId ? (() => {
            const block = activePage.blocks.find(b => b.id === activeEditingBlockId);
            if (!block) return null;
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid hsl(var(--color-neutral-200))' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--color-neutral-800))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Edit {block.type} Block
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setActiveEditingBlockId(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'hsl(var(--color-neutral-500))',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 4,
                      borderRadius: '50%',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--color-neutral-100))'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Close editor"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className={styles.scrollArea}>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {renderBlockEditor(block)}
                    <button
                      type="button"
                      onClick={() => setActiveEditingBlockId(null)}
                      style={{
                        marginTop: 12,
                        padding: '10px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'hsl(var(--color-primary))',
                        color: 'white',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '13px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--color-primary-dark))'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--color-primary))'}
                    >
                      Done Editing
                    </button>
                  </div>
                </div>
              </>
            );
          })() : (
            <>
              <div className={styles.tabContainer}>
            <button 
              type="button" 
              onClick={() => setExpandedSection('profile')}
              className={`${styles.tabButton} ${expandedSection === 'profile' ? styles.tabButtonActive : ''}`}
            >
              Profile
            </button>
            <button 
              type="button" 
              onClick={() => setExpandedSection('theme')}
              className={`${styles.tabButton} ${expandedSection === 'theme' ? styles.tabButtonActive : ''}`}
            >
              Theme
            </button>
            <button 
              type="button" 
              onClick={() => setExpandedSection('add')}
              className={`${styles.tabButton} ${expandedSection === 'add' ? styles.tabButtonActive : ''}`}
            >
              Widgets
            </button>
          </div>

          <div className={styles.scrollArea}>
            <div key={expandedSection} className={styles.tabContent}>
              {/* 1. Profile Category Editor */}
              {expandedSection === 'profile' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Profile Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div 
                        onClick={() => {
                          if (activePage.avatarUrl) {
                            handleUpdateProfile({ avatarUrl: '' });
                          } else {
                            fileInputRef.current?.click();
                          }
                        }}
                        style={{ 
                          width: '64px', 
                          height: '64px', 
                          borderRadius: '50%', 
                          overflow: 'hidden', 
                          backgroundColor: '#f3f4f6', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '1.5px solid #e5e7eb',
                          flexShrink: 0,
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                        className={styles.smartAvatarCircle}
                      >
                        {activePage.avatarUrl ? (
                          <img 
                            src={activePage.avatarUrl} 
                            alt="Profile Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <span style={{ fontSize: '20px', fontWeight: '800', color: '#9ca3af' }}>
                            {activePage.displayName ? activePage.displayName.charAt(0).toUpperCase() : '👤'}
                          </span>
                        )}

                        <div className={styles.avatarHoverOverlay}>
                          {activePage.avatarUrl ? (
                            <Trash2 size={18} style={{ color: 'white' }} />
                          ) : (
                            <Plus size={18} style={{ color: 'white' }} />
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                        <span style={{ fontSize: '11px', color: 'hsl(var(--color-neutral-500))', lineHeight: '1.4' }}>
                          Click avatar to upload/remove.<br />
                          Supports PNG, JPG. Max 5MB.
                        </span>
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".png, .jpg, .jpeg" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handleUpdateProfile({ avatarUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  <TextField 
                    label="Display Name"
                    value={activePage.displayName} 
                    onChange={(e) => handleUpdateProfile({ displayName: e.target.value })}
                    fullWidth
                  />

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Short Bio Tagline</label>
                    <textarea 
                      value={activePage.bio || ''} 
                      onChange={(e) => handleUpdateProfile({ bio: e.target.value })}
                      placeholder="Write a short bio to introduce yourself."
                      className={styles.inputField}
                      style={{ minHeight: '60px', resize: 'vertical' }}
                    />
                  </div>
                </>
              )}

              {/* 2. Theme Canvas Stylings */}
              {expandedSection === 'theme' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className={styles.themeCard}>
                    <label className={styles.modalSectionTitle}>Solid Colors</label>
                    <div className={styles.presetGrid}>
                      {[...defaultSolids, ...customSolids].map((preset, idx) => {
                        const isActive = activePage.theme.backgroundType === 'solid' && activePage.theme.backgroundValue === preset.value;
                        const isCustom = 'id' in preset;
                        return (
                          <div key={idx} className={styles.presetSwatchWrapper}>
                            <button
                              type="button"
                              onClick={() => handleUpdateTheme({ backgroundType: 'solid', backgroundValue: preset.value })}
                              className={`${styles.presetSwatch} ${isActive ? styles.presetSwatchActive : ''}`}
                              style={{ backgroundColor: preset.value }}
                              title={preset.name}
                            />
                            {/* Edit button — shown for all presets */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPresetEditor('solid', { id: isCustom ? (preset as any).id : null, name: preset.name, value: preset.value });
                              }}
                              className={styles.presetEditBtn}
                              title="Edit color"
                            >
                              <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                            </button>
                            {isCustom && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomPreset('solid', (preset as any).id);
                                }}
                                className={styles.presetDeleteBtn}
                                title="Delete Preset"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        );
                      })}
                      <div className={styles.presetSwatchWrapper}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPreset(null);
                            setModalMode('solid');
                            setNewPresetName('');
                            setModalSolidColor(activePage.theme.backgroundValue.startsWith('#') ? activePage.theme.backgroundValue : '#6366f1');
                            setIsModalOpen(true);
                          }}
                          className={styles.addNewPresetBtn}
                          title="Add Custom Solid Color"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.themeCard}>
                    <label className={styles.modalSectionTitle}>Gradients</label>
                    <div className={styles.presetGrid}>
                      {[...defaultGradients, ...customGradients].map((preset, idx) => {
                        const isActive = activePage.theme.backgroundType === 'gradient' && activePage.theme.backgroundValue === preset.value;
                        const isCustom = 'id' in preset;
                        return (
                          <div key={idx} className={styles.presetSwatchWrapper}>
                            <button
                              type="button"
                              onClick={() => handleUpdateTheme({ backgroundType: 'gradient', backgroundValue: preset.value })}
                              className={`${styles.presetSwatch} ${isActive ? styles.presetSwatchActive : ''}`}
                              style={{ background: preset.value }}
                              title={preset.name}
                            />
                            {/* Edit button — shown for all presets */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPresetEditor('gradient', { id: isCustom ? (preset as any).id : null, name: preset.name, value: preset.value });
                              }}
                              className={styles.presetEditBtn}
                              title="Edit gradient"
                            >
                              <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                            </button>
                            {isCustom && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomPreset('gradient', (preset as any).id);
                                }}
                                className={styles.presetDeleteBtn}
                                title="Delete Preset"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        );
                      })}
                      <div className={styles.presetSwatchWrapper}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPreset(null);
                            setModalMode('gradient');
                            setNewPresetName('');
                            setGradientType('linear');
                            setGradientAngle(135);
                            setGradientStops([
                              { color: '#6366f1', offset: 0 },
                              { color: '#ec4899', offset: 100 }
                            ]);
                            setIsModalOpen(true);
                          }}
                          className={styles.addNewPresetBtn}
                          title="Add Custom Gradient"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>


                  <div className={styles.themeCard}>
                    <label className={styles.modalSectionTitle}>Background Image</label>
                    
                    {activePage.theme.backgroundImageUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{
                          width: '60px',
                          height: '40px',
                          borderRadius: '6px',
                          border: '1px solid hsl(var(--color-neutral-200))',
                          backgroundImage: `url(${activePage.theme.backgroundImageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          flexShrink: 0
                        }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--color-neutral-800))' }}>Custom Image BG</span>
                          <button 
                            type="button"
                            onClick={() => {
                              handleUpdateTheme({ 
                                backgroundType: 'solid', 
                                backgroundValue: '#ffffff',
                                backgroundImageUrl: '' 
                              });
                            }}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#ef4444', 
                              fontSize: '11px', 
                              fontWeight: 700, 
                              cursor: 'pointer',
                              padding: 0,
                              textAlign: 'left'
                            }}
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button
                          type="button"
                          onClick={() => bgImageInputRef.current?.click()}
                          className={styles.addStopBtn}
                          style={{ flex: 1, padding: '8px 12px' }}
                        >
                          <ImageIcon size={14} /> Upload Background
                        </button>
                        <input 
                          type="file"
                          ref={bgImageInputRef}
                          accept=".png, .jpg, .jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleUpdateTheme({
                                  backgroundType: 'image',
                                  backgroundImageUrl: reader.result as string
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}


                    {/* Blur Slider */}
                    {activePage.theme.backgroundType === 'image' && activePage.theme.backgroundImageUrl && (
                      <div className={styles.formGroup} style={{ marginTop: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label className={styles.formLabel}>Image Blur: {activePage.theme.backgroundBlur || 0}px</label>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="25" 
                          value={activePage.theme.backgroundBlur || 0} 
                          className={styles.radiusSlider}
                          onChange={(e) => handleUpdateTheme({ backgroundBlur: parseInt(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>

                  <div className={styles.themeCard}>
                    <label className={styles.modalSectionTitle}>Widget Border Radius</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {/* Rounded Corners */}
                      <button
                        type="button"
                        onClick={() => {
                          if (activePage.theme.blockRadius === 0) {
                            handleUpdateTheme({ blockRadius: 20 });
                          }
                        }}
                        className={`${styles.radiusOptionBtn} ${activePage.theme.blockRadius > 0 ? styles.radiusOptionBtnActive : ''}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                          <rect x="1.5" y="1.5" width="13" height="13" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                        <span>Rounded Corners</span>
                      </button>

                      {/* Square */}
                      <button
                        type="button"
                        onClick={() => handleUpdateTheme({ blockRadius: 0 })}
                        className={`${styles.radiusOptionBtn} ${activePage.theme.blockRadius === 0 ? styles.radiusOptionBtnActive : ''}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                          <rect x="1.5" y="1.5" width="13" height="13" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                        <span>Square</span>
                      </button>
                    </div>

                    {activePage.theme.blockRadius > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={styles.formLabel} style={{ fontSize: '11px', color: 'hsl(var(--color-neutral-500))' }}>Radius Size: {activePage.theme.blockRadius}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="4" 
                          max="28" 
                          value={activePage.theme.blockRadius} 
                          className={styles.radiusSlider}
                          onChange={(e) => handleUpdateTheme({ blockRadius: parseInt(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>

                  <div className={styles.themeCard} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label className={styles.formLabel} style={{ cursor: 'pointer' }} htmlFor="blockShadow">Enable Card Shadows</label>
                    <input 
                      type="checkbox" 
                      id="blockShadow"
                      checked={activePage.theme.blockShadow}
                      onChange={(e) => handleUpdateTheme({ blockShadow: e.target.checked })}
                    />
                  </div>
                </div>
              )}

              {/* 3. Add Custom Blocks */}
              {expandedSection === 'add' && (
                <>
                  <span className={styles.formLabel}>Choose block to place</span>
                  <div className={styles.addBlockSelector}>
                    <button type="button" onClick={() => handleAddBlock('link')} className={styles.addBlockBtn}>
                      <Link2 size={15} /> Link
                    </button>
                    <button type="button" onClick={() => handleAddBlock('social')} className={styles.addBlockBtn}>
                      <Globe size={15} /> Social
                    </button>
                    <button type="button" onClick={() => handleAddBlock('text')} className={styles.addBlockBtn}>
                      <Layers size={15} /> Quote
                    </button>
                    <button type="button" onClick={() => handleAddBlock('image')} className={styles.addBlockBtn}>
                      <ImageIcon size={15} /> Image
                    </button>
                    <button type="button" onClick={() => handleAddBlock('video')} className={styles.addBlockBtn}>
                      <VideoIcon size={15} /> Video
                    </button>
                    <button type="button" onClick={() => handleAddBlock('contact')} className={styles.addBlockBtn}>
                      <Mail size={15} /> Contact
                    </button>
                    <button type="button" onClick={() => handleAddBlock('group')} className={styles.addBlockBtn} style={{ gridColumn: 'span 3' }}>
                      <Grid size={15} /> Tile Group Block (Nested 2x2 Grid)
                    </button>
                    <button type="button" onClick={() => handleAddBlock('title')} className={styles.addBlockBtn} style={{ gridColumn: 'span 3' }}>
                      <Heading size={15} /> Standalone Title Divider
                    </button>
                  </div>
                </>
              )}
            </div>
            {/* Bottom spacing helper to prevent flex scroll clipping */}
            <div style={{ height: '40px', flexShrink: 0 }} />
          </div>

        {/* Dedicated standalone Profile Link section at the bottom of the editor workspace */}
        <div className={styles.editorFooterSection}>
          <div className={styles.profileLinkRow}>
            <span className={styles.profileLinkUrl}>
              Resu.me/{activePage.slug}
            </span>
             <ConfettiButton
              type="button"
              className={`${styles.profileLinkCopyBtn} ${profileLinkCopied ? styles.profileLinkCopyBtnSuccess : ''}`}
              options={{
                particleCount: 80,
                spread: 60,
                colors: ['#5555f7', '#60a5fa', '#34d399', '#f43f5e', '#fbbf24', '#a855f7']
              }}
              onClick={async () => {
                const url = typeof window !== 'undefined'
                  ? `${window.location.origin}/u/${activePage.slug}`
                  : `/u/${activePage.slug}`;
                const success = await copyToClipboard(url);
                if (success) {
                  setProfileLinkCopied(true);
                  setTimeout(() => setProfileLinkCopied(false), 2500);
                }
              }}
            >
              <Copy size={12} />
              {profileLinkCopied ? 'Copied!' : 'Copy Link'}
            </ConfettiButton>
          </div>
        </div>
            </>
          )}
      </div>

        {/* Right Real-time Snapping Preview Canvas */}
        <div className={styles.previewCanvas}>
          {/* Mock Browser Container Frame */}
          <div 
            className={styles.browserWindow}
            style={{
              width: deviceMode === 'mobile' ? '375px' : deviceMode === 'tablet' ? '768px' : '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Browser Viewport with native page scrolling */}
          <div 
            className={`${styles.browserViewport} ${deviceMode === 'mobile' ? styles.browserViewportMobile : deviceMode === 'tablet' ? styles.browserViewportTablet : ''}`}
            style={{ 
              background: activePage.theme.backgroundType === 'image' ? '#0f172a' : activePage.theme.backgroundValue,
              fontFamily: activePage.theme.fontFamily || 'Inter',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {activePage.theme.backgroundType === 'image' && activePage.theme.backgroundImageUrl && (
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${activePage.theme.backgroundImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: `blur(${activePage.theme.backgroundBlur || 0}px)`,
                  transform: 'scale(1.1)',
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
              />
            )}
            <div 
              className={`${styles.bentoSheet} ${previewMode === 'live' ? styles.bentoSheetLive : ''} ${deviceMode === 'mobile' ? styles.bentoSheetMobile : deviceMode === 'tablet' ? styles.bentoSheetTablet : ''}`}
              style={{
                color: (activePage.theme.backgroundType === 'image' || !activePage.theme.backgroundValue.includes('#ffffff')) ? '#ffffff' : '#1f2937',
              }}
            >
              <div className={`${styles.bentoSplitLayout} ${deviceMode === 'tablet' || deviceMode === 'mobile' ? styles.bentoSplitLayoutMobile : ''}`}>
                {/* Left Profile Info */}
                <div className={styles.profileCol}>
                  <div className={styles.avatar}>
                    {activePage.avatarUrl ? (
                      <img 
                        src={activePage.avatarUrl} 
                        alt={activePage.displayName} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                      />
                    ) : (
                      activePage.displayName ? activePage.displayName.charAt(0).toUpperCase() : '👤'
                    )}
                  </div>
                  <h1 className={styles.displayName}>{activePage.displayName}</h1>
                  <p 
                    className={styles.bioText} 
                    style={{ 
                      opacity: activePage.bio ? 1 : 0.6,
                      fontStyle: activePage.bio ? 'normal' : 'italic'
                    }}
                  >
                    {activePage.bio || "Write a short bio to introduce yourself."}
                  </p>
                </div>

                {/* Right Snapping Grid Canvas */}
                <div className={`${styles.gridCanvas} ${deviceMode === 'mobile' ? styles.gridCanvasMobile : deviceMode === 'tablet' ? styles.gridCanvasTablet : ''}`}>
                  {/* Guides overlay background — visible at all times in edit mode */}
                  {previewMode === 'edit' && (
                    <div className={`${styles.gridGuideOverlay} ${deviceMode === 'mobile' || deviceMode === 'tablet' ? styles.gridGuideOverlayMobile : ''} ${dragBlockId ? styles.gridGuideOverlayActive : ''}`}>
                      {Array.from({ length: deviceMode === 'mobile' || deviceMode === 'tablet' ? 8 : 16 }).map((_, i) => (
                        <div key={i} className={styles.gridCellGuide} style={{ borderRadius: `${activePage.theme.blockRadius}px` }} />
                      ))}
                    </div>
                  )}

              {(() => {
                const isDraggingOrResizing = !!dragBlockId || !!resizeBlockId;
                const minY = (!isDraggingOrResizing && activePage.blocks.length > 0) 
                  ? Math.min(...activePage.blocks.map(b => b.position.y)) 
                  : 0;
                const normalizedBlocks = minY > 0 
                  ? activePage.blocks.map(b => ({ ...b, position: { ...b.position, y: b.position.y - minY } }))
                  : activePage.blocks;
                
                // Sort blocks by position for consistent order in responsive views
                const sortedBlocks = [...normalizedBlocks].sort((a, b) => {
                  if (a.position.y !== b.position.y) return a.position.y - b.position.y;
                  return a.position.x - b.position.x;
                });

                return sortedBlocks.map((block) => {
                  const isDragging = block.id === dragBlockId;
                  const isResizing = block.id === resizeBlockId;
                  
                  // Snap coordinates translation
                  let x = block.position.x;
                  let y = block.position.y;

                  if (isDragging) {
                    const targetX = x + dragOffset.x;
                    const targetY = y + dragOffset.y;
                    const spans = getSizeSpans(block.size);
                    x = Math.max(0, Math.min(4 - spans.cols, targetX));
                    y = Math.max(0, Math.min(4 - spans.rows, targetY));
                  }

                  let spans = getSizeSpans(block.size);
                  if (isResizing) {
                    spans = resizeSpans;
                  }

                  // Brand desaturated styling for social widgets
                  const colorConfig = getWidgetColorConfig(block.type, block.data.platform);
                  let blockBg = block.data.bgColor || colorConfig.tint;
                  let brandColor = colorConfig.brand;
                  let logoBg = colorConfig.brand;
                  let logoColor = 'white';
                  let btnLabel = 'Visit';

                  if (block.type === 'social') {
                    const plat = block.data.platform || '';
                    if (plat === 'linkedin') btnLabel = 'Connect';
                    else if (plat === 'twitter' || plat === 'x') btnLabel = 'Follow';
                    else if (plat === 'youtube') btnLabel = 'Subscribe';
                    else if (plat === 'instagram') btnLabel = 'Follow';
                    else if (plat === 'github') btnLabel = 'Connect';
                  }

                  // Grid cell styling overrides
                  const isMobileOrTablet = deviceMode === 'mobile' || deviceMode === 'tablet';
                  const displayCols = 2; // Always render 2 columns for mobile/tablet responsive preview
                  const colsSpan = Math.min(displayCols, spans.cols);

                  const gridStyle: React.CSSProperties = {
                    gridColumn: isMobileOrTablet 
                      ? `span ${colsSpan}` 
                      : `${x + 1} / span ${spans.cols}`,
                    gridRow: isMobileOrTablet 
                      ? `span ${spans.rows}` 
                      : `${y + 1} / span ${spans.rows}`,
                    borderRadius: `${activePage.theme.blockRadius}px`,
                    border: block.type === 'title' ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: block.type === 'title' ? 'none' : (activePage.theme.blockShadow ? '0 4px 12px rgba(0, 0, 0, 0.03)' : 'none'),
                    backgroundColor: block.type === 'title' ? 'transparent' : blockBg,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: block.type === 'title' ? '4px 0' : '16px',
                    boxSizing: 'border-box',
                    height: block.type === 'title' ? 'auto' : `${spans.rows * 100 + (spans.rows - 1) * 12}px`,
                    minHeight: block.type === 'title' ? 'auto' : '100px',
                    alignSelf: block.type === 'title' ? 'start' : undefined,
                    zIndex: isDragging ? 10 : (block.id === activeEditingBlockId ? 100 : 2)
                  };

                  return (
                    <div 
                      key={block.id}
                      style={gridStyle}
                      data-cols={spans.cols}
                      data-rows={spans.rows}
                      className={`${styles.blockWrapper} ${isDragging ? styles.blockDragging : ''} ${selectedBlockId === block.id && previewMode === 'edit' ? styles.blockSelected : ''} ${(['link', 'social', 'contact'].includes(block.type) || (block.type === 'image' && block.data.url)) && previewMode === 'live' ? styles.blockWrapperInteractive : ''}`}
                      onMouseDown={(e) => handleBlockMouseDown(e, block)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (previewMode === 'live') {
                          if ((['link', 'social', 'contact'].includes(block.type) || block.type === 'image') && block.data.url) {
                            window.open(block.data.url, '_blank', 'noopener,noreferrer');
                          }
                        } else {
                          if (!dragBlockId && !resizeBlockId) {
                            setSelectedBlockId(block.id);
                          }
                        }
                      }}
                    >
                      {/* Hover controls overlay */}
                      {previewMode === 'edit' && (
                        <div className={styles.blockOverlay}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEditingBlockId(activeEditingBlockId === block.id ? null : block.id);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={styles.overlayBtn} 
                            title="Edit details"
                          >
                            <Pencil size={11} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateBlock(block);
                            }} 
                            onMouseDown={(e) => e.stopPropagation()}
                            className={styles.overlayBtn} 
                            title="Duplicate card"
                          >
                            <Copy size={11} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }} 
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`${styles.overlayBtn} ${styles.overlayBtnDanger}`} 
                            title="Delete card"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}

                      {/* Render block components */}
                      <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' }}>
                        {block.type === 'title' && (
                          <div 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              height: '100%',
                              width: '100%',
                              justifyContent: block.data.align === 'center' ? 'center' : block.data.align === 'right' ? 'flex-end' : 'flex-start',
                              color: activePage.theme.backgroundValue.includes('#ffffff') ? '#333' : 'white'
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
                          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', pointerEvents: 'auto' }} onMouseDown={(e) => e.stopPropagation()}>
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
                                        border: previewMode === 'live' ? 'none' : '1px dashed rgba(0,0,0,0.08)', 
                                        borderRadius: '8px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontSize: '9px',
                                        color: '#aaa',
                                        background: previewMode === 'live' ? (activePage.theme.backgroundValue.includes('#ffffff') ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)') : 'rgba(0,0,0,0.01)'
                                      }}
                                    >
                                      {previewMode === 'live' ? null : 'Empty'}
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

                                return (
                                  <div 
                                    key={child.id}
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
                                      overflow: 'hidden',
                                      cursor: previewMode === 'live' && child.data.url ? 'pointer' : 'default'
                                    }}
                                    onClick={(e) => {
                                      if (previewMode === 'live' && child.data.url) {
                                        e.stopPropagation();
                                        window.open(child.data.url, '_blank', 'noopener,noreferrer');
                                      }
                                    }}
                                  >
                                    <span style={{ fontSize: '9px', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                      {child.type === 'social' ? (child.data.platform?.toUpperCase() || 'SOCIAL') : (child.data.title || 'Link')}
                                    </span>
                                    {previewMode === 'edit' && (
                                      <button 
                                        type="button" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveFromGroup(block.id, child.id);
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        style={{ 
                                          position: 'absolute', 
                                          top: '2px', 
                                          right: '2px', 
                                          background: 'rgba(0,0,0,0.06)', 
                                          border: 'none', 
                                          borderRadius: '50%', 
                                          width: '12px', 
                                          height: '12px', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center', 
                                          fontSize: '8px', 
                                          cursor: 'pointer',
                                          color: '#666',
                                          padding: 0
                                        }}
                                        title="Remove from group"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {block.type === 'link' && (
                          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', pointerEvents: 'none' }}>
                            <div className={styles.widgetLogoBox} style={{ background: brandColor, color: 'white' }}>
                              <Link2 size={13} />
                            </div>
                            <div style={{ width: '100%', marginTop: 'auto' }}>
                              <span 
                                style={{ 
                                  fontSize: '12px', 
                                  fontWeight: 700, 
                                  color: activePage.theme.backgroundValue.includes('#ffffff') ? '#1f2937' : '#ffffff', 
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
                                {block.data.title || 'My Link'}
                              </span>
                            </div>
                          </div>
                        )}

                        {block.type === 'social' && (
                          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', pointerEvents: 'none' }}>
                            {renderSocialIcon(block.data.platform || '')}
                            <div style={{ width: '100%', marginTop: 'auto' }}>
                              <span 
                                style={{ 
                                  fontSize: '12px', 
                                  fontWeight: 700, 
                                  color: activePage.theme.backgroundValue.includes('#ffffff') ? '#1f2937' : '#ffffff', 
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
                                {block.data.username || activePage.displayName}
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
                            borderRadius: `${activePage.theme.blockRadius}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
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
                                    borderRadius: `${activePage.theme.blockRadius}px`
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
                                    fontFamily: activePage.theme.fontFamily || 'Inter'
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
                          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: '-16px', overflow: 'hidden', borderRadius: `${activePage.theme.blockRadius}px` }}>
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

                      {/* Resize grid cell handles */}
                      {previewMode === 'edit' && (
                        <div 
                          className={styles.resizeHandle} 
                          onMouseDown={(e) => handleResizeMouseDown(e, block)}
                          style={{
                            borderBottomRightRadius: activePage.theme.blockRadius === 0 ? '0px' : `${activePage.theme.blockRadius + 5}px`
                          }}
                        />
                      )}

                    </div>
                  );
                })
              })()}
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>
                {editingPreset
                  ? (modalMode === 'solid' ? 'Edit Solid Color' : 'Edit Gradient')
                  : (modalMode === 'solid' ? 'Add Custom Solid Color' : 'Add Custom Gradient')}
              </span>
              <button type="button" onClick={() => setIsModalOpen(false)} className={styles.modalCloseBtn}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Preset Name Input */}
              <div className={styles.formGroup}>
                <TextField
                  label="Preset Name"
                  placeholder={modalMode === 'solid' ? 'My Solid Color' : 'My Gradient'}
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  fullWidth
                />
              </div>

              {modalMode === 'solid' ? (
                /* Solid Mode Picker */
                <div className={styles.formGroup}>
                  <label className={styles.modalSectionTitle}>Choose Color</label>
                  <ColorPicker
                    color={modalSolidColor}
                    onChange={(newVal) => setModalSolidColor(newVal)}
                  />
                </div>
              ) : (
                /* Gradient Mode Builder */
                <>
                  {/* 1. Type selection & Direction angle */}
                  <div className={styles.formGroup}>
                    <label className={styles.modalSectionTitle}>Type</label>
                    <div className={styles.gradientTypeToggle}>
                      <button
                        type="button"
                        onClick={() => setGradientType('linear')}
                        className={`${styles.gradientToggleBtn} ${gradientType === 'linear' ? styles.gradientToggleBtnActive : ''}`}
                      >
                        Linear
                      </button>
                      <button
                        type="button"
                        onClick={() => setGradientType('radial')}
                        className={`${styles.gradientToggleBtn} ${gradientType === 'radial' ? styles.gradientToggleBtnActive : ''}`}
                      >
                        Radial
                      </button>
                    </div>
                  </div>

                  {gradientType === 'linear' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Angle: {gradientAngle}°</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={gradientAngle}
                        onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                        className={styles.radiusSlider}
                      />
                    </div>
                  )}

                  {/* 2. Interactive Track */}
                  <div className={styles.formGroup}>
                    <label className={styles.modalSectionTitle}>Interactive Track</label>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--color-neutral-500))', display: 'block', marginBottom: '8px' }}>
                      Click track to add stop (max 5). Drag pins horizontally to adjust offset.
                    </span>
                    <div 
                      ref={trackRef}
                      className={styles.interactiveTrack}
                      style={{
                        background: (() => {
                          const sortedStops = [...gradientStops].sort((a, b) => a.offset - b.offset);
                          const stopsStr = sortedStops.map(s => `${s.color} ${s.offset}%`).join(', ');
                          return `linear-gradient(to right, ${stopsStr})`;
                        })()
                      }}
                      onClick={handleTrackClick}
                    >
                      {gradientStops.map((stop, idx) => {
                        const isActive = selectedStopIdx === idx;
                        return (
                          <div
                            key={idx}
                            className={`${styles.stopPin} ${isActive ? styles.stopPinActive : ''}`}
                            style={{ 
                              left: `${stop.offset}%`, 
                              backgroundColor: stop.color 
                            }}
                            onMouseDown={(e) => handleStopMouseDown(e, idx)}
                            onClick={(e) => e.stopPropagation()}
                            title={`Stop #${idx + 1} (${stop.offset}%)`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Selected Stop Controls */}
                  {gradientStops[selectedStopIdx] && (
                    <div className={styles.formGroup} style={{ padding: '12px', borderRadius: '8px', border: '1px dashed hsl(var(--color-neutral-200))', backgroundColor: 'hsl(var(--color-neutral-50))' }}>
                      <label className={styles.formLabel} style={{ fontWeight: 700, marginBottom: 8, fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--color-neutral-500))' }}>Selected Stop #{selectedStopIdx + 1}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Swatch color input wrapper */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1.5px solid hsl(var(--color-neutral-200))',
                          backgroundColor: gradientStops[selectedStopIdx].color,
                          position: 'relative',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <input
                            type="color"
                            value={gradientStops[selectedStopIdx].color.startsWith('#') && gradientStops[selectedStopIdx].color.length === 7 ? gradientStops[selectedStopIdx].color : '#6366f1'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGradientStops(prev => prev.map((s, i) => i === selectedStopIdx ? { ...s, color: val } : s));
                            }}
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              left: '-6px',
                              width: '48px',
                              height: '48px',
                              cursor: 'pointer',
                              opacity: 0
                            }}
                          />
                        </div>

                        {/* Hex text input */}
                        <input
                          type="text"
                          value={gradientStops[selectedStopIdx].color}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setGradientStops(prev => prev.map((s, i) => i === selectedStopIdx ? { ...s, color: val } : s));
                          }}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid hsl(var(--color-neutral-200))',
                            fontSize: '12px',
                            fontFamily: 'monospace'
                          }}
                        />

                        {/* Position input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '11px', color: 'hsl(var(--color-neutral-500))' }}>Pos:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={gradientStops[selectedStopIdx].offset}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              setGradientStops(prev => prev.map((s, i) => i === selectedStopIdx ? { ...s, offset: val } : s));
                            }}
                            style={{
                              width: '50px',
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid hsl(var(--color-neutral-200))',
                              fontSize: '12px',
                              textAlign: 'center'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: 'hsl(var(--color-neutral-500))' }}>%</span>
                        </div>

                        {/* Delete Stop */}
                        {gradientStops.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = gradientStops.filter((_, i) => i !== selectedStopIdx);
                              setGradientStops(updated);
                              setSelectedStopIdx(0);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '6px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '6px'
                            }}
                            title="Delete Stop"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. Final Live Preview (according to selected type) */}
                  <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label className={styles.modalSectionTitle} style={{ alignSelf: 'flex-start' }}>Live Preview</label>
                    <div 
                      className={styles.previewGradientBar}
                      style={{
                        background: (() => {
                          const sortedStops = [...gradientStops].sort((a, b) => a.offset - b.offset);
                          const stopsStr = sortedStops.map(s => `${s.color} ${s.offset}%`).join(', ');
                          return gradientType === 'linear'
                            ? `linear-gradient(${gradientAngle}deg, ${stopsStr})`
                            : `radial-gradient(circle, ${stopsStr})`;
                        })(),
                        ...(gradientType === 'radial' ? {
                          width: '90px',
                          height: '90px',
                          borderRadius: '50%',
                          marginTop: '4px'
                        } : {
                          width: '100%',
                          height: '50px',
                          borderRadius: '8px',
                          marginTop: '4px'
                        })
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.backBtn}
                style={{ padding: '8px 16px', border: '1px solid hsl(var(--color-neutral-200))', background: 'white' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomPreset}
                className={styles.saveBtn}
                style={{ padding: '8px 16px' }}
              >
                {editingPreset ? 'Save Changes' : 'Save Preset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
</div>
  );
}
