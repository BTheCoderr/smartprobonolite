import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import os from 'os';
import path from 'path';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import { checkRateLimit, ipFromRequest } from '@/lib/rateLimit';
import {
  createLogger,
  getClientTraceIdFromPagesApi,
  getRequestIdFromPagesApi,
  logApiFlow,
  serializeErrorSafe,
} from '@/lib/logger';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

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
    error?: unknown;
    upload_file_bytes?: number;
    upload_mime?: string;
  }) => {
    const base = {
      kind: 'api_flow' as const,
      request_id: requestId,
      route: '/api/upload',
      feature: 'file_upload',
      user_id: null as string | null,
      outcome: args.outcome,
      status_code: args.status_code,
      duration_ms: Date.now() - started,
      client_trace_id: clientTraceId,
      upload_file_bytes: args.upload_file_bytes,
      upload_mime: args.upload_mime,
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

  const rl = checkRateLimit(`upload:${ipFromRequest(req)}`, { maxRequests: 15, windowMs: 86_400_000 });
  if (!rl.allowed) {
    flow({ outcome: 'rate_limited', status_code: 429 });
    return res.status(429).json({ error: 'Daily upload limit reached. Sign in or upgrade to Pro for unlimited uploads.' });
  }

  try {
    // Ensure upload directory exists (use os tmp dir for serverless environments)
    const uploadDir = path.join(os.tmpdir(), 'smartprobono-uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
      uploadDir,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      flow({ outcome: 'client_error', status_code: 400 });
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedText = '';
    const fileName = file.originalFilename || 'unknown';
    const fileType = file.mimetype || '';

    // Extract text based on file type
    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      extractedText = await extractTextFromPDF(file.filepath);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.toLowerCase().endsWith('.docx')
    ) {
      extractedText = await extractTextFromDocx(file.filepath);
    } else if (fileType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
      extractedText = fs.readFileSync(file.filepath, 'utf-8');
    } else {
      // Clean up temp file
      fs.unlinkSync(file.filepath);
      flow({
        outcome: 'client_error',
        status_code: 400,
        upload_file_bytes: file.size,
        upload_mime: fileType || 'unknown',
      });
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    flow({
      outcome: 'success',
      status_code: 200,
      upload_file_bytes: file.size,
      upload_mime: fileType || 'unknown',
    });

    return res.status(200).json({
      success: true,
      fileName,
      fileType,
      fileSize: file.size,
      extractedText,
    });
  } catch (error: any) {
    flow({ outcome: 'server_error', status_code: 500, error });

    try {
      if (error.filepath && fs.existsSync(error.filepath)) {
        fs.unlinkSync(error.filepath);
      }
    } catch (cleanupError) {
      createLogger(requestId).warn('upload_temp_cleanup_failed', {
        feature: 'file_upload',
        ...serializeErrorSafe(cleanupError),
      });
    }
    
    return res.status(500).json({
      error: 'Failed to process file upload',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
}

