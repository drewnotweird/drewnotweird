# Whisky Blender Prototype — Rules & Logic

## Blend Codes

### Format
`WB` followed by 6 random digits (e.g. `WB141154`). Generated at time of bottling in `thelab.html`.

### Storage
Stored in `sessionStorage` under the key `wb_XXXXXX`:
```json
{
  "name": "My Blend",
  "creator": "whiskyblender.com",
  "recipe": [25, 25, 25, 25, 0]
}
```
`recipe` is an array of 5 percentage values (0–100), one per lab option, summing to 100.

### URL Passing
The blend code travels through the site as a `?blend=XXXXXX` query parameter. Every link in the custom product flow must carry this param forward:
- `thelab.html` → `customoptions.html?blend=CODE`
- `customoptions.html` → `custom-product.html?handle=HANDLE&blend=CODE`
- `custom-product.html` "Other options" / "See more" → `customoptions.html?blend=CODE`
- Related products grid → each card href includes `&blend=CODE`

---

## The Lab (`thelab.html`)

### Options
5 cask options, each with a fixed colour identity:

| # | Name | Colour |
|---|------|--------|
| 0 | Banana split | Yellow (`#f4e495`) |
| 1 | Malted Bacon | Green (`#9bd5c5`) |
| 2 | Spicy Beeswax | Red (`#f3d3d3`) |
| 3 | Salty Butter | Blue (`#c9e1f0`) |
| 4 | Charred Marshmallow | Brown (`#dcd0bc`) |

### Blending Rules
- Each press of `+` or `−` adjusts the option by `STEP = 5%`
- `MAX = 20` presses = 100% total
- `+` is disabled when `total >= MAX`
- `−` is disabled when `presses[i] === 0`

### On Reaching 100%
On mobile (viewport width < 600px), the page automatically scrolls the pie wheel into the centre of the viewport.

### Prefill from Blend Code
If a `?blend=` param is present on load, the lab reads the sessionStorage entry and reconstructs the blend:
- `presses[i] = recipe[i] / STEP`
- Name and creator fields are populated
- All cards re-render
- Changing anything and submitting creates a **new** blend code — it does not overwrite the original

### Submission
A blend code is generated and the blend is saved to sessionStorage. The user is forwarded to `customoptions.html?blend=CODE`.

---

## Press Animations

All animations avoid opacity changes. Force-reflow (`void el.offsetWidth`) is used to restart animations on rapid presses.

| Element | Add press | Remove press |
|---------|-----------|--------------|
| Percentage pill (`.wb-option-amount`) | Scale 0.9 → 1.1 → 0.97 → 1 (0.4s) | Scale 1 → 0.9 → 1 (0.3s) |
| `+` / `−` button | Same as pill | Same as pill |
| Fill bar (`.wb-sticky-lab`) | Scale 0.97 → 1.03 → 0.99 → 1 (0.4s) | Scale 1 → 0.97 → 1 (0.3s) |
| Card gradient flash | Grows from bottom + fades simultaneously (0.5s) — add only | — |

### Card Gradient Flash
On add, a full-height gradient overlay rises from the bottom of the card image and fades out as it grows. The colour matches the pie wheel tint for that option (see table above). The gradient runs from 100% colour at the bottom to transparent at the top.

---

## Custom Options (`customoptions.html`)

### With a blend code (`?blend=` present)
- Heading: random Scottish phrase (e.g. "Ya dancer!", "Belter!", "Magic!")
- Sub-heading: "Now choose how you want to bottle your whisky…"

### Without a blend code
- Heading: "Bottle options"
- Sub-heading: "There are a few different bottles we can offer, but first you need to decide what to fill it with."
- Button: "Create something" → `create.html`

---

## Custom Products (`custom-product.html`)

- Blend code is displayed as: `Blend code: WBXXXXXX (Change)`
- "Change" links back to `thelab.html?blend=CODE` so the user can edit the recipe; submitting there creates a new code
- The "Other options" / "See more" link must carry the blend code: `customoptions.html?blend=CODE`

---

## Related Products (`js/wb-related.js`)

Rendered via `WBRelated.render(gridEl, config)`.

### `type: 'product'`
Same collection products appear first, then featured products. The current product (by `handle`) is excluded.

### `type: 'custom'`
All custom products except the current one. Blend code is appended to every card href.

---

## Perfect Drams (`perfectdrams.html`)

Each dram is a premade blend. On page load, a blend code is generated and stored in sessionStorage for each dram using:
- `name`: the dram's display name (e.g. "Rich and bold")
- `creator`: `'whiskyblender.com'` (the user can change this on the product page)
- `recipe`: preset percentages across the 5 lab options

Cards link to `customoptions.html?blend=CODE`.

---

## Single Malts (`singlemalts.html` → `custom-malt.html`)

Each product in the single malts collection links to `custom-malt.html?handle=HANDLE`.

| Handle | Product |
|--------|---------|
| `aultmore-2011` | Aultmore 2011 Barrel |
| `teaninich-2014` | Teaninich 2014 Barrel |
| `glenburgie-2015` | Glenburgie 2015 Hogshead |
| `craigellachie-2013` | Craigellachie 2013 Hogshead |
| `macallan-32` | Macallan 32 year old |
| `highland-park-32` | Highland Park 32 year old |

The `custom-malt.html` page reads `?handle=`, pre-selects the matching radio button, and updates the page title and heading.

---

## Vouchers (`vouchers.html`)

Changing the theme radio pre-selects a new main image. On mobile, the viewport scrolls back to the first slide (the main image) whenever the theme changes.

| Theme value | Image |
|-------------|-------|
| `cheers` | `voucher-standard.jpg` |
| `celebrate` | `voucher-celebrate.jpg` |
| `love` | `voucher-love.jpg` |
| `thanks` | `voucher-thanks.jpg` |

---

## Loader / Error / Retry Pattern

Used on pages that depend on a data load (currently `thelab.html`). Reusable for other scenarios.

1. **Loading state**: loader spinner shown, `<main>` hidden
2. **Failure**: error panel shown with:
   - Friendly failure message
   - Link to the shop
   - Retry button with a note that retrying may not help if the issue persists
3. **Retry**: shows the loader again briefly, then loads successfully (in the prototype, first attempt always fails, retry always succeeds)

---

## Global Rules

- **No text selection on tap**: `user-select: none` applied to all interactive cards, buttons, labels, and list items
- **Blend code always in URL**: never stored only in sessionStorage without a corresponding `?blend=` param in the URL — the param is what ties the session data to the page
