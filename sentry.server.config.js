// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
// const SENTRY_DSN = "https://6f2f24a173714f9a8d98f3a420259e00@o961673.ingest.sentry.io/5909993"

Sentry.init({
  dsn: SENTRY_DSN,
  // Only send a sample of errors due to error quotas.
  sampleRate: 0.2,
  tracesSampleRate: 0.2,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
