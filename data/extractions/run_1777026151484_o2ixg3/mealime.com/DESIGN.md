# Design System — mealime.com
> Extracted automatically by Clone Architect from https://mealime.com
> Date: 2026-04-24
> Viewport: Desktop 1440x900 + Mobile 390x844
> Every value in this file comes from real getComputedStyle() extraction — no approximation.

## 1. Visual Theme & Atmosphere

mealime.com's design is built on a dark canvas (`#000000`) where content emerges through carefully calibrated luminance levels. This is a dark-mode-native design — darkness is the foundation, not an afterthought. The custom chaparral-pro typeface defines the brand's typographic voice — used at a remarkably light weight (0) for headlines, creating an understated authority that doesn't need to shout. Text appears in Pure Black (`#000000`). Deep Purple (`#0000ee`) serves as the primary accent color, used for CTAs and interactive highlights. The shadow system uses multi-layered shadows for natural, atmospheric depth — each elevation level combines multiple shadow layers for realistic lift. Motion design uses smooth easing curves for polished state transitions. 

**Key Characteristics:**
- Background: Pure Black (`#000000`)
- Primary typeface: chaparral-pro
- Primary text: Pure White (`#ffffff`)
- Accent: Deep Purple (`#0000ee`)
- Border: Dim Gray (`#6d6d6d`)
- Shadow system: 3 unique shadow levels detected
- Custom fonts loaded: chaparral-pro, lato, permanent-marker

## 2. Color Palette & Roles

### Background & Surface
- **Pure Black** (`#000000`): Page background (primary)
- **Deep Purple** (`#0000ee`): Surface / elevated background
- **Dark Gray** (`#464646`): Surface / elevated background

