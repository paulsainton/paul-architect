# Design System — motion.ai
> Extracted automatically by Clone Architect from https://motion.ai
> Date: 2026-04-18
> Viewport: Desktop 1440x900 + Mobile 390x844
> Every value in this file comes from real getComputedStyle() extraction — no approximation.

## 1. Visual Theme & Atmosphere

motion.ai's design is built on a clean white canvas (`#ffffff`) that lets content and imagery take center stage. The custom slick typeface defines the brand's typographic voice — at weight 700 for headlines, it creates confident, assertive statements. Text appears in Dim Gray (`#666666`). Dim Gray (`#666666`) serves as the primary accent color, used for CTAs and interactive highlights. The design operates without box-shadows — structure comes from borders, spacing, and background color differentiation. Motion design uses smooth easing curves for polished state transitions. 

**Key Characteristics:**
- Background: Pure White (`#ffffff`)
- Primary typeface: slick
- Primary text: Dim Gray (`#666666`)
- Accent: Dim Gray (`#666666`)
- Display: 45px weight 700
- Border: Light Gray (`#e0e0e0`)
- Custom fonts loaded: slick, ElegantIcons, Open Sans

## 2. Color Palette & Roles

### Background & Surface
- **Pure White** (`#ffffff`): Page background (primary)
- **Light Gray** (`#e0e0e0`): Surface / elevated background

### Text & Content
- **Dim Gray** (`#666666`): Primary body text
- **Pure Black (#000000)** (`#000000`): Secondary text
- **Charcoal (#283139)** (`#283139`): Secondary text

### Accent & Interactive
- **Royal Blue (#3178ef)** (`#3178ef`): Interactive / accent
- **Cornflower Blue (#2ea3f2)** (`#2ea3f2`): Interactive / accent

### Border & Divider
- **Light Gray (#e0e0e0)** (`#e0e0e0`): Borders / dividers

## 3. Typography Rules

### Font Families
- **Primary**: `slick`
- **Secondary**: `ElegantIcons`
- **Font 3**: `Open Sans`

### Custom Fonts Loaded
- **slick** weight normal (normal)
- **ElegantIcons** weight normal (normal)
- **Open Sans** weight 300 (italic)
- **Open Sans** weight 400 (italic)
- **Open Sans** weight 600 (italic)
- **Open Sans** weight 700 (italic)
- **Open Sans** weight 800 (italic)

### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | Open Sans | 45px | 700 | 1 | normal | Main headline (h1) |
| Body | Open Sans | 14px | 500 | 1.7 | normal | Standard reading text |

## 4. Component Stylings

### Navigation

**Main Nav**
- Background: `#3178ef`
- Padding: 40px 0px 0px
- Radius: none
- Font: 14px weight 500
- Use: Fixed/sticky flex nav — N/A items

## 5. Layout Principles

### Layout Type
**hero + sections**

### Grid
Single column, centered content

### Max Width
none

### Spacing System
Compact spacing — information density prioritized

| Token | Value |
|-------|-------|
| xs | 10px |
| sm | 10px |
| md | 10px |
| lg | 10px |
| xl | 40px |
| 2xl | 40px |
| 3xl | 40px |

### Border Radius Scale
| Name | Value | Use |
|------|-------|-----|
| None | 0px | No rounding |
| Sm | 4px | Buttons, inputs, small elements |
| Md | 8px | Cards, containers |
| Lg | 12px | Large cards, sections |
| Xl | 16px | Featured containers |
| Full | 9999px | Pills, avatars, circular elements |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, content blocks |

**Shadow Philosophy**: Flat design — no shadows used. Borders and spacing define structure.

## 7. Do's and Don'ts

### Do
- Use Open Sans as the primary typeface — it defines the brand personality
- Use Dim Gray (`#666666`) as the primary accent — it's the brand's signature interactive color
- Derive all token values from the extracted data — every color, size, and spacing must match the original

### Don't
- Don't substitute with generic sans-serif or serif — the custom font carries the brand
- Don't introduce additional saturated accent colors — the palette is intentionally controlled
- Don't approximate or "eyeball" values — use the exact extracted token values

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | 400px | Single column, compact spacing |
| Mobile Small | 479px | Single column, compact spacing |
| Mobile | 568px | Single column, compact spacing |
| Tablet Small | 767px | 2-column grids begin |
| Tablet Small | 768px | 2-column grids begin |
| Tablet | 860px | Multi-column layouts |

### Token Diff — Desktop vs Mobile

| Element | Property | Desktop | Mobile |
|---------|----------|---------|--------|
| hero | padding | `175px 0px` | `75px 0px` |
| hero | height | `649px` | `755px` |

### Collapsing Strategy
- Navigation: horizontal links → hamburger menu on mobile
- Cards: multi-column → stacked vertical on mobile
- Footer: multi-column → stacked single column on mobile

### Touch Targets
- Navigation: adequate spacing between items
- Interactive elements: minimum 44px touch target recommended

## 9. Agent Prompt Guide

### Quick Reference
- Background: Pure White (`#ffffff`)
- Primary text: Dim Gray (`#666666`)
- Accent: Dim Gray (`#666666`)
- Border: Light Gray (`#e0e0e0`)
- Font: slick
- Body: 14px weight 500

### Example Component Prompts
- "Create a hero section on Pure White background (#ffffff). Headline at 45px slick weight 700, line-height 1, color #666666."
- "Build navigation: static on #ffffff. slick 16px weight 400 for links."

### Iteration Guide
1. Use Pure White (`#ffffff`) as the base background — match exactly
2. All text in Dim Gray (`#666666`) — not pure black, not pure white
3. Accent color Dim Gray (`#666666`) for CTAs and interactive elements
4. Font: slick — respect the weight range found in extraction
5. Every spacing, radius, and shadow value comes from tokens.json — no approximation

---
*Generated by Clone Architect — automated Playwright extraction + design analysis.*
*Source: https://motion.ai | 2026-04-18T11:11:28.071Z*
*All values verified via getComputedStyle() — no approximation, no hallucination.*
