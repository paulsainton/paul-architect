# Design System — akiflow.com
> Extracted automatically by Clone Architect from https://akiflow.com
> Date: 2026-04-18
> Viewport: Desktop 1440x900 + Mobile 390x844
> Every value in this file comes from real getComputedStyle() extraction — no approximation.

## 1. Visual Theme & Atmosphere

akiflow.com's design is built on a Off-White background (`#f8fafc`) providing a clean foundation for the interface. The custom Kite One typeface defines the brand's typographic voice — used at a remarkably light weight (400) for headlines, creating an understated authority that doesn't need to shout. Text appears in Pure Black (`#000000`). Deep Purple (`#0000ee`) serves as the primary accent color, used for CTAs and interactive highlights. The shadow system uses multi-layered shadows for natural, atmospheric depth — each elevation level combines multiple shadow layers for realistic lift. The site uses a variable font with OPSZ + WGHT axes, enabling precise weight/width control across the type hierarchy. 

**Key Characteristics:**
- Background: Off-White (`#f8fafc`)
- Primary typeface: Kite One
- Primary text: Pure Black (`#000000`)
- Accent: Deep Purple (`#0000ee`)
- Display: 56px weight 400, letter-spacing -1.68px
- Border: Light Gray (`#e5e7eb`)
- Shadow system: 2 unique shadow levels detected
- Custom fonts loaded: Kite One, Caveat, DM Sans, Geist, fontello Regular, Inter, Inter Variable, Kite One Placeholder, DM Sans Placeholder, Geist Placeholder, fontello Regular Placeholder, Inter Placeholder, Inter Variable Placeholder

## 2. Color Palette & Roles

### Background & Surface
- **Off-White** (`#f8fafc`): Page background (primary)
- **Pure White** (`#ffffff`): Surface / elevated background
- **Light Gray** (`#dfe7f0`): Surface / elevated background

