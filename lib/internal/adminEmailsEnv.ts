/** Parsed ADMIN_EMAILS — no DB imports (safe for Edge middleware). */
export function getAdminEmailsFromEnv(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * When ADMIN_EMAILS is empty, internal diagnostics APIs are blocked unless this is exactly "true".
 * For local development only — never set in production.
 */
export function isInternalApiDevUnscopedAllowed(): boolean {
  return process.env.INTERNAL_API_ALLOW_UNSCOPED === 'true';
}
