import { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { BASE_LABELS, ALL_TEMPLATES, getTemplatesForBase, LABEL_DIMS, COLOR_PALETTE, SINGLEMALT_ARTWORKS } from './data/labels';

// ─── URL encoding / decoding ──────────────────────────────────────────────────

// Form field key → URL param name
const FIELD_TO_PARAM = {
  blendName:      'blend-name',
  createdBy:      'created-by',
  distillery:     'distillery',
  reference:      'reference',
  referenceOnDark: 'reference-on-dark',
  color:          'color',
  artwork:      'artwork',
  singleCask:   'single-cask',
  series:       'series',
  customerName: 'customer-name',
  description:  'description',
  keyImage:     'key-image',
  strength:     'strength',
  fgColor:      'fg-color',
  bgColor:      'bg-color',
  // 'image' (file blob) is intentionally excluded
};
const PARAM_TO_FIELD = Object.fromEntries(Object.entries(FIELD_TO_PARAM).map(([k, v]) => [v, k]));

function encodeFormData(formData) {
  const params = {};
  Object.entries(formData).forEach(([key, value]) => {
    if (key === 'image') return;
    const param = FIELD_TO_PARAM[key] || key;
    if (value !== null && value !== undefined && value !== '' && value !== false) {
      params[param] = String(value);
    }
  });
  return params;
}

function decodeFormData(template, searchParams) {
  const formData = {};
  template.fields.forEach(f => {
    if (f.type === 'select' || f.type === 'color-swatch' || f.type === 'preset-image')
      formData[f.key] = f.default ?? f.options[0].value;
    else if (f.type === 'checkbox' || f.type === 'checkbox-inline') formData[f.key] = false;
    else if (f.type === 'strength') formData[f.key] = f.default ?? '';
    else formData[f.key] = f.default ?? '';
  });
  searchParams.forEach((value, param) => {
    const key = PARAM_TO_FIELD[param] || param;
    formData[key] = key === 'singleCask' ? value === 'true' : value;
  });
  return formData;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function insertSpaceForLongWords(str) {
  if (!str) return '';
  return str.split(' ').map(word => {
    if (word.length > 14) {
      let result = '';
      for (let i = 0; i < word.length; i += 14) result += word.slice(i, i + 14) + ' ';
      return result.trim();
    }
    return word;
  }).join(' ');
}

// Auto-resize text to fill its parent container, matching the original resize() algorithm.
// min/max/step match the original (min=18, max=52, step=0.5).
function useAutoFontSize(ref, text, { min = 18, max = 52, step = 0.5 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      const parent = el.parentNode;
      if (!parent) return;
      const isOverflown = n => n.scrollWidth > n.clientWidth || n.scrollHeight > n.clientHeight;
      let i = min;
      let overflow = false;
      while (!overflow && i < max) {
        el.style.fontSize = `${i}px`;
        el.style.lineHeight = `${i * 0.74}px`;
        overflow = isOverflown(parent);
        if (!overflow) i += step;
      }
      const final = i - step - 1;
      el.style.fontSize = `${final}px`;
      el.style.lineHeight = `${final * 0.74}px`;
    };
    document.fonts.ready.then(run);
  }, [text]);
}

// ─── Shared output wrappers ───────────────────────────────────────────────────

function OutputWrapper({ onBack, children }) {
  return (
    <div className="output-shell">
      <div className="output-toolbar">
        <button className="back-btn" onClick={onBack}>← Edit</button>
        <button className="print-btn" onClick={() => window.print()}>Print</button>
      </div>
      <div className="label-page-wrapper">
        {children}
      </div>
    </div>
  );
}

