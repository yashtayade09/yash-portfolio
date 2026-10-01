---
kind: frontend_style
name: CSS Design System with Dark/Light Theme Tokens for Portfolio and Dashboard
category: frontend_style
scope:
    - '**'
source_files:
    - style.css
    - static/dashboard.css
    - templates/dashboard/base.html
---

## Approach

The repository uses **plain CSS** (no preprocessors, no Tailwind, no component library) split into two independent style sheets:

- `style.css` — styles the public portfolio front-end (loaded by `index.html`).
- `static/dashboard.css` — styles the Django admin dashboard (loaded by `templates/dashboard/base.html`).

Both files implement a **design-token-driven system** built on CSS custom properties (`:root` variables), with a dark theme as default and a `[data-theme="light"]` override block. There is no build step or CSS-in-JS tooling; assets are served directly via Django's static file mechanism.

## Key Files

- `style.css` — ~1520 lines covering the public site: layout, background mesh/grid/noise layers, side navigation, hero, about, stats, education/experience timelines, skills tabs, tech marquee, certificates/workshops, projects, achievements/services, resume, contact form, footer, modals/toasts, loader, theme sweep animation, and responsive rules at `max-width: 900px`.
- `static/dashboard.css` — ~1300 lines covering the CMS dashboard: sidebar, topbar, content area, cards/metrics, tables, forms, pills, quick-jump search, toasts, and responsive behavior.
- `templates/dashboard/base.html` — the dashboard template shell that loads Google Fonts (Space Grotesk, Inter, JetBrains Mono) and Font Awesome 6.5.1, sets `data-theme="dark"` on `<html>`, and injects a small inline script that reads `localStorage['theme']` before first paint to avoid theme flash.
- `main.js` / `dashboard.js` — companion JavaScript files referenced from the templates (not analyzed here).

## Architecture & Conventions

### Design tokens

Both style sheets declare an identical token palette under `:root`:

| Token group | Examples |
|---|---|
| Backgrounds | `--bg`, `--bg-alt`, `--panel`, `--panel-2` |
| Borders | `--border`, `--border-strong` |
| Text | `--text`, `--text-muted`, `--text-dim` |
| Accents | `--blue`, `--violet`, `--cyan`, `--emerald`, `--magenta`, `--amber`, `--red` |
| Gradients | `--grad-primary` (blue→violet→cyan), `--grad-line` |
| Shadows | `--shadow-lg`, `--shadow-md`, plus `--shadow-glow` in dashboard |
| Radii | `--radius`, `--radius-sm`, `--radius-xs` |
| Typography | `--font-display` (Space Grotesk), `--font-body` (Inter), `--font-mono` (JetBrains Mono) |
| Layout sizes | `--nav-w`, `--sidebar-w`, `--sidebar-w-collapsed`, `--topbar-h`, `--transition-theme` |

A matching `[data-theme="light"]` block redefines the same tokens with light-mode values. This is the only theming mechanism — there is no CSS variable fallback strategy beyond this selector.

### Naming conventions

- Public-site classes use a flat BEM-like scheme without a namespace prefix: `.hero`, `.project-card`, `.skill-bar-fill`, `.tech-marquee`, etc.
- Dashboard classes are prefixed with `db-` (e.g. `.db-sidebar`, `.db-nav-link`, `.db-card`, `.db-btn-primary`, `.db-table-toolbar`) to keep the two style sheets isolated.
- Utility-like classes are also used un-prefixed in the public sheet: `.container`, `.section`, `.eyebrow`, `.btn`, `.tag`, `.modal-overlay`, `.toast-container`, `.loader-overlay`, `.theme-sweep`.

### Visual system

- **Background layering**: both sheets define a fixed `.bg-layer` / `.db-bg` with three radial gradients (`.bg-mesh` / `::before` pseudo-element) plus a grid pattern (`.bg-grid` / `::after`) and an SVG noise overlay (`.bg-noise`).
- **Glass panels**: `backdrop-filter: blur(...)` + semi-transparent panel backgrounds (`color-mix(in srgb, var(--panel) 70%, transparent)` in the public nav; `var(--panel-glass)` in the dashboard).
- **Gradient text**: headings and key values use `-webkit-background-clip: text` with `--grad-primary`.
- **Animations**: `meshDrift`, `rotate`, `morph`, `marquee`, `scrollWheel`, `blink`, `pulse`, `loadProgress`, `modalIn`, `toastIn`, `dbFadeUp`, `dbGradientShift` — all defined locally in each CSS file.
- **Icons**: Font Awesome 6.5.1 loaded from CDN; icon glyphs are referenced via `<i class="fa-solid ...">` in templates and via empty `::before` content blocks in `style.css` (the "Icon Fallbacks - Removed Emojis" section).

### Responsive strategy

- Public site: a single `@media (max-width: 900px)` breakpoint collapses the vertical side nav into a bottom floating pill, stacks grids to single columns, and centers content.
- Dashboard: relies on CSS Grid `auto-fit`/`minmax()` patterns (e.g. `.db-grid-metrics`, `.db-modules-grid`, `.db-quick-grid`) rather than explicit breakpoints; a `.db-burger` button exists but its mobile behavior is driven by JS.

### Theme switching

- The attribute `data-theme` on `<html>` toggles between dark/light palettes.
- Dashboard base template writes the saved value from `localStorage['theme']` before first paint via an inline IIFE.
- Public site uses `.theme-icon-sun` / `.theme-icon-moon` visibility toggled by `[data-theme]` selectors.

### Typography

Fonts are loaded from Google Fonts via preconnect links in `base.html`; the font families are declared as CSS variables so they can be swapped centrally. Monospace is reserved for labels, tags, dates, and metadata.

## Conventions Observed

- All colors, radii, shadows, fonts, and spacing go through CSS custom properties — hard-coded color literals appear only inside gradient definitions and a few inline SVG data URIs.
- Cards consistently follow the pattern: `background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); transition: all 0.3s ease;` with a hover that swaps the border to `var(--blue)` and applies a lift transform.
- Buttons come in variants (`btn-primary`, `btn-secondary`, `btn-outline` on the public site; `db-btn-primary`, `db-btn-ghost`, `db-btn-danger` on the dashboard) sharing a common base `.btn` / `.db-btn`.
- Focus states use `:focus-visible` with a blue outline and offset — no `outline: none` without a replacement.
- The dashboard template defaults to `data-theme="dark"` and persists the choice in `localStorage`.
- No CSS framework or preprocessor is configured; there is no `tailwind.config.*`, no SCSS/Sass setup, and no PostCSS pipeline visible in the repo.
- The two style sheets are intentionally separated by domain (public vs. dashboard) and differentiated by the `db-` namespace on the dashboard side.