# Architecture Overview

## Project Structure

Key folders:

- [src/components](../src/components) — Reusable UI components and layout.
- [src/pages](../src/pages) — Route-level pages (views).
- [src/context](../src/context) — React Context providers (Auth, Theme, Robot control).
- [src/services](../src/services) — API clients and service helpers.
- [src](../src) — Entry points and shared assets.

## Rendering Flow

1) The app boots in [src/index.js](../src/index.js).
2) The root component is [src/App.js](../src/App.js).
3) Layout and navigation are handled in [src/components/layout](../src/components/layout).
4) Routes are declared in [src/components/layout/AnimatedRoutes.js](../src/components/layout/AnimatedRoutes.js).

## Layout Layers

- Global layout and structural shell: [src/components/layout/Layout.js](../src/components/layout/Layout.js)
- Main navigation: [src/components/layout/Navbar.js](../src/components/layout/Navbar.js)
- Route transitions: [src/components/layout/PageTransition.js](../src/components/layout/PageTransition.js)

## Auth & Access

Protected routes are enforced via:

- [src/components/layout/ProtectedRoute.js](../src/components/layout/ProtectedRoute.js)
- [src/components/layout/AdminRoute.js](../src/components/layout/AdminRoute.js)

These guard components read authentication state from [src/context/AuthContext.js](../src/context/AuthContext.js).

## Conventions

- Pages should be thin and delegate reusable UI to components.
- Contexts own session or UI state that must be shared across routes.
- API calls live in [src/services/api.js](../src/services/api.js) and are called from pages/components.
