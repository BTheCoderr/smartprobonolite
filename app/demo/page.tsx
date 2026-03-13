'use client';

import { useState, useRef } from 'react';
import ChatBox from '../dashboard/components/ChatBox';
import FileUploader from '../dashboard/components/FileUploader';
import OutputViewer from '../dashboard/components/OutputViewer';
import Link from 'next/link';

export default function DemoPage() {
  const [uploadedText, setUploadedText] = useState<string>('');
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const extractButtonRef = useRef<HTMLButtonElement>(null);

  const handleFileUploaded = (text: string, fileName: string) => {
    setUploadedText(text);
    setCurrentFileName(fileName);
  };

  const handleOutputGenerated = (output: string) => {
    setGeneratedOutput(output);
  };

  const handleExtractClick = () => {
    // Trigger the extract button in ChatBox
    extractButtonRef.current?.click();
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
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[1600px] mx-auto space-y-16">
          {/* SECTION 1: HERO */}
          <section className="text-center max-w-3xl mx-auto pt-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 leading-tight">
              SmartProBono Lite – 24/7 help getting ready for court
            </h1>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 max-w-2xl mx-auto">
              Try Ermi, our AI legal assistant, in demo mode. SmartProBono Lite helps renters understand their options, organize their story, and prepare draft letters and documents for attorney review.
            </p>
            <p className="text-sm text-gray-500">
              Demo Mode: Conversations and documents are not saved.
            </p>
          </section>

          {/* SECTION 2: WHO WE HELP */}
          <section className="bg-gray-50 py-8 px-6 md:px-8 rounded-lg max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">
              Who SmartProBono Lite is for
            </h2>
            <p className="mb-5 text-gray-700 text-sm md:text-base">
              SmartProBono Lite is built for renters dealing with serious housing problems and feeling like they are on their own.
            </p>
            <ul className="list-disc ml-5 space-y-2 text-gray-700 text-sm md:text-base">
              <li>Facing eviction or a notice to move</li>
              <li>Unsafe conditions: mold, leaks, pests, no heat</li>
              <li>Landlord not making repairs or ignoring messages</li>
              <li>Issues with security deposits</li>
              <li>Threats or utility shutoffs</li>
              <li>Confusion about rights or what to do next</li>
            </ul>
          </section>

          {/* SECTION 3: HOW IT WORKS */}
          <section className="py-8 px-4 max-w-5xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-900 text-center">
              How SmartProBono Lite works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white rounded-lg p-5 md:p-6 border border-gray-200 shadow-sm">
                <div className="text-2xl font-bold text-primary-600 mb-3">1</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base">Tell Ermi what's going on</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Type your situation or upload a document.</p>
              </div>
              <div className="bg-white rounded-lg p-5 md:p-6 border border-gray-200 shadow-sm">
                <div className="text-2xl font-bold text-primary-600 mb-3">2</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base">Ermi organizes your case</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Ermi asks follow-up questions and finds key issues.</p>
              </div>
              <div className="bg-white rounded-lg p-5 md:p-6 border border-gray-200 shadow-sm">
                <div className="text-2xl font-bold text-primary-600 mb-3">3</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base">Get drafts + next steps</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Letters, summaries, and checklists appear instantly.</p>
              </div>
            </div>
          </section>

          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
            {/* Column 1: Upload */}
            <div className="h-full flex flex-col">
              <FileUploader onFileUploaded={handleFileUploaded} />
              
              {uploadedText && (
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-700">
                      Uploaded: {currentFileName}
                    </h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-24 overflow-y-auto custom-scrollbar border border-gray-200 mb-3">
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">
                      {uploadedText.substring(0, 300)}
                      {uploadedText.length > 300 && '...'}
                    </p>
                  </div>
                  <button
                    onClick={handleExtractClick}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Extract Info to Ermi
                  </button>
                </div>
              )}
            </div>

            {/* Column 2: Chat */}
            <div className="h-full">
              <ChatBox
                uploadedText={uploadedText}
                onOutputGenerated={handleOutputGenerated}
                extractButtonRef={extractButtonRef}
              />
            </div>

            {/* Column 3: Output */}
            <div className="h-full">
              <OutputViewer output={generatedOutput} />
            </div>
          </div>

          {/* SECTION 5: IMPORTANT INFO */}
          <section className="bg-gray-100 py-6 px-6 md:px-8 rounded-lg text-sm max-w-4xl mx-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-900">Important information</h2>
            <p className="text-gray-700 leading-relaxed">
              SmartProBono Lite is not a law firm, and Ermi is not a lawyer. This demo is for education and preparation only. Nothing here creates an attorney-client relationship. All drafts should be reviewed by a licensed attorney before being relied on or filed.
            </p>
          </section>

          {/* SECTION 6: PILOT NOTE */}
          <section className="text-center text-sm text-gray-500 pb-8 max-w-2xl mx-auto">
            SmartProBono Lite is an early-stage pilot working with legal aid and community partners to help renters get organized and get help faster.
          </section>
        </div>
      </main>
    </div>
  );
}
