/**
 * Loads data/legal-chunks.json, embeds each chunk_text (OpenAI), upserts into legal_chunks.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 * Run from repo root: node scripts/seed-legal-chunks.cjs
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvLocal() {
  const p = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function embed(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: String(text).slice(0, 8000),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 400)}`);
  }
  const data = await res.json();
  return data.data[0].embedding;
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
        'Add them to .env.local (Project Settings → API on your Supabase project). ' +
        'If the old project is paused or retired, create a new project and restore your backup first.'
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const jsonPath = path.join(process.cwd(), 'data', 'legal-chunks.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const chunks = JSON.parse(raw);

  for (const chunk of chunks) {
    const embedding = await embed(chunk.chunk_text);
    const row = {
      chunk_key: chunk.chunk_key,
      title: chunk.title ?? null,
      jurisdiction: chunk.jurisdiction ?? 'RI',
      topic: chunk.topic,
      source_name: chunk.source_name ?? null,
      source_url: chunk.source_url || null,
      source_type: chunk.source_type ?? null,
      chunk_text: chunk.chunk_text,
      tags: chunk.tags ?? [],
      citation_strength: chunk.citation_strength ?? 'low',
      embedding,
    };
    const { error } = await supabase.from('legal_chunks').upsert(row, { onConflict: 'chunk_key' });
    if (error) {
      console.error('Failed', chunk.chunk_key, error);
    } else {
      console.log('OK', chunk.chunk_key);
    }
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
