import React, { useState, useEffect, useRef } from 'react';
import { Pipette, Plus } from 'lucide-react';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  color: string;
  onChange: (hexColor: string) => void;
}

// Color Conversion Helpers
function hexToRgba(hex: string) {
  let cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3 || cleanHex.length === 4) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const hasAlpha = cleanHex.length === 8;
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  const a = hasAlpha ? parseInt(cleanHex.substring(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function rgbaToHex(r: number, g: number, b: number, a: number) {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  const alphaHex = a < 1 ? toHex(a * 255) : '';
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`.toUpperCase();
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function hsvToRgb(h: number, s: number, v: number) {
  h /= 360; s /= 100; v /= 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

const defaultPresets = [
  '#EF4444', '#22C55E', '#EAB308', '#14B8A6', '#F97316', '#64748B', '#3B82F6',
  '#D946EF', '#EC4899', '#C084FC', '#A855F7', '#06B6D4'
];

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const hueSliderRef = useRef<HTMLDivElement | null>(null);
  const alphaSliderRef = useRef<HTMLDivElement | null>(null);

  // Parse initial color prop
  const initialRgba = hexToRgba(color || '#2463EB');
  const initialHsv = rgbToHsv(initialRgba.r, initialRgba.g, initialRgba.b);

  const [h, setH] = useState(initialHsv.h);
  const [s, setS] = useState(initialHsv.s);
  const [v, setV] = useState(initialHsv.v);
  const [a, setA] = useState(initialRgba.a);

  const [hexInput, setHexInput] = useState(color || '#2463EB');

  // Sync state with incoming color prop
  useEffect(() => {
    if (color && color !== hexInput) {
      const rgba = hexToRgba(color);
      const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
      setH(hsv.h);
      setS(hsv.s);
      setV(hsv.v);
      setA(rgba.a);
      setHexInput(color);
    }
  }, [color]);

  // Update output color when HSV or Alpha changes
  const updateColor = (newH: number, newS: number, newV: number, newA: number) => {
    const rgb = hsvToRgb(newH, newS, newV);
    const hex = rgbaToHex(rgb.r, rgb.g, rgb.b, newA);
    setHexInput(hex);
    onChange(hex);
  };

  // Canvas Drag Handling (Saturation / Brightness)
  const handleCanvasDrag = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    
    const newS = Math.round(x * 100);
    const newV = Math.round((1 - y) * 100);
    setS(newS);
    setV(newV);
    updateColor(h, newS, newV, a);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    handleCanvasDrag(e.clientX, e.clientY);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleCanvasDrag(moveEvent.clientX, moveEvent.clientY);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Hue Slider Drag Handling
  const handleHueDrag = (clientX: number) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newH = Math.round(x * 360);
    setH(newH);
    updateColor(newH, s, v, a);
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    handleHueDrag(e.clientX);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleHueDrag(moveEvent.clientX);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Alpha Slider Drag Handling
  const handleAlphaDrag = (clientX: number) => {
    if (!alphaSliderRef.current) return;
    const rect = alphaSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newA = parseFloat(x.toFixed(2));
    setA(newA);
    updateColor(h, s, v, newA);
  };

  const handleAlphaMouseDown = (e: React.MouseEvent) => {
    handleAlphaDrag(e.clientX);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleAlphaDrag(moveEvent.clientX);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Native Browser Eyedropper API handler
  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase();
          const rgba = hexToRgba(hex);
          const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
          setH(hsv.h);
          setS(hsv.s);
          setV(hsv.v);
          setA(rgba.a);
          setHexInput(hex);
          onChange(hex);
        }
      } catch (err) {
        console.warn('Eyedropper selection cancelled or failed:', err);
      }
    }
  };


  const baseColor = rgbaToHex(hsvToRgb(h, 100, 100).r, hsvToRgb(h, 100, 100).g, hsvToRgb(h, 100, 100).b, 1);
  const rgbCurrent = hsvToRgb(h, s, v);
  const currentSolidHex = rgbaToHex(rgbCurrent.r, rgbCurrent.g, rgbCurrent.b, 1);

  return (
    <div className={styles.pickerContainer}>
      {/* 1. SL Canvas */}
      <div 
        ref={canvasRef}
        className={styles.canvasContainer} 
        style={{ backgroundColor: baseColor }}
        onMouseDown={handleCanvasMouseDown}
      >
        <div className={styles.canvasWhite} />
        <div className={styles.canvasBlack} />
        <div 
          className={styles.canvasHandle} 
          style={{ 
            left: `${s}%`, 
            top: `${100 - v}%`,
            backgroundColor: currentSolidHex 
          }} 
        />
      </div>

      {/* 2. Sliders Control Row */}
      <div className={styles.slidersRow}>
        {/* Eyedropper API Button */}
        {typeof window !== 'undefined' && 'EyeDropper' in window && (
          <button 
            type="button" 
            onClick={handleEyedropper} 
            className={styles.eyedropperButton}
            title="Pick a color from screen"
          >
            <Pipette size={14} />
          </button>
        )}

        <div className={styles.slidersColumn}>
          {/* Hue Spectrum Slider */}
          <div 
            ref={hueSliderRef}
            className={`${styles.sliderWrapper} ${styles.hueTrack}`}
            onMouseDown={handleHueMouseDown}
          >
            <div 
              className={styles.sliderHandle} 
              style={{ 
                left: `${(h / 360) * 100}%`,
                backgroundColor: baseColor
              }} 
            />
          </div>

          {/* Alpha Opacity Slider */}
          <div 
            ref={alphaSliderRef}
            className={`${styles.sliderWrapper} ${styles.alphaTrack}`}
            onMouseDown={handleAlphaMouseDown}
            style={{
              background: `linear-gradient(to right, transparent, ${currentSolidHex})`
            }}
          >
            <div 
              className={styles.sliderHandle} 
              style={{ 
                left: `${a * 100}%`,
                backgroundColor: `rgba(${rgbCurrent.r}, ${rgbCurrent.g}, ${rgbCurrent.b}, ${a})`
              }} 
            />
          </div>
        </div>
      </div>

      {/* 3. Inputs Row */}
      <div className={styles.inputsRow}>
        <select className={styles.formatDropdown}>
          <option>HEX</option>
        </select>

        <input 
          type="text" 
          value={hexInput}
          onChange={(e) => {
            const val = e.target.value;
            setHexInput(val);
            if (/^#[0-9A-F]{3}$/i.test(val) || /^#[0-9A-F]{4}$/i.test(val) || /^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{8}$/i.test(val)) {
              const rgba = hexToRgba(val);
              const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
              setH(hsv.h);
              setS(hsv.s);
              setV(hsv.v);
              setA(rgba.a);
              onChange(val);
            }
          }}
          className={styles.hexInput}
        />

        <input 
          type="text" 
          value={`${Math.round(a * 100)}%`}
          onChange={(e) => {
            const num = parseInt(e.target.value.replace(/[^0-9]/g, ''));
            if (!isNaN(num) && num >= 0 && num <= 100) {
              const newA = num / 100;
              setA(newA);
              updateColor(h, s, v, newA);
            }
          }}
          className={styles.alphaInput}
        />
      </div>
    </div>
  );
}
