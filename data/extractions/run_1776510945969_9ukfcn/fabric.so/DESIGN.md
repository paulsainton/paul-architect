# Design System — fabric.so
> Extracted automatically by Clone Architect from https://fabric.so
> Date: 2026-04-18
> Viewport: Desktop 1440x900 + Mobile 390x844
> Every value in this file comes from real getComputedStyle() extraction — no approximation.

## 1. Visual Theme & Atmosphere

fabric.so's design is built on a clean white canvas (`#ffffff`) that lets content and imagery take center stage. The custom Be Vietnam Pro typeface defines the brand's typographic voice — used at a remarkably light weight (300) for headlines, creating an understated authority that doesn't need to shout. Text appears in Pure Black (`#000000`). Dim Gray (`#666666`) serves as the primary accent color, used for CTAs and interactive highlights. The shadow system uses multi-layered shadows for natural, atmospheric depth — each elevation level combines multiple shadow layers for realistic lift. 

**Key Characteristics:**
- Background: Pure White (`#ffffff`)
- Primary typeface: Be Vietnam Pro
- Primary text: Pure Black (`#000000`)
- Accent: Dim Gray (`#666666`)
- Display: 80px weight 300, letter-spacing -1.6px
- Border: Light Gray (`#e5e7eb`)
- Shadow system: 2 unique shadow levels detected
- Custom fonts loaded: Be Vietnam Pro, DM Sans, Manrope, Caveat, Fira Mono, Fragment Mono, IBM Plex Mono, JetBrains Mono, Victor Mono, GT Alpina Light, GT Alpina Light Italic, PP Mondwest Regular, PP NeueBit Bold, Inter, Inter Variable, Inter Display, Manrope Placeholder, DM Sans Placeholder, Be Vietnam Pro Placeholder, GT Alpina Light Placeholder, GT Alpina Light Italic Placeholder, PP Mondwest Regular Placeholder, PP NeueBit Bold Placeholder, Inter Placeholder, Inter Variable Placeholder, Inter Display Placeholder

## 2. Color Palette & Roles

### Background & Surface
- **Pure White** (`#ffffff`): Page background (primary)
- **Off-White** (`#fafafa`): Surface / elevated background

