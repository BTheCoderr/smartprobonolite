/**
 * Loads data/eval-cases.json into eval_cases (no embeddings).
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: node scripts/seed-eval-cases.cjs
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

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const jsonPath = path.join(process.cwd(), 'data', 'eval-cases.json');
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const cases = JSON.parse(raw);

  for (const c of cases) {
    const row = {
      eval_key: c.eval_key,
      user_query: c.user_query,
      expected_topics: c.expected_topics ?? [],
      ideal_answer: c.ideal_answer,
      safe_response: c.safe_response ?? null,
      risk_level: c.risk_level ?? 'medium',
    };
    const { error } = await supabase.from('eval_cases').upsert(row, { onConflict: 'eval_key' });
    if (error) {
      console.error('Failed', c.eval_key, error);
    } else {
      console.log('OK', c.eval_key);
    }
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