### Text & Content
- **Pure Black** (`#000000`): Primary body text
- **Deep Purple (#0000ee)** (`#0000ee`): Secondary text
- **Violet (#7200cc)** (`#7200cc`): Secondary text
- **Dark Gray (#323b4a)** (`#323b4a`): Secondary text
- **Charcoal (#212833)** (`#212833`): Secondary text

### Accent & Interactive
- **Violet (#9000ff)** (`#9000ff`): Interactive / accent

### Border & Divider
- **Light Gray (#dfe7f0)** (`#dfe7f0`): Borders / dividers

### CSS Custom Properties (Design Tokens)

**Spacing Token**
- `--sj-tw-border-spacing-x`: `0`
- `--sj-tw-numeric-spacing`: ``
- `--sj-tw-border-spacing-y`: `0`

**Shadow Token**
- `--sj-tw-drop-shadow`: ``
- `--sj-tw-shadow`: `0 0 #0000`
- `--sj-tw-shadow-colored`: `0 0 #0000`
- `--sj-tw-ring-shadow`: `0 0 #0000`

**Other tokens**
- `--fallback-color-black`: `#050505`
- `--fallback-color-grey-700`: `#5E687B`
- `--fallback-color-grey-300`: `#DFE7F0`
- `--fallback-color-white`: `#FFFFFF`
- `--fallback-color-purple-100`: `#F3E3FF`
- `--fallback-color-purple-700`: `#550097`
- `--sj-tw-ring-color`: `rgba(59,130,246,.5)`
- `--fallback-color-grey-900`: `#212833`

## 3. Typography Rules

### Font Families
- **Primary**: `Kite One`
- **Secondary**: `Caveat`
- **Font 3**: `DM Sans`
- **Font 4**: `Geist`
- **Font 5**: `fontello Regular`

### Custom Fonts Loaded
- **Kite One** weight 400 (normal)
- **Caveat** weight 400 (normal)
- **DM Sans** weight 700 (normal)
- **DM Sans** weight 600 (normal)
- **DM Sans** weight 500 (normal)
- **Geist** weight 600 (normal)
- **Geist** weight 900 (normal)
- **Geist** weight 500 (normal)
- **Geist** weight 700 (normal)
- **Geist** weight 400 (normal)
- **fontello Regular** weight 400 (normal)
- **fontello Regular** weight normal (normal)
- **Inter** weight 500 (normal)
- **Inter** weight 400 (normal)
- **Inter** weight 600 (normal)
- **Inter** weight 700 (normal)
- **Inter Variable** weight 400 (normal)
- **Inter** weight 900 (normal)
- **Inter** weight 300 (normal)
- **Kite One Placeholder** weight normal (normal)
- **DM Sans Placeholder** weight normal (normal)
- **Geist Placeholder** weight normal (normal)
- **fontello Regular Placeholder** weight normal (normal)
- **Inter Placeholder** weight normal (normal)
- **Inter Variable Placeholder** weight normal (normal)

### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Inter Variable | 56px | 400 | 1.1 | -1.68px | Main headline (h1) |
| Sub-heading | Inter Variable | 20.8px | 400 | 1.2 | -0.624px | Third-level heading (h3) |
| Sub-heading | Inter | 20px | 600 | 1.2 | -0.6px | Section titles (h2) |
| Label Heading | Inter Variable | 17.6px | 400 | 1.5 | -0.704px | Small heading (H4) |
| Body | Kite One | 12px | 400 | normal | normal | Standard reading text |

### OpenType & Variable Font Features

**Active OpenType features:**
- `blwf`
- `cv03`
- `cv04`
- `cv09`
- Character Variant 1 (cv01)
- `cv05`
- Stylistic Set 3 (ss03) — alternate glyph forms
- `cv11`

**Variable font axes:**
- OPSZ axis
- WGHT axis

## 4. Component Stylings

### Navigation

**Main Nav**
- Background: `#000000`
- Padding: 0px
- Radius: none
- Font: 12px weight 400
- Use: Fixed/sticky flex nav — N/A items

## 5. Layout Principles

### Layout Type
**top-nav + content**

### Grid
Single column, centered content

### Max Width
1200px

### Spacing System
Compact spacing — information density prioritized

| Token | Value |
|-------|-------|
| xs | 8px |
| sm | 8px |
| md | 8px |
| lg | 8px |
| xl | 8px |
| 2xl | 8px |
| 3xl | 8px |

### Border Radius Scale
| Name | Value | Use |
|------|-------|-----|
| None | 0px | No rounding |
| Sm | 4px | Buttons, inputs, small elements |
| Md | 10px | Cards, containers |
| Lg | 12px | Large cards, sections |
| Xl | 16px | Featured containers |
| Full | 9999px | Pills, avatars, circular elements |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, content blocks |
| Layered (Level 1) | `rgba(144, 0, 255, 0.2) 0px 1px 16px 0px` | Cards, elevated surfaces |
| Layered (Level 2) | `rgba(0, 0, 0, 0.06) 0px 1px 2px 0px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px` | Cards, elevated surfaces |

**Shadow Philosophy**: Multi-layered shadow system creating natural, atmospheric depth. Each shadow level combines multiple layers for realistic elevation.

## 7. Do's and Don'ts

### Do
- Use Off-White (`#f8fafc`) as the page background — it's intentionally not pure white
- Use sans-serif as the primary typeface — it defines the brand personality
- Keep font weights between 400-600 — the system uses a narrow weight range for subtle hierarchy
- Use the extracted shadow patterns for elevation — they are tuned to match the brand palette
- Use Deep Purple (`#0000ee`) as the primary accent — it's the brand's signature interactive color
- Derive all token values from the extracted data — every color, size, and spacing must match the original

### Don't
- Don't use pure white (`#ffffff`) as a page background — the warm tone is part of the brand identity
- Don't substitute with generic sans-serif or serif — the custom font carries the brand
- Don't use weight 700 (bold) or above — 600 is the maximum weight in this system
- Don't invent new shadow values — use only the extracted shadow levels
- Don't introduce additional saturated accent colors — the palette is intentionally controlled
- Don't approximate or "eyeball" values — use the exact extracted token values

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | 600px | Single column, compact spacing |
| Mobile | 640px | Single column, compact spacing |
| Tablet Small | 768px | 2-column grids begin |
| Tablet | 809px | Multi-column layouts |
| Tablet | 810px | Multi-column layouts |
| Tablet | 939px | Multi-column layouts |
| Tablet | 940px | Multi-column layouts |

### Token Diff — Desktop vs Mobile

| Element | Property | Desktop | Mobile |
|---------|----------|---------|--------|
| heading | font-size | `56px` | `40px` |
| heading | line-height | `61.6px` | `48px` |
| heading | letter-spacing | `-1.68px` | `-1.6px` |

### Collapsing Strategy
- Headlines: 56px → 40px on mobile
- Navigation: horizontal links → hamburger menu on mobile
- Cards: multi-column → stacked vertical on mobile
- Footer: multi-column → stacked single column on mobile

### Touch Targets
- Navigation: adequate spacing between items
- Interactive elements: minimum 44px touch target recommended

## 9. Agent Prompt Guide

### Quick Reference
- Background: Off-White (`#f8fafc`)
- Primary text: Pure Black (`#000000`)
- Accent: Deep Purple (`#0000ee`)
- Border: Light Gray (`#e5e7eb`)
- Font: Kite One
- Body: 12px weight 400

### Example Component Prompts
- "Create a hero section on Off-White background (#f8fafc). Headline at 56px Kite One weight 400, line-height 1.1, letter-spacing -1.68px, color #000000."
- "Build navigation: relative on #f8fafc. Kite One 12px weight 400 for links."

### Iteration Guide
1. Use Off-White (`#f8fafc`) as the base background — match exactly
2. All text in Pure Black (`#000000`) — not pure black, not pure white
3. Accent color Deep Purple (`#0000ee`) for CTAs and interactive elements
4. Font: Kite One — respect the weight range found in extraction
5. Every spacing, radius, and shadow value comes from tokens.json — no approximation

---
*Generated by Clone Architect — automated Playwright extraction + design analysis.*
*Source: https://akiflow.com | 2026-04-18T12:47:13.679Z*
*All values verified via getComputedStyle() — no approximation, no hallucination.*
