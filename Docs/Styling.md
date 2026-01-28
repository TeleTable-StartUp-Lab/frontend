# Styling & Theming

## Tailwind Setup

Tailwind is configured in [tailwind.config.js](../tailwind.config.js). Global styles live in:

- [src/index.css](../src/index.css)
- [src/App.css](../src/App.css)

## Design Tokens

- Color usage follows `primary`, `secondary`, and semantic colors like `success`, `danger`, etc. (Tailwind config).
- Glassmorphism is defined via `.glass-panel` and related utility classes.

## Theme Handling

Theme classes are applied at the root level via [ThemeContext](../src/context/ThemeContext.js). The light theme overrides live in [src/index.css](../src/index.css).

## Animation Guidelines

Framer Motion is used for animations. Favor simple entrance animations for reliability and avoid large nested animation trees that can cause layout jitter.
