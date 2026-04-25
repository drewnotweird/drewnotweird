# Whisky Blender — Rules & Logic

## Blend Codes

### Format
`WB` followed by 8 random alphanumeric characters (e.g. `WB4F2A91C3`). Issued by the server — never generated client-side.

### Issuance
When a customer submits their blend in the Lab, the recipe is posted to a server endpoint. The server saves it to the database, generates a unique code (random, 8 alphanumeric chars), and returns it. The customer is then forwarded to their blend URL. Generating the code server-side guarantees uniqueness and ensures the URL is only handed to the customer after the save has succeeded.

Uniqueness is enforced via a unique constraint on the DB column. On the rare collision, the server retries with a new code.

### Recipe schema
```json
{
  "name": "My Blend",
  "creator": "Andrew",
  "recipe": [25, 25, 25, 25, 0]
}
```
`recipe` is an array of 5 percentage values (0–100), one per lab option, summing to 100.

### Retrieval
The blend code in the URL is the only thing a customer needs to retrieve their blend — on any device, at any time. Any page that needs recipe data fetches it from the server by code. `sessionStorage` is not used for persistence; the server is the source of truth.

### URL structure
The blend code travels through the site as a `?blend=XXXXXX` query parameter. Every link in the custom product flow must carry this param forward:
- Lab → `customoptions?blend=CODE`
- Custom Options → `custom-product?handle=HANDLE&blend=CODE`
- Custom Product "Other options" / "See more" → `customoptions?blend=CODE`
- Related products grid → each card href includes `&blend=CODE`

---

## The Lab

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
- **Mobile** (< 600px): scrolls the pie wheel to the centre of the viewport
- **Desktop** (≥ 600px): scrolls to the input fields (`.wb-lab-inputs`)

### Pie Wheel Tap Navigation
On mobile (viewport width < 600px), tapping anywhere on the pie wheel scrolls to the corresponding option card. The tapped segment is determined by:
1. Calculating the tap angle relative to the pie centre, in CSS conic-gradient convention (0° = top, clockwise)
2. Reading the wheel's current animated rotation from its computed transform matrix
3. Subtracting the rotation to recover the original segment angle
4. Dividing by 72° (360° ÷ 5 options) to get the card index

The pie has `cursor: pointer` on mobile and `cursor: default` on desktop.

### Prefill from Blend Code
If a `?blend=` param is present on load, the lab fetches the recipe from the server and reconstructs the blend:
- `presses[i] = recipe[i] / STEP`
- Name and creator fields are populated
- All cards re-render
- Changing anything and submitting creates a **new** blend code — it does not overwrite the original

### Submission
The recipe, name, and creator are posted to the server. The server saves to the database, issues a new code, and returns it. The user is forwarded to `customoptions?blend=CODE`.

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
On add, a full-height gradient overlay rises from the bottom of the card image and fades out as it grows simultaneously. The colour matches the pie wheel tint for that option (see table above). The gradient runs from 100% colour at the bottom to transparent at the top. Implemented as a `::after` pseudo-element on `.wb-card-image`, animated with `scaleY` + `opacity`.

### Card Active State
On any button press (`+` or `−`), the card `li` receives the class `wb-card-active`, which triggers the same CSS rules as `:hover` — the background image zooms in and the cask image rises. The class is removed 900ms after the last press (debounced). This is necessary on mobile because the browser's native hover-on-tap behaviour is disrupted by the `::after` overlay on `.wb-card-image`.

### Fill Bar
The fill bar (`.wb-sticky-lab`) has `z-index: 300` to ensure it always sits above the card gradient flash overlay. It also has `will-change: transform` to prevent compositing flicker during the scale animation.

---

## Custom Options

### With a blend code (`?blend=` present)
- Heading: random Scottish phrase (e.g. "Ya dancer!", "Belter!", "Magic!")
- Sub-heading: "Now choose how you want to bottle your whisky…"

### Without a blend code
- Heading: "Bottle options"
- Sub-heading: "There are a few different bottles we can offer, but first you need to decide what to fill it with."
- Button: "Create something" → Lab

---

## Custom Products

- Blend code is displayed as: `Blend code: WBXXXXXX (Change)`
- "Change" links back to the Lab with `?blend=CODE` so the user can edit the recipe; submitting there creates a new code
- The "Other options" / "See more" link must carry the blend code: `customoptions?blend=CODE`

---

## Single Malts

Each single malt product entry in `WB_PRODUCTS` has an `href` field pointing to `custom-malt?handle=xxx`. This overrides the default `product?handle=` link and is respected by both the shop grid and the related products renderer.

