/**
 * Legacy path — canonical is POST /api/lawyer-lead (App Router).
 * Kept for older clients and bookmarks.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { insertLawyerLead } from '@/lib/lawyerLead';
import { checkRateLimit, ipFromRequest } from '@/lib/rateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rl = checkRateLimit(`lawyer-lead:${ipFromRequest(req)}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  const result = await insertLawyerLead(req.body);
  if (!result.ok) {
    const status =
      result.message === 'Valid email required'
        ? 400
        : result.message === 'Server misconfigured'
          ? 503
          : 500;
    return res.status(status).json({ error: result.message });
  }

  return res.status(200).json({ ok: true });
}
