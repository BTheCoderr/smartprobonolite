import type { NextApiRequest, NextApiResponse } from 'next';
import { Packer } from 'docx';
import { generateDocxDocument, generatePlainTextDocument } from '@/lib/utils/documentGenerator';
import Groq from 'groq-sdk';
import { documentGenerationPrompt } from '@/lib/prompts/intakePrompt';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { isProFromProfile } from '@/lib/billing/isProFromProfile';
import { checkRateLimit, ipFromRequest } from '@/lib/rateLimit';
import {
  getClientTraceIdFromPagesApi,
  getRequestIdFromPagesApi,
  logApiFlow,
  resolveSupabaseUserIdFromRequest,
  serializeErrorSafe,
} from '@/lib/logger';

/**
 * Document generation. Pro-only exports (DOCX) must verify `profiles` server-side — do not rely on UI paywalls alone.
 */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 30_000,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const started = Date.now();
  const requestId = getRequestIdFromPagesApi(req);
  const clientTraceId = getClientTraceIdFromPagesApi(req);

  const flow = (args: {
    outcome: 'success' | 'client_error' | 'rate_limited' | 'server_error';
    status_code: number;
    user_id?: string | null;
    error?: unknown;
    doc_format?: string;
    response_bytes?: number;
  }) => {
    const user_id = args.user_id ?? null;
    const base = {
      kind: 'api_flow' as const,
      request_id: requestId,
      route: '/api/generate-doc',
      feature: 'generate_doc',
      user_id,
      outcome: args.outcome,
      status_code: args.status_code,
      duration_ms: Date.now() - started,
      client_trace_id: clientTraceId,
      doc_format: args.doc_format,
    };
    if (args.error) {
      const s = serializeErrorSafe(args.error);
      logApiFlow({
        ...base,
        error_type: s.error_type,
        error_code: s.error_code,
        error_message_safe: s.error_message_safe,
      });
    } else {
      logApiFlow(base);
    }
  };

  if (req.method !== 'POST') {
    flow({ outcome: 'client_error', status_code: 405 });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let userId: string | null = null;

  const rl = checkRateLimit(`gendoc:${ipFromRequest(req)}`, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    flow({ outcome: 'rate_limited', status_code: 429 });
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  try {
    userId = await resolveSupabaseUserIdFromRequest(req);
    const { documentType, clientInfo, instructions, format = 'docx' } = req.body as {
      documentType: string;
      clientInfo: string;
      instructions: string;
      format?: 'docx' | 'txt';
    };

    if (!documentType || !clientInfo || !instructions) {
      flow({ outcome: 'client_error', status_code: 400, user_id: userId, doc_format: format });
      return res.status(400).json({
        error: 'documentType, clientInfo, and instructions are required',
      });
    }

    if (format === 'docx') {
      if (!supabaseAdmin) {
        flow({ outcome: 'server_error', status_code: 503, user_id: userId, doc_format: format });
        return res.status(503).json({ error: 'Server misconfigured' });
      }
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) {
        flow({ outcome: 'client_error', status_code: 401, user_id: userId, doc_format: format });
        return res.status(401).json({ error: 'Sign in required for Word export' });
      }
      const {
        data: { user },
        error: authErr,
      } = await supabaseAdmin.auth.getUser(token);
      if (authErr || !user) {
        flow({ outcome: 'client_error', status_code: 401, user_id: userId, doc_format: format });
        return res.status(401).json({ error: 'Invalid or expired session' });
      }
      userId = user.id;
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('plan_tier, subscription_status')
        .eq('id', user.id)
        .single();

      if (profileErr || !profile) {
        flow({
          outcome: 'client_error',
          status_code: 403,
          user_id: userId,
          doc_format: format,
          error: profileErr ?? new Error('profile_missing'),
        });
        return res.status(403).json({ error: 'Pro subscription required for Word export' });
      }
      if (!isProFromProfile(profile)) {
        flow({ outcome: 'client_error', status_code: 403, user_id: userId, doc_format: format });
        return res.status(403).json({ error: 'Pro subscription required for Word export' });
      }
    }

    // Generate document content using AI
    const prompt = documentGenerationPrompt(documentType, clientInfo, instructions);

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3000,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    if (!generatedContent) {
      flow({ outcome: 'server_error', status_code: 500, user_id: userId, doc_format: format });
      return res.status(500).json({ error: 'Failed to generate document content' });
    }

    // Generate document based on format
    if (format === 'docx') {
      const doc = generateDocxDocument({
        title: documentType,
        content: generatedContent,
        isDraft: true,
      });

      const buffer = await Packer.toBuffer(doc);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${documentType.replace(/\s+/g, '_')}.docx"`);

      flow({ outcome: 'success', status_code: 200, user_id: userId, doc_format: format });
      return res.status(200).send(buffer);
    } else {
      // Plain text format
      const textDoc = generatePlainTextDocument({
        title: documentType,
        content: generatedContent,
        isDraft: true,
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${documentType.replace(/\s+/g, '_')}.txt"`);

      flow({ outcome: 'success', status_code: 200, user_id: userId, doc_format: format });
      return res.status(200).send(textDoc);
    }
  } catch (error: any) {
    flow({ outcome: 'server_error', status_code: 500, user_id: userId, error });
    return res.status(500).json({
      error: 'Failed to generate document',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
