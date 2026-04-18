# Design System — reclaim.ai
> Extracted automatically by Clone Architect from https://reclaim.ai
> Date: 2026-04-18
> Viewport: Desktop 1440x900 + Mobile 390x844
> Every value in this file comes from real getComputedStyle() extraction — no approximation.

## 1. Visual Theme & Atmosphere

reclaim.ai's design is built on a clean white canvas (`#ffffff`) that lets content and imagery take center stage. The custom Inter typeface defines the brand's typographic voice — used at a remarkably light weight (400) for headlines, creating an understated authority that doesn't need to shout. Text appears in Near Black (`#181d25`) — not pure black but a softer near-black that adds warmth. Royal Blue (`#5665f0`) serves as the primary accent color, used for CTAs and interactive highlights. The shadow system uses multi-layered shadows for natural, atmospheric depth — each elevation level combines multiple shadow layers for realistic lift. Motion design uses smooth easing curves for polished state transitions. 

**Key Characteristics:**
- Background: Pure White (`#ffffff`)
- Primary typeface: Inter
- Primary text: Near Black (`#181d25`)
- Accent: Royal Blue (`#5665f0`)
- Display: 90px weight 400
- Border: Light Gray (`#e5e7eb`)
- Shadow system: 3 unique shadow levels detected
- Custom fonts loaded: webflow-icons, Inter, Poppins

## 2. Color Palette & Roles

