'use client';

import { useState, useRef } from 'react';
import { validateFileType, formatFileSize } from '@/lib/utils/textExtraction';
import { captureEvent } from '@/lib/posthogClient';

interface FileUploaderProps {
  onFileUploaded: (text: string, fileName: string) => void;
}

export default function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');

    if (!validateFileType(file)) {
      setError('Unsupported file type. Please upload TXT, PDF, or DOCX files.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setUploading(true);
    captureEvent('intake_started', {
      file_name: file.name,
      file_type: file.type || file.name.split('.').pop()?.toLowerCase(),
      file_size: file.size,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onFileUploaded(data.extractedText, data.fileName);
      captureEvent('intake_completed', {
        file_name: data.fileName,
        file_type: data.fileType,
        file_size: data.fileSize,
        text_length: data.extractedText?.length || 0,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload file');
      captureEvent('intake_failed', {
        message: error.message,
        file_name: file.name,
        file_type: file.type || file.name.split('.').pop()?.toLowerCase(),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">Upload Intake Form</h2>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-gray-50 hover:border-primary-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={!uploading ? handleButtonClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.docx"
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex flex-col items-center">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Processing file...</p>
            </>
          ) : (
            <>
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop file here or click to upload
              </p>
              <p className="text-sm text-gray-500">
                Supports TXT, PDF, DOCX (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
          <div className="text-primary-600 font-semibold text-base">TXT</div>
          <div className="text-xs text-gray-600">Plain Text</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="text-red-600 font-semibold text-base">PDF</div>
          <div className="text-xs text-gray-600">Documents</div>
        </div>
        <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
          <div className="text-primary-600 font-semibold text-base">DOCX</div>
          <div className="text-xs text-gray-600">Word Files</div>
        </div>
      </div>
    </div>
  );
}

