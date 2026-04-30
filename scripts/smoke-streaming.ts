/**
 * Smoke tests for the SSE streaming protocol.
 *
 * Verifies that:
 *   1. Each event type round-trips serialize → parse cleanly.
 *   2. The parser tolerates SSE comments and unknown event names
 *      (forward-compat).
 *   3. Multi-line buffer splitting on `\n\n` produces parseable records.
 *
 * Run via: `npx tsx scripts/smoke-streaming.ts`
 */

import {
  parseSseRecord,
  serializeSseEvent,
  type StreamEvent,
} from '@/lib/agents/streaming';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function roundTripEachEventType() {
  const cases: StreamEvent[] = [
    { type: 'agent_finished', agent: 'intake', outcome: 'ok', duration_ms: 120 },
    { type: 'agent_finished', agent: 'research', outcome: 'degraded', duration_ms: 0 },
    {
      type: 'agent_skipped',
      agent: 'document',
      reason: 'analysis_recommendation_not_draft',
    },
    {
      type: 'final',
      message: 'Hi — staff should review your situation.',
      intent: 'lockout',
      degraded: true,
      degradation: { llm: true, rag: false },
      agentReview: { facts: { state: 'Rhode Island' } },
    },
    {
      type: 'error',
      reason: 'graph_failed',
      fallbackMessage: 'Sorry — please try again.',
    },
  ];

  for (const original of cases) {
    const wire = serializeSseEvent(original);
    assert(wire.endsWith('\n\n'), `record for ${original.type} missing terminator`);
    const record = wire.replace(/\n\n$/, '');
    const parsed = parseSseRecord(record);
    assert(parsed !== null, `${original.type} parsed to null`);
    assert(
      deepEqual(parsed, original),
      `${original.type} did not round-trip\n  in:  ${JSON.stringify(original)}\n  out: ${JSON.stringify(parsed)}`,
    );
  }
  console.log(`[ok] all ${cases.length} event types round-trip cleanly`);
}

function ignoresCommentsAndUnknownEvents() {
  const withComment =
    ':keepalive\n' +
    'event: agent_finished\n' +
    'data: {"agent":"intake","outcome":"ok","duration_ms":1}';
  const parsed = parseSseRecord(withComment);
  assert(parsed?.type === 'agent_finished', 'comment line broke parsing');

  const unknown = 'event: agent_paused\ndata: {"foo":1}';
  assert(parseSseRecord(unknown) === null, 'unknown event name should parse to null');

  const malformed = 'data: {"no":"event_name"}';
  assert(parseSseRecord(malformed) === null, 'missing event name should parse to null');

  console.log('[ok] parser tolerates comments + ignores unknown/malformed records');
}

function multiRecordBufferSplit() {
  const buffer =
    serializeSseEvent({
      type: 'agent_finished',
      agent: 'intake',
      outcome: 'ok',
      duration_ms: 1,
    }) +
    serializeSseEvent({
      type: 'agent_finished',
      agent: 'research',
      outcome: 'ok',
      duration_ms: 2,
    }) +
    serializeSseEvent({
      type: 'final',
      message: 'done',
      intent: 'lockout',
    });

  const records = buffer.split('\n\n').filter((r) => r.length > 0);
  assert(records.length === 3, `expected 3 records, got ${records.length}`);
  const parsed = records.map((r) => parseSseRecord(r));
  assert(parsed[0]?.type === 'agent_finished', 'record 0 wrong type');
  assert(parsed[1]?.type === 'agent_finished', 'record 1 wrong type');
  assert(parsed[2]?.type === 'final', 'record 2 wrong type');
  console.log('[ok] multi-record buffer splits + parses cleanly');
}

function main() {
  roundTripEachEventType();
  ignoresCommentsAndUnknownEvents();
  multiRecordBufferSplit();
  console.log('\nSTREAMING PROTOCOL: ALL SMOKE TESTS PASSED');
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