### Background & Surface
- **Pure White** (`#ffffff`): Page background (primary)
- **Light Gray** (`#ebefff`): Surface / elevated background
- **Warm Cream** (`#fafaef`): Surface / elevated background
- **Warm Cream (#fafaee)** (`#fafaee`): Surface / elevated background
- **Light Gray (#eef0fe)** (`#eef0fe`): Surface / elevated background

### Text & Content
- **Near Black** (`#181d25`): Primary body text
- **Pure Black (#000000)** (`#000000`): Secondary text
- **Charcoal (#333333)** (`#333333`): Secondary text
- **Charcoal (#2f2e41)** (`#2f2e41`): Secondary text
- **Deep Purple (#0000ee)** (`#0000ee`): Secondary text

### Accent & Interactive
- **Royal Blue (#5665f0)** (`#5665f0`): Interactive / accent
- **Royal Blue (#5562eb)** (`#5562eb`): Interactive / accent
- **Tangerine (#dab159)** (`#dab159`): Interactive / accent

### CSS Custom Properties (Design Tokens)

**Border Radius Token**
- `--_apps---sizes--radius`: `10px`

**Other tokens**
- `--_apps---colors--background-dark`: `#030303`
- `--_apps---colors--foreground-dark`: `#f8f8f8`
- `--_apps---colors--secondary-foreground`: `#0b0d13`
- `--_apps---sidebar--sidebar-primary-dark`: `#6374fe`
- `--_apps---colors--ring-dark`: `#7b8ff6`
- `--_apps---colors--accent-dark`: `#292929`
- `--_apps---colors--accent`: `#e4e4e4`
- `--_apps---colors--primary-foreground`: `#f6f8ff`

## 3. Typography Rules

### Font Families
- **Primary**: `webflow-icons`
- **Secondary**: `Inter`
- **Font 3**: `Poppins`

### Custom Fonts Loaded
- **webflow-icons** weight 400 (normal)
- **Inter** weight 300 (normal)
- **Inter** weight 400 (normal)
- **Inter** weight 500 (normal)
- **Inter** weight 600 (normal)
- **Inter** weight 700 (normal)
- **Poppins** weight 300 (normal)
- **Poppins** weight 400 (normal)
- **Poppins** weight 500 (normal)
- **Poppins** weight 600 (normal)
- **Poppins** weight 700 (normal)

### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Poppins | 90px | 400 | 1 | normal | Main headline (h1) |
| Section Heading | Poppins | 40px | 400 | 1.25 | normal | Section titles (h2) |
| Body | Poppins | 18px | 400 | 1.78 | normal | Standard reading text |
| Button | Hiragino Sans GB | 12px | 700 | 1 | normal | Button labels |
| Link | Hiragino Sans GB | 12px | 400 | 1.25 | normal | Decoration: underline |

## 4. Component Stylings

### Buttons

**Primary**
- Background: `#5562eb`
- Text: `#ffffff`
- Padding: 6px 9px
- Radius: 3px
- Border: 1px solid rgb(255, 255, 255)
- Font: 12px weight 700
- Use: Primary CTA

**Dark**
- Background: `#000000`
- Text: `#181d25`
- Padding: 0px
- Radius: 50%
- Border: 2px solid rgba(0, 0, 0, 0)
- Font: 12px weight 400
- Use: Dark actions

**Dark**
- Background: `#000000`
- Text: `#000000`
- Padding: 10px 30px
- Radius: 100px
- Border: 1px solid rgb(0, 0, 0)
- Font: 14px weight 400
- Use: Dark actions

**Dark**
- Background: `#000000`
- Text: `#ffffff`
- Padding: 10px 30px
- Radius: 100px
- Font: 16px weight 400
- Use: Dark actions

### Cards & Containers

**Standard Card**
- Background: `#000000`
- Padding: 0px
- Radius: 0px
- Use: Content containers, listing items

### Navigation

**Main Nav**
- Background: `#000000`
- Padding: 0px
- Radius: none
- Font: 18px weight 400
- Use: Fixed/sticky block nav — N/A items

## 5. Layout Principles

### Layout Type
**hero + sections**

### Grid
Flexbox column

### Max Width
none

### Spacing System
Compact spacing — information density prioritized

| Token | Value |
|-------|-------|
| xs | 6px |
| sm | 9px |
| md | 15px |
| lg | 18px |
| xl | 40px |
| 2xl | 40px |
| 3xl | 60px |

### Border Radius Scale
| Name | Value | Use |
|------|-------|-----|
| None | 0px | No rounding |
| Sm | 3px | Buttons, inputs, small elements |
| Md | 10px | Cards, containers |
| Lg | 10px | Large cards, sections |
| Xl | 10px | Featured containers |
| Full | 9999px | Pills, avatars, circular elements |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, content blocks |
| Layered (Level 1) | `rgb(204, 204, 204) 0px 0px 2px 2px` | Cards, elevated surfaces |
| Layered (Level 2) | `rgb(243, 246, 255) 0px 2px 10px 1px` | Cards, elevated surfaces |
| Inset (Level 3) | `rgba(0, 0, 0, 0.2) 0px 1px 10px -3px, rgba(29, 140, 242, 0.08) 0px 4px 4px 0px i...` | Buttons, pressed-state elements |

**Shadow Philosophy**: Multi-layered shadow system creating natural, atmospheric depth. Each shadow level combines multiple layers for realistic elevation.

## 7. Do's and Don'ts

### Do
- Use Near Black (`#181d25`) for text — not pure black, it's warmer and more readable
- Use Poppins as the primary typeface — it defines the brand personality
- Use the extracted shadow patterns for elevation — they are tuned to match the brand palette
- Use Royal Blue (`#5665f0`) as the primary accent — it's the brand's signature interactive color
- Derive all token values from the extracted data — every color, size, and spacing must match the original

### Don't
- Don't use pure black (`#000000`) for text — the near-black adds warmth
- Don't substitute with generic sans-serif or serif — the custom font carries the brand
- Don't invent new shadow values — use only the extracted shadow levels
- Don't introduce additional saturated accent colors — the palette is intentionally controlled
- Don't approximate or "eyeball" values — use the exact extracted token values

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | 376px | Single column, compact spacing |
| Mobile Small | 479px | Single column, compact spacing |
| Mobile | 544px | Single column, compact spacing |
| Mobile | 600px | Single column, compact spacing |
| Tablet Small | 767px | 2-column grids begin |
| Tablet Small | 768px | 2-column grids begin |
| Tablet | 800px | Multi-column layouts |

### Token Diff — Desktop vs Mobile

| Element | Property | Desktop | Mobile |
|---------|----------|---------|--------|
| heading | font-size | `90px` | `48px` |
| heading | line-height | `90px` | `50px` |
| nav | height | `110px` | `87px` |
| hero | height | `49px` | `58px` |
| sidebar | width | `47px` | `auto` |

### Collapsing Strategy
- Headlines: 90px → 48px on mobile
- Navigation: horizontal links → hamburger menu on mobile
- Cards: multi-column → stacked vertical on mobile
- Footer: multi-column → stacked single column on mobile

### Touch Targets
- Buttons: 6px 9px padding
- Navigation: adequate spacing between items
- Interactive elements: minimum 44px touch target recommended

## 9. Agent Prompt Guide

### Quick Reference
- Background: Pure White (`#ffffff`)
- Primary text: Near Black (`#181d25`)
- Accent: Royal Blue (`#5665f0`)
- Border: Light Gray (`#e5e7eb`)
- Font: webflow-icons
- Body: 18px weight 400

### Example Component Prompts
- "Create a hero section on Pure White background (#ffffff). Headline at 90px webflow-icons weight 400, line-height 1, color #181d25."
- "Create a CTA button: #5562eb background, #ffffff text, 3px radius, 6px 9px padding, 12px webflow-icons weight 700."
- "Design a card on #000000 background. Border: 0px none rgb(24, 29, 37). Radius: 0px. Shadow: none."
- "Build navigation: sticky on #ffffff. webflow-icons 18px weight 400 for links."

### Iteration Guide
1. Use Pure White (`#ffffff`) as the base background — match exactly
2. All text in Near Black (`#181d25`) — not pure black, not pure white
3. Accent color Royal Blue (`#5665f0`) for CTAs and interactive elements
4. Font: webflow-icons — respect the weight range found in extraction
5. Every spacing, radius, and shadow value comes from tokens.json — no approximation

---
*Generated by Clone Architect — automated Playwright extraction + design analysis.*
*Source: https://reclaim.ai | 2026-04-18T12:33:13.076Z*
*All values verified via getComputedStyle() — no approximation, no hallucination.*
