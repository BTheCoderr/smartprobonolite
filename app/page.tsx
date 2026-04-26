'use client';

import Link from 'next/link';
import { GhostButton, PrimaryButton } from '@/components/ui';
import { NoticeBox } from '@/components/ri/NoticeBox';
import { PublicHeader } from '@/components/PublicHeader';

function ToolCard({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-spb-blue/40 hover:shadow-md transition flex flex-col"
    >
      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-spb-blue">{title}</h2>
      <p className="mt-2 text-sm text-gray-600 flex-1">{description}</p>
      <span className="mt-4 text-sm font-medium text-spb-blue">{action} →</span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-spb-bg">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 md:py-14 space-y-12">
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <h1 className="text-3xl md:text-4xl font-bold text-spb-ink leading-tight">
            Understand legal documents, ask questions, and get guided help
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            SmartProBono turns confusing legal language into plain-English guidance, next steps, and documents you can download or
            print—with Ermi as your assistant across every tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/document" className="inline-flex justify-center">
              <PrimaryButton type="button">Upload a document</PrimaryButton>
            </Link>
            <Link href="/diy/expungement" className="inline-flex justify-center">
              <GhostButton type="button" className="w-full sm:w-auto">
                Start DIY expungement prep
              </GhostButton>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="sr-only">Legal help toolbox</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ToolCard
              title="Understand a legal document"
              description="Upload a PDF or Word file, get a plain-English summary, and ask follow-up questions."
              href="/document"
              action="Upload"
            />
            <ToolCard
              title="Ask Ermi"
              description="Chat in everyday language about wording, next steps, and drafts for your review—not legal advice."
              href="/chat"
              action="Open chat"
            />
            <ToolCard
              title="Generate a letter or summary"
              description="Describe what you need; drafts appear in the output panel for export or print."
              href="/generate"
              action="Start generating"
            />
            <ToolCard
              title="DIY expungement prep"
              description="Build a preparation summary and checklist before you talk to a clerk or legal aid office."
              href="/diy/expungement"
              action="Start prep"
            />
            <ToolCard
              title="Rhode Island eviction help"
              description="Guided intake, issue flags, Ermi grounded in RI materials, and a printable tenant case summary."
              href="/ri/eviction/intake"
              action="Start RI intake"
            />
            <ToolCard
              title="Full workspace"
              description="All tools in one screen: upload, chat, and output—best on a larger display."
              href="/tools"
              action="Open workspace"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How it works</h2>
          <ol className="list-decimal ml-5 text-gray-700 space-y-2 text-sm md:text-base">
            <li>Upload a document or answer a few guided questions.</li>
            <li>Get plain-English explanations, prep checklists, or draft text.</li>
            <li>Download DOCX or use Print / Save as PDF from your browser.</li>
            <li>Use Ask Ermi anywhere to connect the dots between tools.</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Rhode Island pilot</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            The Rhode Island Eviction Help Desk flow remains available for tenants and staff: intake, results, Ermi with RI
            materials, and a tenant case summary.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/ri/eviction/intake">
              <PrimaryButton type="button">RI eviction intake</PrimaryButton>
            </Link>
            <Link href="/ri/assistant">
              <GhostButton type="button">RI Ermi assistant</GhostButton>
            </Link>
            <Link href="/ri/materials">
              <GhostButton type="button">RI materials</GhostButton>
            </Link>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-4">
          <NoticeBox title="Informational tools only" tone="warning">
            SmartProBono is not a law firm and does not provide legal advice. Local rules vary; confirm important steps with a
            court or qualified professional.
          </NoticeBox>
          <NoticeBox title="Drafts for review" tone="info">
            AI-generated text is for preparation and education. Have legal staff or an attorney review before you rely on it in
            court or with an employer.
          </NoticeBox>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
        <p>SmartProBono · Legal help tools for everyday people</p>
        <p className="mt-1">
          <Link href="/login" className="text-spb-blue hover:underline">
            Attorney / pilot login
          </Link>
        </p>
      </footer>
    </div>
  );
}