// The calibrated white page with crop marks overlay
// cropsFile overrides dims.cropsFile when a template needs different crop marks
function LabelPage({ dims, cropsFile, pageBackground, children }) {
  const baseUrl = import.meta.env.BASE_URL;
  const crops = cropsFile || dims.cropsFile;
  return (
    <div style={{
      boxSizing: 'content-box',
      width: dims.pageW,
      height: dims.pageH,
      paddingTop: dims.pagePaddingTop,
      position: 'relative',
      background: '#ffffff',
      backgroundImage: pageBackground || 'none',
      backgroundSize: 'cover',
      margin: '0 auto',
      color: '#000',
      textShadow: '1px 1px #ffffff',
      WebkitFontSmoothing: 'auto',
      MozOsxFontSmoothing: 'auto',
    }}>
      {/* Crop marks overlay — extends to cropsH which equals total page height */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: dims.pageW,
        height: dims.cropsH,
        backgroundImage: `url(${baseUrl}${crops})`,
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none',
        zIndex: 10,
      }} />
      {/* Label area — centred within the padded content region */}
      <div style={{
        position: 'relative',
        width: dims.labelW,
        height: dims.labelH,
        margin: '0 auto',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Reference tag (small rotated monospace text on right edge) ─────────────

function ReferenceTag({ dims, value, onDark }) {
  if (!value) return null;
  return (
    <div style={{
      position: 'absolute',
      right: dims.refRight,
      top: dims.refTop,
      height: 20,
      width: 80,
      transform: 'rotate(-90deg)',
      textAlign: 'right',
      zIndex: 2,
      opacity: 0.6,
      fontFamily: '"Roboto Mono", monospace',
      fontSize: dims.refFontSize,
      lineHeight: `${dims.refFontSize + 2}px`,
      color: onDark ? '#ffffff' : '#000000',
      textShadow: 'none',
    }}>
      {value}
    </div>
  );
}

// ─── Tampa Whisky Club label ──────────────────────────────────────────────────

const TAMPA_COLORS = {
  red:    '#d50a0a',
  blue:   '#374fa2',
  green:  '#0f7731',
  purple: '#613d92',
};

function TampaOutput({ formData, onBack }) {
  const dims = LABEL_DIMS['500ml'];
  const baseUrl = import.meta.env.BASE_URL;
  const accent = TAMPA_COLORS[formData.color] || TAMPA_COLORS.red;

  const blendNameRef = useRef(null);
  const seriesRef = useRef(null);
  useAutoFontSize(blendNameRef, formData.blendName);
  useAutoFontSize(seriesRef, formData.series);

  return (
    <OutputWrapper onBack={onBack}>
      <LabelPage dims={dims} cropsFile="crops50-taller.png" pageBackground={`url(${baseUrl}sample50cl-tampa.png)`}>
        {/* Background key image (ship / casks) — full-width, bleeds above label top */}
        <div style={{
          position: 'absolute',
          top: -8, left: -9,
          width: 570, height: 244,
          backgroundImage: `url(${baseUrl}images/${formData.keyImage}.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          zIndex: 1,
        }} />

        {/* Coloured strip above the image */}
        <div style={{
          position: 'absolute',
          top: -33, left: -9,
          width: 570, height: 33,
          backgroundColor: accent,
          color: '#ffffff',
          textShadow: 'none',
          textTransform: 'uppercase',
          textAlign: 'center',
          letterSpacing: 5,
          fontSize: 9,
          lineHeight: '32px',
          fontFamily: '"brothers", sans-serif',
        }}>
          Whisky Club Tampa exclusive
        </div>

        {/* Horizontal accent line — no z-index so ship image (z-index:1) sits on top */}
        <div style={{
          position: 'absolute',
          top: 152, left: -9,
          width: 570, height: 2,
          backgroundColor: accent,
        }} />

        {/* Tampa logo — top right */}
        <div style={{
          position: 'absolute',
          top: 14, right: 12,
          width: 88, height: 88,
          backgroundImage: `url(${baseUrl}images/tampa-logo.png)`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          zIndex: 21,
        }} />

        {/* Zigzag panel — rotated description area, left side */}
        <div style={{
          position: 'absolute',
          top: 46, left: -78,
          width: 246, height: 110,
          backgroundImage: `url(${baseUrl}images/zigzag.png)`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 21,
          transform: 'rotate(90deg)',
          textAlign: 'center',
          fontFamily: '"brothers", sans-serif',
          fontSize: 12,
          letterSpacing: -0.5,
          textShadow: 'none',
          color: '#000',
        }}>
          <span style={{ padding: '16px 22px', display: 'block' }}>
            {formData.description}
          </span>
        </div>

        {/* Expression / blend name — Brothers font, accent colour */}
        <div style={{
          fontFamily: '"brothers", sans-serif',
          position: 'absolute',
          top: 70, left: 208,
          width: 120, height: 42,
          textTransform: 'uppercase',
          display: 'grid',
          placeContent: 'center',
          justifyContent: 'start',
          scale: '2.2',
          zIndex: 4,
          letterSpacing: -0.8,
          color: accent,
        }}>
          <div ref={blendNameRef}>
            {insertSpaceForLongWords(formData.blendName)}
          </div>
        </div>

        {/* Customer name — Caveat handwriting font */}
        <div style={{
          fontFamily: '"Caveat", cursive',
          position: 'absolute',
          top: 177, left: 214,
          width: 122, height: 12,
          scale: '2.2',
          zIndex: 3,
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: 12, lineHeight: '10px' }}>
            {formData.customerName}
          </div>
        </div>

        {/* Series / reference — horizontal (not rotated), upper right area */}
        <div style={{
          position: 'absolute',
          right: 192, top: 26,
          height: 20, width: 220,
          zIndex: 2,
          fontFamily: '"brothers", sans-serif',
          color: '#000',
        }}>
          <div ref={seriesRef}>{formData.series}</div>
        </div>
      </LabelPage>
    </OutputWrapper>
  );
}

// ─── Single malt with roundel label ──────────────────────────────────────────

function SingleMaltOutput({ baseLabel, formData, onBack }) {
  const dims = LABEL_DIMS[baseLabel.size];
  const baseUrl = import.meta.env.BASE_URL;
  const fgColor = formData.fgColor || '#111111';
  const bgColor = formData.bgColor || '#ffffff';
  const artwork = formData.artwork;

  const blendNameRef = useRef(null);
  useAutoFontSize(blendNameRef, formData.blendName);

  const s = dims.roundelH / 232;
  const distilledTop = Math.round(184 * s);
  const distilledLeft = Math.round(142 * s);

  return (
    <OutputWrapper onBack={onBack}>
      <LabelPage dims={dims} cropsFile={dims.cropsFile} pageBackground={`url(${baseUrl}${dims.barsFile})`}>
        {artwork && <div style={{
          position: 'absolute',
          top: dims.roundelTop, left: dims.roundelLeft, width: dims.roundelW, height: dims.roundelH,
          backgroundImage: `url(${baseUrl}images/${artwork})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          zIndex: 1,
          pointerEvents: 'none',
        }} />}
        {/* Whisky name */}
        <div style={{
          fontFamily: '"trimPosterCompressed", sans-serif',
          fontWeight: 400,
          position: 'absolute',
          top: dims.outerTop, left: dims.outerLeft,
          width: dims.outerW, height: dims.outerH,
          textTransform: 'uppercase',
          display: 'grid', placeContent: 'center', justifyContent: 'start',
          scale: String(dims.scale),
          color: '#ffffff', textShadow: '1px 1px #000000',
          overflow: 'hidden', zIndex: 3,
        }}>
          <div ref={blendNameRef}>{insertSpaceForLongWords(formData.blendName)}</div>
        </div>

        {/* Distilled at label */}
        <div style={{ position: 'absolute', top: distilledTop, left: distilledLeft, zIndex: 2, textTransform: 'uppercase', color: '#ffffff', letterSpacing: '8px', fontSize: '8px', fontWeight: 700, textShadow: '1px 1px #000000' }}>
          Distilled at
        </div>

        {/* Distillery name */}
        <div style={{
          fontFamily: '"Raleway", sans-serif',
          position: 'absolute',
          top: dims.sideTop, left: dims.sideLeft,
          width: dims.sideW, height: dims.sideH,
          scale: String(dims.scale),
          overflow: 'hidden', zIndex: 2,
        }}>
          <div style={{ fontSize: 7, lineHeight: '10px', fontWeight: 700, color: '#ffffff', textShadow: '1px 1px #000000' }}>
            {formData.distillery}
          </div>
        </div>
        <SideInfoPanels
          fgColor={fgColor} bgColor={bgColor}
          strength={formData.strength} singleCask={formData.singleCask}
          baseUrl={baseUrl}
          {...roundelPanelProps(dims)}
        />
        <ReferenceTag dims={dims} value={formData.reference} onDark={!!formData.referenceOnDark} />
      </LabelPage>
    </OutputWrapper>
  );
}

// Compute SideInfoPanels props for a roundel label, scaling from the 500ml reference
function roundelPanelProps(dims) {
  const s = dims.roundelH / 232;
  return {
    panelTop: dims.roundelTop,
    panelLength: dims.roundelH,
    panelPadding: `${Math.round(10 * s)}px ${Math.round(16 * s)}px ${Math.round(17 * s)}px`,
    tallFontSize: Math.round(14 * s),
    domainFontSize: Math.round(9 * s),
    svgWidth: Math.round(202 * s),
    svgHeight: Math.round(34 * s),
  };
}

// ─── Blended malt label (no side panels) ─────────────────────────────────────

function BlendedMaltOutput({ baseLabel, formData, onBack }) {
  const dims = LABEL_DIMS[baseLabel.size];
  const baseUrl = import.meta.env.BASE_URL;
  const fgColor = formData.fgColor || '#111111';
  const artwork = formData.artwork;

  const blendNameRef = useRef(null);
  useAutoFontSize(blendNameRef, formData.blendName);

  const s = dims.roundelH / 232;
  const createdByTop = Math.round(184 * s);
  const createdByLeft = Math.round(142 * s);

  const shadowColor = COLOR_PALETTE.find(c => c.value === fgColor)?.luminance === 'light' ? '#000000' : '#ffffff';

  return (
    <OutputWrapper onBack={onBack}>
      <LabelPage dims={dims} cropsFile={dims.cropsFile} pageBackground={`url(${baseUrl}${dims.barsFile})`}>
        {artwork && <div style={{
          position: 'absolute',
          top: dims.roundelTop, left: dims.roundelLeft, width: dims.roundelW, height: dims.roundelH,
          backgroundImage: `url(${baseUrl}images/${artwork})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          zIndex: 1,
          pointerEvents: 'none',
        }} />}
        {/* Whisky name */}
        <div style={{
          fontFamily: '"trimPosterCompressed", sans-serif',
          fontWeight: 400,
          position: 'absolute',
          top: dims.outerTop, left: dims.outerLeft,
          width: dims.outerW, height: dims.outerH,
          textTransform: 'uppercase',
          display: 'grid', placeContent: 'center', justifyContent: 'start',
          scale: String(dims.scale),
          color: fgColor, textShadow: `1px 1px ${shadowColor}`,
          overflow: 'hidden', zIndex: 3,
        }}>
          <div ref={blendNameRef}>{insertSpaceForLongWords(formData.blendName)}</div>
        </div>
        {/* Created by label */}
        <div style={{ position: 'absolute', top: createdByTop, left: createdByLeft, zIndex: 2, textTransform: 'uppercase', color: fgColor, letterSpacing: '8px', fontSize: '8px', fontWeight: 700, textShadow: `1px 1px ${shadowColor}` }}>
          Created by
        </div>
        {/* Blender name */}
        <div style={{
          fontFamily: '"Raleway", sans-serif',
          position: 'absolute',
          top: dims.sideTop, left: dims.sideLeft,
          width: dims.sideW, height: dims.sideH,
          scale: String(dims.scale),
          overflow: 'hidden', zIndex: 2,
        }}>
          <div style={{ fontSize: 7, lineHeight: '10px', fontWeight: 700, color: fgColor, textShadow: `1px 1px ${shadowColor}` }}>
            {formData.createdBy}
          </div>
        </div>
        <ReferenceTag dims={dims} value={formData.reference} onDark={!!formData.referenceOnDark} />
      </LabelPage>
    </OutputWrapper>
  );
}

// ─── Blended malt single image (no panels, no text) ──────────────────────────

function BlendedSingleImageOutput({ baseLabel, formData, onBack }) {
  const dims = LABEL_DIMS[baseLabel.size];
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <OutputWrapper onBack={onBack}>
      <LabelPage dims={dims} cropsFile={dims.cropsFile} pageBackground={`url(${baseUrl}${dims.barsFile})`}>
        {formData.image && (
          <div style={{
            position: 'absolute',
            top: dims.roundelTop, left: dims.roundelLeft, width: dims.roundelW, height: dims.roundelH,
            backgroundImage: `url(${formData.image})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            zIndex: 1,
          }} />
        )}
        <ReferenceTag dims={dims} value={formData.reference} onDark={!!formData.referenceOnDark} />
      </LabelPage>
    </OutputWrapper>
  );
}

// ─── Shared side panels (info + single cask) ─────────────────────────────────

function SideInfoPanels({
  fgColor, bgColor, strength, singleCask, baseUrl,
  panelTop = -33, panelLength = 269,
  panelPadding = '10px 20px 17px',
  tallFontSize = 15,
  domainFontSize = 10,
  svgWidth = 230, svgHeight = 38,
}) {
  const zigzagClip = (() => {
    const w = panelLength, h = 56, step = 8, depth = 5;
    const count = Math.ceil(w / step);
    const pts = Array.from({ length: count + 1 }, (_, i) => {
      const x = Math.min(i * step, w);
      return `${x}px ${i % 2 === 0 ? 0 : depth}px`;
    });
    return `polygon(${[...pts, `${w}px ${h}px`, `0px ${h}px`].join(', ')})`;
  })();

  const singleCaskClip = (() => {
    const w = panelLength, h = 70, step = 8, depth = 5;
    const count = Math.ceil(w / step);
    const pts = Array.from({ length: count + 1 }, (_, i) => {
      const x = Math.min(i * step, w);
      return `${x}px ${i % 2 === 0 ? 0 : depth}px`;
    });
    return `polygon(${[...pts, `${w}px ${h}px`, `0px ${h}px`].join(', ')})`;
  })();

  const panelStyle = {
    position: 'absolute',
    top: panelTop, left: 47, width: panelLength, height: 56,
    transform: 'rotate(90deg)', transformOrigin: 'left top',
    clipPath: zigzagClip,
    backgroundColor: bgColor, color: fgColor, textShadow: 'none',
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center',
    padding: panelPadding, zIndex: 2,
  };

  const tallFont = { fontFamily: '"Antonio", sans-serif', fontWeight: 300, fontSize: tallFontSize, textTransform: 'uppercase', letterSpacing: -0.5 };

  return (
    <>
      <div style={panelStyle}>
        <span style={tallFont}>{strength || '46'}% abv</span>
        <span style={{ fontSize: domainFontSize, fontWeight: 700, textAlign: 'center', letterSpacing: 0.4, fontFamily: '"Raleway", sans-serif' }}>whiskyblender.com</span>
        <span style={{ ...tallFont, textAlign: 'right' }}>500ml ℮</span>
      </div>

      {singleCask && (
        <div style={{
          position: 'absolute',
          top: panelTop, left: 102, width: panelLength, height: 70, paddingTop: 6,
          transform: 'rotate(90deg)', transformOrigin: 'left top',
          clipPath: singleCaskClip,
          backgroundColor: bgColor, color: fgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
        }}>
          <svg viewBox="0 0 136.43 22.62" width={svgWidth} height={svgHeight} fill={fgColor} xmlns="http://www.w3.org/2000/svg">
            <path d="M.12,15.12l1.73-3.07.15.06c-.88,6.92,1.52,9.69,4.31,9.81,2.76.12,4.83-2.79,4.04-5.77C9.2,11.75.36,10.57.36,5.16.36,2.13,3.19,0,6.16,0,9.32,0,11.66,1.76,12.21,5.13l-1.52,3.07-.15-.06c.21-4.43-1.46-7.23-4.22-7.44-1.91-.15-4.52,1.21-3.98,4.46.7,4.16,10.05,5.65,10.05,11.3,0,4.19-3.49,6.16-6.13,6.16-3.43,0-6.95-2.61-6.13-7.5Z"/>
            <path d="M13.03,22.01c.82-.39,1.43-1.24,1.43-2.58V3.19c0-1.09-.49-2.16-1.43-2.58v-.15h4.77v.15c-.97.43-1.43,1.49-1.43,2.58v16.25c0,1.34.67,2.19,1.43,2.58v.15h-4.77v-.15Z"/>
            <path d="M19.28,22.01c.85-.46,1.37-1.37,1.37-2.58V3.19c0-1.25-.52-2.16-1.37-2.58v-.15h4.65v.15c-.85.43-1.37,1.34-1.37,2.58v2.64C23.69,1.97,25.69,0,28.36,0c3.8,0,5.77,3.13,6.13,7.29.27,3.28-.61,7.83-2.43,12.15-.46,1.06-.15,1.97.97,2.58v.15h-4.52v-.15c.39-.12,1-1.03,1.7-2.58,1.76-3.89,2.52-8.2,2.34-11.42-.21-3.8-1.03-7.29-4.19-7.32-4.28-.03-5.8,8.87-5.8,12.09v6.65c0,1.21.52,2.12,1.37,2.58v.15h-4.65v-.15Z"/>
            <path d="M35.53,11.42C35.53,4.62,38.23,0,42.6,0c2,0,3.7.88,4.74,2.13l-.82,3.07-.15.06c-.42-3.13-2.12-4.56-3.76-4.56-3.07,0-4.46,4.98-4.92,8.53h12.66v.15c-.76.4-1.43,1.18-1.43,2.52v6.16c-1,2.73-2.79,4.55-5.98,4.55-4.65,0-7.41-4.49-7.41-11.2ZM46.98,16.85v-3.61c0-3.13-.7-3.25-6.13-3.25h-3.25c-.03.55-.06,1.06-.06,1.49,0,6.13,2.22,10.45,5.41,10.45,1.91,0,4.04-1.85,4.04-5.07Z"/>
            <path d="M62.31,17.61l-1.73,4.55h-10.11v-.15c.82-.39,1.43-1.24,1.43-2.58V3.19c0-1.09-.49-2.16-1.43-2.58v-.15h4.77v.15c-.97.43-1.43,1.49-1.43,2.58v16.25c0,.39.06.76.15,1.06.3.64,1,.97,1.82.97,2.64,0,4.8-1,6.32-3.92l.21.06Z"/>
            <path d="M62.22,11.39C62.22,4.56,65.13,0,69.51,0c3.25,0,5.13,1.76,6.07,5.13l-1.52,3.07-.15-.06c.21-4.43-1.64-7.44-4.46-7.44-2.67,0-4.65,3.34-5.1,8.5h3.49c1.09,0,2.22-.49,2.64-1.43h.15v3.64h-.15c-.43-.97-1.55-1.4-2.64-1.4h-3.55c-.03.46-.06.91-.06,1.37-.06,6.32,2.07,10.54,5.28,10.54,2.82,0,4.68-3.01,4.46-7.44l.15-.06,1.52,3.07c-.94,3.37-2.82,5.13-6.07,5.13-4.43,0-7.35-4.49-7.35-11.23Z"/>
            <path d="M81.78,11.39C81.78,4.56,84.69,0,89.06,0c3.25,0,5.13,1.76,6.07,5.13l-1.52,3.07-.15-.06c.21-4.43-1.64-7.44-4.46-7.44-3.04,0-5.16,4.28-5.22,10.69-.06,6.32,2.06,10.54,5.28,10.54,2.82,0,4.68-3.01,4.46-7.44l.15-.06,1.52,3.07c-.94,3.37-2.82,5.13-6.07,5.13-4.43,0-7.35-4.49-7.35-11.23Z"/>
            <path d="M94.56,22.01c.39-.12,1.4-1.21,1.91-3.34l3.64-15.15c.24-1.73-.58-2.55-1.34-2.92v-.15h4.65l4.37,18.19c.52,2.13,1.52,3.25,1.91,3.37v.15h-5.16v-.15c.82-.39,1.73-1.34,1.25-3.34l-.91-3.83v.06h-6.47l-.88,3.77c-.49,2,.42,2.95,1.25,3.34v.15h-4.22v-.15ZM104.7,14.06l-3.04-12.75-3.04,12.75h6.07Z"/>
            <path d="M109.13,15.12l1.73-3.07.15.06c-.88,6.92,1.52,9.69,4.31,9.81,2.76.12,4.83-2.79,4.04-5.77-1.15-4.4-9.99-5.59-9.99-10.99C109.38,2.13,112.2,0,115.18,0c3.16,0,5.5,1.76,6.04,5.13l-1.52,3.07-.15-.06c.21-4.43-1.46-7.23-4.22-7.44-1.91-.15-4.52,1.21-3.98,4.46.7,4.16,10.05,5.65,10.05,11.3,0,4.19-3.49,6.16-6.13,6.16-3.43,0-6.95-2.61-6.13-7.5Z"/>
            <path d="M122.04,22.01c.82-.39,1.43-1.24,1.43-2.58V3.19c0-1.09-.49-2.16-1.43-2.58v-.15h4.77v.15c-.97.43-1.43,1.49-1.43,2.58v8.56l6.16-8.56c1.12-1.55-.18-2.55-.27-2.58v-.15h4.25v.15c-.21.09-1.31.61-2.46,2.16l-3.89,5.25,5.1,10.66c1,2.1,1.79,3.01,2.16,3.34v.15h-4.71v-.15c.76-.39,1.55-1.06.61-3.04l-4.4-9.26-2.55,3.46v6.26c0,1.34.61,2.19,1.37,2.58v.15h-4.71v-.15Z"/>
          </svg>
        </div>
      )}
    </>
  );
}

// ─── Single image label ───────────────────────────────────────────────────────

function SingleImageOutput({ baseLabel, formData, onBack }) {
  const dims = LABEL_DIMS[baseLabel.size];
  const baseUrl = import.meta.env.BASE_URL;
  const fgColor = formData.fgColor || '#111111';
  const bgColor = formData.bgColor || '#ffffff';
  const isTaller = !!baseLabel.tallerBars;
  const isRoundel = !!baseLabel.isRoundel;

  // Scale blank image area proportionally from 500ml reference values
  const hr = dims.labelH / 303;
  const blankTop = Math.round(-33 * hr);
  const blankLeft = formData.singleCask ? Math.round(90 * hr) : Math.round(40 * hr);
  const blankW = formData.singleCask ? Math.round(471 * hr) : Math.round(521 * hr);
  const blankH = Math.round(269 * hr);

  return (
    <OutputWrapper onBack={onBack}>
      <LabelPage
        dims={dims}
        cropsFile={isTaller ? 'crops50-taller.png' : dims.cropsFile}
        pageBackground={`url(${baseUrl}${isTaller ? 'sample50cl-tallerbars.png' : dims.barsFile})`}
      >
        {formData.image && (
          isRoundel ? (
            <div style={{
              position: 'absolute',
              top: dims.roundelTop, left: dims.roundelLeft, width: dims.roundelW, height: dims.roundelH,
              backgroundImage: `url(${formData.image})`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              zIndex: 1,
            }} />
          ) : (
            <div style={{
              position: 'absolute',
              top: blankTop, left: blankLeft, width: blankW, height: blankH,
              backgroundImage: `url(${formData.image})`,
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              zIndex: 1,
            }} />
          )
        )}
        {isRoundel ? (
          <SideInfoPanels
            fgColor={fgColor} bgColor={bgColor}
            strength={formData.strength} singleCask={formData.singleCask}
            baseUrl={baseUrl}
            {...roundelPanelProps(dims)}
          />
        ) : (
          <SideInfoPanels
            fgColor={fgColor} bgColor={bgColor}
            strength={formData.strength} singleCask={formData.singleCask}
            baseUrl={baseUrl}
          />
        )}
        <ReferenceTag dims={dims} value={formData.reference} onDark={!!formData.referenceOnDark} />
      </LabelPage>
    </OutputWrapper>
  );
}

// ─── Generic (unimplemented) output ──────────────────────────────────────────

function GenericOutput({ baseLabel, template, onBack }) {
  return (
    <div className="output-shell">
      <div className="output-unavailable">
        <p>Output for <em>{baseLabel.name} — {template.name}</em> is coming soon.</p>
        <button className="back-btn" onClick={onBack}>← Back to form</button>
      </div>
    </div>
  );
}

// ─── 50ml mini label (shared across contact sheet templates) ─────────────────

const MINI_LABEL_STYLES = {
  blank:    { barBg: '#111111', barFg: '#c8a050', barText: 'Blended Malt Scotch Whisky' },
  wedding:  { barBg: '#111111', barFg: '#c8a050', barText: 'Wedding Edition' },
  birthday: { barBg: '#111111', barFg: '#c8a050', barText: 'Happy Birthday' },
};

function MiniLabel({ blendName, createdBy, strength, reference, labelStyle = 'blank' }) {
  const STRIP_W = 28;
  const BAR_H = 38;
  const style = MINI_LABEL_STYLES[labelStyle] ?? MINI_LABEL_STYLES.blank;

  return (
    <div style={{
      width: CONTACT_LABEL_W, height: CONTACT_LABEL_H,
      display: 'flex', flexDirection: 'column',
      border: '0.5px solid #aaa', overflow: 'hidden', background: '#fff',
      fontFamily: '"Raleway", sans-serif',
    }}>
      {/* Main row */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left strip — "Bottled by whiskyblender.com", bottom-to-top */}
        <div style={{
          width: STRIP_W, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRight: '0.5px solid #ddd',
        }}>
          <span style={{
            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
            fontSize: 5.5, letterSpacing: '0.06em', whiteSpace: 'nowrap',
            color: '#666',
          }}>
            Bottled by whiskyblender.com
          </span>
        </div>

        {/* Centre — name + "By" + creator, inset gold frame */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '8px 6px',
        }}>
          <div style={{
            width: '100%', height: '100%',
            border: '1px solid #c8a050',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '6px', textAlign: 'center', gap: 3,
            position: 'relative',
          }}>
            <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.15, color: '#111' }}>
              {blendName || 'Whisky Name'}
            </div>
            <div style={{ fontSize: 7, color: '#555' }}>By</div>
            <div style={{ fontSize: 8, fontWeight: 600, color: '#111', lineHeight: 1.2 }}>
              {createdBy || '—'}
            </div>
            {reference && (
              <div style={{
                position: 'absolute', bottom: 3, right: 4,
                fontSize: 5, color: '#aaa', fontFamily: '"Roboto Mono", monospace',
                letterSpacing: '0.04em',
              }}>
                {reference}
              </div>
            )}
          </div>
        </div>

        {/* Right strip — strength + 50ml, top-to-bottom */}
        <div style={{
          width: STRIP_W, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderLeft: '0.5px solid #ddd',
        }}>
          <span style={{
            writingMode: 'vertical-rl',
            fontSize: 5.5, letterSpacing: '0.06em', whiteSpace: 'nowrap',
            color: '#666',
          }}>
            {strength || '46'}% abv.  ·  50ml
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        height: BAR_H, flexShrink: 0,
        background: style.barBg, color: style.barFg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 5.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>
        {style.barText}
      </div>
    </div>
  );
}

