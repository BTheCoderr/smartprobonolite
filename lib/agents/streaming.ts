/**
 * Shared streaming protocol for the six-agent law-firm graph.
 *
 * Imported by BOTH the server SSE writer (`pages/api/chat.ts`) and the
 * client SSE consumer (`app/dashboard/components/ChatBox.tsx`), so this
 * file MUST stay free of Node-only imports.
 *
 * Wire format: standard Server-Sent Events with named events.
 *
 *   event: agent_finished
 *   data: {"agent":"intake","outcome":"ok","duration_ms":120}
 *
 *   event: agent_skipped
 *   data: {"agent":"document","reason":"analysis_recommendation_not_draft"}
 *
 *   event: final
 *   data: {"message":"...","intent":"lockout","degraded":true,"agentReview":{...}}
 *
 *   event: error
 *   data: {"reason":"graph_failed","fallbackMessage":"..."}
 *
 * Clients MUST tolerate unknown event types (forward-compat).
 */

/**
 * Canonical user-facing agent identifiers, in the order they execute.
 * Mirrored by the LangGraph node names with the `_agent` suffix.
 */
export const AGENT_ORDER = [
  'intake',
  'research',
  'analysis',
  'document',
  'strategy',
  'safety',
] as const;

export type AgentName = (typeof AGENT_ORDER)[number];

export const AGENT_DISPLAY: Record<AgentName, string> = {
  intake: 'Intake',
  research: 'Research',
  analysis: 'Analysis',
  document: 'Document',
  strategy: 'Strategy',
  safety: 'Compliance',
};

const NODE_TO_AGENT: Record<string, AgentName> = {
  intake_agent: 'intake',
  research_agent: 'research',
  analysis_agent: 'analysis',
  document_agent: 'document',
  strategy_agent: 'strategy',
  safety_agent: 'safety',
};

export function nodeNameToAgent(nodeName: string): AgentName | null {
  return NODE_TO_AGENT[nodeName] ?? null;
}

export type AgentOutcome = 'ok' | 'degraded';

export type AgentFinishedEvent = {
  type: 'agent_finished';
  agent: AgentName;
  outcome: AgentOutcome;
  duration_ms: number;
};

export type AgentSkippedEvent = {
  type: 'agent_skipped';
  agent: AgentName;
  reason: string;
};

export type FinalEvent = {
  type: 'final';
  message: string;
  intent: string;
  degraded?: true;
  degradation?: { llm?: boolean; rag?: boolean; rag_circuit_open?: boolean };
  agentReview?: unknown;
};

export type ErrorStreamEvent = {
  type: 'error';
  reason: string;
  fallbackMessage: string;
};

export type StreamEvent =
  | AgentFinishedEvent
  | AgentSkippedEvent
  | FinalEvent
  | ErrorStreamEvent;

/**
 * Server: serialize a stream event into the SSE wire format.
 *
 * SSE requires each event to be terminated by a blank line. We use named
 * events (`event: <name>`) so the client can dispatch with a switch on
 * event.type without inspecting the payload. The trailing `\n\n` is the
 * record separator the spec requires.
 */
export function serializeSseEvent(event: StreamEvent): string {
  const { type, ...payload } = event;
  return `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
}

/**
 * Client: parse a single complete SSE record (everything up to the blank
 * line) into a typed StreamEvent. Returns null when the record is malformed
 * or has an unknown event name (so callers can ignore it forward-compat).
 *
 * Tolerant of comment lines (`:foo`) and arbitrary whitespace between
 * fields, per the SSE spec.
 */
export function parseSseRecord(record: string): StreamEvent | null {
  const lines = record.split('\n');
  let eventName = '';
  const dataLines: string[] = [];
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    if (line.startsWith(':')) continue;
    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trim());
    }
  }
  if (!eventName || dataLines.length === 0) return null;
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(dataLines.join('\n'));
  } catch {
    return null;
  }
  switch (eventName) {
    case 'agent_finished':
    case 'agent_skipped':
    case 'final':
    case 'error':
      return { type: eventName, ...payload } as StreamEvent;
    default:
      return null;
  }
}
