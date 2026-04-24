# Design System — stripe.com
> Extracted automatically by Clone Architect from https://stripe.com
> Date: 2026-04-24
> Viewport: Desktop 1440x900 + Mobile 390x844
> Every value in this file comes from real getComputedStyle() extraction — no approximation.

## 1. Visual Theme & Atmosphere

stripe.com's design is built on a clean white canvas (`#ffffff`) that lets content and imagery take center stage. The custom sohne-var typeface defines the brand's typographic voice — used at a remarkably light weight (300) for headlines, creating an understated authority that doesn't need to shout. Negative letter-spacing (-0.8px) at display sizes (40px) compresses headlines into dense, engineered blocks. Text appears in Pure Black (`#000000`). Deep Purple (`#533afd`) serves as the primary accent color, used for CTAs and interactive highlights. The shadow system uses multi-layered shadows for natural, atmospheric depth — each elevation level combines multiple shadow layers for realistic lift. Motion design uses smooth easing curves for polished state transitions. 

**Key Characteristics:**
- Background: Pure White (`#ffffff`)
- Primary typeface: sohne-var
- Primary text: Pure Black (`#000000`)
- Accent: Deep Purple (`#533afd`)
- Display: 40px weight 300, letter-spacing -0.8px
- Border: Light Gray (`#d6d9fc`)
- Shadow system: 1 unique shadow levels detected
- Custom fonts loaded: sohne-var, SourceCodePro

## 2. Color Palette & Roles

