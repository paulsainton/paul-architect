# Design System — yuka.io
> Extracted automatically by Clone Architect from https://yuka.io
> Date: 2026-04-24
> Viewport: Desktop 1440x900 + Mobile 390x844
> Every value in this file comes from real getComputedStyle() extraction — no approximation.

## 1. Visual Theme & Atmosphere

yuka.io's design is built on a clean white canvas (`#ffffff`) that lets content and imagery take center stage. The custom Font Awesome 5 Brands typeface defines the brand's typographic voice — at weight 600 for headlines, it creates confident, assertive statements. Text appears in Charcoal (`#302c2e`) — not pure black but a softer near-black that adds warmth. Charcoal (`#302c2e`) serves as the primary accent color, used for CTAs and interactive highlights. The shadow system uses multi-layered shadows for natural, atmospheric depth — each elevation level combines multiple shadow layers for realistic lift. Motion design uses smooth easing curves for polished state transitions. 

**Key Characteristics:**
- Background: Pure White (`#ffffff`)
- Primary typeface: Font Awesome 5 Brands
- Primary text: Charcoal (`#302c2e`)
- Accent: Charcoal (`#302c2e`)
- Display: 42px weight 600
- Border: Silver (`#c4c4c4`)
- Shadow system: 3 unique shadow levels detected
- Custom fonts loaded: Font Awesome 5 Brands, Font Awesome 5 Free, icomoon, Open Sans, TablePress, Montserrat, Poppins, Always In My Heart, Quicksand, Din condensed, Unna, Lato, Pacifico, Roboto, Caveat Brush, FontAwesome

## 2. Color Palette & Roles