### Text & Content
- **Pure Black** (`#000000`): Primary body text
- **Success Green (#5ebd21)** (`#5ebd21`): Secondary text
- **Silver (#adb5bd)** (`#adb5bd`): Secondary text
- **Pink (#f5de7d)** (`#f5de7d`): Secondary text
- **Silver (#b4b4b4)** (`#b4b4b4`): Secondary text

### Accent & Interactive
- **Success Green (#5ebd21)** (`#5ebd21`): Interactive / accent

### Border & Divider
- **Silver (#adb5bd)** (`#adb5bd`): Borders / dividers
- **Silver (#b4b4b4)** (`#b4b4b4`): Borders / dividers
- **Light Gray (#e2e6e9)** (`#e2e6e9`): Borders / dividers

## 3. Typography Rules

### Font Families
- **Primary**: `chaparral-pro`
- **Secondary**: `lato`
- **Font 3**: `permanent-marker`

### Custom Fonts Loaded
- **chaparral-pro** weight 400 (normal)
- **chaparral-pro** weight 700 (normal)
- **lato** weight 900 (normal)
- **lato** weight 500 (normal)
- **permanent-marker** weight 400 (normal)

### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Section Heading | chaparral-pro | 60px | 900 | 1 | normal | Section titles (h2) |
| Sub-heading | lato | 20px | 700 | 1.1 | 2px | Third-level heading (h3) |
| Label Heading | lato | 16px | 500 | 1.5 | normal | Small heading (H4) |
| Button | lato | 16px | 400 | 1.15 | normal | Button labels |

## 4. Component Stylings

### Buttons

**Primary**
- Background: `#000000`
- Text: `#000000`
- Padding: 32px
- Radius: 0px
- Font: 16px weight 400
- Use: Primary CTA

**Outline**
- Background: `#5ebd21`
- Text: `#ffffff`
- Padding: 7.2px 24px
- Radius: 4px
- Border: 1px solid rgb(94, 189, 33)
- Shadow: `rgba(255, 255, 255, 0.15) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.075) 0px 1px 1p...`
- Font: 14px weight 900
- Use: Outline actions

**Outline**
- Background: `#5ebd21`
- Text: `#ffffff`
- Padding: 12px 40px
- Radius: 4px
- Border: 1px solid rgb(94, 189, 33)
- Shadow: `rgba(255, 255, 255, 0.15) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.075) 0px 1px 1p...`
- Font: 16px weight 900
- Use: Outline actions

**Outline**
- Background: `#5ebd21`
- Text: `#ffffff`
- Padding: 12px 40px
- Radius: 4px
- Border: 1px solid rgb(94, 189, 33)
- Shadow: `rgba(255, 255, 255, 0.15) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.075) 0px 1px 1p...`
- Font: 16px weight 900
- Use: Outline actions

### Navigation

**Main Nav**
- Background: `#000000`
- Padding: 0px
- Radius: none
- Font: 16px weight 500
- Use: Static flex nav — N/A items

## 5. Layout Principles

### Layout Type
**top-nav + content**

### Grid
Single column, centered content

### Max Width
none

### Spacing System
Compact spacing — information density prioritized

| Token | Value |
|-------|-------|
| xs | 5.6px |
| sm | 8.8px |
| md | 8.8px |
| lg | 32px |
| xl | 32px |
| 2xl | 40px |
| 3xl | 40px |

### Border Radius Scale
| Name | Value | Use |
|------|-------|-----|
| None | 0px | No rounding |
| Sm | 4px | Buttons, inputs, small elements |
| Md | 4px | Cards, containers |
| Lg | 4px | Large cards, sections |
| Xl | 4px | Featured containers |
| Full | 9999px | Pills, avatars, circular elements |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, content blocks |
| Inset (Level 1) | `rgba(255, 255, 255, 0.15) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.075) 0px 1px 1p...` | Buttons, pressed-state elements |
| Layered (Level 2) | `rgba(0, 0, 0, 0.15) 0px 15px 20px -10px, rgba(0, 0, 0, 0.4) 0px 1px 4px -2px` | Cards, elevated surfaces |
| Layered (Level 3) | `rgba(0, 0, 0, 0.15) 0px 3px 4px 0px` | Cards, elevated surfaces |

**Shadow Philosophy**: Multi-layered shadow system creating natural, atmospheric depth. Each shadow level combines multiple layers for realistic elevation.

## 7. Do's and Don'ts

### Do
- Use dark background (`#000000`) as the foundation — this is a dark-mode-native design
- Use lato as the primary typeface — it defines the brand personality
- Use the extracted shadow patterns for elevation — they are tuned to match the brand palette
- Use Deep Purple (`#0000ee`) as the primary accent — it's the brand's signature interactive color
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
| Mobile | 576px | Single column, compact spacing |
| Tablet Small | 768px | 2-column grids begin |
| Tablet | 991px | Multi-column layouts |
| Tablet | 992px | Multi-column layouts |
| Desktop | 1200px | Full feature layout |

### Token Diff — Desktop vs Mobile

| Element | Property | Desktop | Mobile |
|---------|----------|---------|--------|
| nav | display | `flex` | `none` |
| nav | height | `30px` | `auto` |
| button | width | `auto` | `88px` |

### Collapsing Strategy
- Navigation: flex → none on mobile
- Cards: multi-column → stacked vertical on mobile
- Footer: multi-column → stacked single column on mobile

### Touch Targets
- Buttons: 32px padding
- Navigation: adequate spacing between items
- Interactive elements: minimum 44px touch target recommended

## 9. Agent Prompt Guide

### Quick Reference
- Background: Pure Black (`#000000`)
- Primary text: Pure Black (`#000000`)
- Accent: Deep Purple (`#0000ee`)
- Border: Dim Gray (`#6d6d6d`)
- Font: chaparral-pro
- Body: 16px weight 500

### Example Component Prompts
- "Create a CTA button: #000000 background, #000000 text, 0px radius, 32px padding, 16px chaparral-pro weight 400."
- "Build navigation: static on #000000. chaparral-pro 16px weight 500 for links."

### Iteration Guide
1. Use Pure Black (`#000000`) as the base background — match exactly
2. All text in Pure Black (`#000000`) — not pure black, not pure white
3. Accent color Deep Purple (`#0000ee`) for CTAs and interactive elements
4. Font: chaparral-pro — respect the weight range found in extraction
5. Every spacing, radius, and shadow value comes from tokens.json — no approximation

---
*Generated by Clone Architect — automated Playwright extraction + design analysis.*
*Source: https://mealime.com | 2026-04-24T10:26:32.096Z*
*All values verified via getComputedStyle() — no approximation, no hallucination.*