All six single malts are part of the `custom` collection:

| Handle | Name |
|--------|------|
| `aultmore-2011` | Aultmore 2011 Barrel |
| `teaninich-2014` | Teaninich 2014 Barrel |
| `glenburgie-2015` | Glenburgie 2015 Hogshead |
| `craigellachie-2013` | Craigellachie 2013 Hogshead |
| `macallan-32` | Macallan 32 Year Old |
| `highland-park-32` | Highland Park 32 Year Old |

The single malt product page reads `?handle=`, pre-selects the matching radio button, and updates the page title and heading.

### `href` field
Any product entry in `WB_PRODUCTS` can include an `href` field to override the default `product?handle=xxx` link. Use it for products that have their own bespoke page (e.g. single malts).

---

## Related Products (`js/wb-related.js`)

Rendered via `WBRelated.render(gridEl, config)`.

### `type: 'product'`
Same collection products appear first, then featured products. The current product (by `handle`) is excluded.

### `type: 'custom'`
All custom products except the current one. Blend code is appended to every card href.

---

## Perfect Drams

Each dram is a premade blend with a fixed recipe. Blend codes for perfect drams are pre-issued by the server and stored in the database — they don't need to be generated at runtime. Each card links to `customoptions?blend=CODE` using its pre-assigned code.

The recipe schema follows the same format as customer blends:
- `name`: the dram's display name (e.g. "Rich and bold")
- `creator`: `'whiskyblender.com'` (the customer can change this on the product page)
- `recipe`: preset percentages across the 5 lab options

---

## Vouchers and Gift Card

Both products use the shared product page template. Their data lives in `WB_PRODUCTS` under keys `voucher` and `giftcard`.

### Product schema fields

| Field | Type | Description |
|-------|------|-------------|
| `denominations` | `[{value, label, disabled?}]` | Renders a "Value" radio group (voucher only; `null` for gift card) |
| `themes` | `[{value, label, image, disabled?}]` | Renders a "Theme" radio group; changing selection swaps the main image |
| `formNote` | `string` (HTML) | Inline note shown above the quantity input |
| `formNoteType` | `'note'` \| `'info'` | Controls icon — lightbulb for `note`, info icon for `info` |

### Theme image swap
Changing the theme radio swaps the main product image. On mobile (< 768px), the page also scrolls the `.wb-product-media` element into view so the customer sees the updated image.

---

## Shop Filters

Filters are rendered as radio buttons. Switching filter updates the product grid in-page (no page reload) using `history.pushState` to keep the URL in sync. The grid fades out, products are swapped, then it fades back in. Back/forward navigation is handled via `popstate`. Filter order: `featured` → config filters → `sale`.

---

## Loader / Error / Retry Pattern

Used on pages that depend on an async data load. States:

1. **Loading**: loader spinner shown, `<main>` hidden
2. **Failure**: error panel shown with a friendly message, a link to the shop, and a retry button
3. **Retry**: re-attempts the load from the beginning

---

## Contact Wizard (`contact.html`, `collaborate.html`)

A multi-step enquiry wizard replaces the old single-textarea contact form. It lives in both `contact.html` (standalone page) and the "Let's talk Scotch" section of `collaborate.html`. Styles are in `css/wb-contact.css`.

### Flow
```
Step 1 (contact): name / email* / phone  +  path choice
   ├── "Write a message"  →  message textarea  →  success
   └── "Collaborate"      →  about → quantity → whisky → label → additional info → success
```

### State (JS, IIFE per page)
- `answers` object collects all fields
- `stepHistory` array enables back-navigation
- `PROGRESS` maps step name → progress bar %

### Auto-advance steps (about / quantity / whisky / label)
Clicking a choice card calls `wbcwAnswer(field, value, nextStep, btn)`. After a 200 ms flash animation, the wizard advances automatically — no separate Next button needed.

### Shopify integration
At submit time, `buildBody()` compiles all answers into a formatted string for `contact[body]`. To wire into Shopify:
1. Wrap `<div class="wbcw">` in `{% form 'contact' %}...{% endform %}`
2. Add `<textarea name="contact[body]" id="wbcwHiddenBody" style="display:none"></textarea>` and hidden fields for name/email/phone
3. Uncomment the SHOPIFY block in `wbcwSubmit()`

---

## Global Rules

- **No text selection on tap**: `user-select: none` applied to all interactive cards, buttons, labels, and list items
- **Blend code always in URL**: the `?blend=` param is what ties the recipe to the page — always pass it forward through every link in the custom flow. The URL alone is enough for a customer to retrieve their blend on any device.
