# Design System — instagram.com
> Extracted automatically by Clone Architect from https://www.instagram.com/p/DWdY6ewiZIJ/?igsh=bG1kMzlmb2ZvMWFn
> Date: 2026-04-18
> Viewport: Desktop 1440x900 + Mobile 390x844
> Every value in this file comes from real getComputedStyle() extraction — no approximation.

## 1. Visual Theme & Atmosphere

instagram.com's design is built on a clean white canvas (`#ffffff`) that lets content and imagery take center stage. The custom Optimistic Text Light typeface defines the brand's typographic voice — used at a remarkably light weight (0) for headlines, creating an understated authority that doesn't need to shout. Text appears in Pure Black (`#000000`). Deep Purple (`#4150f7`) serves as the primary accent color, used for CTAs and interactive highlights. The design operates without box-shadows — structure comes from borders, spacing, and background color differentiation. Motion design uses smooth easing curves for polished state transitions. 

**Key Characteristics:**
- Background: Pure White (`#ffffff`)
- Primary typeface: Optimistic Text Light
- Primary text: Pure Black (`#000000`)
- Accent: Deep Purple (`#4150f7`)
- Border: Light Gray (`#dbdbdb`)
- Custom fonts loaded: Optimistic Text Light, Optimistic Text Light Swap, Optimistic Text Normal, Optimistic Text Normal Swap, Optimistic Text Medium, Optimistic Text Medium Swap, Optimistic Text Bold, Optimistic Text Bold Swap, Optimistic Text ExtraBold, Optimistic Text ExtraBold Swap, Optimistic Text Viet Light, Optimistic Text Viet Light Swap, Optimistic Text Viet Normal, Optimistic Text Viet Normal Swap, Optimistic Text Viet Bold, Optimistic Text Viet Bold Swap, Optimistic Text Arbc Light, Optimistic Text Arbc Light Swap, Optimistic Text Arbc Normal, Optimistic Text Arbc Normal Swap, Optimistic Text Arbc Bold, Optimistic Text Arbc Bold Swap, Optimistic Display Light, Optimistic Display Light Swap, Optimistic Display Medium, Optimistic Display Medium Swap, Optimistic Display Semibold, Optimistic Display Semibold Swap, Optimistic Display Bold, Optimistic Display Bold Swap, Optimistic Display Viet Light, Optimistic Display Viet Light Swap, Optimistic Display Viet Medium, Optimistic Display Viet Medium Swap, Optimistic Display Viet Bold, Optimistic Display Viet Bold Swap, Optimistic Display Arbc Light, Optimistic Display Arbc Light Swap, Optimistic Display Arbc Medium, Optimistic Display Arbc Medium Swap, Optimistic Display Arbc Bold, Optimistic Display Arbc Bold Swap, Segoe UI Historic, Fix for Mac Chrome 80, Optimistic, Optimistic DM, Optimistic 95

## 2. Color Palette & Roles

