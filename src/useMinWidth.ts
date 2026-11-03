import { useSyncExternalStore } from 'react';

/** Viewport width at which the page switches to the three-column layout with side rails. */
export const RAILS_MIN_WIDTH = 1320;

/** True while the viewport is at least `px` wide. Re-renders on resize across the threshold only. */
export const useMinWidth = (px: number) => {
  const query = `(min-width: ${px}px)`;
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', notify);
      return () => mql.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
};
