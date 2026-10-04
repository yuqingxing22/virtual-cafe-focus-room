import { captureException, init } from "@sentry/browser";

// Loaded lazily from main.jsx, and only when a DSN was provided at build time.
// The privacy page promises that reports are technical only, so the integrations that
// record what a visitor did (clicks, console output, navigation) or ping sessions are removed.
const DROPPED_INTEGRATIONS = new Set(["Breadcrumbs", "BrowserSession"]);

export const initErrorReporting = (dsn, release) => {
  init({
    dsn,
    release: release || undefined,
    environment: "production",
    sendDefaultPii: false,
    tracesSampleRate: 0,
    integrations: (defaults) =>
      defaults.filter((integration) => !DROPPED_INTEGRATIONS.has(integration.name)),
    beforeSend(event) {
      delete event.user;
      if (event.request?.url) event.request.url = event.request.url.split(/[?#]/)[0];
      return event;
    },
  });

  const report = (error, extra) => captureException(error, extra ? { extra } : undefined);
  window.__cafeReportError = report;

  // Errors caught by the React error boundary before this chunk finished loading.
  const pending = window.__cafePendingErrors ?? [];
  window.__cafePendingErrors = [];
  pending.forEach(({ error, extra }) => report(error, extra));
};
