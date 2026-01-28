# Routing & Navigation

## Route Table

Routes are defined in [src/components/layout/AnimatedRoutes.js](../src/components/layout/AnimatedRoutes.js).

Public routes:

- / (Landing)
- /login
- /register
- /about
- /privacy
- /terms
- /contact
- /diary/public

Protected routes (auth required):

- /dashboard
- /diary

Admin routes (admin role required):

- /queue
- /admin

## Protected Routes

- [ProtectedRoute](../src/components/layout/ProtectedRoute.js) redirects unauthenticated users to /login.
- [AdminRoute](../src/components/layout/AdminRoute.js) redirects non-admin users to /dashboard.

## Navigation Components

- Main nav bar: [src/components/layout/Navbar.js](../src/components/layout/Navbar.js)
- Footer nav links: [src/components/layout/Layout.js](../src/components/layout/Layout.js)

## Page Transitions

Route transitions are implemented with Framer Motion in:

- [src/components/layout/PageTransition.js](../src/components/layout/PageTransition.js)
- [src/components/layout/AnimatedRoutes.js](../src/components/layout/AnimatedRoutes.js)

If transitions cause visual issues, see [Troubleshooting](Troubleshooting.md).
