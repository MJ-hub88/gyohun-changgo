---
name: Knowledge Repository Logic
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006e2d'
  on-secondary: '#ffffff'
  secondary-container: '#7cf994'
  on-secondary-container: '#007230'
  tertiary: '#ae0010'
  on-tertiary: '#ffffff'
  tertiary-container: '#d52022'
  on-tertiary-container: '#ffecea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#7ffc97'
  secondary-fixed-dim: '#62df7d'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for **professional knowledge management**, prioritizing clarity, organization, and high trust. It targets researchers, educators, and corporate teams who require a distraction-free environment to archive and retrieve "lessons learned."

The aesthetic is **Corporate Modern**, characterized by a systematic approach to information density. It utilizes ample whitespace and a rigorous grid to ensure that even complex data sets remain legible. The emotional response is one of reliability and intellectual order, moving away from "playful" elements in favor of "functional" precision.

## Colors

The palette is anchored by **Soft Blue (#2563EB)**, which serves as the primary action color, signaling intelligence and stability. 

- **Success Green (#16A34A)** is strictly reserved for "Active" states or positive affirmations (작동).
- **Destructive Red (#DC2626)** is used for "Inactive" states, errors, or critical deletions (비작동).
- **Surface Neutrals** utilize a light gray (#F9FAFB) to differentiate container backgrounds from the main page body (#FFFFFF), creating a subtle layered effect without high-contrast jarring.

## Typography

The typography system is optimized for multilingual support, specifically balancing Korean and English characters. 

- **Headlines:** Use **Hanken Grotesk** for a sharp, contemporary feel that provides visual hierarchy in dashboard views.
- **Body Text:** Use **Noto Sans** for maximum legibility in long-form knowledge entries. Its neutral character ensures focus remains on the content.
- **Labels/UI:** Use **Inter** for small-scale UI elements like buttons, tags, and data tables due to its excellent x-height and technical clarity.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Content is contained within a maximum width of 1280px for desktop viewing to maintain optimal line lengths for reading. 

- **Grid:** A 12-column grid is used for desktop, collapsing to 4 columns on mobile.
- **Rhythm:** Spacing is strictly based on an **8px linear scale**. Use 16px (2u) for internal component padding and 24px (3u) for gutters between cards.
- **Mobile Reflow:** On mobile devices, side-by-side cards stack vertically, and horizontal margins reduce to 16px to maximize screen real estate.

## Elevation & Depth

This design system uses **Tonal Layering** combined with **Ambient Shadows** to create a sense of organized structure.

- **Level 0 (Base):** Pure white (#FFFFFF) background.
- **Level 1 (Surfaces):** Light gray (#F9FAFB) used for secondary sidebars or section containers.
- **Level 2 (Cards):** White surfaces with a soft, diffused shadow. Shadow spec: `0px 4px 12px rgba(0, 0, 0, 0.05)`.
- **Interactions:** Upon hover, cards should transition to a slightly deeper shadow `0px 8px 20px rgba(0, 0, 0, 0.08)` and a subtle 1px border shift to the primary color.

## Shapes

The shape language is defined by **Moderate Rounding**. 

- **Standard Radius:** 8px (0.5rem) is the default for buttons, input fields, and cards. This softens the corporate aesthetic just enough to be approachable while maintaining a structured, "blocked" look.
- **Large Radius:** 16px (1rem) for larger modal containers.
- **Full Radius:** Reserved exclusively for status "Pills" or "Tags" to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid #2563EB with white text. 8px radius. High emphasis.
- **Secondary:** White background with #E5E7EB border and #4B5563 text.
- **Destructive:** Solid #DC2626 for terminal actions.

### Cards
Cards are the primary vehicle for "Lessons." They must feature a 1px border (#E5E7EB) and the Level 2 shadow. Padding should be a consistent 24px internally.

### Status Chips
Used for "작동" (Active) and "비작동" (Inactive). 
- **Active:** Light green background, dark green text, pill-shaped.
- **Inactive:** Light red background, dark red text, pill-shaped.

### Input Fields
Inputs use a white background with a 1px #E5E7EB border. On focus, the border transitions to 2px #2563EB with a soft blue outer glow (3px blur).

### Lists
Data lists should use horizontal dividers (1px #F3F4F6) with 16px vertical padding between items to maintain a "warehouse" of neatly indexed information.