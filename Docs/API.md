# API & Data Flow

## API Client

The frontend uses a shared Axios instance:

- [src/services/api.js](../src/services/api.js)

This file typically contains:

- Base URL configuration
- JSON headers
- Auth token injection (if implemented)

## Auth Flow

1) User submits credentials in [Login](../src/pages/Login.js).
2) `AuthContext` calls the backend `/login` endpoint.
3) Token is stored in localStorage.
4) User details are fetched via `/me` and stored in context.

## Data Fetching

Pages and components call the API client directly. Example pages with data fetching include:

- [Landing](../src/pages/Landing.js) — backend health check
- [AdminPanel](../src/pages/AdminPanel.js) — user management

## Error Handling

Errors are typically stored in local component state and surfaced with inline UI messages. Standardize messages for consistency.
