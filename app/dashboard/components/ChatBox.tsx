'use client';

import { useState, useRef, useEffect } from 'react';
import { captureEvent } from '@/lib/posthogClient';
import { consumeErmiHandoff } from '@/lib/ermiHandoff';
import { getAuthHeaders } from '@/lib/auth/getAuthHeaders';
import { fetchWithTimeout, isTimeoutError } from '@/lib/resilience';
import {
  AgentReviewPanel,
  type AgentReview,
} from '@/app/dashboard/components/agent-review';
import AgentStreamProgress, {
  emptyProgress,
  type AgentProgressMap,
} from '@/app/dashboard/components/AgentStreamProgress';
import {
  AGENT_ORDER,
  parseSseRecord,
  type StreamEvent,
} from '@/lib/agents/streaming';

/**
 * When true, the dashboard ChatBox engages the six-agent LangGraph path AND
 * subscribes to per-agent SSE progress so users see Intake → Research →
 * Analysis → … light up live. Flip to `false` to instantly revert the
 * dashboard to the legacy single-pass JSON path; the server already supports
 * both paths in parallel.
 */
const ENABLE_AGENT_STREAMING = true;

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
  isDegraded?: boolean;
  degradation?: { llm?: boolean; rag?: boolean; rag_circuit_open?: boolean };
  agentReview?: AgentReview;
};

export type RiIntakeContext = {
  summary?: string;
  category?: string;
  categoryLabel?: string;
  flags?: string[];
  citations?: Array<{ sourceTitle: string; quote: string }>;
  handoutSections?: Array<{ title: string; summary: string; bullets?: string[] }>;
};

interface ChatBoxProps {
  uploadedText?: string;
  onOutputGenerated?: (output: string) => void;
  onTypingChange?: (typing: boolean) => void;
  extractButtonRef?: React.RefObject<HTMLButtonElement>;
  /** When 'legacy', uses Ermi general assistant. Default is 'ri_eviction' for RWU/RILS demo. Set to 'legacy' to restore broader behavior. */
  assistantMode?: 'legacy' | 'ri_eviction';
  /** Intake context for RI eviction mode (from buildGuidance). Pass when assistantMode is 'ri_eviction' (default). */
  intakeContext?: RiIntakeContext | null;
  /** When false, skip loading session handoff from other tools (testing). Default true in legacy mode. */
  consumeSessionHandoff?: boolean;
}

const RI_INITIAL_MESSAGE =
  "Hi! I'm Ermi, your Rhode Island eviction assistant. I provide informational guidance about eviction notices, tenant rights, and court procedures. Legal staff should review your situation. What would you like to know?";

const LEGACY_INITIAL_MESSAGE =
  "Hi! I'm Ermi, your AI legal assistant. I help renters get organized for housing problems like eviction, repairs, and deposits. In this demo, you can practice how SmartProBono Lite summarizes your story and drafts letters or forms for an attorney to review. What would you like to work on today?";

