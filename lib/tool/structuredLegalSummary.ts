/** Build a single downloadable text artifact for document + Ermi output (Pro). */
export function buildStructuredLegalSummary(opts: {
  fileName: string;
  uploadedText: string;
  generatedOutput: string;
}): string {
  const excerpt = opts.uploadedText.length > 8000 ? `${opts.uploadedText.slice(0, 8000)}\n\n[…truncated]` : opts.uploadedText;
  const out =
    opts.generatedOutput.length > 12000 ? `${opts.generatedOutput.slice(0, 12000)}\n\n[…truncated]` : opts.generatedOutput;

  return [
    'SMARTPROBONO — STRUCTURED LEGAL SUMMARY (DRAFT / INFORMATIONAL ONLY)',
    'Not legal advice. Confirm facts and deadlines with official sources or a qualified professional.',
    '---',
    `Source file: ${opts.fileName || 'N/A'}`,
    '',
    '## Uploaded document (excerpt)',
    excerpt || '(none)',
    '',
    '## Assistant output (Ermi / panel)',
    out || '(none)',
    '---',
    `Generated: ${new Date().toISOString()}`,
  ].join('\n');
}