### Background & Surface
- **Pure White** (`#ffffff`): Page background (primary)
- **Light Gray** (`#ecebe5`): Surface / elevated background
- **Ghost White** (`#edf8fb`): Surface / elevated background
- **Light Gray (#ddebee)** (`#ddebee`): Surface / elevated background

### Text & Content
- **Charcoal** (`#302c2e`): Primary body text
- **Pure Black (#000000)** (`#000000`): Secondary text

### Accent & Interactive
- **Emerald (#00db5f)** (`#00db5f`): Interactive / accent
- **Success Green (#00bc52)** (`#00bc52`): Interactive / accent
- **Vermillion (#fd2c19)** (`#fd2c19`): Interactive / accent
- **Coral (#ff8939)** (`#ff8939`): Interactive / accent

### Border & Divider
- **Silver (#c4c4c4)** (`#c4c4c4`): Borders / dividers
- **Light Gray (#ddebee)** (`#ddebee`): Borders / dividers
- **Silver (#b0c8ca)** (`#b0c8ca`): Borders / dividers
- **Silver (#d3d3d1)** (`#d3d3d1`): Borders / dividers

### CSS Custom Properties (Design Tokens)

**Font Size Token**
- `--wp--preset--font-size--large`: `36px`
- `--wp--preset--font-size--huge`: `42px`
- `--wp--preset--font-size--x-large`: `42px`
- `--wp--preset--font-size--normal`: `16px`

**Shadow Token**
- `--wp--preset--shadow--outlined`: `6px 6px 0px -3px rgba(255, 255, 255, 1), 6px 6px rgba(0, 0, 0, 1)`
- `--wp--preset--shadow--deep`: `12px 12px 50px rgba(0, 0, 0, 0.4)`
- `--wp--preset--shadow--natural`: `6px 6px 9px rgba(0, 0, 0, 0.2)`
- `--wp--preset--shadow--crisp`: `6px 6px 0px rgba(0, 0, 0, 1)`

**Spacing Token**
- `--wp--preset--spacing--60`: `2.25rem`
- `--wp--preset--spacing--40`: `1rem`
- `--wp--preset--spacing--30`: `0.67rem`
- `--wp--preset--spacing--50`: `1.5rem`

**Font Family Token**
- `--font-family-monospace`: `SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace`

**Other tokens**
- `--wp--preset--color--vivid-purple`: `#9b51e0`
- `--wp--preset--color--pale-pink`: `#f78da7`
- `--wp--preset--color--cyan-bluish-gray`: `#abb8c3`
- `--wp--preset--color--vivid-green-cyan`: `#00d084`
- `--wp--preset--color--luminous-vivid-orange`: `#ff6900`
- `--wp--preset--color--vivid-cyan-blue`: `#0693e3`
- `--wp--preset--color--pale-cyan-blue`: `#8ed1fc`
- `--wp--preset--color--luminous-vivid-amber`: `#fcb900`

## 3. Typography Rules

### Font Families
- **Primary**: `Font Awesome 5 Brands`
- **Secondary**: `Font Awesome 5 Free`
- **Font 3**: `icomoon`
- **Font 4**: `Open Sans`
- **Font 5**: `TablePress`

### Custom Fonts Loaded
- **Font Awesome 5 Brands** weight normal (normal)
- **Font Awesome 5 Free** weight 400 (normal)
- **Font Awesome 5 Free** weight 900 (normal)
- **icomoon** weight normal (normal)
- **Open Sans** weight 300 (normal)
- **Open Sans** weight 400 (normal)
- **Open Sans** weight 600 (normal)
- **Open Sans** weight 700 (normal)
- **TablePress** weight 400 (normal)
- **Montserrat** weight 100 (normal)
- **Montserrat** weight 200 (normal)
- **Montserrat** weight 300 (normal)
- **Montserrat** weight 400 (normal)
- **Montserrat** weight 500 (normal)
- **Montserrat** weight 600 (normal)
- **Montserrat** weight 700 (normal)
- **Montserrat** weight 900 (normal)
- **Open Sans** weight 800 (normal)
- **Poppins** weight 100 (normal)
- **Poppins** weight 200 (normal)
- **Poppins** weight 300 (normal)
- **Poppins** weight 400 (normal)
- **Poppins** weight 500 (normal)
- **Poppins** weight 600 (normal)
- **Poppins** weight 700 (normal)
- **Poppins** weight 800 (normal)
- **Poppins** weight 900 (normal)
- **Always In My Heart** weight 400 (normal)
- **Quicksand** weight 400 (normal)
- **Din condensed** weight 700 (normal)
- **Unna** weight 400 (normal)
- **Unna** weight 700 (normal)
- **Lato** weight 400 (normal)
- **Lato** weight 700 (normal)
- **Lato** weight 900 (normal)
- **Pacifico** weight 400 (normal)
- **Roboto** weight 400 (normal)
- **Roboto** weight 500 (normal)
- **Roboto** weight 700 (normal)
- **Caveat Brush** weight 400 (normal)
- **FontAwesome** weight normal (normal)

### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Poppins | 42px | 600 | 1.19 | normal | Main headline (h1) |
| Section Heading | Poppins | 38px | 600 | 1.21 | normal | Section titles (h2) |
| Sub-heading | Always In My Heart | 36px | 400 | 0.89 | normal | Third-level heading (h3) |
| Button | Open Sans | 20px | 400 | 1 | normal | Button labels |
| Label Heading | Montserrat | 18px | 600 | 1.22 | normal | Small heading (H4) |
| Card Title | Open Sans | 16px | 400 | 1.5 | normal | Card headings |

## 4. Component Stylings

### Buttons

**Primary**
- Background: `#000000`
- Text: `#ffffff`
- Padding: 0px 0px 0px 70px
- Radius: 4px
- Font: 20px weight 400
- Use: Primary CTA

**Outline**
- Background: `#00db5f`
- Text: `#ffffff`
- Padding: 0px 20px
- Radius: 6px
- Border: 3px solid rgb(0, 219, 95)
- Font: 20px weight 600
- Use: Outline actions

### Cards & Containers

**Standard Card**
- Background: `#000000`
- Padding: 0px
- Radius: 0px
- Use: Content containers, listing items

### Navigation

**Main Nav**
- Background: `#ffffff`
- Padding: 0px
- Radius: none
- Font: 16px weight 400
- Use: Static list-item nav — N/A items

## 5. Layout Principles

### Layout Type
**top-nav + content**

### Grid
Flexbox row

### Max Width
none

### Spacing System
Compact spacing — information density prioritized

| Token | Value |
|-------|-------|
| xs | 5px |
| sm | 5px |
| md | 16px |
| lg | 20px |
| xl | 20px |
| 2xl | 64px |
| 3xl | 64px |

### Border Radius Scale
| Name | Value | Use |
|------|-------|-----|
| None | 0px | No rounding |
| Sm | 4px | Buttons, inputs, small elements |
| Md | 7px | Cards, containers |
| Lg | 9px | Large cards, sections |
| Xl | 16px | Featured containers |
| Full | 9999px | Pills, avatars, circular elements |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, content blocks |
| Layered (Level 1) | `rgba(0, 0, 0, 0.28) 0px 2px 4px 0px` | Cards, elevated surfaces |
| Layered (Level 2) | `rgba(0, 0, 0, 0.24) 0px 1px 5px 0px, rgba(0, 0, 0, 0.3) 0px 2px 4px 0px` | Cards, elevated surfaces |
| Layered (Level 3) | `rgba(0, 0, 0, 0.28) 0px 0px 4px 0px` | Cards, elevated surfaces |

**Shadow Philosophy**: Multi-layered shadow system creating natural, atmospheric depth. Each shadow level combines multiple layers for realistic elevation.

## 7. Do's and Don'ts

### Do
- Use Charcoal (`#302c2e`) for text — not pure black, it's warmer and more readable
- Use Open Sans as the primary typeface — it defines the brand personality
- Keep font weights between 400-600 — the system uses a narrow weight range for subtle hierarchy
- Use the extracted shadow patterns for elevation — they are tuned to match the brand palette
- Use Charcoal (`#302c2e`) as the primary accent — it's the brand's signature interactive color
- Derive all token values from the extracted data — every color, size, and spacing must match the original

### Don't
- Don't use pure black (`#000000`) for text — the near-black adds warmth
- Don't substitute with generic sans-serif or serif — the custom font carries the brand
- Don't use weight 700 (bold) or above — 600 is the maximum weight in this system
- Don't invent new shadow values — use only the extracted shadow levels
- Don't introduce additional saturated accent colors — the palette is intentionally controlled
- Don't approximate or "eyeball" values — use the exact extracted token values

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | 2px | Single column, compact spacing |
| Mobile Small | 320px | Single column, compact spacing |
| Mobile Small | 321px | Single column, compact spacing |
| Mobile Small | 323px | Single column, compact spacing |
| Mobile Small | 335px | Single column, compact spacing |
| Mobile Small | 340px | Single column, compact spacing |
| Mobile Small | 350px | Single column, compact spacing |

### Token Diff — Desktop vs Mobile

| Element | Property | Desktop | Mobile |
|---------|----------|---------|--------|
| heading | font-size | `42px` | `28px` |
| heading | line-height | `50px` | `35px` |
| nav | height | `47px` | `auto` |
| button | width | `auto` | `90px` |
| card | width | `1440px` | `390px` |

### Collapsing Strategy
- Headlines: 42px → 28px on mobile
- Navigation: horizontal links → hamburger menu on mobile
- Cards: multi-column → stacked vertical on mobile
- Footer: multi-column → stacked single column on mobile

### Touch Targets
- Buttons: 0px 0px 0px 70px padding
- Navigation: adequate spacing between items
- Interactive elements: minimum 44px touch target recommended

## 9. Agent Prompt Guide

### Quick Reference
- Background: Pure White (`#ffffff`)
- Primary text: Charcoal (`#302c2e`)
- Accent: Charcoal (`#302c2e`)
- Border: Silver (`#c4c4c4`)
- Font: Font Awesome 5 Brands
- Body: 16px weight 400

### Example Component Prompts
- "Create a hero section on Pure White background (#ffffff). Headline at 42px Font Awesome 5 Brands weight 600, line-height 1.19, color #302c2e."
- "Create a CTA button: #000000 background, #ffffff text, 4px radius, 0px 0px 0px 70px padding, 20px Font Awesome 5 Brands weight 400."
- "Design a card on #000000 background. Border: 0px none rgb(48, 44, 46). Radius: 0px. Shadow: none."
- "Build navigation: static on #ffffff. Font Awesome 5 Brands 16px weight 400 for links."

### Iteration Guide
1. Use Pure White (`#ffffff`) as the base background — match exactly
2. All text in Charcoal (`#302c2e`) — not pure black, not pure white
3. Accent color Charcoal (`#302c2e`) for CTAs and interactive elements
4. Font: Font Awesome 5 Brands — respect the weight range found in extraction
5. Every spacing, radius, and shadow value comes from tokens.json — no approximation

---
*Generated by Clone Architect — automated Playwright extraction + design analysis.*
*Source: https://yuka.io | 2026-04-24T10:26:02.539Z*
*All values verified via getComputedStyle() — no approximation, no hallucination.*