function ContactSheetWebsiteOutput({ formData, onBack }) {
  return (
    <OutputWrapper onBack={onBack}>
      <div style={{ width: CONTACT_PAGE_W, height: CONTACT_PAGE_H, background: '#ffffff', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: CONTACT_MARGIN_Y, left: CONTACT_MARGIN_X,
          display: 'grid',
          gridTemplateColumns: `repeat(${CONTACT_COLS}, ${CONTACT_LABEL_W}px)`,
          gap: CONTACT_GAP,
        }}>
          {Array.from({ length: CONTACT_COLS * CONTACT_ROWS }).map((_, i) => (
            <MiniLabel key={i} blendName={formData.blendName} createdBy={formData.createdBy} strength={formData.strength} reference={formData.reference} labelStyle={formData.labelStyle} />
          ))}
        </div>
      </div>
    </OutputWrapper>
  );
}

// ─── 50ml contact sheet ───────────────────────────────────────────────────────

const CONTACT_COLS = 3;
const CONTACT_ROWS = 4;
const CONTACT_LABEL_W = 227;  // ~60mm at 96dpi
const CONTACT_LABEL_H = 250;  // ~66mm at 96dpi
const CONTACT_PAGE_W = 794;   // A4 portrait at 96dpi
const CONTACT_PAGE_H = 1123;
const CONTACT_GAP = 11;       // ~3mm between labels
const CONTACT_MARGIN_X = Math.round((CONTACT_PAGE_W - CONTACT_COLS * CONTACT_LABEL_W - (CONTACT_COLS - 1) * CONTACT_GAP) / 2);
const CONTACT_MARGIN_Y = Math.round((CONTACT_PAGE_H - CONTACT_ROWS * CONTACT_LABEL_H - (CONTACT_ROWS - 1) * CONTACT_GAP) / 2);

