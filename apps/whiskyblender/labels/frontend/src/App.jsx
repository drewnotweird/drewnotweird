import { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { BASE_LABELS, ALL_TEMPLATES, getTemplatesForBase, LABEL_DIMS } from './data/labels';

// ─── URL encoding / decoding ──────────────────────────────────────────────────

// Form field key → URL param name
const FIELD_TO_PARAM = {
  blendName:    'blend-name',
  createdBy:    'created-by',
  distillery:   'distillery',
  reference:    'reference',
  color:        'color',
  labelStyle:   'labelstyle',
  singleCask:   'single-cask',
  series:       'series',
  customerName: 'customer-name',
  description:  'description',
  keyImage:     'key-image',
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
    if (f.type === 'select') formData[f.key] = f.options[0].value;
    else if (f.type === 'checkbox') formData[f.key] = false;
    else formData[f.key] = '';
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
      <LabelPage dims={dims} cropsFile="crops50-tampa.png" pageBackground={`url(${baseUrl}sample50cl.png)`}>
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

// ─── Single malt (website options) label ─────────────────────────────────────

const SINGLEMALT_PRINT_COLORS = {
  white: { color: '#ffffff', textShadow: '1px 1px #000000' },
  black: { color: '#000000', textShadow: '1px 1px #ffffff' },
};

function SingleMaltOutput({ baseLabel, formData, onBack }) {
  const dims = LABEL_DIMS[baseLabel.size];
  const baseUrl = import.meta.env.BASE_URL;

  const style = SINGLEMALT_PRINT_COLORS.white; // website options always white text
  const bgFile = `singlemalt${baseLabel.size === '200ml' ? '200ml' : '500ml'}-${formData.labelStyle || 'option_1'}.jpg`;
  const caskOverlayFile = baseLabel.size === '200ml' ? 'singlecask20-black.png' : 'singlecask50-black.png';

  const blendNameRef = useRef(null);
  useAutoFontSize(blendNameRef, formData.blendName);

  return (
    <OutputWrapper onBack={onBack}>
      <LabelPage dims={dims} cropsFile="crops50-tampa.png" pageBackground={`url(${baseUrl}images/${bgFile})`}>
        {/* Single cask overlay on the page (covers full content + padding area) */}
        {formData.singleCask && (
          <div style={{
            position: 'absolute',
            top: -dims.pagePaddingTop,
            left: -(dims.pageW - dims.labelW) / 2,
            width: dims.pageW,
            height: dims.pageH + dims.pagePaddingTop,
            backgroundImage: `url(${baseUrl}images/${caskOverlayFile})`,
            backgroundSize: 'cover',
            zIndex: 9,
            pointerEvents: 'none',
          }} />
        )}

        {/* Blend name */}
        <div style={{
          fontFamily: '"trimPosterCompressed", sans-serif',
          fontWeight: 400,
          position: 'absolute',
          top: dims.outerTop, left: dims.outerLeft,
          width: dims.outerW, height: dims.outerH,
          textTransform: 'uppercase',
          display: 'grid',
          placeContent: 'center',
          justifyContent: 'start',
          scale: String(dims.scale),
          zIndex: 4,
          color: style.color,
          textShadow: style.textShadow,
          overflow: 'hidden',
        }}>
          <div ref={blendNameRef}>
            {insertSpaceForLongWords(formData.blendName)}
          </div>
        </div>

        {/* Distillery name */}
        {formData.distillery && (
          <div style={{
            fontFamily: '"Raleway", sans-serif',
            position: 'absolute',
            top: dims.sideTop, left: dims.sideLeft,
            width: dims.sideW, height: dims.sideH,
            scale: String(dims.scale),
            zIndex: 3,
            overflow: 'hidden',
          }}>
            <div style={{ fontSize: 7, lineHeight: '10px', fontWeight: 700, color: style.color, textShadow: style.textShadow }}>
              {formData.distillery}
            </div>
          </div>
        )}

        {/* Reference — rotated */}
        {formData.reference && (
          <div style={{
            position: 'absolute',
            transform: 'rotate(-90deg)',
            right: dims.refRight, top: dims.refTop,
            height: 20, width: 80,
            zIndex: 2,
            textAlign: 'right',
          }}>
            <div style={{
              fontFamily: '"Roboto Mono", monospace',
              fontSize: dims.refFontSize,
              lineHeight: `${dims.refFontSize + 2}px`,
              opacity: 0.6,
              color: style.color,
              textShadow: style.textShadow,
            }}>
              {formData.reference}
            </div>
          </div>
        )}
      </LabelPage>
    </OutputWrapper>
  );
}

// ─── Single image label ───────────────────────────────────────────────────────


function SingleImageOutput({ baseLabel, formData, onBack }) {
  const dims = LABEL_DIMS[baseLabel.size];

  return (
    <OutputWrapper onBack={onBack}>
      <LabelPage dims={dims}>
        {formData.image && (
          <div style={{
            position: 'absolute',
            top: dims.imgTop, left: dims.imgLeft,
            width: dims.imgW, height: dims.imgH,
            backgroundImage: `url(${formData.image})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            zIndex: 1,
          }} />
        )}
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

// ─── Label output router ──────────────────────────────────────────────────────

function LabelOutput({ baseLabel, template, formData, onBack }) {
  if (baseLabel.size === '50ml') {
    return (
      <div className="output-shell">
        <div className="output-unavailable">
          <p>50ml contact sheet output is coming soon.</p>
          <button className="back-btn" onClick={onBack}>← Back to form</button>
        </div>
      </div>
    );
  }

  if (template.id === 'tampa-whisky-club') {
    return <TampaOutput formData={formData} onBack={onBack} />;
  }

  if (template.id === 'website-options-singlemalt') {
    return <SingleMaltOutput baseLabel={baseLabel} formData={formData} onBack={onBack} />;
  }

  if (template.id === 'single-image') {
    return <SingleImageOutput baseLabel={baseLabel} formData={formData} onBack={onBack} />;
  }

  return <GenericOutput baseLabel={baseLabel} template={template} onBack={onBack} />;
}

// ─── App shell ────────────────────────────────────────────────────────────────

function AppShell({ children }) {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <a className="app-header__brand" href="../">Whisky Blender</a>
          <span className="app-header__title">Label Generator</span>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

// ─── Step 1: Choose base label ────────────────────────────────────────────────

function StepOne() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="step-shell">
        <div className="step-header">
          <div className="step-eyebrow">Step 1 of 3</div>
          <h1 className="step-title">Choose label</h1>
          <p className="step-desc">Select the base label format for your bottle.</p>
        </div>
        <div className="base-grid">
          {BASE_LABELS.map(base => (
            <button key={base.id} className="base-card" onClick={() => navigate(`/${base.id}/`)}>
              <span className="base-card__size">{base.size}</span>
              <span className="base-card__name">{base.name}</span>
            </button>
          ))}
        </div>
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
        <div className="template-grid">
          {templates.map(tmpl => (
            <button key={tmpl.id} className="template-card" onClick={() => navigate(`/${baseId}/${tmpl.id}/`)}>
              <span className="template-card__name">{tmpl.name}</span>
            </button>
          ))}
        </div>
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      </div>
    </AppShell>
  );
}

// ─── Step 3: Fill in form ─────────────────────────────────────────────────────

function StepThree({ baseLabel, template, initialValues, onGenerate, onBack }) {
  const [values, setValues] = useState(() => {
    const defaults = {};
    template.fields.forEach(f => {
      if (f.type === 'select') defaults[f.key] = f.options[0].value;
      else if (f.type === 'checkbox') defaults[f.key] = false;
      else defaults[f.key] = '';
    });
    return initialValues ? { ...defaults, ...initialValues } : defaults;
  });
  const [imageUrl, setImageUrl] = useState(initialValues?.image || null);

  const handleChange = (key, value) => setValues(prev => ({ ...prev, [key]: value }));

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
        <form className="label-form" onSubmit={handleSubmit}>
          {template.fields.map(field => (
            <div key={field.key} className="form-field">
              <label className="form-label" htmlFor={field.key}>{field.label}</label>

              {field.type === 'select' ? (
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
              ) : (
                <input id={field.key} type="text" className="form-input"
                  placeholder={field.placeholder} value={values[field.key]}
                  onChange={e => handleChange(field.key, e.target.value)} />
              )}
            </div>
          ))}
          <div className="form-actions">
            <button type="submit" className="generate-btn">Generate label →</button>
            {template.sample && (
              <button type="button" className="sample-btn" onClick={() => onGenerate(template.sample)}>
                Try a sample
              </button>
            )}
            <button type="button" className="back-btn" onClick={onBack}>← Back</button>
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

  const base = BASE_LABELS.find(b => b.id === baseId);
  const template = ALL_TEMPLATES[templateId];
  if (!base || !template) return <Navigate to="/" replace />;

  const hasOutput = searchParams.toString() !== '';
  const decodedData = useMemo(
    () => hasOutput ? decodeFormData(template, searchParams) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.toString()],
  );

  // Persist last generated values so the form stays pre-populated on Edit
  const lastDataRef = useRef(null);
  if (decodedData) lastDataRef.current = decodedData;

  const handleGenerate = (data) => setSearchParams(encodeFormData(data));
  const handleEdit = () => setSearchParams({});

  if (hasOutput && decodedData) {
    return (
      <div className="app app--output">
        <LabelOutput baseLabel={base} template={template} formData={decodedData} onBack={handleEdit} />
      </div>
    );
  }

  return (
    <StepThree
      baseLabel={base}
      template={template}
      initialValues={lastDataRef.current}
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
