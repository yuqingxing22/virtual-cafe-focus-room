import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles.css";

// Cloudflare Web Analytics: cookie-free, aggregate page views. Only loads when a token is
// provided at build time, so local development and forks stay untracked.
const analyticsToken = import.meta.env.VITE_CF_ANALYTICS_TOKEN?.trim();
if (import.meta.env.PROD && analyticsToken) {
  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.setAttribute("data-cf-beacon", JSON.stringify({ token: analyticsToken }));
  document.head.appendChild(script);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
