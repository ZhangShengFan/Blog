import { siteConfig } from '@config/site.config';

export const ANALYTICS_CONSENT_KEY = 'cookie-consent';

export type AnalyticsConsent = 'accepted' | 'declined';

const UMAMI_SCRIPT_ID = 'umami-analytics-script';

export const getAnalyticsConsent = (): AnalyticsConsent | null => {
  try {
    const value = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch {
    return null;
  }
};

export const setAnalyticsConsent = (consent: AnalyticsConsent) => {
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  } catch {
    // Consent still applies to the current page when storage is unavailable.
  }
};

export const hasAnalyticsConfig = () =>
  Boolean(siteConfig.analytics.umamiScriptSrc && siteConfig.analytics.umamiWebsiteId);

export const loadAnalytics = () => {
  if (typeof document === 'undefined' || !hasAnalyticsConfig() || document.getElementById(UMAMI_SCRIPT_ID)) {
    return;
  }

  const script = document.createElement('script');
  script.id = UMAMI_SCRIPT_ID;
  script.defer = true;
  script.src = siteConfig.analytics.umamiScriptSrc;
  script.dataset.websiteId = siteConfig.analytics.umamiWebsiteId;
  document.head.appendChild(script);
};

export const initializeAnalytics = () => {
  if (getAnalyticsConsent() === 'accepted') {
    loadAnalytics();
  }
};
