import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Edit, RefreshCw } from 'lucide-react';
import styles from './SignatureModal.module.css';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  initialImage?: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialImage,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('upload');
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Drawing States
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setImageSrc(initialImage || null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setErrorMsg(null);
      
      // If we switch to draw, reset drawing canvas
      if (activeTab === 'draw') {
        initDrawCanvas();
      }
    }
  }, [isOpen, initialImage]);

  useEffect(() => {
    if (activeTab === 'draw' && isOpen) {
      initDrawCanvas();
    }
  }, [activeTab, isOpen]);

  const initDrawCanvas = () => {
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Set ink style
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    }, 50);
  };

  if (!isOpen) return null;

  // File Upload Processors
  const processFile = (file: File) => {
    if (file.type !== 'image/png') {
      setErrorMsg('Only PNG format signatures are supported to ensure a transparent background.');
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Dragging / Panning Image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Mobile Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  // Drawing Canvas Methods
  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Scale client coordinate to canvas coordinates
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const getCanvasTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: ((touch.clientX - rect.left) / rect.width) * canvas.width,
      y: ((touch.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getCanvasMousePos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasMousePos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getCanvasTouchPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasTouchPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  // Crop / Save Execution
  const handleSave = () => {
    if (activeTab === 'upload') {
      if (!imageSrc) return;
      // Crop calculations using Canvas
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, 300, 100);

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const baseWidth = 240;
        const baseHeight = baseWidth / aspectRatio;

        const drawWidth = baseWidth * zoom;
        const drawHeight = baseHeight * zoom;

        // Position coordinates centered
        const startX = 150 - drawWidth / 2 + offset.x;
        const startY = 50 - drawHeight / 2 + offset.y;

        ctx.drawImage(img, startX, startY, drawWidth, drawHeight);
        onSave(canvas.toDataURL('image/png'));
        onClose();
      };
    } else {
      // Save Hand-drawn Signature from Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        // We will output it as a base64 png
        const drawDataUrl = canvas.toDataURL('image/png');
        onSave(drawDataUrl);
        onClose();
      }
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add Signature</h2>
          <button onClick={onClose} className={styles.closeBtn} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className={styles.tabContainer}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'upload' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={14} style={{ marginRight: '6px' }} />
            Upload Image
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'draw' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('draw')}
          >
            <Edit size={14} style={{ marginRight: '6px' }} />
            Draw Signature
          </button>
        </div>

        {/* Guidance Alert Banner */}
        <div className={styles.guidanceBanner}>
          ℹ️ Please fit the signature properly inside the visible boundary box. Signature must be uploaded in PNG format only.
        </div>

        <div className={styles.modalContent}>
          {activeTab === 'upload' ? (
            <div className={styles.uploadTabContent}>
              {!imageSrc ? (
                <div
                  className={styles.dropzone}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <Upload className={styles.uploadIcon} size={32} />
                  <div className={styles.uploadText}>
                    <strong>Click to upload</strong> or drag and drop
                  </div>
                  <div className={styles.uploadSubtext}>PNG format only (Up to 1MB)</div>
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div className={styles.editorArea}>
                  <div
                    className={styles.cropViewport}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUpOrLeave}
                  >
                    <img
                      src={imageSrc}
                      alt="Signature"
                      className={styles.draggableImg}
                      style={{
                        width: '240px',
                        height: 'auto',
                        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                      }}
                      draggable={false}
                    />
                    <div className={styles.cropBoxHighlight} />
                  </div>

                  {/* Zoom controls */}
                  <div className={styles.zoomControls}>
                    <button
                      type="button"
                      className={styles.zoomBtn}
                      onClick={() => setZoom((z) => Math.max(0.05, z - 0.05))}
                      title="Zoom Out"
                    >
                      —
                    </button>
                    <input
                      type="range"
                      min="0.05"
                      max="5.0"
                      step="0.01"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className={styles.zoomSlider}
                    />
                    <button
                      type="button"
                      className={styles.zoomBtn}
                      onClick={() => setZoom((z) => Math.min(5.0, z + 0.05))}
                      title="Zoom In"
                    >
                      ＋
                    </button>
                  </div>

                  <div className={styles.changeActionRow}>
                    <button
                      type="button"
                      className={styles.changeBtn}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Different PNG
                    </button>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.drawTabContent}>
              <div className={styles.canvasContainer}>
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={100}
                  className={styles.drawCanvas}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawingTouch}
                  onTouchMove={drawTouch}
                  onTouchEnd={stopDrawing}
                />
                <div className={styles.canvasGuideText}>Draw your signature inside this box</div>
              </div>
              <button type="button" className={styles.resetCanvasBtn} onClick={initDrawCanvas}>
                <RefreshCw size={12} style={{ marginRight: '6px' }} />
                Reset Canvas
              </button>
            </div>
          )}

          {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
        </div>

        {/* Action Buttons */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => {
              setImageSrc(null);
              initDrawCanvas();
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={activeTab === 'upload' && !imageSrc}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
