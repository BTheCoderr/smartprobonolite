'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { captureEvent } from '@/lib/posthogClient';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

interface ChatBoxProps {
  uploadedText?: string;
  onOutputGenerated?: (output: string) => void;
  onTypingChange?: (typing: boolean) => void;
  extractButtonRef?: React.RefObject<HTMLButtonElement>;
}

export default function ChatBox({ uploadedText, onOutputGenerated, onTypingChange, extractButtonRef }: ChatBoxProps) {
  // Check if user is authenticated - if not, this is demo mode and should reset on refresh
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Ermi, your AI legal assistant. I help renters get organized for housing problems like eviction, repairs, and deposits. In this demo, you can practice how SmartProBono Lite summarizes your story and drafts letters or forms for an attorney to review. What would you like to work on today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setIsDemoMode(!session);
      } else {
        setIsDemoMode(true);
      }
    };
    checkAuth();
  }, []);

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

    captureEvent('chat_message_sent', {
      source: uploadedText ? 'chat_with_upload' : 'chat_only',
      message_length: messageText.length,
    });

    captureEvent('chat_message_sent', {
      source: uploadedText ? 'chat_with_upload' : 'chat_only',
      message_length: messageText.length,
    });

    try {
      // Get auth token if available (only if supabase is configured)
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [...messages, userMessage],
          uploadedText: uploadedText || undefined,
          mode: 'chat',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      captureEvent('chat_message_received', {
        mode: 'chat',
        message_length: data.message?.length ?? 0,
      });

      // If response looks like generated content, pass it to output viewer
      if (shouldSendToOutputViewer(data.message, 'chat') && onOutputGenerated) {
        onOutputGenerated(data.message);
        captureEvent('doc_generated', {
          trigger: 'chat_request',
          output_length: data.message.length,
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
      captureEvent('chat_error', { message: error.message, mode: 'chat' });
    } finally {
      setLoading(false);
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
      // Get auth token if available (only if supabase is configured)
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [...messages, userMessage],
          uploadedText,
          mode: 'extract',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract information');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
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
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error extracting information. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
      captureEvent('intake_extract_failed', { message: error.message });
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <div>
            <h2 className="text-lg font-semibold">Ermi</h2>
            <p className="text-xs text-primary-100">AI Legal Assistant</p>
          </div>
        </div>
        
        {uploadedText && (
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
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-100' : 'text-gray-400'
                }`}
              >
                {hasMounted ? new Date(message.timestamp).toLocaleTimeString() : '--:--'}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-lg px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !uploadedText && !loading && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-xs font-medium text-gray-600 mb-2">SUGGESTIONS:</p>
          <div className="flex flex-wrap gap-2">
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

