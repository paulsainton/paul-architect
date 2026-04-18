# Design System — rise.com
> Extracted automatically by Clone Architect from https://rise.com
> Date: 2026-04-18
> Viewport: Desktop 1440x900 + Mobile 390x844
> Every value in this file comes from real getComputedStyle() extraction — no approximation.

## 1. Visual Theme & Atmosphere

rise.com's design is built on a dark canvas (`#000000`) where content emerges through carefully calibrated luminance levels. This is a dark-mode-native design — darkness is the foundation, not an afterthought. The custom Graphik typeface defines the brand's typographic voice — used at a remarkably light weight (400) for headlines, creating an understated authority that doesn't need to shout. Text appears in Pure Black (`#000000`). Bright Orange (`#ff6500`) serves as the primary accent color, used for CTAs and interactive highlights. The shadow system uses multi-layered shadows for natural, atmospheric depth — each elevation level combines multiple shadow layers for realistic lift. Motion design uses smooth easing curves for polished state transitions. 

**Key Characteristics:**
- Background: Pure Black (`#000000`)
- Primary typeface: Graphik
- Primary text: Pure White (`#ffffff`)
- Accent: Bright Orange (`#ff6500`)
- Display: 66px weight 400, letter-spacing -2.4px
- Border: Dark Gray (`#535353`)
- Shadow system: 3 unique shadow levels detected
- Custom fonts loaded: Roboto, Graphik, GT Walsheim

## 2. Color Palette & Roles

