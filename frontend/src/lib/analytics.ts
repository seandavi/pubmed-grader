/**
 * Google Analytics 4 wrapper. Uses the consolidated "Sean Davis — web"
 * property; loads only on production hosts, otherwise `track()` is a no-op.
 */

const MEASUREMENT_ID = "G-KLLV1GCF4E";

function isProductionHost(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[")) return false;
  return !/\.(workers\.dev|netlify\.app|ts\.net)$/.test(host);
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let enabled = false;

export function initAnalytics(): void {
  if (typeof window === "undefined") return;
  if (!isProductionHost(window.location.hostname)) return;

  // Mirror Google's canonical gtag snippet exactly: a plain `function` that
  // pushes the `arguments` object, NOT a rest-params arrow that pushes a
  // real Array. gtag.js's queue-replay logic only processes dataLayer
  // entries whose shape matches `arguments`; Array entries are silently
  // skipped, no page_view fires, and every subsequent gtag() call is
  // dropped on the floor (verified empirically against the live site).
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments as unknown as unknown[]);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
    content_group: "pubmed-grader",
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  enabled = true;
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  if (!enabled || typeof window === "undefined") return;
  window.gtag("event", event, params);
}
