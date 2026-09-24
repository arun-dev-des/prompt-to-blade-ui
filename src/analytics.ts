import posthog from 'posthog-js';

/**
 * PostHog is a public/client-side key by design (same model as Google Analytics) —
 * safe to ship in the bundle, so it's fine as a hardcoded fallback. VITE_POSTHOG_KEY
 * lets a fork point at its own PostHog project without a code change.
 */
const KEY = (import.meta.env.VITE_POSTHOG_KEY as string | undefined) ?? 'phc_zC9h35hs6qquUt7fFxFbgDCcLVgdL5n87GyBiYkhgDZM';
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com';

let ready = false;

export const initAnalytics = () => {
  if (!KEY || ready) return;
  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: 'always',
    capture_pageview: true,
    capture_pageleave: true,
  });
  ready = true;
};

/** No-ops before init (or with no key configured) instead of throwing. */
export const track = (event: string, props?: Record<string, unknown>) => {
  if (!ready) return;
  posthog.capture(event, props);
};
