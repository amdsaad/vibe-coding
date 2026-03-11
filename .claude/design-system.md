# VIBES Design System

> A comprehensive, AI-readable design system document for maintaining visual consistency across the Vibes platform and any derived projects. This file serves as the single source of truth for all design decisions.

---

## Table of Contents

1. [Context & Origin](#1-context--origin)
2. [Design Philosophy](#2-design-philosophy)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Components](#6-components)
7. [Animations & Motion](#7-animations--motion)
8. [Section Patterns](#8-section-patterns)
9. [Iconography & Decorative Elements](#9-iconography--decorative-elements)
10. [Responsive Behavior](#10-responsive-behavior)
11. [AI Implementation Guide](#11-ai-implementation-guide)

---

## 1. Context & Origin

### Inspiration Sources

This design system was synthesized from analysis of two creative agency websites:

- **QClay (qclay.design)** — Contributed: generous whitespace philosophy, spinning circular text badges, section-based viewport design, serif+sans typography pairing, restrained color with bold accents
- **Studio Linear (studiolinear.com)** — Contributed: dominant single-color commitment (red), oversized condensed typography, monospace body text, red pill-shaped tags, striped decorative borders, editorial/punk aesthetic, marquee scrolling bands

### Design Direction

The system leans **heavily toward Studio Linear's boldness** — fearless color, massive type, monospace editorial feel — while incorporating QClay's spatial discipline and breathing whitespace.

### Personality Keywords

**Bold. Editorial. Confident. Irreverent. Clean.**

The design should feel like a high-end creative magazine crossed with a punk zine. Never corporate. Never generic. Never timid.

### Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS v4 with `@theme inline` in `globals.css`
- **Fonts**: Google Fonts loaded via `next/font/google`
- **Language**: TypeScript

---

## 2. Design Philosophy

### Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Confidence through scale** | Typography is the primary design tool. Headlines should be massive and commanding. | Use `clamp()` for fluid type scaling. Hero headings reach 9rem on desktop. |
| **Single-color dominance** | Red `#E70000` is the identity. It's used boldly and unapologetically everywhere. | Apply red to CTAs, accent text, backgrounds, borders, marquees, scrollbars, and text selection. |
| **Monospace editorial texture** | Body text uses monospace to create a technical/editorial feel distinct from generic sans-serif. | JetBrains Mono is the default body font. All descriptions, labels, and navigation use it. |
| **Generous whitespace** | Sections breathe. Content doesn't crowd. Space creates hierarchy. | Sections use `py-24 md:py-36`. Content max-width is `1400px`. |
| **Playful irreverence** | Inject personality through details — spinning badges, striped borders, bold copy. | Use `.animate-spin-slow`, `.striped-border`, editorial parenthetical labels like `( Features )`. |

### What This Design System IS NOT

- Not minimalist for minimalism's sake — it's bold and opinionated
- Not corporate or safe — it should feel edgy and creative
- Not dependent on imagery — typography and color carry the design
- Not template-like — every section should feel intentional and crafted

---

## 3. Color System

### Color Tokens

Define these as CSS custom properties in `:root` AND as `@theme inline` values for Tailwind v4:

```css
:root {
  --background: #FAFAF8;    /* Warm white — page base */
  --foreground: #0A0A0A;    /* Near-black — primary text */
  --red: #E70000;           /* Primary accent — the brand color */
  --red-dark: #C10000;      /* Hover/active state for red */
  --lime: #8DE746;          /* Secondary accent — used sparingly for highlights */
  --gray: #6B6B6B;          /* Secondary text, descriptions */
  --light-gray: #E8E8E8;    /* Borders, decorative numbers, dividers */
}
```

```css
@theme inline {
  --color-background: #FAFAF8;
  --color-foreground: #0A0A0A;
  --color-red: #E70000;
  --color-red-dark: #C10000;
  --color-lime: #8DE746;
  --color-gray: #6B6B6B;
  --color-light-gray: #E8E8E8;
}
```

### Color Usage Rules

| Token | Tailwind Class | When to Use | When NOT to Use |
|-------|---------------|-------------|-----------------|
| `background` | `bg-background` | Page background, nav background with opacity, card backgrounds | Never as text color |
| `foreground` | `text-foreground`, `bg-foreground` | Primary text, dark section backgrounds, secondary buttons | Avoid for borders (use `foreground/10` instead) |
| `red` | `text-red`, `bg-red` | CTAs, accent headlines, marquee backgrounds, tags, hover states, links, scrollbar, text selection | Never as body text color. Never for large background areas except CTA sections and marquees |
| `red-dark` | `bg-red-dark` | Hover/active state for red buttons only | Never as a standalone color — always paired with `red` |
| `lime` | `text-lime` | Feature list markers on dark/red backgrounds, special highlights | Use very sparingly. Only on dark or red backgrounds for contrast |
| `gray` | `text-gray` | Body text, descriptions, secondary labels, footer links | Not for headings. Not for interactive elements |
| `light-gray` | `text-light-gray` | Decorative large numbers (01, 02...), border colors | Not for body text (too low contrast) |

### Opacity Patterns

- `bg-background/90` — Nav background with blur
- `border-foreground/5` — Subtle nav border
- `border-foreground/10` — Card borders, section dividers
- `text-background/50` — Muted text on dark backgrounds
- `text-white/70` — Secondary text on red/dark backgrounds
- `text-white/30` — Borders on colored card overlays
- `bg-red/[0.02]` — Hover tint on feature cards
- `text-red/20` — Hover state for decorative numbers

### Special Color Behaviors

```css
/* Text selection — always red with white text */
::selection {
  background: var(--red);
  color: white;
}

/* Scrollbar — red thumb on warm-white track */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--background); }
::-webkit-scrollbar-thumb { background: var(--red); border-radius: 4px; }
```

---

## 4. Typography

### Font Stack

| Role | Font Family | CSS Variable | Weights | Google Font Import |
|------|------------|-------------|---------|-------------------|
| **Display/Headings** | Space Grotesk | `--font-space-grotesk` | 400, 500, 600, **700** | `Space_Grotesk` |
| **Body/UI/Labels** | JetBrains Mono | `--font-geist-mono` | 400, 500, 600 | `JetBrains_Mono` |

### Font Loading (Next.js)

```tsx
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
```

Apply to `<body>`: `className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}`

### Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing | Tailwind Classes |
|---------|------|------|--------|-------------|----------------|-----------------|
| **Hero H1** | Space Grotesk | `clamp(3rem, 10vw, 9rem)` | 700 (bold) | 0.9 | tight | `font-[family-name:var(--font-space-grotesk)] text-[clamp(3rem,10vw,9rem)] font-bold leading-[0.9] tracking-tight` |
| **Section H2** | Space Grotesk | `clamp(2.5rem, 6vw, 5rem)` | 700 | 0.95 | tight | `font-[family-name:var(--font-space-grotesk)] text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-tight` |
| **CTA H2** | Space Grotesk | `clamp(2.5rem, 8vw, 7rem)` | 700 | 0.9 | tight | `font-[family-name:var(--font-space-grotesk)] text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[0.9] tracking-tight` |
| **Card H3** | Space Grotesk | `1.25rem` (xl) | 700 | default | tight | `font-[family-name:var(--font-space-grotesk)] text-xl font-bold tracking-tight` |
| **Name H3** | Space Grotesk | `1.5rem` (2xl) | 700 | default | tight | `font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight` |
| **Decorative Number** | Space Grotesk | `3rem` (5xl) | 700 | default | default | `font-[family-name:var(--font-space-grotesk)] text-5xl font-bold` |
| **Price** | Space Grotesk | `3rem` (5xl) | 700 | default | default | `font-[family-name:var(--font-space-grotesk)] text-5xl font-bold` |
| **Body Text** | JetBrains Mono | `0.875rem` (sm) | 400 | 1.75 (leading-7) or 1.5 (leading-6) | default | `font-mono text-sm leading-7` or `leading-6` |
| **Nav Link** | JetBrains Mono | `0.75rem` (xs) | 400 | default | `0.2em` | `font-mono text-xs uppercase tracking-[0.2em]` |
| **Section Label** | JetBrains Mono | `0.75rem` (xs) | 400 | default | `0.3em` | `font-mono text-xs uppercase tracking-[0.3em]` |
| **Pill Tag** | JetBrains Mono | `10px` | 400 | default | `0.2em` | `font-mono text-[10px] uppercase tracking-[0.2em]` |
| **Marquee Text** | Space Grotesk | `1.5rem` (2xl) | 700 | default | `0.15em` | `font-[family-name:var(--font-space-grotesk)] text-lg md:text-2xl font-bold uppercase tracking-[0.15em]` |
| **Logo** | Space Grotesk | `1.5rem` (2xl) nav / `2.25rem` (4xl) footer | 700 | default | tight | `font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-red` |
| **Footer Heading** | JetBrains Mono | `0.75rem` (xs) | 600 | default | `0.2em` | `font-mono text-xs uppercase tracking-[0.2em] font-semibold` |
| **Copyright** | JetBrains Mono | `0.75rem` (xs) | 400 | default | default | `font-mono text-xs text-gray` |

### Typography Rules

1. **All headings are uppercase** — never use sentence case or title case for headings
2. **All navigation and labels are uppercase** — with wide letter-spacing
3. **Body text is the only sentence-case element** — descriptions, paragraphs
4. **Display font (Space Grotesk) is ONLY for**: headings, prices, decorative numbers, marquee text, and the logo
5. **Mono font (JetBrains Mono) is for everything else**: body, nav, labels, tags, buttons, footers
6. **Accent lines in headings**: Use `<span className="text-red">` to highlight key phrases. Pattern: first line(s) in foreground, accent line in red
7. **Trailing period accent**: Add `<span className="text-red">.</span>` at the end of hero/CTA headings for punctuation-as-design

---

## 5. Spacing & Layout

### Container

```
Max width: 1400px
Horizontal padding: px-6 (mobile) / px-12 (desktop / md:)
Center: mx-auto
```

Tailwind: `max-w-[1400px] mx-auto px-6 md:px-12`

### Section Spacing

| Section Type | Vertical Padding | Tailwind |
|-------------|-----------------|----------|
| Standard content section | 96px / 144px | `py-24 md:py-36` |
| Marquee band | 20px | `py-5` |
| Footer | 64px | `py-16` |
| Nav | 16px | `py-4` |

### Section Header Spacing

- Gap between section header and content: `mb-16 md:mb-24` (64px / 96px)
- Gap between section label and heading: `mb-4` (16px) for centered, `mb-6` for left-aligned

### Card Grid Gaps

| Grid Type | Gap | Tailwind |
|-----------|-----|----------|
| Feature cards (3-col) | 24px | `gap-6` |
| Showcase cards (2-col) | 32px | `gap-8` |
| Pricing cards (3-col) | 24px | `gap-6` |
| Footer columns (4-col) | 48px | `gap-12` |

### Content Width Constraints

- **Hero body text**: `max-w-md` (28rem / 448px)
- **CTA body text**: `max-w-lg` (32rem / 512px)
- **Pricing grid**: `max-w-[1100px]`
- **Full content**: `max-w-[1400px]`

---

## 6. Components

### 6.1 Navigation Bar

**When to use**: Fixed at page top on every page.

```
Position: fixed, top-0, z-50
Background: bg-background/90 backdrop-blur-sm
Border: border-b border-foreground/5
Inner padding: px-6 py-4 md:px-12
Layout: flex items-center justify-between
```

**Logo**: Display font, 2xl, bold, red with foreground period
**Nav links**: Mono, xs, uppercase, tracking-[0.2em], hover:text-red
**Primary CTA**: `bg-red text-white font-mono text-xs uppercase tracking-[0.2em] px-6 py-3 rounded-full hover:bg-red-dark`
**Secondary link**: Same as nav links

### 6.2 Buttons

#### Primary Button (Red)

**When to use**: Main call-to-action. "Create Your Portfolio", "Start Free", "Go Pro".

```
bg-red text-white font-mono text-sm uppercase tracking-[0.15em] px-8 py-4 rounded-full
hover:bg-red-dark transition-colors font-medium
```

**Variables**: `--red` background, `--red-dark` hover, white text, monospace font

#### Secondary Button (Outline)

**When to use**: Secondary action paired with a primary. "See Examples".

```
border-2 border-foreground text-foreground font-mono text-sm uppercase tracking-[0.15em]
px-8 py-4 rounded-full hover:bg-foreground hover:text-background transition-colors font-medium
```

#### Inverted Button (White on Red)

**When to use**: CTA on red backgrounds.

```
bg-white text-red font-mono text-sm uppercase tracking-[0.15em] px-10 py-4 rounded-full
hover:bg-white/90 transition-colors font-medium
```

#### Dark Button

**When to use**: Non-featured pricing tiers, secondary actions on light backgrounds.

```
bg-foreground text-background font-mono text-sm uppercase tracking-[0.15em] px-6 py-4
rounded-full font-medium hover:bg-foreground/80 transition-colors
```

#### Small Nav Button

**When to use**: Navigation bar CTA only.

```
bg-red text-white font-mono text-xs uppercase tracking-[0.2em] px-6 py-3 rounded-full
hover:bg-red-dark transition-colors
```

### 6.3 Pill Tag

**When to use**: Category labels on cards, step indicators, plan names. Always appears in the top-right or as an inline label.

#### Red Pill (default, on light backgrounds)

```
font-mono text-[10px] uppercase tracking-[0.2em] text-red border border-red
rounded-full px-3 py-1
```

#### White Pill (on dark/colored backgrounds)

```
font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 border border-white/30
rounded-full px-3 py-1
```

### 6.4 Feature Card

**When to use**: Displaying features, capabilities, or benefits in a grid.

```
Structure:
┌──────────────────────────┐
│  [Large Number]    [Tag] │   ← flex justify-between, mb-6
│                          │
│  CARD TITLE              │   ← Display font, xl, bold
│  Description text in     │   ← Mono, sm, text-gray
│  monospace goes here.    │
└──────────────────────────┘

Wrapper: border-2 border-foreground/10 rounded-2xl p-8
Hover:   hover:border-red hover:bg-red/[0.02] transition-all duration-300 hover-lift
Number:  text-5xl font-bold text-light-gray → group-hover:text-red/20
Grid:    grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

### 6.5 Showcase Card

**When to use**: Displaying portfolio items, case studies, or work examples.

```
Structure:
┌─────────────────────────────┐
│                        [↗]  │   ← Arrow, opacity-0 → group-hover:opacity-100
│                             │
│                             │   ← Colored background, aspect-[4/3], rounded-2xl
│   [ROLE TAG]                │   ← White pill at bottom-left
│   gradient overlay ─────────│   ← bg-gradient-to-t from-black/40
└─────────────────────────────┘
  NAME                  VIEW     ← Display font 2xl + Mono xs red
  Description text               ← Mono sm, text-background/50

Wrapper: group cursor-pointer
Image:   rounded-2xl aspect-[4/3] mb-6 relative overflow-hidden
Arrow:   absolute top-6 right-6 w-10 h-10 rounded-full border-2 border-white/30
Grid:    grid-cols-1 md:grid-cols-2 gap-8
```

### 6.6 Pricing Card

**When to use**: Pricing tiers. One card should be `featured: true`.

#### Standard Tier

```
rounded-2xl p-8 md:p-10 border-2 border-foreground/10
hover:border-red/30 transition-all hover-lift
```

List markers: `text-red` "+"
CTA: Dark button

#### Featured Tier

```
bg-red text-white border-2 border-red scale-105
rounded-2xl p-8 md:p-10 transition-all hover-lift
```

List markers: `text-lime` "+"
CTA: Inverted button (white on red)

### 6.7 Step Card (How It Works)

**When to use**: Sequential process steps, always in a 3-column connected layout.

```
Structure:
┌─────────────┬─────────────┬─────────────┐
│  [Icon]     │  [Icon]     │  [Icon]     │
│  STEP 01    │  STEP 02    │  STEP 03    │
│  TITLE      │  TITLE      │  TITLE      │
│  Desc...    │  Desc...    │  Desc...    │
└─────────────┴─────────────┴─────────────┘

Outer: border-2 border-foreground/10 rounded-2xl overflow-hidden
Inner: p-10 md:p-12, dividers via border-r-2 border-foreground/10
Icon:  text-5xl mb-6 (use unicode: ✨ ✎ ⚡ or similar)
Tag:   Red pill with "Step XX"
Grid:  grid-cols-1 md:grid-cols-3 gap-0
```

### 6.8 Section Header

**When to use**: Every content section starts with one.

#### Left-Aligned (with right label)

```
<div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-24">
  <h2>HEADING LINE<br /><span className="text-red">ACCENT LINE</span></h2>
  <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray">( Label )</p>
</div>
```

#### Centered (with top label)

```
<div className="text-center mb-16 md:mb-24">
  <p className="font-mono text-xs uppercase tracking-[0.3em] text-red mb-4">( Label )</p>
  <h2>HEADING LINE<br /><span className="text-red">ACCENT LINE</span></h2>
</div>
```

**Rule**: Section labels always use `( Parenthetical Format )` — this is a signature design element from Studio Linear's editorial style.

### 6.9 Striped Divider

**When to use**: Between major sections, especially before/after marquee bands and above the footer.

```css
.striped-border {
  background: repeating-linear-gradient(
    90deg,
    var(--red) 0px, var(--red) 12px,
    var(--background) 12px, var(--background) 24px
  );
  height: 8px;
}
```

Tailwind: `<div className="striped-border" />`

### 6.10 Marquee Band

**When to use**: Social proof, feature highlights, or brand messaging between sections. Always sandwiched between striped dividers.

```
Outer: bg-red py-5 overflow-hidden
Inner: flex whitespace-nowrap animate-marquee (or animate-marquee-slow)
Text:  Display font, text-lg md:text-2xl, white, bold, uppercase, tracking-[0.15em]
Content: Repeat 6-8x with mx-8 spacing
Separator: Use " * " between items
```

---

## 7. Animations & Motion

### Keyframe Definitions

| Animation | Duration | Timing | Use Case |
|-----------|----------|--------|----------|
| `fadeInUp` | 0.8s | ease-out | Page load entrance for hero elements |
| `marquee` | 20s | linear, infinite | Feature marquee scrolling |
| `marquee` (slow) | 35s | linear, infinite | Stats/social proof marquee |
| `spin-slow` | 12s | linear, infinite | Decorative spinning badge |

### Stagger Pattern

Hero elements use staggered fade-in-up with 150ms delay increments:

| Class | Delay | Use |
|-------|-------|-----|
| `.animate-fade-in-up` | 0ms | First element (subtitle/label) |
| `.animate-fade-in-up-delay-1` | 150ms | Main heading |
| `.animate-fade-in-up-delay-2` | 300ms | Body text + CTAs |
| `.animate-fade-in-up-delay-3` | 450ms | Decorative elements |
| `.animate-fade-in-up-delay-4` | 600ms | Additional elements |

Elements with delay MUST have `opacity: 0` as initial state.

### Hover Effects

#### Hover Lift (Cards)

```css
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(231, 0, 0, 0.15);
}
```

**When to use**: Feature cards, pricing cards. The shadow uses red tint at 15% opacity.

#### Color Transitions

All interactive elements use `transition-colors` (Tailwind default: 150ms).

#### Opacity Transitions

Showcase card arrows: `opacity-0 group-hover:opacity-100 transition-opacity`

### Motion Rules

1. **Entrance animations**: Only on the hero section. Other sections should use CSS-only hover effects.
2. **Transition duration**: 300ms for transforms, 150ms for colors, 200ms for opacity.
3. **Marquees**: Must use `translateX(-50%)` and duplicate content to create seamless loop.
4. **Never pause animations on hover** for marquees.
5. **Spinning elements**: 12s full rotation — slow enough to be ambient, not distracting.

---

## 8. Section Patterns

### 8.1 Hero Section

**Purpose**: First impression. Massive headline, value proposition, primary CTAs.

```
Background: bg-background (light)
Layout: min-h-screen, flex flex-col justify-center
Padding: pt-28 (accounts for fixed nav) pb-8 px-6 md:px-12
Max width: 1400px

Structure:
1. Subtitle label (mono, xs, red, uppercase, wide tracking)
2. Giant headline (display, clamp 3-9rem, line-height 0.9)
   - Key phrase in red via <span>
   - Trailing red period accent
3. Body text (mono, sm, gray, max-w-md) + CTA buttons row
4. Decorative spinning badge (absolute positioned, right side, hidden on <lg)
```

### 8.2 Marquee Section

**Purpose**: Visual rhythm break. Communicates key features or social proof.

```
Structure: striped-border → red marquee → striped-border
Always appears between content sections, never standalone.
```

### 8.3 Feature Grid Section

**Purpose**: Highlight product capabilities or benefits.

```
Background: bg-background (light)
Header: Left-aligned with right label
Grid: 3-col feature cards
```

### 8.4 Showcase Section (Dark)

**Purpose**: Display work, portfolio items, or examples.

```
Background: bg-foreground (dark), text-background
Header: Left-aligned with right link "( View All Work ----> )"
Grid: 2-col showcase cards
```

### 8.5 Steps Section

**Purpose**: Explain a sequential process.

```
Background: bg-background (light)
Header: Centered with top label
Content: Single bordered card split into 3 columns
```

### 8.6 Pricing Section

**Purpose**: Display pricing tiers.

```
Background: bg-background (light)
Header: Centered with top label
Grid: 3-col pricing cards, max-w-[1100px], center featured card with scale-105
```

### 8.7 CTA Section

**Purpose**: Final conversion push before footer.

```
Background: bg-red
Text: white, centered
Headline: Display font, clamp 2.5-7rem, line-height 0.9
  - Trailing foreground period (dark dot on red background)
Body: mono, sm, white/70, max-w-lg
Button: Inverted (white on red)
```

### 8.8 Footer

**Purpose**: Site navigation, brand, social links.

```
Background: bg-background
Border: striped-border above, border-t border-foreground/5
Layout: 4-col grid (brand + 3 link columns)
Bottom bar: copyright left, social links right, separated by border-t border-foreground/10
```

### Section Flow (recommended page order)

```
1. Nav (fixed)
2. Hero
3. Striped Divider
4. Marquee (features)
5. Striped Divider
6. Features Grid
7. Showcase (dark)
8. Steps
9. Striped Divider
10. Marquee (social proof)
11. Striped Divider
12. Pricing
13. CTA (red)
14. Striped Divider
15. Footer
```

---

## 9. Iconography & Decorative Elements

### Spinning Badge

A circular SVG text element that rotates continuously. Used as a decorative hero accent.

```tsx
<div className="relative w-32 h-32">
  <svg className="animate-spin-slow w-full h-full" viewBox="0 0 200 200">
    <defs>
      <path id="circlePath"
        d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" />
    </defs>
    <text fill="currentColor" className="text-red"
      fontSize="15" fontFamily="monospace" letterSpacing="4">
      <textPath href="#circlePath">YOUR TEXT HERE * MORE TEXT *</textPath>
    </text>
  </svg>
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-3xl">ICON</span>
  </div>
</div>
```

**When to use**: Hero section only. One per page. Positioned absolute, right side.

### Arrow Icon (Showcase Card)

```tsx
<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
  <path d="M1 13L13 1M13 1H1M13 1V13" stroke="currentColor" strokeWidth="2" />
</svg>
```

**When to use**: Top-right of showcase/portfolio cards, revealed on hover.

### Unicode Icons (Steps)

Use unicode characters for step icons:
- `&#10024;` (✨) — Selection/choice
- `&#9998;` (✎) — Editing/customization
- `&#9889;` (⚡) — Speed/launch
- `&#9876;` (⚔) — Center of spinning badge

Style: `text-5xl mb-6`

### List Markers

Use "+" character for feature lists:
- On light backgrounds: `<span className="text-red">+</span>`
- On red backgrounds: `<span className="text-lime">+</span>`

---

## 10. Responsive Behavior

### Breakpoints (Tailwind defaults)

| Breakpoint | Width | Key Changes |
|-----------|-------|-------------|
| Default (mobile) | < 768px | Single column, smaller type, hidden nav links |
| `md:` | >= 768px | Multi-column grids, larger section padding |
| `lg:` | >= 1024px | 3-col feature grid, spinning badge visible |
| `sm:` | >= 640px | Inline button rows, "Log In" link visible |

### Responsive Patterns

| Element | Mobile | Desktop |
|---------|--------|---------|
| Container padding | `px-6` | `md:px-12` |
| Section padding | `py-24` | `md:py-36` |
| Feature grid | 1 column | 2 cols (md) → 3 cols (lg) |
| Showcase grid | 1 column | 2 columns (md) |
| Pricing grid | 1 column | 3 columns (md) |
| Steps grid | 1 column (stacked, border-b) | 3 columns (border-r) |
| Footer grid | 1 column | 4 columns |
| Nav links | Hidden | Visible (md) |
| Spinning badge | Hidden | Visible (lg) |
| Hero buttons | Column stack | Row (sm) |
| Section headers | Column stack | Row with items-end (md) |
| Card padding | `p-8` | `md:p-10` or `md:p-12` |
| Marquee text | `text-lg` | `md:text-2xl` |

### Typography Scaling

All headings use `clamp()` for fluid scaling — no breakpoint-based size changes needed:

- Hero: `clamp(3rem, 10vw, 9rem)` — 48px → 144px
- Sections: `clamp(2.5rem, 6vw, 5rem)` — 40px → 80px
- CTA: `clamp(2.5rem, 8vw, 7rem)` — 40px → 112px

---

## 11. AI Implementation Guide

### Step-by-Step: Building a New Page with This Design System

1. **Set up the layout** — Load Space Grotesk and JetBrains Mono via `next/font/google`. Apply both as CSS variable classes on `<body>`.

2. **Configure globals.css** — Copy the `:root` variables and `@theme inline` block exactly. Include all keyframe animations and utility classes (`.animate-marquee`, `.striped-border`, `.hover-lift`, etc.).

3. **Start with the nav** — Fixed position, blurred background, logo left, links center, CTAs right.

4. **Build sections top-to-bottom** following the section flow pattern. Each section:
   - Wrap in `<section>` with id for anchor links
   - Use `max-w-[1400px] mx-auto` container
   - Start with a section header (left-aligned or centered)
   - Use appropriate grid layout for content

5. **Apply typography consistently**:
   - Headings → `font-[family-name:var(--font-space-grotesk)]` + uppercase
   - Everything else → `font-mono` (inherits JetBrains Mono)
   - Never mix these rules

6. **Add color accents**:
   - One `<span className="text-red">` per heading for emphasis
   - Red pills on cards
   - Red CTAs
   - Red marquee bands between sections

7. **Add animations** only to the hero section. Use hover effects on cards everywhere.

8. **Test responsive** — Mobile-first, then layer `md:` and `lg:` overrides.

### Key Variables Reference (Quick Copy)

```css
/* Colors */
--background: #FAFAF8;
--foreground: #0A0A0A;
--red: #E70000;
--red-dark: #C10000;
--lime: #8DE746;
--gray: #6B6B6B;
--light-gray: #E8E8E8;

/* Fonts */
--font-space-grotesk: Space Grotesk (Google Fonts)
--font-geist-mono: JetBrains Mono (Google Fonts)

/* Spacing */
Container: max-w-[1400px] mx-auto px-6 md:px-12
Section: py-24 md:py-36
Header gap: mb-16 md:mb-24

/* Borders */
Cards: border-2 border-foreground/10 rounded-2xl
Divider: striped-border (8px red/white repeating gradient)

/* Shadows */
Hover: 0 20px 60px rgba(231, 0, 0, 0.15)
```

### Common Mistakes to Avoid

1. **Using sans-serif for body text** — Always use monospace (JetBrains Mono)
2. **Lowercase headings** — All headings must be uppercase
3. **Multiple accent colors** — Red is the ONLY primary accent. Lime is secondary and rare.
4. **Missing striped dividers** — Marquees must always be sandwiched between striped-border dividers
5. **Flat buttons** — All buttons are `rounded-full` (pill shape), never squared or slightly rounded
6. **Generic hover states** — Use `hover-lift` with red-tinted shadow, not plain shadow
7. **Missing parenthetical labels** — Section labels use `( Label )` format
8. **Forgetting the trailing red period** — Hero and CTA headings end with `<span className="text-red">.</span>`
9. **Using too many colors for showcase cards** — Use the brand red, lime, and 1-2 bold accent colors max
10. **Skipping the dark section** — Every page should have at least one `bg-foreground` section for rhythm

---

*Last updated: March 2026. Based on analysis of qclay.design and studiolinear.com.*
*Design system for the Vibes portfolio creator platform.*