### Text & Content
- **Pure Black** (`#000000`): Primary body text
- **Jet Black (#0a0a0a)** (`#0a0a0a`): Secondary text
- **Deep Purple (#0000ee)** (`#0000ee`): Secondary text
- **Charcoal (#333333)** (`#333333`): Secondary text
- **Navy Blue (#19154e)** (`#19154e`): Secondary text

## 3. Typography Rules

### Font Families
- **Primary**: `Be Vietnam Pro`
- **Secondary**: `DM Sans`
- **Font 3**: `Manrope`
- **Font 4**: `Caveat`
- **Font 5**: `Fira Mono`

### Custom Fonts Loaded
- **Be Vietnam Pro** weight 800 (normal)
- **DM Sans** weight 700 (normal)
- **Manrope** weight 500 (normal)
- **Manrope** weight 600 (normal)
- **Manrope** weight 700 (normal)
- **Manrope** weight 800 (normal)
- **Caveat** weight 400 (normal)
- **DM Sans** weight 900 (normal)
- **Fira Mono** weight 400 (normal)
- **Fira Mono** weight 700 (normal)
- **Fragment Mono** weight 400 (normal)
- **IBM Plex Mono** weight 400 (normal)
- **IBM Plex Mono** weight 500 (normal)
- **IBM Plex Mono** weight 600 (normal)
- **IBM Plex Mono** weight 700 (normal)
- **JetBrains Mono** weight 400 (normal)
- **JetBrains Mono** weight 700 (normal)
- **Victor Mono** weight 700 (normal)
- **GT Alpina Light** weight 300 (normal)
- **GT Alpina Light Italic** weight 300 (italic)
- **PP Mondwest Regular** weight 400 (normal)
- **PP NeueBit Bold** weight 700 (normal)
- **PP NeueBit Bold** weight normal (normal)
- **GT Alpina Light** weight normal (normal)
- **Inter** weight 500 (normal)
- **Inter** weight 400 (normal)
- **Inter** weight 700 (normal)
- **Inter** weight 100 (normal)
- **Inter** weight 200 (normal)
- **Inter** weight 300 (normal)
- **Inter** weight 600 (normal)
- **Inter** weight 800 (normal)
- **Inter** weight 900 (normal)
- **Inter Variable** weight 400 (normal)
- **Inter Display** weight 400 (normal)
- **Inter Display** weight 100 (normal)
- **Inter Display** weight 200 (normal)
- **Inter Display** weight 300 (normal)
- **Inter Display** weight 500 (normal)
- **Inter Display** weight 600 (normal)
- **Inter Display** weight 700 (normal)
- **Inter Display** weight 800 (normal)
- **Inter Display** weight 900 (normal)
- **Manrope Placeholder** weight normal (normal)
- **DM Sans Placeholder** weight normal (normal)
- **Be Vietnam Pro Placeholder** weight normal (normal)
- **GT Alpina Light Placeholder** weight normal (normal)
- **GT Alpina Light Italic Placeholder** weight normal (normal)
- **PP Mondwest Regular Placeholder** weight normal (normal)
- **PP NeueBit Bold Placeholder** weight normal (normal)
- **Inter Placeholder** weight normal (normal)
- **Inter Variable Placeholder** weight normal (normal)
- **Inter Display Placeholder** weight normal (normal)

### Typography Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero | GT Alpina Light | 80px | 300 | 1.08 | -1.6px | Main headline (h1) |
| Section Heading | GT Alpina Light | 52px | 300 | 1.08 | -1.04px | Section titles (h2) |
| Sub-heading | Inter | 18px | 500 | 1.5 | -0.18px | Third-level heading (h3) |
| Label Heading | Inter | 18px | 600 | 1.5 | -0.27px | Small heading (H5) |
| Body | Be Vietnam Pro | 12px | 400 | normal | normal | Standard reading text |

### OpenType & Variable Font Features

**Active OpenType features:**
- `ccmp`
- `cv05`
- `cv11`
- Kerning (kern) — `on`
- `salt`

## 4. Component Stylings

### Navigation

**Main Nav**
- Background: `#ffffff`
- Padding: 16px 12px
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
| xs | 12px |
| sm | 12px |
| md | 16px |
| lg | 16px |
| xl | 16px |
| 2xl | 16px |
| 3xl | 16px |

### Border Radius Scale
| Name | Value | Use |
|------|-------|-----|
| None | 0px | No rounding |
| Sm | 8px | Buttons, inputs, small elements |
| Md | 8px | Cards, containers |
| Lg | 12px | Large cards, sections |
| Xl | 16px | Featured containers |
| Full | 9999px | Pills, avatars, circular elements |

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, content blocks |
| Layered (Level 1) | `rgba(0, 0, 0, 0.1) 0px 1px 1px 0px, rgba(0, 0, 0, 0.05) 0px 2px 4px 0px` | Cards, elevated surfaces |
| Layered (Level 2) | `rgba(0, 0, 0, 0.15) 0px 1px 142px 0px` | Cards, elevated surfaces |

**Shadow Philosophy**: Multi-layered shadow system creating natural, atmospheric depth. Each shadow level combines multiple layers for realistic elevation.

## 7. Do's and Don'ts

### Do
- Use sans-serif as the primary typeface — it defines the brand personality
- Keep font weights between 400-400 — the system uses a narrow weight range for subtle hierarchy
- Use the extracted shadow patterns for elevation — they are tuned to match the brand palette
- Use Dim Gray (`#666666`) as the primary accent — it's the brand's signature interactive color
- Derive all token values from the extracted data — every color, size, and spacing must match the original

### Don't
- Don't substitute with generic sans-serif or serif — the custom font carries the brand
- Don't use weight 700 (bold) or above — 400 is the maximum weight in this system
- Don't invent new shadow values — use only the extracted shadow levels
- Don't introduce additional saturated accent colors — the palette is intentionally controlled
- Don't approximate or "eyeball" values — use the exact extracted token values

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Tablet | 809px | Multi-column layouts |
| Tablet | 810px | Multi-column layouts |
| Desktop | 1199px | Full feature layout |
| Desktop | 1200px | Full feature layout |
| Ultra-wide | 2275px | Maximum content width |
| Ultra-wide | 2276px | Maximum content width |

### Token Diff — Desktop vs Mobile

| Element | Property | Desktop | Mobile |
|---------|----------|---------|--------|
| heading | line-height | `86.4px` | `78.4px` |
| nav | padding | `16px 12px` | `0px 0px 0px 14px` |
| nav | height | `56px` | `64px` |

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
- Primary text: Pure Black (`#000000`)
- Accent: Dim Gray (`#666666`)
- Border: Light Gray (`#e5e7eb`)
- Font: Be Vietnam Pro
- Body: 12px weight 400

### Example Component Prompts
- "Create a hero section on Pure White background (#ffffff). Headline at 80px Be Vietnam Pro weight 300, line-height 1.08, letter-spacing -1.6px, color #000000."
- "Build navigation: relative on #ffffff. Be Vietnam Pro 12px weight 400 for links."

### Iteration Guide
1. Use Pure White (`#ffffff`) as the base background — match exactly
2. All text in Pure Black (`#000000`) — not pure black, not pure white
3. Accent color Dim Gray (`#666666`) for CTAs and interactive elements
4. Font: Be Vietnam Pro — respect the weight range found in extraction
5. Every spacing, radius, and shadow value comes from tokens.json — no approximation

---
*Generated by Clone Architect — automated Playwright extraction + design analysis.*
*Source: https://fabric.so | 2026-04-18T11:16:44.834Z*
*All values verified via getComputedStyle() — no approximation, no hallucination.*
