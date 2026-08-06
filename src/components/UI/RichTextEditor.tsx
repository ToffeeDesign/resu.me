import React, { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Link2Off,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eraser,
  Check
} from 'lucide-react';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  value,
  onChange,
  placeholder,
  minHeight
}) => {
  const richTextRef = useRef<HTMLDivElement>(null);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const savedSelectionRange = useRef<Range | null>(null);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    bulletList: false,
    numberedList: false,
    link: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
  });

  const updateActiveFormats = () => {
    if (typeof document === 'undefined') return;

    let linkActive = false;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).startContainer;
      while (node && node.nodeName !== 'DIV' && node.nodeName !== 'BODY') {
        if (node.nodeName === 'A') {
          linkActive = true;
          break;
        }
        node = node.parentNode;
      }
    }

    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      bulletList: document.queryCommandState('insertUnorderedList'),
      numberedList: document.queryCommandState('insertOrderedList'),
      link: linkActive,
      alignLeft: document.queryCommandState('justifyLeft'),
      alignCenter: document.queryCommandState('justifyCenter'),
      alignRight: document.queryCommandState('justifyRight'),
      alignJustify: document.queryCommandState('justifyFull'),
    });
  };

  const handleApplyLink = () => {
    if (savedSelectionRange.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRange.current);
      }
    }
    document.execCommand('createLink', false, linkUrl);
    setShowLinkPopover(false);
    setLinkUrl('');
    if (richTextRef.current) {
      onChange(richTextRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const handleCommand = (command: string, valueStr: string = '') => {
    document.execCommand(command, false, valueStr);
    if (richTextRef.current) {
      onChange(richTextRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const handleClearFormatting = () => {
    document.execCommand('removeFormat', false);
    document.execCommand('unlink', false);
    document.execCommand('formatBlock', false, 'p');
    document.execCommand('justifyLeft', false);
    if (richTextRef.current) {
      onChange(richTextRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  useEffect(() => {
    if (richTextRef.current && richTextRef.current.innerHTML !== value) {
      richTextRef.current.innerHTML = value || '';
    }
  }, [id, value]);

  const handleRichTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
    updateActiveFormats();
  };

  return (
    <div className={styles.richTextContainer}>
      <div className={styles.toolbarRow}>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.bold ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('bold');
          }}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.italic ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('italic');
          }}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.underline ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('underline');
          }}
          title="Underline"
        >
          <Underline size={14} />
        </button>

        <div className={styles.toolbarDivider} />

        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.bulletList ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('insertUnorderedList');
          }}
          title="Bullet List"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.numberedList ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('insertOrderedList');
          }}
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </button>

        <div className={styles.toolbarDivider} />

        <div className={styles.toolbarPopoverContainer}>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${activeFormats.link ? styles.toolbarBtnActive : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              const sel = window.getSelection();
              if (sel && sel.rangeCount > 0) {
                savedSelectionRange.current = sel.getRangeAt(0);
              } else {
                savedSelectionRange.current = null;
              }
              setShowLinkPopover(prev => !prev);
            }}
            title="Add Link"
          >
            <Link2 size={14} />
          </button>

          {showLinkPopover && (
            <div className={styles.summaryLinkPopover} onClick={(e) => e.stopPropagation()}>
              <div className={styles.popoverTitle}>Link URL</div>
              <div className={styles.popoverRow}>
                <input
                  type="text"
                  className={styles.popoverInput}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter Link"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyLink();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.popoverCheckBtn}
                  onClick={handleApplyLink}
                  title="Apply"
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.toolbarBtn}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('unlink');
          }}
          title="Remove Link"
        >
          <Link2Off size={14} />
        </button>

        <div className={styles.toolbarDivider} />

        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.alignLeft ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('justifyLeft');
          }}
          title="Align Left"
        >
          <AlignLeft size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.alignCenter ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('justifyCenter');
          }}
          title="Align Center"
        >
          <AlignCenter size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.alignRight ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('justifyRight');
          }}
          title="Align Right"
        >
          <AlignRight size={14} />
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${activeFormats.alignJustify ? styles.toolbarBtnActive : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCommand('justifyFull');
          }}
          title="Justify"
        >
          <AlignJustify size={14} />
        </button>

        <div className={styles.toolbarDivider} />

        <button
          type="button"
          className={styles.toolbarBtn}
          onMouseDown={(e) => {
            e.preventDefault();
            handleClearFormatting();
          }}
          title="Clear Formatting"
        >
          <Eraser size={14} />
        </button>
      </div>
      <div
        ref={richTextRef}
        className={styles.richTextEditor}
        contentEditable={true}
        onInput={handleRichTextChange}
        onSelect={updateActiveFormats}
        suppressContentEditableWarning={true}
        style={minHeight ? { minHeight } : undefined}
      />
    </div>
  );
};