### Background & Surface
- **Pure White** (`#ffffff`): Page background (primary)
- **Light Gray** (`#d6d9fc`): Surface / elevated background
- **Light Gray (#e8e9ff)** (`#e8e9ff`): Surface / elevated background
- **Light Gray (#e5edf5)** (`#e5edf5`): Surface / elevated background

### Text & Content
- **Pure Black** (`#000000`): Primary body text
- **Deep Navy (#061b31)** (`#061b31`): Secondary text
- **Deep Purple (#000eff)** (`#000eff`): Secondary text
- **Dark Gray (#2d2564)** (`#2d2564`): Secondary text

### Accent & Interactive
- **Deep Purple (#533afd)** (`#533afd`): Interactive / accent
- **Medium Gray (#64748d)** (`#64748d`): Interactive / accent
- **Honey (#81b81a)** (`#81b81a`): Interactive / accent
- **Lavender (#b9b9f9)** (`#b9b9f9`): Interactive / accent

### CSS Custom Properties (Design Tokens)

**Primary Brand Color**
- `--hds-color-accent-border-solid`: `#533afd`
- `--hds-color-accentColorMode-ruby-icon-solid`: `#ea2261`
- `--hds-color-accentColorMode-magenta-surface-subduedAlt`: `#ffe6f5`
- `--hds-color-accentColorMode-lemon-surface-subdued`: `#fff2d8`

**Shadow Token**
- `--hds-shadow-sm-top-offset-y`: `5px`
- `--hds-shadow-sm-bottom-offset-y`: `2px`
- `--hds-shadow-xs-top-blur`: `10px`
- `--hds-color-shadow-sm-top`: `#00377014`

**Spacing Token**
- `--navigation-padding-outer`: `8px`
- `--hds-space-core-1900`: `152px`
- `--hds-space-core-300`: `24px`
- `--hds-space-core-250`: `20px`

**Font Family Token**
- `--hds-font-family`: `"sohne-var","SF Pro Display",sans-serif`
- `--hds-font-family-code`: `"SourceCodePro","SFMono-Regular",monospace`

**Motion Token**
- `--navigation-duration-slow`: `300ms`
- `--navigation-duration`: `240ms`
- `--navigation-hamburger-duration`: `0.25s`

**Background**
- `--hds-color-surface-border-quiet`: `#e5edf5`
- `--hds-color-surface-bg-subduedAdaptive`: `#1658bc08`
- `--hds-color-surface-bg-subdued`: `#f8fafd`
- `--hds-color-surface-bg-quiet`: `#fff`

**Text Color**
- `--hds-color-text-quiet`: `#7d8ba4`
- `--hds-color-text-soft`: `#50617a`
- `--hds-color-text-solid`: `#061b31`
- `--hds-color-text-subdued`: `#64748d`

**Font Weight Token**
- `--hds-font-weight-bold`: `400`
- `--hds-font-weight-normal`: `300`

**Border**
- `--hds-canary-color-border-focus`: `#635bff`

**Border Radius Token**
- `--navigation-border-radius`: `6px`

**Other tokens**
- `--hds-color-core-neutral-975`: `#0d253d`
- `--hds-font-input-text-md-lineHeight`: `1.3`
- `--hds-color-util-brand-900`: `#1c1e54`
- `--hds-color-action-bg-subduedHover`: `#b9b9f9`
- `--hds-color-input-text-label`: `#273951`
- `--hds-color-input-text-selected`: `#273951`
- `--hds-color-input-text-popover`: `#273951`
- `--hds-color-button-ui-iconHover`: `#2e2b8c`

## 3. Typography Rules

### Font Families
- **Primary**: `sohne-var`
- **Secondary**: `SourceCodePro`

### Custom Fonts Loaded
- **sohne-var** weight 1 1000 (normal)
- **SourceCodePro** weight 500 (normal)

### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | sohne-var | 40px | 300 | 1.15 | -0.8px | Main headline (h1) |
| Section Heading | sohne-var | 32px | 300 | 1.1 | -0.64px | Section titles (h2) |
| Sub-heading | sohne-var | 26px | 300 | 1.12 | -0.26px | Third-level heading (h3) |
| Label Heading | sohne-var | 16px | 400 | 1.4 | normal | Small heading (H4) |
| Button | sohne-var | 14px | 400 | 1 | normal | Button labels |

### OpenType & Variable Font Features

**Active OpenType features:**
- Stylistic Set 1 (ss01) — alternate glyph forms
- Tabular Numbers (tnum) — fixed-width digits for data tables

## 4. Component Stylings

### Buttons

**Primary**
- Background: `#000000`
- Text: `#061b31`
- Padding: 12px 0px
- Radius: 4px
- Font: 14px weight 400
- Use: Primary CTA
- Focus: outline: `rgb(83, 58, 253) solid 2px`

**Secondary**
- Background: `#533afd`
- Text: `#ffffff`
- Padding: 12.5px 20px 13.5px
- Radius: 4px
- Font: 14px weight 400
- Use: Secondary actions

### Cards & Containers

**Standard Card**
- Background: `#000000`
- Padding: 11.5px 20px 12.5px
- Radius: 4px
- Border: 1px solid rgb(255, 255, 255)
- Use: Content containers, listing items

### Navigation

**Main Nav**
- Background: `#000000`
- Padding: 0px
- Radius: none
- Font: 16px weight 400
- Use: Fixed/sticky block nav — N/A items

## 5. Layout Principles

### Layout Type
**sidebar + main content**

### Grid
Single column, centered content

### Max Width
none

### Spacing System
Compact spacing — information density prioritized

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 28px |
| 2xl | 28px |
| 3xl | 71px |

### Border Radius Scale
| Name | Value | Use |
|------|-------|-----|
| None | 0px | No rounding |
| Sm | 4px | Buttons, inputs, small elements |
| Md | 6px | Cards, containers |
| Lg | 6px | Large cards, sections |
| Xl | 6px | Featured containers |
| Full | 9999px | Pills, avatars, circular elements |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, content blocks |
| Layered (Level 1) | `rgba(0, 0, 0, 0.1) 0px 30px 60px -50px, rgba(50, 50, 93, 0.25) 0px 30px 60px -10...` | Cards, elevated surfaces |

**Shadow Philosophy**: Multi-layered shadow system creating natural, atmospheric depth. Each shadow level combines multiple layers for realistic elevation.

## 7. Do's and Don'ts

### Do
- Use dark background (`#000000`) as the foundation — this is a dark-mode-native design
- Use sohne-var as the primary typeface — it defines the brand personality
- Keep font weights between 400-400 — the system uses a narrow weight range for subtle hierarchy
- Use negative letter-spacing (-0.8px) at display sizes for compressed, editorial headlines
- Use the extracted shadow patterns for elevation — they are tuned to match the brand palette
- Use Deep Purple (`#533afd`) as the primary accent — it's the brand's signature interactive color
- Derive all token values from the extracted data — every color, size, and spacing must match the original

### Don't
- Don't use light backgrounds — the dark canvas is the native medium
- Don't substitute with generic sans-serif or serif — the custom font carries the brand
- Don't use weight 700 (bold) or above — 400 is the maximum weight in this system
- Don't increase letter-spacing on headings — the type is designed to run tight at scale
- Don't invent new shadow values — use only the extracted shadow levels
- Don't introduce additional saturated accent colors — the palette is intentionally controlled
- Don't approximate or "eyeball" values — use the exact extracted token values

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | 640px | Single column layout |
| Tablet | 768px | 2-column grids |
| Desktop | 1024px | Full layout |
| Large Desktop | 1280px | Maximum width |

### Token Diff — Desktop vs Mobile

| Element | Property | Desktop | Mobile |
|---------|----------|---------|--------|
| heading | font-size | `40px` | `34px` |
| heading | line-height | `46px` | `35.02px` |
| heading | letter-spacing | `-0.8px` | `-0.34px` |
| nav | height | `76px` | `66px` |
| hero | padding | `0px 16px` | `0px` |
| hero | height | `685px` | `519.047px` |
| button | padding | `12px 0px` | `16px 0px` |
| button | font-size | `14px` | `18px` |
| button | width | `79px` | `fit-content` |
| card | padding | `11.5px 20px 12.5px` | `16px 0px` |
| card | width | `131px` | `fit-content` |

### Collapsing Strategy
- Headlines: 40px → 34px on mobile
- Navigation: horizontal links → hamburger menu on mobile
- Cards: multi-column → stacked vertical on mobile
- Footer: multi-column → stacked single column on mobile

### Touch Targets
- Buttons: 12px 0px padding
- Navigation: adequate spacing between items
- Interactive elements: minimum 44px touch target recommended

## 9. Agent Prompt Guide

### Quick Reference
- Background: Pure White (`#ffffff`)
- Primary text: Pure Black (`#000000`)
- Accent: Deep Purple (`#533afd`)
- Border: Light Gray (`#d6d9fc`)
- Font: sohne-var
- Body: 16px weight 400

### Example Component Prompts
- "Create a hero section on Pure White background (#ffffff). Headline at 40px sohne-var weight 300, line-height 1.15, letter-spacing -0.8px, color #000000."
- "Create a CTA button: #000000 background, #061b31 text, 4px radius, 12px 0px padding, 14px sohne-var weight 400."
- "Design a card on #000000 background. Border: 1px solid rgb(255, 255, 255). Radius: 4px. Shadow: none."
- "Build navigation: relative on #ffffff. sohne-var 16px weight 400 for links."

### Iteration Guide
1. Use Pure White (`#ffffff`) as the base background — match exactly
2. All text in Pure Black (`#000000`) — not pure black, not pure white
3. Accent color Deep Purple (`#533afd`) for CTAs and interactive elements
4. Font: sohne-var — respect the weight range found in extraction
5. Every spacing, radius, and shadow value comes from tokens.json — no approximation

---
*Generated by Clone Architect — automated Playwright extraction + design analysis.*
*Source: https://stripe.com | 2026-04-24T21:20:58.928Z*
*All values verified via getComputedStyle() — no approximation, no hallucination.*
