'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import ChatBox from '@/app/dashboard/components/ChatBox';
import FileUploader from '@/app/dashboard/components/FileUploader';
import OutputViewer from '@/app/dashboard/components/OutputViewer';
import { NoticeBox } from '@/components/ri/NoticeBox';
import { PaywallGate } from '@/components/billing/PaywallGate';
import { setErmiHandoff } from '@/lib/ermiHandoff';
import { buildStructuredLegalSummary } from '@/lib/tool/structuredLegalSummary';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/events';

export type ToolWorkspaceVariant = 'full' | 'document' | 'chat' | 'generate';

const copy: Record<
  ToolWorkspaceVariant,
  { title: string; subtitle: string; showUploader: boolean }
> = {
  full: {
    title: 'Tools workspace',
    subtitle: 'Upload a document, chat with Ermi in plain English, and export drafts from the output panel.',
    showUploader: true,
  },
  document: {
    title: 'Understand a legal document',
    subtitle:
      'Upload a PDF or Word file. Use Extract info for a structured plain-English summary, then ask Ermi follow-up questions.',
    showUploader: true,
  },
  chat: {
    title: 'Ask Ermi a legal question',
    subtitle:
      'Ermi helps you think through wording, next steps, and drafts for review—not legal advice. Bring context from other tools using the handoff banner.',
    showUploader: false,
  },
  generate: {
    title: 'Generate a letter or summary',
    subtitle:
      'Describe what you need in the chat. When Ermi produces a draft, it appears on the right. Export as DOCX or print to PDF from your browser.',
    showUploader: false,
  },
};

export function ToolWorkspace({ variant = 'full' }: { variant?: ToolWorkspaceVariant }) {
  const router = useRouter();
  const { title, subtitle, showUploader } = copy[variant];
  const [uploadedText, setUploadedText] = useState('');
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleFileUploaded = (text: string, fileName: string) => {
    setUploadedText(text);
    setCurrentFileName(fileName);
  };

  const handleAskErmiAboutDocument = () => {
    if (!uploadedText.trim()) return;
    setErmiHandoff({
      source: 'document',
      text: `Document "${currentFileName || 'upload'}":\n\n${uploadedText.slice(0, 8000)}`,
    });
    router.push('/chat');
  };

  const handleAskErmiAboutOutput = () => {
    if (!generatedOutput.trim()) return;
    setErmiHandoff({
      source: 'output',
      text: `The user has this text in the output panel:\n\n${generatedOutput.slice(0, 8000)}`,
    });
    router.push('/chat');
  };

  const downloadStructuredSummary = () => {
    const text = buildStructuredLegalSummary({
      fileName: currentFileName,
      uploadedText,
      generatedOutput,
    });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartprobono-structured-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
    void trackEvent(ANALYTICS_EVENTS.structuredLegalSummaryDownload, { variant });
  };

  return (
    <div className="min-h-screen bg-spb-bg">
      <PublicHeader />
      <main className="max-w-[1600px] mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-spb-ink">{title}</h1>
          <p className="text-gray-600 mt-1 max-w-3xl">{subtitle}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link href="/tools" className="text-spb-blue hover:underline">
              Full workspace
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/document" className="text-spb-blue hover:underline">
              Document only
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/chat" className="text-spb-blue hover:underline">
              Chat only
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <NoticeBox title="Informational tools only" tone="warning">
            SmartProBono is not a law firm. Outputs are drafts for your review. Local rules vary—confirm important steps with a
            court or qualified professional.
          </NoticeBox>
        </div>

        {(uploadedText.trim() || generatedOutput.trim()) && (
          <div className="mb-6">
            <PaywallGate reason="structured_legal_summary">
              <div className="rounded-xl border border-green-200 bg-green-50/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Full structured legal summary</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Download one .txt combining your upload excerpt and the assistant output—formatted for staff review.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadStructuredSummary}
                  className="shrink-0 rounded-lg bg-gray-900 text-white text-sm font-medium px-4 py-2 hover:bg-gray-800"
                >
                  Download summary (.txt)
                </button>
              </div>
            </PaywallGate>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-220px)]">
          <div className="bg-white rounded-2xl shadow-card flex flex-col h-full min-h-[560px] overflow-hidden border border-gray-200">
            <div className="p-4 md:p-6 flex flex-col flex-1 min-h-0 gap-4">
              {showUploader && (
                <>
                  <FileUploader onFileUploaded={handleFileUploaded} />
                  {uploadedText ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleAskErmiAboutDocument}
                        className="text-sm font-medium rounded-lg bg-spb-blue text-white px-4 py-2 hover:bg-spb-blueDark transition"
                      >
                        Open focused chat with this document
                      </button>
                    </div>
                  ) : null}
                </>
              )}

              {uploadedText && showUploader && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-gray-700 max-h-24 overflow-y-auto">
                  <span className="font-semibold">Uploaded: {currentFileName}</span>
                  <p className="mt-1 whitespace-pre-wrap">{uploadedText.slice(0, 400)}…</p>
                </div>
              )}

              <div className="flex-1 min-h-[380px] flex flex-col">
                <ChatBox
                  assistantMode="legacy"
                  uploadedText={uploadedText}
                  onOutputGenerated={setGeneratedOutput}
                  onTypingChange={setIsTyping}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col min-h-[560px]">
            <OutputViewer
              output={generatedOutput}
              onRegenerate={() => setGeneratedOutput('')}
              onAskErmiAboutOutput={handleAskErmiAboutOutput}
            />
            {isTyping && (
              <div className="mt-4 p-4 bg-white rounded-xl shadow-card border border-gray-200 text-sm text-gray-500">
                Ermi is drafting…
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