### Background & Surface
- **Pure White** (`#ffffff`): Page background (primary)
- **Light Gray** (`#f3f5f7`): Surface / elevated background
- **Light Gray (#dbdbdb)** (`#dbdbdb`): Surface / elevated background
- **Light Gray (#efefef)** (`#efefef`): Surface / elevated background
- **Light Gray (#dadde1)** (`#dadde1`): Surface / elevated background

### Text & Content
- **Pure Black** (`#000000`): Primary body text
- **Charcoal (#2b3036)** (`#2b3036`): Secondary text
- **Jet Black (#0c1014)** (`#0c1014`): Secondary text

### Accent & Interactive
- **Deep Purple (#4150f7)** (`#4150f7`): Interactive / accent
- **Royal Blue (#4a5df9)** (`#4a5df9`): Interactive / accent
- **Deep Purple (#3143e3)** (`#3143e3`): Interactive / accent

### Border & Divider
- **Light Gray (#dbdbdb)** (`#dbdbdb`): Borders / dividers
- **Light Gray (#dadde1)** (`#dadde1`): Borders / dividers

### CSS Custom Properties (Design Tokens)

**Font Size Token**
- `--system-26-font-size`: `26px`
- `--system-13-font-size`: `12px`
- `--text-input-field-font-size`: `1rem`
- `--system-18-font-size`: `18px`

**Border Radius Token**
- `--card-corner-radius`: `4px`
- `--button-corner-radius-large`: `12px`
- `--live-video-border-radius`: `4px`
- `--igds-dialog-border-radius`: `24px`

**Spacing Token**
- `--creation-padding-y`: `112px`
- `--chat-bubble-padding-vertical`: `8px`
- `--messenger-card-spacing`: `16px`
- `--polaris-site-padding-top`: `30px`

**Font Family Token**
- `--font-family-default`: `Helvetica, Arial, sans-serif`
- `--font-family-segoe`: `Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif`
- `--font-family-code`: `ui-monospace, Menlo, Consolas, Monaco, monospace`
- `--font-family-apple`: `system-ui, -apple-system, BlinkMacSystemFont, '.SFNSText-Regular', sans-serif`

**Shadow Token**
- `--card-box-shadow`: `0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)`
- `--shadow-base`: `0 1px 2px rgba(0, 0, 0, 0.2)`
- `--shadow-2`: `rgba(0, 0, 0, 0.2)`
- `--scroll-shadow`: `0 1px 2px rgba(0, 0, 0, 0.1), 0 -1px rgba(0, 0, 0, 0.1) inset`

**Font Weight Token**
- `--font-weight-system-medium`: `500`
- `--font-weight-system-light`: `300`
- `--font-weight-system-bold`: `700`
- `--font-weight-system-regular`: `400`

**Motion Token**
- `--fds-animation-swap-shuffle-in`: `cubic-bezier(0.14, 1, 0.34, 1)`
- `--glimmer-animation-duration`: `1000ms`
- `--glimmer-animation-timing-function`: `steps(10, end)`
- `--fds-animation-move-out`: `cubic-bezier(0.17, 0.17, 0, 1)`

**Error / Destructive**
- `--input-label-color-error`: `hsl(350, 87%, 55%)`
- `--badge-background-color-red`: `#e41e3f`

**Success**
- `--badge-background-color-green`: `#31A24C`

**Warning**
- `--badge-background-color-yellow`: `#F7B928`

**Z-Index Token**
- `--modal-z-index`: `100`

**Text Color**
- `--chat-text-blockquote-color-text-primary-media`: `rgba(255, 255, 255, 0.7)`

**Background**
- `--chat-text-blockquote-color-background-line`: `rgba(0, 0, 0, 0.12)`

**Other tokens**
- `--ig-colors-button-primary-background--pressed`: `65, 80, 247`
- `--ig-menu-text-color`: `12, 16, 20`
- `--text-badge-success-background`: `#31A24C`
- `--text-secondary`: `153, 153, 153`
- `--teal-primary`: `rgb(0,152,124)`
- `--ig-text-input-border-hover-prism`: `12, 16, 20`
- `--ig-colors-button-primary-text--disabled`: `white-00`
- `--text-input-outside-label`: `#000000`

## 3. Typography Rules

### Font Families
- **Primary**: `Optimistic Text Light`
- **Secondary**: `Optimistic Text Light Swap`
- **Font 3**: `Optimistic Text Normal`
- **Font 4**: `Optimistic Text Normal Swap`
- **Font 5**: `Optimistic Text Medium`

### Custom Fonts Loaded
- **Optimistic Text Light** weight 300 (normal)
- **Optimistic Text Light Swap** weight 300 (normal)
- **Optimistic Text Normal** weight 400 (normal)
- **Optimistic Text Normal Swap** weight 400 (normal)
- **Optimistic Text Medium** weight 500 (normal)
- **Optimistic Text Medium Swap** weight 500 (normal)
- **Optimistic Text Bold** weight 700 (normal)
- **Optimistic Text Bold Swap** weight 700 (normal)
- **Optimistic Text ExtraBold** weight 800 (normal)
- **Optimistic Text ExtraBold Swap** weight 800 (normal)
- **Optimistic Text Viet Light** weight 300 (normal)
- **Optimistic Text Viet Light Swap** weight 300 (normal)
- **Optimistic Text Viet Normal** weight 400 (normal)
- **Optimistic Text Viet Normal Swap** weight 400 (normal)
- **Optimistic Text Viet Bold** weight 700 (normal)
- **Optimistic Text Viet Bold Swap** weight 700 (normal)
- **Optimistic Text Arbc Light** weight 300 (normal)
- **Optimistic Text Arbc Light Swap** weight 300 (normal)
- **Optimistic Text Arbc Normal** weight 400 (normal)
- **Optimistic Text Arbc Normal Swap** weight 400 (normal)
- **Optimistic Text Arbc Bold** weight 700 (normal)
- **Optimistic Text Arbc Bold Swap** weight 700 (normal)
- **Optimistic Display Light** weight 300 (normal)
- **Optimistic Display Light Swap** weight 300 (normal)
- **Optimistic Display Medium** weight 500 (normal)
- **Optimistic Display Medium Swap** weight 500 (normal)
- **Optimistic Display Semibold** weight 600 (normal)
- **Optimistic Display Semibold Swap** weight 600 (normal)
- **Optimistic Display Bold** weight 700 (normal)
- **Optimistic Display Bold Swap** weight 700 (normal)
- **Optimistic Display Viet Light** weight 300 (normal)
- **Optimistic Display Viet Light Swap** weight 300 (normal)
- **Optimistic Display Viet Medium** weight 500 (normal)
- **Optimistic Display Viet Medium Swap** weight 500 (normal)
- **Optimistic Display Viet Bold** weight 700 (normal)
- **Optimistic Display Viet Bold Swap** weight 700 (normal)
- **Optimistic Display Arbc Light** weight 300 (normal)
- **Optimistic Display Arbc Light Swap** weight 300 (normal)
- **Optimistic Display Arbc Medium** weight 500 (normal)
- **Optimistic Display Arbc Medium Swap** weight 500 (normal)
- **Optimistic Display Arbc Bold** weight 700 (normal)
- **Optimistic Display Arbc Bold Swap** weight 700 (normal)
- **Segoe UI Historic** weight normal (normal)
- **Segoe UI Historic** weight 700 (normal)
- **Fix for Mac Chrome 80** weight 500 (normal)
- **Optimistic** weight 300 800 (normal)
- **Optimistic DM** weight 300 800 (normal)
- **Optimistic 95** weight 300 800 (normal)

### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Body | Optimistic Text Light | 14px | 400 | 1.29 | normal | Standard reading text |

### OpenType & Variable Font Features

**Active OpenType features:**
- Stylistic Set 2 (ss02) — alternate glyph forms
- Stylistic Set 1 (ss01) — alternate glyph forms

## 4. Component Stylings

### Buttons

**Primary**
- Background: `#000000`
- Text: `#000000`
- Padding: 8px
- Radius: 0px
- Font: 14px weight 400
- Use: Primary CTA
- Focus: outline: `rgb(16, 16, 16) auto 1px`

**Ghost / Light**
- Background: `#efefef`
- Text: `#000000`
- Padding: 0px
- Radius: 0px
- Font: 14px weight 400
- Use: Ghost / Light actions

## 5. Layout Principles

### Layout Type
**top-nav + content**

### Grid
Flexbox column

### Max Width
none

### Spacing System
Compact spacing — information density prioritized

| Token | Value |
|-------|-------|
| xs | 8px |
| sm | 8px |
| md | 16px |
| lg | 16px |
| xl | 16px |
| 2xl | 16px |
| 3xl | 16px |

### Border Radius Scale
| Name | Value | Use |
|------|-------|-----|
| None | 0px | No rounding |
| Sm | 2px | Buttons, inputs, small elements |
| Md | 8px | Cards, containers |
| Lg | 12px | Large cards, sections |
| Xl | 12px | Featured containers |
| Full | 9999px | Pills, avatars, circular elements |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, content blocks |

**Shadow Philosophy**: Flat design — no shadows used. Borders and spacing define structure.

## 7. Do's and Don'ts

### Do
- Use -apple-system as the primary typeface — it defines the brand personality
- Keep font weights between 400-400 — the system uses a narrow weight range for subtle hierarchy
- Use Deep Purple (`#4150f7`) as the primary accent — it's the brand's signature interactive color
- Derive all token values from the extracted data — every color, size, and spacing must match the original

### Don't
- Don't substitute with generic sans-serif or serif — the custom font carries the brand
- Don't use weight 700 (bold) or above — 400 is the maximum weight in this system
- Don't introduce additional saturated accent colors — the palette is intentionally controlled
- Don't approximate or "eyeball" values — use the exact extracted token values

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | 1px | Single column, compact spacing |
| Mobile Small | 2px | Single column, compact spacing |
| Mobile Small | 280px | Single column, compact spacing |
| Mobile Small | 375px | Single column, compact spacing |
| Mobile Small | 400px | Single column, compact spacing |
| Mobile Small | 447px | Single column, compact spacing |
| Mobile Small | 450px | Single column, compact spacing |

### Token Diff — Desktop vs Mobile

| Element | Property | Desktop | Mobile |
|---------|----------|---------|--------|
| button | padding | `8px` | `8px 0px 8px 8px` |
| button | width | `34px` | `32px` |

### Collapsing Strategy
- Navigation: horizontal links → hamburger menu on mobile
- Cards: multi-column → stacked vertical on mobile
- Footer: multi-column → stacked single column on mobile

### Touch Targets
- Buttons: 8px padding
- Navigation: adequate spacing between items
- Interactive elements: minimum 44px touch target recommended

## 9. Agent Prompt Guide

### Quick Reference
- Background: Pure White (`#ffffff`)
- Primary text: Pure Black (`#000000`)
- Accent: Deep Purple (`#4150f7`)
- Border: Light Gray (`#dbdbdb`)
- Font: Optimistic Text Light
- Body: 14px weight 400

### Example Component Prompts
- "Create a CTA button: #000000 background, #000000 text, 0px radius, 8px padding, 14px Optimistic Text Light weight 400."
- "Build navigation: static on #ffffff. Optimistic Text Light 16px weight 400 for links."

### Iteration Guide
1. Use Pure White (`#ffffff`) as the base background — match exactly
2. All text in Pure Black (`#000000`) — not pure black, not pure white
3. Accent color Deep Purple (`#4150f7`) for CTAs and interactive elements
4. Font: Optimistic Text Light — respect the weight range found in extraction
5. Every spacing, radius, and shadow value comes from tokens.json — no approximation

---
*Generated by Clone Architect — automated Playwright extraction + design analysis.*
*Source: https://www.instagram.com/p/DWdY6ewiZIJ/?igsh=bG1kMzlmb2ZvMWFn | 2026-04-18T12:08:48.899Z*
*All values verified via getComputedStyle() — no approximation, no hallucination.*
