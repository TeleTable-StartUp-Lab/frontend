# Components & Pages

## Layout Components

- [Layout](../src/components/layout/Layout.js) — App shell and footer.
- [Navbar](../src/components/layout/Navbar.js) — Main navigation and user menu.
- [AnimatedRoutes](../src/components/layout/AnimatedRoutes.js) — Route configuration.
- [PageTransition](../src/components/layout/PageTransition.js) — Route transition wrapper.

## Common Components

- [BackendHealthCheck](../src/components/common/BackendHealthCheck.js) — Backend status indicator.

## Pages (Routes)

- [Landing](../src/pages/Landing.js)
- [Login](../src/pages/Login.js)
- [Register](../src/pages/Register.js)
- [Dashboard](../src/pages/Dashboard.js)
- [Diary](../src/pages/Diary.js)
- [PublicDiary](../src/pages/PublicDiary.js)
- [QueueControl](../src/pages/QueueControl.js)
- [AdminPanel](../src/pages/AdminPanel.js)
- [About](../src/pages/About.js)
- [Privacy](../src/pages/Privacy.js)
- [Terms](../src/pages/Terms.js)
- [Contact](../src/pages/Contact.js)

## Component Conventions

- Keep pages focused on layout and data fetching.
- Extract reusable pieces into `components/common` or feature folders.
- Co-locate CSS by using Tailwind utility classes or shared CSS in [src/index.css](../src/index.css).