function ContactSheetOutput({ formData, onBack }) {
  return (
    <OutputWrapper onBack={onBack}>
      <div style={{ width: CONTACT_PAGE_W, height: CONTACT_PAGE_H, background: '#ffffff', position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: CONTACT_MARGIN_Y,
          left: CONTACT_MARGIN_X,
          display: 'grid',
          gridTemplateColumns: `repeat(${CONTACT_COLS}, ${CONTACT_LABEL_W}px)`,
          gap: CONTACT_GAP,
        }}>
          {Array.from({ length: CONTACT_COLS * CONTACT_ROWS }).map((_, i) => (
            <div key={i} style={{
              width: CONTACT_LABEL_W,
              height: CONTACT_LABEL_H,
              backgroundImage: formData.image ? `url(${formData.image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              outline: formData.image ? 'none' : '1px dashed #bbb',
            }} />
          ))}
        </div>
      </div>
    </OutputWrapper>
  );
}

// ─── Label output router ──────────────────────────────────────────────────────

function LabelOutput({ baseLabel, template, formData, onBack }) {
  if (template.id === 'website-options-contact') {
    return <ContactSheetWebsiteOutput formData={formData} onBack={onBack} />;
  }

  if (template.id === 'single-image-contact') {
    return <ContactSheetOutput formData={formData} onBack={onBack} />;
  }

  if (template.id === 'tampa-whisky-club') {
    return <TampaOutput formData={formData} onBack={onBack} />;
  }

  if (template.id === 'website-options-singlemalt') {
    return <SingleMaltOutput baseLabel={baseLabel} formData={formData} onBack={onBack} />;
  }

  if (template.id === 'website-options-blended') {
    return <BlendedMaltOutput baseLabel={baseLabel} formData={formData} onBack={onBack} />;
  }

  if (template.id === 'single-image-blended') {
    return <BlendedSingleImageOutput baseLabel={baseLabel} formData={formData} onBack={onBack} />;
  }

  if (template.id === 'single-image') {
    return <SingleImageOutput baseLabel={baseLabel} formData={formData} onBack={onBack} />;
  }

  return <GenericOutput baseLabel={baseLabel} template={template} onBack={onBack} />;
}

// ─── App shell ────────────────────────────────────────────────────────────────

function AppShell({ children }) {
  const baseUrl = import.meta.env.BASE_URL;
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <a className="app-header__brand" href="../">
            <img src={`${baseUrl}wb-logo.svg`} alt="Whisky Blender" className="app-header__logo" />
          </a>
          <span className="app-header__title">Label Generator</span>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

// ─── Step 1: Choose base label ────────────────────────────────────────────────

const BASE_TABS = [
  { heading: '500ml', filter: b => b.size === '500ml' },
  { heading: '200ml', filter: b => b.size === '200ml' },
  { heading: 'Other', filter: b => b.size !== '500ml' && b.size !== '200ml' },
  { heading: 'Legacy', legacy: true },
];

const LEGACY_LINKS = [
  { label: 'Core label generator', url: 'https://www.drewnotweird.com/whiskyblender/label/' },
  { label: 'Tampa label generator', url: 'https://www.drewnotweird.com/whiskyblender/tampa/' },
  { label: 'Single malts label generator', url: 'https://www.drewnotweird.com/whiskyblender/singlemalts/' },
];

function StepOne() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const tab = BASE_TABS[activeTab];
  return (
    <AppShell>
      <div className="step-shell">
        <div className="step-header">
          <div className="step-eyebrow">Step 1 of 3</div>
          <h1 className="step-title">Choose label</h1>
          <p className="step-desc">Select the base label format for your bottle.</p>
        </div>
        <div className="base-tabs">
          {BASE_TABS.map((t, i) => (
            <button
              key={t.heading}
              className={`base-tab${i === activeTab ? ' base-tab--active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {t.heading}
            </button>
          ))}
        </div>
        {tab.legacy ? (
          <div className="legacy-links">
            {LEGACY_LINKS.map(({ label, url }) => (
              <a key={url} href={url} className="legacy-link" target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
          </div>
        ) : (
          <div className="base-grid">
            {BASE_LABELS.filter(tab.filter).map(base => (
              <button key={base.id} className="base-card" onClick={() => navigate(`/${base.id}/`)}>
                <span className="base-card__name">{base.name.charAt(0).toUpperCase() + base.name.slice(1)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ─── Step 2: Choose template ──────────────────────────────────────────────────

function StepTwo() {
  const { baseId } = useParams();
  const navigate = useNavigate();
  const base = BASE_LABELS.find(b => b.id === baseId);
  if (!base) return <Navigate to="/" replace />;
  const templates = getTemplatesForBase(base.id);
  return (
    <AppShell>
      <div className="step-shell">
        <div className="step-header">
          <div className="step-eyebrow">Step 2 of 3</div>
          <h1 className="step-title">Choose template</h1>
          <p className="step-desc"><span className="step-desc__label">{base.name}</span></p>
        </div>
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <div className="template-grid">
          {templates.map(tmpl => (
            <button key={tmpl.id} className="template-card" onClick={() => navigate(`/${baseId}/${tmpl.id}/`)}>
              <span className="template-card__name">{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

// ─── Step 3: Fill in form ─────────────────────────────────────────────────────

function StepThree({ baseLabel, template, initialValues, onGenerate, onBack }) {
  const [values, setValues] = useState(() => {
    const defaults = {};
    template.fields.forEach(f => {
      if (f.type === 'select' || f.type === 'color-swatch' || f.type === 'preset-image')
        defaults[f.key] = f.default ?? f.options[0].value;
      else if (f.type === 'checkbox' || f.type === 'checkbox-inline') defaults[f.key] = false;
      else if (f.type === 'strength') defaults[f.key] = f.default ?? '';
      else defaults[f.key] = f.default ?? '';
    });
    return initialValues ? { ...defaults, ...initialValues } : defaults;
  });
  const [imageUrl, setImageUrl] = useState(initialValues?.image || null);

  const handleChange = (key, value) => {
    setValues(prev => {
      const next = { ...prev, [key]: value };
      const getLum = v => COLOR_PALETTE.find(c => c.value === v)?.luminance;
      if (key === 'bgColor') {
        const bgLum = getLum(value);
        if (bgLum && getLum(next.fgColor) === bgLum)
          next.fgColor = COLOR_PALETTE.find(c => c.luminance !== bgLum)?.value ?? next.fgColor;
      }
      if (key === 'fgColor') {
        const fgLum = getLum(value);
        if (fgLum && getLum(next.bgColor) === fgLum)
          next.bgColor = COLOR_PALETTE.find(c => c.luminance !== fgLum)?.value ?? next.bgColor;
      }
      return next;
    });
  };

  const handleFile = (key, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setValues(prev => ({ ...prev, [key]: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(values);
  };

  return (
    <AppShell>
      <div className="step-shell">
        <div className="step-header">
          <div className="step-eyebrow">Step 3 of 3</div>
          <h1 className="step-title">{template.name}</h1>
          <p className="step-desc"><span className="step-desc__label">{baseLabel.name}</span></p>
        </div>
        <button type="button" className="back-btn" onClick={onBack}>← Back</button>
        <form className="label-form" onSubmit={handleSubmit}>
          {template.fields.map(field => {
            if (field.type === 'checkbox-inline') return null;
            const inlineCheckbox = field.key === 'reference'
              ? template.fields.find(f => f.type === 'checkbox-inline')
              : null;
            return (
            <div key={field.key} className="form-field">
              <label className="form-label" htmlFor={field.key}>{field.label}</label>

              {field.type === 'preset-image' ? (
                <div className="color-swatches">
                  {field.options.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`color-swatch${values[field.key] === opt.value ? ' color-swatch--selected' : ''}`}
                      onClick={() => handleChange(field.key, opt.value)}
                    >
                      <span className="color-swatch__dot" style={opt.value === '' ? {
                        backgroundColor: '#ffffff',
                        height: '72px',
                      } : {
                        backgroundImage: `url(${import.meta.env.BASE_URL}images/${opt.value})`,
                        backgroundSize: '600%',
                        backgroundPosition: 'center center',
                        height: '72px',
                      }} />
                      <span className="color-swatch__label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              ) : field.type === 'color-swatch' ? (
                <div className="color-swatches">
                  {field.options.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`color-swatch${values[field.key] === opt.value ? ' color-swatch--selected' : ''}`}
                      onClick={() => handleChange(field.key, opt.value)}
                    >
                      <span className="color-swatch__dot" style={{ backgroundColor: opt.value }} />
                      <span className="color-swatch__label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              ) : field.type === 'select' ? (
                <select id={field.key} className="form-select" value={values[field.key]}
                  onChange={e => handleChange(field.key, e.target.value)}>
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={values[field.key]}
                    onChange={e => handleChange(field.key, e.target.checked)}
                  />
                  <span>Yes</span>
                </label>
              ) : field.type === 'file' ? (
                <div className="file-field">
                  <input id={field.key} type="file" accept={field.accept}
                    className="form-file-input"
                    onChange={e => handleFile(field.key, e.target.files[0])} />
                  <label htmlFor={field.key} className="form-file-btn">
                    {imageUrl ? 'Change image' : 'Choose image'}
                  </label>
                  {imageUrl && (
                    <div className="file-preview">
                      <img src={imageUrl} alt="Preview" className="file-preview__img" />
                    </div>
                  )}
                </div>
              ) : field.type === 'strength' ? (
                <div className="strength-input">
                  <input id={field.key} type="number" className="form-input form-input--strength"
                    value={values[field.key]} min="0" max="99" step="1"
                    onChange={e => handleChange(field.key, e.target.value)} />
                  <span className="strength-unit">% abv.</span>
                </div>
              ) : inlineCheckbox ? (
                <div className="input-with-inline-checkbox">
                  <input id={field.key} type="text" className="form-input"
                    placeholder={field.placeholder} value={values[field.key]}
                    onChange={e => handleChange(field.key, e.target.value)} />
                  <label className="form-checkbox form-checkbox--inline">
                    <input
                      type="checkbox"
                      checked={values[inlineCheckbox.key]}
                      onChange={e => handleChange(inlineCheckbox.key, e.target.checked)}
                    />
                    <span>{inlineCheckbox.label}</span>
                  </label>
                </div>
              ) : (
                <input id={field.key} type="text" className="form-input"
                  placeholder={field.placeholder} value={values[field.key]}
                  onChange={e => handleChange(field.key, e.target.value)} />
              )}
            </div>
            );
          })}
          <div className="form-actions">
            <button type="submit" className="generate-btn">Generate label →</button>
            {template.sample && (
              <button type="button" className="sample-btn" onClick={() => onGenerate(template.sample)}>
                Try a sample
              </button>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}

// ─── Step 3 + output route ────────────────────────────────────────────────────

function StepThreeOrOutput() {
  const { baseId, templateId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showOutput, setShowOutput] = useState(() => searchParams.toString() !== '');
  const [imageUrl, setImageUrl] = useState(null);
  const lastDataRef = useRef(null);

  const base = BASE_LABELS.find(b => b.id === baseId);
  const template = ALL_TEMPLATES[templateId];
  if (!base || !template) return <Navigate to="/" replace />;

  const hasUrlData = searchParams.toString() !== '';
  const isOutput = showOutput;

  const decodedData = useMemo(
    () => hasUrlData ? decodeFormData(template, searchParams) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.toString()],
  );

  // Merge URL-decoded text fields with in-memory image
  const outputData = useMemo(() => {
    const textData = decodedData || lastDataRef.current || {};
    return imageUrl ? { ...textData, image: imageUrl } : textData;
  }, [decodedData, imageUrl]);

  const handleGenerate = (data) => {
    lastDataRef.current = data;
    if (data.image) setImageUrl(data.image);
    const encoded = encodeFormData(data);
    if (Object.keys(encoded).length > 0) {
      setSearchParams(encoded);
    }
    setShowOutput(true);
  };

  const handleEdit = () => {
    // Keep search params so form can re-populate from URL on edit
    setShowOutput(false);
  };

  if (isOutput) {
    return (
      <div className="app app--output">
        <LabelOutput baseLabel={base} template={template} formData={outputData} onBack={handleEdit} />
      </div>
    );
  }

  // Prefer in-memory ref (has image); fall back to URL-decoded data
  const formInitial = lastDataRef.current
    ? { ...lastDataRef.current, image: imageUrl }
    : decodedData;

  return (
    <StepThree
      baseLabel={base}
      template={template}
      initialValues={formInitial}
      onGenerate={handleGenerate}
      onBack={() => navigate(`/${baseId}/`)}
    />
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StepOne />} />
      <Route path="/:baseId/" element={<StepTwo />} />
      <Route path="/:baseId/:templateId/" element={<StepThreeOrOutput />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
