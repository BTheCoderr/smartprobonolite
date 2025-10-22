'use client';

import { useState } from 'react';
import ChatBox from '../dashboard/components/ChatBox';
import FileUploader from '../dashboard/components/FileUploader';
import OutputViewer from '../dashboard/components/OutputViewer';
import Link from 'next/link';

export default function DemoPage() {
  const [uploadedText, setUploadedText] = useState<string>('');
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const handleFileUploaded = (text: string, fileName: string) => {
    setUploadedText(text);
    setCurrentFileName(fileName);
  };

  const handleOutputGenerated = (output: string) => {
    setGeneratedOutput(output);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                SmartProBono <span className="text-primary-600">Lite</span>
              </Link>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                Demo Mode
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Demo User
                </span>
              </span>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Welcome Header */}
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl font-bold text-gray-900">
                Try <span className="text-primary-600">Ermi</span> — Your AI Legal Assistant
              </h1>
            </div>
            <p className="text-gray-600">
              Experience the power of AI-assisted legal document preparation.
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> This is a preview of SmartProBono Lite. 
                Your conversations and documents won't be saved. 
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                  Sign up for full access →
                </Link>
              </p>
            </div>
          </div>

          {/* 2-Pane Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-400px)] min-h-[600px]">
            {/* Left Pane - Chat with Ermi */}
            <div className="flex flex-col gap-4 h-full">
              <FileUploader onFileUploaded={handleFileUploaded} />
              
              {uploadedText && (
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-700">
                      Uploaded: {currentFileName}
                    </h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-24 overflow-y-auto custom-scrollbar border border-gray-200">
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
                />
              </div>
            </div>

            {/* Right Pane - Document Preview */}
            <div className="h-full">
              <OutputViewer output={generatedOutput} />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              SmartProBono © 2025 | Powered by <span className="text-primary-600 font-semibold">Ermi AI</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Ermi does not provide legal advice — all outputs require attorney review.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
