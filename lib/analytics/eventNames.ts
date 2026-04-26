/**
 * Canonical analytics event_name values stored in app_events.
 * Prefer these in trackEvent() so dashboards stay consistent.
 */
export const ANALYTICS_EVENTS = {
  upgradePromptOpened: 'upgrade_prompt_opened',
  upgradeCheckoutStarted: 'upgrade_checkout_started',
  documentUploaded: 'document_uploaded',
  documentDownloaded: 'document_downloaded',
  expungementStarted: 'expungement_started',
  structuredLegalSummaryDownload: 'structured_legal_summary_download',
  lawyerLeadSubmit: 'lawyer_lead_submit',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
