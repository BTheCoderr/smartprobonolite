'use client';

import { useState } from 'react';
import { captureEvent } from '@/lib/posthogClient';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/events';
import { getAuthHeaders } from '@/lib/auth/getAuthHeaders';
import { fetchWithTimeout, isTimeoutError } from '@/lib/resilience';
import { StatusMessage } from '@/components/ui/StatusMessage';

interface OutputViewerProps {
  output: string;
  onRegenerate?: () => void;
  /** Navigate to chat with this output as Ermi context (set by parent via session handoff). */
  onAskErmiAboutOutput?: () => void;
}

const FREE_PRINT_WATERMARK =
  'SmartProBono — Free tier preview. Upgrade for a clean print/PDF without this banner.';

export default function OutputViewer({ output, onRegenerate, onAskErmiAboutOutput }: OutputViewerProps) {
  const { isPro, openUpgrade } = useSubscription();
  const [downloading, setDownloading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [printWarning, setPrintWarning] = useState(false);

  const handlePrint = () => {
    if (!output) return;
    setPrintWarning(false);
    captureEvent('doc_print_requested', { output_length: output.length, tier: isPro ? 'pro' : 'free' });
    const w = window.open('', '_blank');
    if (!w) {
      setPrintWarning(true);
      return;
    }
    const banner = !isPro
      ? `<div style="border:2px dashed #b45309;background:#fffbeb;padding:12px;margin-bottom:16px;font-size:13px;color:#78350f;">${FREE_PRINT_WATERMARK}</div>`
      : '';
    w.document.write(
      `<!DOCTYPE html><html><head><title>SmartProBono output</title><style>body{font-family:system-ui,sans-serif;padding:1.5rem;white-space:pre-wrap;max-width:48rem;margin:0 auto;}</style></head><body>${banner}<h1 style="font-size:14px;color:#444;">Draft — for your review</h1><pre style="white-space:pre-wrap;font-family:inherit;">${output.replace(/</g, '&lt;')}</pre></body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const handleCopy = async () => {
    if (!output) return;
    setCopyError(null);

    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      captureEvent('doc_copied', {
        output_length: output.length,
      });
    } catch (error) {
      setCopyError('Could not copy to clipboard. Try selecting the text manually.');
      setTimeout(() => setCopyError(null), 4000);
      captureEvent('doc_copy_failed', {
        message: (error as Error).message,
      });
    }
  };

  const handleDownload = async (format: 'docx' | 'txt') => {
    if (!output) return;

    if (format === 'docx' && !isPro) {
      openUpgrade('docx_export');
      return;
    }

    if (format === 'txt') {
      const freeWatermark = `[SmartProBono — Free tier preview — Upgrade for clean export]\n\n`;
      const text = !isPro ? `${freeWatermark}${output}` : output;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smartprobono_output.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      void trackEvent(ANALYTICS_EVENTS.documentDownloaded, { format: 'txt', output_length: output.length, tier: isPro ? 'pro' : 'free' });
      captureEvent('doc_downloaded', { format: 'txt', output_length: output.length });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetchWithTimeout(
        '/api/generate-doc',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            documentType: 'Generated Document',
            clientInfo: 'Generated from AI Assistant',
            instructions: output,
            format: 'docx',
          }),
        },
        45_000,
      );

      if (!response.ok) {
        const errText = await response.text();
        let msg = 'Failed to generate document';
        try {
          const j = JSON.parse(errText) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          if (errText) msg = errText;
        }
        throw new Error(msg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smartprobono_output.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      void trackEvent(ANALYTICS_EVENTS.documentDownloaded, { format: 'docx', output_length: output.length, tier: 'pro' });
      captureEvent('doc_downloaded', {
        format: 'docx',
        output_length: output.length,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error: any) {
      console.error('Download error:', error);
      const msg = isTimeoutError(error)
        ? 'The download request took too long. Please try again.'
        : 'Failed to download document. Please try again.';
      setDownloadError(msg);
      captureEvent('doc_download_failed', {
        message: error.message,
        format: 'docx',
        timeout: isTimeoutError(error),
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-lg font-semibold">Generated Output</h2>
        </div>

        {output && (
          <div className="flex gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
            )}
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition flex items-center gap-1"
            >
              {copySuccess ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleDownload('txt')}
              disabled={downloading}
              title={!isPro ? 'Free export includes a preview watermark in the text' : undefined}
              className="px-4 py-2 text-sm rounded-lg border border-white/40 text-white hover:bg-white/10 transition disabled:opacity-50 flex items-center gap-1"
            >
              Export TXT{!isPro ? ' (watermarked)' : ''}
            </button>
            <button
              type="button"
              onClick={() => handleDownload('docx')}
              disabled={downloading}
              title={!isPro ? 'Pro feature — click to upgrade' : undefined}
              className="px-4 py-2 text-sm bg-spb-blue text-white rounded-lg hover:bg-spb-blueDark transition disabled:opacity-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {!isPro ? 'Export DOCX (Pro)' : 'Export DOCX'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={downloading}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Print / Save as PDF
            </button>
            {onAskErmiAboutOutput && (
              <button
                type="button"
                onClick={onAskErmiAboutOutput}
                className="px-4 py-2 text-sm rounded-lg border border-spb-blue text-spb-blue hover:bg-blue-50 transition"
              >
                Ask Ermi about this
              </button>
            )}
          </div>
        )}
      </div>

      {copyError && (
        <div className="px-6 pt-3">
          <StatusMessage
            variant="warning"
            message={copyError}
            onDismiss={() => setCopyError(null)}
          />
        </div>
      )}

      {downloadError && (
        <div className="px-6 pt-3">
          <StatusMessage
            variant="error"
            message={downloadError}
            onDismiss={() => setDownloadError(null)}
            action={{ label: 'Try again', onClick: () => void handleDownload('docx') }}
          />
        </div>
      )}

      {downloadSuccess && (
        <div className="px-6 pt-3">
          <StatusMessage variant="success" message="Document downloaded" />
        </div>
      )}

      {printWarning && (
        <div className="px-6 pt-3">
          <StatusMessage
            variant="warning"
            message="Pop-up blocked. Please allow pop-ups for this site to print your output."
            onDismiss={() => setPrintWarning(false)}
          />
        </div>
      )}

      {downloading && (
        <div className="px-6 py-2 text-sm text-gray-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600" />
          Generating document…
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50">
        {output ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                {output}
              </pre>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <svg
                className="w-24 h-24 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Draft letters, summaries, and checklists will appear here.
              </h3>
              <p className="text-gray-500">
                In the full version you can download these and share them with a legal aid office or lawyer.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

