'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card, GhostButton } from '@/components/ui';
import { clearMaterials, loadMaterials, upsertMaterial, type StoredMaterial } from '@/lib/ri/storage';
import { NoticeBox } from '@/components/ri/NoticeBox';

function randomId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function MaterialsPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [materials, setMaterials] = useState<StoredMaterial[]>(() => loadMaterials());

  const countLabel = useMemo(() => `${materials.length} document${materials.length === 1 ? '' : 's'}`, [materials.length]);

  async function handleUpload(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.error || 'Upload failed');
      }

      const material: StoredMaterial = {
        id: randomId(),
        title: data.fileName || file.name,
        extractedText: data.extractedText || '',
        addedAtIso: new Date().toISOString(),
      };
      upsertMaterial(material);
      const next = loadMaterials();
      setMaterials(next);
      setMessage('Saved for this browser session. Guidance will cite these excerpts.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-spb-bg">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-gray-900">
            SmartProBono Lite
          </Link>
          <Link href="/ri/eviction/intake" className="text-sm font-medium text-spb-blue hover:underline">
            Start intake
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-spb-ink">Rhode Island materials</h1>
          <p className="text-gray-700">
            The Handbook and Intake Form are pre-loaded. You can upload additional documents (e.g., RILS handout)
            here; guidance will cite from whichever materials are available.
          </p>
        </div>

        <NoticeBox title="Why this exists" tone="info">
          This prototype is designed to avoid “generic chatbot law.” It will keep outputs conservative and attach short
          excerpts from your uploaded RI materials when it can find relevant text.
        </NoticeBox>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-gray-900">Uploaded documents</div>
              <div className="text-sm text-gray-600">{countLabel} stored locally in this browser</div>
            </div>
            <GhostButton
              type="button"
              onClick={() => {
                clearMaterials();
                setMaterials([]);
              }}
            >
              Clear
            </GhostButton>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900 mb-2">Add a document</div>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
              }}
            />
            <div className="text-xs text-gray-600 mt-2">Accepted: PDF, DOCX, TXT. (Stored only in this browser.)</div>
          </div>

          {message && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">Status:</span> {message}
            </div>
          )}

          {materials.length > 0 && (
            <div className="space-y-3">
              {materials.map((m) => (
                <div key={m.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="font-semibold text-gray-900">{m.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(m.addedAtIso).toLocaleString()} · {Math.min(m.extractedText.length, 2000)} chars indexed
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/ri/eviction/intake"
              className="inline-flex px-5 py-2.5 rounded-xl bg-spb-blue text-white hover:bg-spb-blueDark transition shadow-sm"
            >
              Start / continue intake
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}