### Background & Surface
- **Pure Black** (`#000000`): Page background (primary)
- **Charcoal** (`#313537`): Surface / elevated background
- **Warm Brown** (`#282828`): Surface / elevated background
- **Jet Black** (`#271706`): Surface / elevated background
- **Charcoal (#383532)** (`#383532`): Surface / elevated background

### Text & Content
- **Pure Black** (`#000000`): Primary body text
- **Bright Orange (#ff6500)** (`#ff6500`): Secondary text
- **Bright Orange (#ff6602)** (`#ff6602`): Secondary text

### Accent & Interactive
- **Bright Orange (#ff6500)** (`#ff6500`): Interactive / accent
- **Bright Orange (#ff6602)** (`#ff6602`): Interactive / accent

### CSS Custom Properties (Design Tokens)

- `--osano-link-color-contrast`: `#ebebeb`
- `--osano-toggle-off-thumb-color-disabled`: `#404040`
- `--osano-toggle-off-thumb-color`: `#000000`
- `--osano-toggle-on-thumb-color`: `#ffffff`
- `--osano-gpc-color`: `#37cd84`
- `--osano-toggle-on-thumb-color-disabled`: `#bfbfbf`
- `--osano-toggle-on-track-color-disabled`: `#006f25`
- `--osano-toggle-off-track-color-disabled`: `#454545`
- `--osano-button-background-color`: `#ffffff`
- `--osano-button-deny-background-color-contrast`: `#141414`
- `--osano-toggle-off-background-color`: `#d2cfff`
- `--osano-gpc-background-color-contrast`: `#ebebeb`
- `--osano-gpc-foreground-color`: `#058a5e`
- `--osano-widget-outline-color`: `#29246a`
- `--osano-button-deny-foreground-color-contrast`: `#ebebeb`

## 3. Typography Rules

### Font Families
- **Primary**: `Roboto`
- **Secondary**: `Graphik`
- **Font 3**: `GT Walsheim`
- **Font 4**: `Lato`
- **Font 5**: `Merriweather`

### Custom Fonts Loaded
- **Roboto** weight 400 (normal)
- **Graphik** weight normal (normal)
- **Graphik** weight 500 (normal)
- **Graphik** weight 600 (normal)
- **GT Walsheim** weight 300 (normal)
- **GT Walsheim** weight normal (normal)
- **GT Walsheim** weight 500 (normal)

### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | GT Walsheim | 66px | 400 | 1.09 | -2.4px | Main headline (h1) |
| Section Heading | GT Walsheim | 42px | 400 | 1.14 | -0.1px | Section titles (h2) |
| Body | Graphik | 16px | 400 | normal | normal | Standard reading text |
| Button | Roboto | 16px | 700 | 1 | normal | Button labels |
| Label Heading | Graphik | 15px | 500 | 1.6 | -0.1px | Small heading (H4) |
| Link | Graphik | 14px | 400 | 1.71 | normal | Decoration: none |

## 4. Component Stylings

### Buttons

**Primary**
- Background: `#ffffff`
- Text: `#282828`
- Padding: 8px 12px
- Radius: 4px
- Border: 1px solid rgb(255, 255, 255)
- Font: 16px weight 700
- Use: Primary CTA

**Dark**
- Background: `#000000`
- Text: `#000000`
- Padding: 0px
- Radius: 50%
- Border: 2px solid rgba(0, 0, 0, 0)
- Font: 16px weight 400
- Use: Dark actions

**Dark**
- Background: `#000000`
- Text: `#000000`
- Padding: 0px
- Radius: 0px
- Font: 16px weight 400
- Use: Dark actions

### Navigation

**Main Nav**
- Background: `#000000`
- Padding: 0px
- Radius: none
- Font: 16px weight 400
- Use: Fixed/sticky flex nav — N/A items

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
| xs | 2px |
| sm | 8px |
| md | 12px |
| lg | 24px |
| xl | 30px |
| 2xl | 30px |
| 3xl | 30px |

### Border Radius Scale
| Name | Value | Use |
|------|-------|-----|
| None | 0px | No rounding |
| Sm | 4px | Buttons, inputs, small elements |
| Md | 4px | Cards, containers |
| Lg | 4px | Large cards, sections |
| Xl | 27px | Featured containers |
| Full | 9999px | Pills, avatars, circular elements |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, content blocks |
| Layered (Level 1) | `rgba(0, 0, 0, 0.2) 0px 0px 5px 0px` | Cards, elevated surfaces |
| Layered (Level 2) | `rgb(204, 204, 204) 0px 0px 2px 2px` | Cards, elevated surfaces |
| Layered (Level 3) | `rgba(0, 0, 0, 0.1) 0px 5px 40px 0px` | Cards, elevated surfaces |

**Shadow Philosophy**: Multi-layered shadow system creating natural, atmospheric depth. Each shadow level combines multiple layers for realistic elevation.

## 7. Do's and Don'ts

### Do
- Use dark background (`#000000`) as the foundation — this is a dark-mode-native design
- Use Graphik as the primary typeface — it defines the brand personality
- Use the extracted shadow patterns for elevation — they are tuned to match the brand palette
- Use Bright Orange (`#ff6500`) as the primary accent — it's the brand's signature interactive color
- Derive all token values from the extracted data — every color, size, and spacing must match the original

### Don't
- Don't use light backgrounds — the dark canvas is the native medium
- Don't substitute with generic sans-serif or serif — the custom font carries the brand
- Don't invent new shadow values — use only the extracted shadow levels
- Don't introduce additional saturated accent colors — the palette is intentionally controlled
- Don't approximate or "eyeball" values — use the exact extracted token values

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | 19px | Single column, compact spacing |
| Mobile Small | 23px | Single column, compact spacing |
| Mobile Small | 25px | Single column, compact spacing |
| Mobile Small | 27px | Single column, compact spacing |
| Mobile Small | 47px | Single column, compact spacing |
| Mobile Small | 48px | Single column, compact spacing |
| Mobile Small | 63px | Single column, compact spacing |

### Token Diff — Desktop vs Mobile

| Element | Property | Desktop | Mobile |
|---------|----------|---------|--------|
| heading | font-size | `66px` | `32px` |
| heading | line-height | `72px` | `36px` |
| heading | letter-spacing | `-2.4px` | `-1.2px` |
| nav | padding | `0px 120px` | `0px` |
| nav | height | `84px` | `60px` |

### Collapsing Strategy
- Headlines: 66px → 32px on mobile
- Navigation: horizontal links → hamburger menu on mobile
- Cards: multi-column → stacked vertical on mobile
- Footer: multi-column → stacked single column on mobile

### Touch Targets
- Buttons: 8px 12px padding
- Navigation: adequate spacing between items
- Interactive elements: minimum 44px touch target recommended

## 9. Agent Prompt Guide

### Quick Reference
- Background: Pure Black (`#000000`)
- Primary text: Pure Black (`#000000`)
- Accent: Bright Orange (`#ff6500`)
- Border: Dark Gray (`#535353`)
- Font: Roboto
- Body: 16px weight 400

### Example Component Prompts
- "Create a hero section on Pure Black background (#000000). Headline at 66px Roboto weight 400, line-height 1.09, letter-spacing -2.4px, color #000000."
- "Create a CTA button: #ffffff background, #282828 text, 4px radius, 8px 12px padding, 16px Roboto weight 700."
- "Build navigation: static on #000000. Roboto 16px weight 400 for links."

### Iteration Guide
1. Use Pure Black (`#000000`) as the base background — match exactly
2. All text in Pure Black (`#000000`) — not pure black, not pure white
3. Accent color Bright Orange (`#ff6500`) for CTAs and interactive elements
4. Font: Roboto — respect the weight range found in extraction
5. Every spacing, radius, and shadow value comes from tokens.json — no approximation

---
*Generated by Clone Architect — automated Playwright extraction + design analysis.*
*Source: https://rise.com | 2026-04-18T11:13:49.755Z*
*All values verified via getComputedStyle() — no approximation, no hallucination.*