export default function ChatBox({
  uploadedText,
  onOutputGenerated,
  onTypingChange,
  extractButtonRef,
  assistantMode = 'ri_eviction',
  intakeContext = null,
  consumeSessionHandoff = true,
}: ChatBoxProps) {
  const isRiMode = assistantMode === 'ri_eviction';
  const initialMessage = isRiMode ? RI_INITIAL_MESSAGE : LEGACY_INITIAL_MESSAGE;
  const [sessionHandoff, setSessionHandoff] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  /**
   * Live per-agent progress for the in-flight assistant turn. Cleared as
   * soon as the assistant message is appended (so the stepper doesn't
   * linger after the bubble renders).
   */
  const [streamProgress, setStreamProgress] = useState<AgentProgressMap | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isRiMode || !consumeSessionHandoff) return;
    const h = consumeErmiHandoff();
    if (h?.text) {
      const label =
        h.source === 'expungement'
          ? 'Expungement prep'
          : h.source === 'document'
            ? 'Document understanding'
            : h.source === 'output'
              ? 'Generated output'
              : 'Previous step';
      setSessionHandoff(`[${label}]\n${h.text}`);
    }
  }, [isRiMode, consumeSessionHandoff]);

  useEffect(() => {
    onTypingChange?.(loading);
  }, [loading, onTypingChange]);

  // Helper function to determine if output should be sent to OutputViewer
  const shouldSendToOutputViewer = (message: string, mode: 'chat' | 'extract'): boolean => {
    if (!message || message.trim().length === 0) return false;
    
    // For extract mode: Show if it's substantial content (>= 50 chars)
    // Extract mode is specifically for producing structured output, so lower threshold
    if (mode === 'extract') {
      return message.length >= 50;
    }
    
    // For chat mode: Show if it looks like document content
    // Check for length (> 200 chars) OR document-like patterns
    const isLongEnough = message.length > 200;
    
    // Document header patterns (case-insensitive)
    const messageUpper = message.toUpperCase();
    const hasDocumentPatterns = 
      messageUpper.includes('DRAFT') ||
      messageUpper.includes('TO:') ||
      messageUpper.includes('FROM:') ||
      messageUpper.includes('RE:') ||
      messageUpper.includes('SUBJECT:') ||
      messageUpper.includes('DATE:') ||
      message.includes('Dear') ||
      message.includes('Sincerely') ||
      message.includes('Respectfully') ||
      message.includes('Yours truly') ||
      message.includes('Best regards') ||
      message.includes('Yours sincerely') ||
      // Legal document patterns
      (messageUpper.includes('COURT') && message.length > 100) ||
      (messageUpper.includes('PLAINTIFF') && message.length > 100) ||
      (messageUpper.includes('DEFENDANT') && message.length > 100) ||
      (messageUpper.includes('PETITION') && message.length > 100) ||
      (messageUpper.includes('MOTION') && message.length > 100) ||
      (messageUpper.includes('AFFIDAVIT') && message.length > 100) ||
      (messageUpper.includes('ANSWER') && message.length > 100) ||
      (messageUpper.includes('COMPLAINT') && message.length > 100) ||
      (messageUpper.includes('LETTER') && message.length > 150) ||
      (messageUpper.includes('SUMMARY') && message.length > 150) ||
      (messageUpper.includes('CHECKLIST') && message.length > 100) ||
      // Structured content indicators (multiple line breaks suggest formatted document)
      (message.split('\n').length >= 5 && message.length > 150) ||
      // Numbered or bulleted lists (common in summaries/checklists)
      (message.split('\n').filter(line => /^[\d\-\*•]\s/.test(line.trim())).length >= 3 && message.length > 150);
    
    return isLongEnough || hasDocumentPatterns;
  };

  /**
   * Apply a single SSE event to the live progress map. Returns the next
   * map AND, if the event was `final`, the assistant Message to append.
   *
   * Pure-ish (it touches setStreamProgress only via the returned next-map)
   * so the streaming loop stays trivially testable.
   */
  const advanceProgress = (
    prev: AgentProgressMap,
    event: StreamEvent,
  ): { next: AgentProgressMap; final?: Message; error?: string } => {
    if (event.type === 'agent_finished') {
      const next: AgentProgressMap = {
        ...prev,
        [event.agent]: event.outcome === 'degraded' ? 'degraded' : 'done',
      };
      // Mark the next non-skipped, non-done agent as 'running' so the user
      // sees a single in-flight indicator rather than a frozen list.
      const idx = AGENT_ORDER.indexOf(event.agent);
      for (let i = idx + 1; i < AGENT_ORDER.length; i += 1) {
        const candidate = AGENT_ORDER[i];
        if (next[candidate] === 'queued') {
          next[candidate] = 'running';
          break;
        }
      }
      return { next };
    }
    if (event.type === 'agent_skipped') {
      const next: AgentProgressMap = { ...prev, [event.agent]: 'skipped' };
      // The skipped agent's slot won't fire a 'finished' event, so promote
      // the following queued agent to 'running' here too.
      const idx = AGENT_ORDER.indexOf(event.agent);
      for (let i = idx + 1; i < AGENT_ORDER.length; i += 1) {
        const candidate = AGENT_ORDER[i];
        if (next[candidate] === 'queued') {
          next[candidate] = 'running';
          break;
        }
      }
      return { next };
    }
    if (event.type === 'final') {
      const review =
        event.agentReview && typeof event.agentReview === 'object'
          ? (event.agentReview as AgentReview)
          : undefined;
      const final: Message = {
        role: 'assistant',
        content: event.message,
        timestamp: new Date().toISOString(),
        ...(event.degraded && { isDegraded: true }),
        ...(event.degradation && { degradation: event.degradation }),
        ...(review && { agentReview: review }),
      };
      return { next: prev, final };
    }
    if (event.type === 'error') {
      return { next: prev, error: event.fallbackMessage };
    }
    return { next: prev };
  };

  /**
   * Drain a Server-Sent Events response body and dispatch each parsed
   * event through `advanceProgress`. Returns the final assistant Message
   * once the stream emits `final`, or throws when it terminates without one.
   */
  const consumeAgentStream = async (response: Response): Promise<Message> => {
    if (!response.body) throw new Error('stream_no_body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalMessage: Message | null = null;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE record separator is a blank line (\n\n).
        let sepIdx = buffer.indexOf('\n\n');
        while (sepIdx !== -1) {
          const record = buffer.slice(0, sepIdx);
          buffer = buffer.slice(sepIdx + 2);
          const event = parseSseRecord(record);
          if (event) {
            setStreamProgress((prev) => {
              const base = prev ?? emptyProgress();
              const { next, final, error } = advanceProgress(base, event);
              if (final) finalMessage = final;
              if (error) {
                finalMessage = {
                  role: 'assistant',
                  content: error,
                  timestamp: new Date().toISOString(),
                  isError: true,
                };
              }
              return next;
            });
          }
          sepIdx = buffer.indexOf('\n\n');
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!finalMessage) {
      throw new Error('stream_ended_without_final');
    }
    return finalMessage;
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    onTypingChange?.(true);

    /**
     * Stream when the user is in the RI eviction surface (where the agents
     * path is the primary intent). Legacy 'chat' mode still uses the
     * single-pass JSON path so that surface stays unchanged for now.
     */
    const useStreaming = ENABLE_AGENT_STREAMING && isRiMode;
    if (useStreaming) {
      setStreamProgress(emptyProgress());
    }

    captureEvent('chat_message_sent', {
      source: uploadedText ? 'chat_with_upload' : 'chat_only',
      message_length: messageText.length,
      ...(useStreaming && { streaming: true }),
    });

    try {
      const headers = await getAuthHeaders();
      const body = JSON.stringify({
        messages: [...messages, userMessage],
        uploadedText: isRiMode ? undefined : uploadedText || undefined,
        mode: isRiMode ? 'ri_eviction' : 'chat',
        intakeContext: isRiMode ? intakeContext : undefined,
        handoffContext: !isRiMode ? sessionHandoff || undefined : undefined,
        ...(useStreaming && { use_agents: true, stream: true }),
      });

      if (useStreaming) {
        // Plain fetch (no fetchWithTimeout): SSE responses are long-lived
        // and the server-side circuit breakers + LangGraph timeouts already
        // cap total runtime.
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { ...headers, Accept: 'text/event-stream' },
          body,
        });
        const contentType = response.headers.get('Content-Type') ?? '';
        if (!response.ok) {
          // Server may have rejected before opening a stream (rate limit,
          // bad payload, etc.) — body is JSON in that case.
          const errPayload = await response.json().catch(() => ({}));
          throw new Error(errPayload.error || 'Failed to get response');
        }
        if (contentType.includes('text/event-stream')) {
          const assistantMessage = await consumeAgentStream(response);
          setMessages((prev) => [...prev, assistantMessage]);
          setStreamProgress(null);
          captureEvent('chat_message_received', {
            mode: 'chat',
            streaming: true,
            message_length: assistantMessage.content.length,
            degraded: !!assistantMessage.isDegraded,
            ...(assistantMessage.agentReview && { agent_review: true }),
          });
          if (
            shouldSendToOutputViewer(assistantMessage.content, 'chat') &&
            onOutputGenerated
          ) {
            onOutputGenerated(assistantMessage.content);
            captureEvent('doc_generated', {
              trigger: 'chat_request',
              output_length: assistantMessage.content.length,
            });
          }
          return;
        }
        // Server responded with JSON despite our stream:true (e.g. agents
        // path disabled mid-flight). Fall through to the JSON handler
        // below by reading the body and re-using the existing flow.
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
          ...(data.degraded && { isDegraded: true }),
          ...(data.degradation && { degradation: data.degradation }),
          ...(data.agentReview && { agentReview: data.agentReview as AgentReview }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamProgress(null);
        captureEvent('chat_message_received', {
          mode: 'chat',
          streaming: false,
          message_length: data.message?.length ?? 0,
          degraded: !!data.degraded,
        });
        if (shouldSendToOutputViewer(data.message, 'chat') && onOutputGenerated) {
          onOutputGenerated(data.message);
          captureEvent('doc_generated', {
            trigger: 'chat_request',
            output_length: data.message.length,
          });
        }
        return;
      }

      // ----- legacy non-streaming JSON path (unchanged) -----
      const response = await fetchWithTimeout(
        '/api/chat',
        {
          method: 'POST',
          headers,
          body,
        },
        45_000,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        ...(data.degraded && { isDegraded: true }),
        ...(data.degradation && { degradation: data.degradation }),
        ...(data.agentReview && { agentReview: data.agentReview as AgentReview }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      captureEvent('chat_message_received', {
        mode: 'chat',
        message_length: data.message?.length ?? 0,
        degraded: !!data.degraded,
        ...(typeof data.intent === 'string' && data.intent.length > 0 && { intent: data.intent }),
        ...(data.agentReview && { agent_review: true }),
      });

      if (shouldSendToOutputViewer(data.message, 'chat') && onOutputGenerated) {
        onOutputGenerated(data.message);
        captureEvent('doc_generated', {
          trigger: 'chat_request',
          output_length: data.message.length,
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const msg = isTimeoutError(error)
        ? 'The request took too long. Please try again.'
        : 'Sorry, I encountered an error. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: msg,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
      captureEvent('chat_error', {
        message: error.message,
        mode: 'chat',
        timeout: isTimeoutError(error),
        ...(useStreaming && { streaming: true }),
      });
    } finally {
      setLoading(false);
      setStreamProgress(null);
      onTypingChange?.(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    await handleSendMessage(input);
    setInput('');
  };

  const handleExtractInfo = async () => {
    if (!uploadedText || loading) return;

    setLoading(true);
    onTypingChange?.(true);

    captureEvent('intake_extract_requested', {
      uploaded_text_length: uploadedText.length,
    });

    const userMessage: Message = {
      role: 'user',
      content: 'Hey Ermi — I\'ve just uploaded a new client intake. Can you look at it?',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const headers = await getAuthHeaders();

      const response = await fetchWithTimeout(
        '/api/chat',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: [...messages, userMessage],
            uploadedText,
            mode: 'extract',
            handoffContext: sessionHandoff || undefined,
          }),
        },
        45_000,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract information');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        ...(data.degraded && { isDegraded: true }),
        ...(data.degradation && { degradation: data.degradation }),
        ...(data.agentReview && { agentReview: data.agentReview as AgentReview }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Extract mode: Send to output viewer if it's substantial content
      if (shouldSendToOutputViewer(data.message, 'extract') && onOutputGenerated) {
        onOutputGenerated(data.message);
        captureEvent('intake_extract_completed', {
          uploaded_text_length: uploadedText.length,
          output_length: data.message?.length ?? 0,
        });
      }
    } catch (error: any) {
      console.error('Extract error:', error);
      const msg = isTimeoutError(error)
        ? 'The extraction request took too long. Please try again.'
        : 'Sorry, I encountered an error extracting information. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: msg,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
      captureEvent('intake_extract_failed', { message: error.message, timeout: isTimeoutError(error) });
    } finally {
      setLoading(false);
      onTypingChange?.(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border border-gray-200">
      {sessionHandoff && !isRiMode && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-950 flex justify-between items-start gap-2">
          <span>
            Using context from another SmartProBono tool. Ermi will factor it into replies until you dismiss it.
          </span>
          <button
            type="button"
            className="underline shrink-0 text-amber-900"
            onClick={() => setSessionHandoff(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Header */}
      <div className={`text-white px-6 py-4 flex items-center justify-between ${isRiMode ? 'bg-gradient-to-r from-spb-blue to-spb-blue/90' : 'bg-gradient-to-r from-primary-600 to-primary-700'}`}>
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <div>
            <h2 className="text-lg font-semibold">Ermi</h2>
            <p className="text-xs text-white/80">{isRiMode ? 'Rhode Island Eviction Assistant' : 'AI Legal Assistant'}</p>
          </div>
        </div>
        
        {uploadedText && !isRiMode && (
          <button
            ref={extractButtonRef}
            onClick={handleExtractInfo}
            disabled={loading}
            className="px-3 py-1 text-sm bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50"
          >
            Extract Info
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50">
        {messages.map((message, index) => {
          const isErrorMsg = message.role === 'assistant' && message.isError;
          const showAgentReview =
            message.role === 'assistant' && !!message.agentReview && !isErrorMsg;
          return (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] flex-col gap-1 ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : isErrorMsg
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.isDegraded && (
                    <p className="mt-1 text-xs text-amber-700">
                      {message.degradation?.rag && !message.degradation?.llm
                        ? 'Reference retrieval is temporarily limited; answers may be less grounded in local materials.'
                        : message.degradation?.rag && message.degradation?.llm
                          ? 'Ermi is in limited mode and reference retrieval is degraded.'
                          : 'Ermi is running in limited mode right now.'}
                    </p>
                  )}
                  {isErrorMsg && (
                    <button
                      type="button"
                      className="mt-2 text-xs font-medium text-red-700 underline hover:text-red-900"
                      onClick={() => {
                        const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                        if (lastUserMsg) {
                          setMessages((prev) => prev.filter((_, i) => i !== index));
                          void handleSendMessage(lastUserMsg.content);
                        }
                      }}
                    >
                      Try again
                    </button>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-primary-100' : isErrorMsg ? 'text-red-400' : 'text-gray-400'
                    }`}
                  >
                    {hasMounted ? new Date(message.timestamp).toLocaleTimeString() : '--:--'}
                  </p>
                </div>
                {showAgentReview && <AgentReviewPanel review={message.agentReview} />}
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div className="flex justify-start">
            {streamProgress ? (
              <AgentStreamProgress progress={streamProgress} />
            ) : (
              <div className="bg-white text-gray-800 rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !uploadedText && !loading && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-xs font-medium text-gray-600 mb-2">SUGGESTIONS:</p>
          <div className="flex flex-wrap gap-2">
            {isRiMode ? (
              <>
                <button
                  onClick={() => handleSendMessage('What does a 5-day eviction notice mean?')}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 text-left"
                >
                  What does a 5-day eviction notice mean?
                </button>
                <button
                  onClick={() => handleSendMessage('What should I bring to the Eviction Help Desk?')}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 text-left"
                >
                  What should I bring to the Eviction Help Desk?
                </button>
                <button
                  onClick={() => handleSendMessage('Can my landlord lock me out without going to court?')}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 text-left"
                >
                  Can my landlord lock me out without going to court?
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSendMessage("Help me explain my eviction notice")}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 text-left"
                >
                  Help me explain my eviction notice
                </button>
                <button
                  onClick={() => handleSendMessage("Draft a letter to my landlord about no heat")}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 text-left"
                >
                  Draft a letter to my landlord about no heat
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

