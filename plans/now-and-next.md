# Now & Next — Project Plan

A web app for parents and carers of autistic children. Tools to support daily routine, transitions, and communication.

---

## Vision

Calm, clear, and reassuring. Not clinical. Not babyish. Designed for the child but usable by the parent. The kind of thing you'd be happy to put on a tablet and hand to your kid.

**Tone:** Friendly, warm, simple. Language like "What's happening now" not "Current task".
**Style:** Minimalist geometric shapes. Rounded corners. Calm palette (soft blues, greens, warm neutrals). High contrast text. Large touch targets.

---

## Tools (phased)

### Phase 1

#### 1. Now & Next board
Shows two things: what's happening **now**, and what's coming **next**.
- Each slot has a pictogram + label
- Tap "done" to advance (Next becomes Now, a new Next is chosen)
- **"First and Then" mode:** reframed language ("First we do X, then we do Y") — same mechanic, different wording and possibly layout

#### 2. Today's Plan
A vertical sequence of steps for the day (e.g. wake up → breakfast → get dressed → school).
- Each step has a pictogram + label
- Tap to mark as done (crossed out or greyed out)
- **"Routine" mode:** the same plan repeats daily without needing to rebuild it — saved as a named routine (e.g. "Morning routine", "Bedtime routine")

---

### Phase 2+ (future tools, not in scope yet)
- Choice board (pick between two or more options)
- Feelings check-in
- Timer / countdown visual
- Social stories builder
- Reward chart

---

## Pictograms

### Source: Mulberry Symbols
- **License:** CC-BY-SA 2.0 (UK) — allows commercial use and modification ✓
- **Format:** SVG — ideal for restyling ✓
- **Size:** ~3,000 symbols
- **Repo:** https://github.com/mulberrysymbols/mulberry-symbols

### Approach to custom styling
The SVGs from Mulberry are clean enough to restyle programmatically or via Illustrator/Figma. Options:
1. **CSS fill override** — load SVGs inline, override colours with CSS custom properties. Fast, no regeneration needed.
2. **AI-assisted redraw** — use the Mulberry set as reference, generate a custom flat geometric set in a consistent style. More work but fully ownable aesthetic.
3. **Hybrid** — use Mulberry as-is for launch, commission/generate a custom set for V2.

Recommendation: start with CSS-styled Mulberry SVGs for Phase 1. Define the visual style clearly enough that a custom set could be generated later without rebuilding the UI.

### Categories needed for Phase 1
- Activities (eating, brushing teeth, getting dressed, school, play, bath, bed, etc.)
- Places (home, school, shops, park, etc.)
- People (mum, dad, teacher, friend, etc.)
- Feelings (happy, sad, tired, angry, etc.)
- Time markers (now, next, morning, afternoon, evening)

---

## Auth & data

### Login
- Email + password (simple, no OAuth friction for parents)
- Or magic link (even simpler — no password to forget)

### What gets saved
- **Symbols library** — user's saved/favourited pictograms with custom labels
- **Boards** — named Now & Next boards (e.g. "School morning", "Hospital visit")
- **Routines** — saved Today's Plan sequences that repeat

### Stack
- **Frontend:** React + Vite (same as other apps in this repo)
- **Backend:** Node/Express + Prisma (same pattern as Wunwurd)
- **Database:** PostgreSQL
- **Auth:** JWT or session-based; consider `lucia-auth` or rolling our own (it's simple enough)
- **Hosting:** Frontend on Fasthosts like other apps. Backend needs a server — could use Railway, Render, or a VPS.

---

## Design system

### Palette (draft — to be refined)
| Name | Hex | Use |
|------|-----|-----|
| Sky | `#E8F4FD` | Background |
| Calm | `#5B9BD5` | Primary action |
| Sage | `#7BC67E` | Success / done |
| Warm | `#F9F3E8` | Card background |
| Stone | `#4A4A4A` | Body text |
| Soft red | `#E8706A` | Alerts / remove |

### Typography
- Clear, rounded sans-serif. Consider: **Nunito**, **Atkinson Hyperlegible** (designed for low vision), or **Lexie Readable**
- Large base size (18px+)
- Labels on pictograms: bold, short, sentence case

### Components needed
- PictogramCard — image + label, tappable, "done" state
- Board — 2-slot (Now/Next) or linear sequence (Today's Plan)
- SymbolPicker — searchable grid of pictograms
- Slot — placeholder when empty, drag-and-drop target

---

## Open questions
1. Should the symbol picker search happen client-side (bundle the SVG index) or server-side?
2. Do we want offline support (PWA)? Parents might use this without wifi.
3. Should children be able to interact directly, or is it always parent-configured?
4. "First and Then" vs "Now and Next" — are these genuinely different modes or just label swaps?
5. What happens when Now & Next runs out of items?

---

## First steps
1. Set up `apps/nowandnext/frontend` skeleton (Vite + React)
2. Download Mulberry SVG set, build a script to index them by category/keyword
3. Design the Now & Next board component — static first, no backend
4. Agree on colour palette and font before building anything else
5. Set up backend skeleton with auth once frontend shape is clear
