'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';
import ChatBox from './components/ChatBox';
import FileUploader from './components/FileUploader';
import OutputViewer from './components/OutputViewer';
import { Card } from '@/components/ui';

export default function DashboardPage() {
  const { user, profile } = useProfile();
  const [uploadedText, setUploadedText] = useState<string>('');
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  const handleFileUploaded = (text: string, fileName: string) => {
    setUploadedText(text);
    setCurrentFileName(fileName);
  };

  const handleOutputGenerated = (output: string) => {
    setGeneratedOutput(output);
  };

  const handleTypingChange = (typing: boolean) => {
    setIsTyping(typing);
  };

  const handleRegenerate = () => {
    // Trigger regeneration by sending a message to chat
    // This will be handled by ChatBox component
    setGeneratedOutput('');
  };

  return (
    <div className="min-h-screen bg-spb-bg p-6">
    <div className="max-w-[1600px] mx-auto">
      {/* Welcome Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-spb-ink mb-2">
            Justice. Automated.
          </h1>
          <p className="text-lg text-gray-600">
            Turn intake into a first-draft legal document in minutes. Meet Ermi, your AI legal assistant.
        </p>
      </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
          {/* Left Column - Chat */}
          <Card className="flex flex-col h-full">
            <div className="mb-4">
            <FileUploader onFileUploaded={handleFileUploaded} />
            </div>
            
            {uploadedText && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Uploaded: {currentFileName}
                  </h3>
                </div>
                <div className="bg-white rounded-lg p-3 max-h-24 overflow-y-auto custom-scrollbar border border-gray-200">
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">
                    {uploadedText.substring(0, 300)}
                    {uploadedText.length > 300 && '...'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0">
              <ChatBox
                uploadedText={uploadedText}
                onOutputGenerated={handleOutputGenerated}
                onTypingChange={handleTypingChange}
              />
            </div>

            {/* Empty State for Chat */}
            {!uploadedText && (
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Start by pasting your client intake.</p>
          </div>
            )}
          </Card>

          {/* Right Column - Editor */}
          <div className="h-full">
            <OutputViewer output={generatedOutput} onRegenerate={handleRegenerate} />
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="mt-4 p-4 bg-white rounded-xl shadow-card border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>Ermi is typing...</span>
                </div>
            </div>
          )}
        </div>
        </div>

      {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>SmartProBono © {new Date().getFullYear()} | Powered by <span className="text-spb-blue font-semibold">Ermi AI</span></p>
          <p className="mt-1 text-xs text-gray-400">
            Ermi does not provide legal advice — all outputs require attorney review.
          </p>
        </div>
      </div>
    </div>
  );
}
