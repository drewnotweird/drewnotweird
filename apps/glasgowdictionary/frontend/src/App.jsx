import { useState, useEffect, useRef, useCallback } from 'react';
import { words } from './data/words';

// Slide 0 = intro, slides 1–26 = words a–z
const TOTAL = words.length + 1;

// Returns the shortest offset for looping carousels (avoids long cross-fade on wrap)
function shortestOffset(index, current) {
  const raw = index - current;
  if (raw > TOTAL / 2) return raw - TOTAL;
  if (raw < -TOTAL / 2) return raw + TOTAL;
  return raw;
}

// ─── Intro slide ───────────────────────────────────────────────────────────────

function IntroSlide({ onStart }) {
  return (
    <div className="intro-slide">
      <div className="intro-body">
        <p className="intro-tagline">Haud yer wheesht an lissen up</p>
        <h1 className="intro-title">
          Glasgow<br />Dictionary
        </h1>
        <p className="intro-desc">
          Wan word fir every letter ae the alphabet. Definitions, examples, an
          a wee phonetic guide so ye dinnae make a complete eejit ae yersel.
        </p>
        <button className="intro-start-btn" onClick={onStart}>
          Stert wi A
          <span className="intro-arrow">→</span>
        </button>
      </div>
      <p className="intro-hint">or tap any letter below</p>
    </div>
  );
}

// ─── Sound button ──────────────────────────────────────────────────────────────

function SoundButton({ audio }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setPlaying(true);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnd = () => setPlaying(false);
    el.addEventListener('ended', onEnd);
    return () => el.removeEventListener('ended', onEnd);
  }, []);

  return (
    <>
      {audio && <audio ref={audioRef} src={`${import.meta.env.BASE_URL}${audio.replace(/^\//, '')}`} />}
      <button
        className={`sound-btn${!audio ? ' sound-btn--unavailable' : ''}${playing ? ' sound-btn--playing' : ''}`}
        onClick={audio ? handlePlay : undefined}
        aria-label={audio ? 'Hear pronunciation' : 'No audio available'}
        title={audio ? 'Hear pronunciation' : 'Audio coming soon'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      </button>
    </>
  );
}

// ─── Word slide ────────────────────────────────────────────────────────────────

function WordSlide({ word }) {
  const hasPhoto = Boolean(word.photo);

  return (
    <div className="word-card">
      <div className="word-photo">
        {hasPhoto ? (
          <img src={`${import.meta.env.BASE_URL}${word.photo.replace(/^\//, '')}`} alt={`${word.word} — Glasgow Dictionary`} />
        ) : (
          <div className="photo-placeholder">
            <span className="photo-letter">{word.letter.toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="word-content">
        <div className="word-header">
          <h1 className="word-title">{word.word}</h1>
          <SoundButton audio={word.audio} />
        </div>

        {word.phonetic && (
          <p className="word-phonetic">[ {word.phonetic} ]</p>
        )}

        <div className="word-entries">
          {word.entries.map((entry, ei) => (
            <div key={ei} className="entry">
              <p className="entry-meta">
                <em>{entry.partOfSpeech}</em>
                {entry.plural && (
                  <span className="entry-plural"> &nbsp;·&nbsp; plural: {entry.plural}</span>
                )}
              </p>

              {entry.definitions.map((def, di) => (
                <p key={di} className="definition">
                  {entry.definitions.length > 1 && (
                    <span className="def-num">{di + 1}.&nbsp;</span>
                  )}
                  {def}
                </p>
              ))}

              {entry.notes && (
                <p className="entry-notes">{entry.notes}</p>
              )}

              {entry.examples && entry.examples.length > 0 && (
                <ul className="examples">
                  {entry.examples.map((ex, xi) => (
                    <li key={xi} className="example" style={{ whiteSpace: 'pre-line' }}>{ex}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Alphabet nav ──────────────────────────────────────────────────────────────

const NAV_ITEM_W = 44; // px — width of each nav slot

function AlphabetNav({ current, onNavigate }) {
  // All items: intro (index 0) + one per word (index 1–26)
  const items = [
    { key: 'intro', index: 0, isIntro: true },
    ...words.map((w, i) => ({ key: w.letter, index: i + 1, label: w.letter.toUpperCase(), isIntro: false })),
  ];

  return (
    <nav className="alphabet-nav" aria-label="Alphabet navigation">
      {/* Items slide past the fixed center highlight */}
      <div className="nav-items">
        {items.map(({ key, index, label, isIntro }) => {
          const offset = shortestOffset(index, current);
          return (
            <button
              key={key}
              className={`nav-item${current === index ? ' active' : ''}`}
              style={{ '--nav-offset': offset }}
              onClick={() => onNavigate(index)}
              aria-label={isIntro ? 'Introduction' : label}
            >
              {isIntro ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              ) : label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Desktop nav arrows ────────────────────────────────────────────────────────

function NavArrow({ direction, onClick }) {
  return (
    <button
      className={`nav-arrow nav-arrow--${direction}`}
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous word' : 'Next word'}
    >
      {direction === 'prev' ? '←' : '→'}
    </button>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Wrap-around navigation
  const navigate = useCallback((index) => {
    setCurrent(((index % TOTAL) + TOTAL) % TOTAL);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      // Don't intercept if focus is in a scrollable area (let normal scroll happen)
      if (e.key === 'ArrowRight') navigate(current + 1);
      else if (e.key === 'ArrowLeft') navigate(current - 1);
      else if (e.key.match(/^[a-z]$/i)) {
        const letterIndex = e.key.toLowerCase().charCodeAt(0) - 96; // a=1 … z=26
        navigate(letterIndex);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, navigate]);

  // Touch/swipe handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Only treat as horizontal swipe if predominantly horizontal
    if (Math.abs(dx) > 60 && Math.abs(dx) > dy * 1.5) {
      navigate(dx < 0 ? current + 1 : current - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="app"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Desktop navigation arrows */}
      <NavArrow direction="prev" onClick={() => navigate(current - 1)} />
      <NavArrow direction="next" onClick={() => navigate(current + 1)} />

      <div className="slides-container">
        {/* Intro */}
        <div
          className={`slide${current === 0 ? ' active' : ''}`}
          style={{ '--offset': String(shortestOffset(0, current)) }}
          aria-hidden={current !== 0}
        >
          <IntroSlide onStart={() => navigate(1)} />
        </div>

        {/* Word slides */}
        {words.map((word, i) => {
          const slideIndex = i + 1;
          const offset = shortestOffset(slideIndex, current);
          // Only render content for nearby slides for performance
          const isNearby = Math.abs(offset) <= 2;
          return (
            <div
              key={word.letter}
              className={`slide${current === slideIndex ? ' active' : ''}`}
              style={{ '--offset': String(offset) }}
              aria-hidden={current !== slideIndex}
            >
              {isNearby && <WordSlide word={word} />}
            </div>
          );
        })}
      </div>

      <AlphabetNav current={current} onNavigate={navigate} />

    </div>
  );
}
