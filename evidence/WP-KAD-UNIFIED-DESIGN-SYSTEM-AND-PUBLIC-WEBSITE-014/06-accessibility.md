# Accessibility & UX Verification - WP-KAD-UNIFIED-DESIGN-SYSTEM-AND-PUBLIC-WEBSITE-014

## 1. Accessibility Checks

- **Skip Navigation**: Every page includes `<a class="skip-link" href="#main-content">Skip to content</a>` positioned offscreen and made visible on focus via `tokens.css` / `foundation.css`.
- **Semantic HTML Landmarks**: Each page contains `<header class="site-header">`, `<nav class="nav" aria-label="Main Navigation">`, `<main id="main-content">`, and `<footer class="footer">`.
- **Heading Order**: Strictly monotonic `h1` → `h2` → `h3` hierarchy without skipped levels.
- **Focus Rings**: High-contrast visible focus outline (`outline: 3px solid var(--gold); outline-offset: 4px;`) across all interactive elements (`a`, `button`, `input`, `select`).
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` resets all transitions and animations to `0.01ms !important`.
- **Contrast & Legibility**:
  - Background: `#0a0b0f` (`--ink`).
  - Primary text: `#e7e8e6` (`--paper`, contrast ratio > 14:1 against background).
  - Muted text: `#9da5b2` (`--muted`, contrast ratio > 7:1 against background).
  - Status colors (Green `#79d69a`, Amber `#f0c36d`, Cyan `#68d5e8`, Red `#f05252`) maintain high readability against dark panels.
- **Touch & Mobile Targets**: All buttons and nav links maintain minimum height and padding for touchscreen usability.
