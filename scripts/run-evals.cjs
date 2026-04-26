/**
 * Pulls eval_cases from Supabase, POSTs each user_query to local /api/chat, prints rough scores.
 * Run dev server first: npm run dev
 * Usage: node scripts/run-evals.cjs
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

function scoreAnswer(answer, expectedTopics) {
  const text = (answer || '').toLowerCase();
  const hits = (expectedTopics || []).filter((t) => {
    const words = t.replace(/_/g, ' ').toLowerCase();
    return text.includes(words) || text.includes(t.replace(/_/g, ''));
  });
  return {
    topicHits: hits.length,
    expectedCount: (expectedTopics || []).length,
  };
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const base = process.env.EVAL_BASE_URL || 'http://localhost:3000';

  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data: evals, error } = await supabase.from('eval_cases').select('*').limit(50);
  if (error) throw error;
  if (!evals?.length) {
    console.error('No rows in eval_cases. Run: node scripts/seed-eval-cases.cjs');
    process.exit(1);
  }

  for (const item of evals) {
    const res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: item.user_query }],
        mode: 'chat',
      }),
    });
    const output = await res.json().catch(() => ({}));
    const answer = output.message || output.answer || '';
    const s = scoreAnswer(answer, item.expected_topics);

    console.log('\n---');
    console.log('eval_key:', item.eval_key);
    console.log('query:', item.user_query);
    console.log('topicHits:', s.topicHits, '/', s.expectedCount);
    console.log('answer_snip:', String(answer).slice(0, 400));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
