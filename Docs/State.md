# State Management

## Context Providers

The app uses React Context for shared state:

- [AuthContext](../src/context/AuthContext.js)
  - Loads the current user on startup.
  - Stores `user` and `loading` state.
  - Exposes `login`, `register`, and `logout` functions.

- [ThemeContext](../src/context/ThemeContext.js)
  - Manages theme selection.
  - Provides theme toggle support.

- [RobotControlContext](../src/context/RobotControlContext.js)
  - Shared state for robot control views.

## State Usage Patterns

- Use context when data is needed by multiple routes or layout components.
- Keep page-specific UI state local to the page component.
- Avoid storing transient UI state in context.

## Auth Loading

Protected routes show a loading spinner while `AuthContext` is resolving the user. This prevents flash of unauthenticated content.
