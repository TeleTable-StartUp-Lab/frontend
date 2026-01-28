# Troubleshooting

## UI Elements Not Appearing After Navigation

Symptoms:

- Certain sections render blank after route transitions.
- Reloading the page fixes it.

Common causes:

- Complex animations layered on route transitions.
- Long-running or infinite animations combined with mount/unmount transitions.

Recommended checks:

1) Review route transitions in [src/components/layout/PageTransition.js](../src/components/layout/PageTransition.js).
2) Reduce nested animation complexity on pages.
3) Confirm that components are mounted as expected in [AnimatedRoutes](../src/components/layout/AnimatedRoutes.js).

## Animation Jank or Flicker

- Prefer modest durations and simple easing curves.
- Avoid animating layout-affecting properties (height, width) in multiple nested elements.
- Use `transform` and `opacity` whenever possible.

## Auth Redirect Loops

- Verify token is stored and `/me` request succeeds in [AuthContext](../src/context/AuthContext.js).
- Check backend availability.

## API Errors

- Inspect [src/services/api.js](../src/services/api.js) for base URL and headers.
- Ensure backend is running and accessible.
