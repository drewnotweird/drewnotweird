import { useState, useEffect, useRef, useMemo } from 'react';
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
  website:      'website',
  // 'image' (file blob) is intentionally excluded
};
const PARAM_TO_FIELD = Object.fromEntries(Object.entries(FIELD_TO_PARAM).map(([k, v]) => [v, k]));

function encodeToUrl(base, template, formData) {
  const params = new URLSearchParams();
  params.set('base', base.id);
  params.set('tmpl', template.id);
  Object.entries(formData).forEach(([key, value]) => {
    if (key === 'image') return;
    const param = FIELD_TO_PARAM[key] || key;
    if (value !== null && value !== undefined && value !== '' && value !== false) {
      params.set(param, String(value));
    }
  });
  return params.toString();
}

function decodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const baseId = params.get('base');
  const tmplId = params.get('tmpl');
  if (!baseId || !tmplId) return null;

  const base = BASE_LABELS.find(b => b.id === baseId);
  const template = ALL_TEMPLATES[tmplId];
  if (!base || !template) return null;

  // Start with field defaults
  const formData = {};
  template.fields.forEach(f => {
    if (f.type === 'select') formData[f.key] = f.options[0].value;
    else if (f.type === 'checkbox') formData[f.key] = false;
    else formData[f.key] = '';
  });

  // Override with URL values
  params.forEach((value, param) => {
    if (param === 'base' || param === 'tmpl') return;
    const key = PARAM_TO_FIELD[param] || param;
    formData[key] = key === 'singleCask' ? value === 'true' : value;
  });

  return { base, template, formData };
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
          overflow: 'hidden',
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

const PRINT_COLORS = {
  black: { color: '#000000', textShadow: '1px 1px #ffffff' },
  green: { color: '#006858', textShadow: '1px 1px #ffffff' },
  blue:  { color: '#27468f', textShadow: '1px 1px #ffffff' },
  red:   { color: '#9d0500', textShadow: '1px 1px #ffffff' },
  white: { color: '#ffffff', textShadow: '1px 1px #000000' },
};

function SingleImageOutput({ baseLabel, formData, onBack }) {
  const dims = LABEL_DIMS[baseLabel.size];
  const style = PRINT_COLORS[formData.color] || PRINT_COLORS.black;

  const blendNameRef = useRef(null);
  useAutoFontSize(blendNameRef, formData.blendName);

  return (
    <OutputWrapper onBack={onBack}>
      <LabelPage dims={dims}>
        {/* Background image */}
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

        {/* Creator name */}
        {formData.createdBy && (
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
              {formData.createdBy}
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

// ─── Step 1: Choose base label ────────────────────────────────────────────────

function StepOne({ onSelect }) {
  return (
    <div className="step-shell">
      <div className="step-header">
        <div className="step-eyebrow">Step 1 of 3</div>
        <h1 className="step-title">Choose label</h1>
        <p className="step-desc">Select the base label format for your bottle.</p>
      </div>
      <div className="base-grid">
        {BASE_LABELS.map(base => (
          <button key={base.id} className="base-card" onClick={() => onSelect(base)}>
            <span className="base-card__size">{base.size}</span>
            <span className="base-card__name">{base.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Choose template ──────────────────────────────────────────────────

function StepTwo({ baseLabel, onSelect, onBack }) {
  const templates = getTemplatesForBase(baseLabel.id);
  return (
    <div className="step-shell">
      <div className="step-header">
        <div className="step-eyebrow">Step 2 of 3</div>
        <h1 className="step-title">Choose template</h1>
        <p className="step-desc"><span className="step-desc__label">{baseLabel.name}</span></p>
      </div>
      <div className="template-grid">
        {templates.map(tmpl => (
          <button key={tmpl.id} className="template-card" onClick={() => onSelect(tmpl)}>
            <span className="template-card__name">{tmpl.name}</span>
          </button>
        ))}
      </div>
      <button className="back-btn" onClick={onBack}>← Back</button>
    </div>
  );
}

// ─── Step 3: Fill in form ─────────────────────────────────────────────────────

function StepThree({ baseLabel, template, onGenerate, onBack }) {
  const [values, setValues] = useState(() => {
    const init = {};
    template.fields.forEach(f => {
      if (f.type === 'select') init[f.key] = f.options[0].value;
      else if (f.type === 'checkbox') init[f.key] = false;
      else init[f.key] = '';
    });
    return init;
  });
  const [imageUrl, setImageUrl] = useState(null);

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
          <button type="button" className="back-btn" onClick={onBack}>← Back</button>
        </div>
      </form>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  // Initialise from URL params if present (direct/shared link to a label)
  const initial = useMemo(() => {
    const decoded = decodeFromUrl();
    if (decoded) return { step: 4, ...decoded };
    return { step: 1, base: null, template: null, formData: null };
  }, []);

  const [step, setStep] = useState(initial.step);
  const [selectedBase, setSelectedBase] = useState(initial.base || null);
  const [selectedTemplate, setSelectedTemplate] = useState(initial.template || null);
  const [formData, setFormData] = useState(initial.formData || null);

  // Handle browser back/forward while on the label output view
  useEffect(() => {
    const onPopState = () => {
      const decoded = decodeFromUrl();
      if (decoded) {
        setSelectedBase(decoded.base);
        setSelectedTemplate(decoded.template);
        setFormData(decoded.formData);
        setStep(4);
      } else {
        setFormData(null);
        setStep(prev => (prev === 4 ? 3 : prev));
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleBaseSelect = (base) => { setSelectedBase(base); setStep(2); };
  const handleTemplateSelect = (tmpl) => { setSelectedTemplate(tmpl); setStep(3); };

  const handleGenerate = (data) => {
    setFormData(data);
    setStep(4);
    const qs = encodeToUrl(selectedBase, selectedTemplate, data);
    window.history.pushState({}, '', `?${qs}`);
  };

  const handleBackToStep1 = () => {
    setSelectedBase(null); setSelectedTemplate(null); setFormData(null); setStep(1);
    window.history.pushState({}, '', window.location.pathname);
  };
  const handleBackToStep2 = () => {
    setSelectedTemplate(null); setFormData(null); setStep(2);
    window.history.pushState({}, '', window.location.pathname);
  };
  const handleBackToStep3 = () => {
    setFormData(null); setStep(3);
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className={`app${step === 4 ? ' app--output' : ''}`}>
      {step !== 4 && (
        <header className="app-header">
          <div className="app-header__inner">
            <span className="app-header__brand">Whisky Blender</span>
            <span className="app-header__title">Label Generator</span>
          </div>
        </header>
      )}
      <main className="app-main">
        {step === 1 && <StepOne onSelect={handleBaseSelect} />}
        {step === 2 && selectedBase && (
          <StepTwo baseLabel={selectedBase} onSelect={handleTemplateSelect} onBack={handleBackToStep1} />
        )}
        {step === 3 && selectedBase && selectedTemplate && (
          <StepThree baseLabel={selectedBase} template={selectedTemplate}
            onGenerate={handleGenerate} onBack={handleBackToStep2} />
        )}
        {step === 4 && selectedBase && selectedTemplate && formData && (
          <LabelOutput baseLabel={selectedBase} template={selectedTemplate}
            formData={formData} onBack={handleBackToStep3} />
        )}
      </main>
    </div>
  );
}
