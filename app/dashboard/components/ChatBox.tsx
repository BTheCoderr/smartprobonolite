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
}

export default function ChatBox({ uploadedText, onOutputGenerated }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Ermi, your AI legal assistant. I help organize client intakes and prepare draft documents for attorney review.\n\nYou can upload an intake form, paste client information, or just tell me what you\'re working on. What can I help you with today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    captureEvent('chat_message_sent', {
      source: uploadedText ? 'chat_with_upload' : 'chat_only',
      message_length: input.length,
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
      if (data.message.length > 200 && onOutputGenerated) {
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
    }
  };

  const handleExtractInfo = async () => {
    if (!uploadedText || loading) return;

    setLoading(true);

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

      if (onOutputGenerated) {
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
        <p className="text-xs text-gray-500 mt-2">
          Try: "Can you review this intake?" or "Generate a client engagement letter"
        </p>
      </div>
    </div>
  );
}

