// Text extraction utilities for different file types

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    // Plain text
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await file.text();
    }

    // For PDF and DOCX, we'll need to handle this on the server side
    // Return a placeholder that indicates server processing is needed
    if (
      fileType === 'application/pdf' ||
      fileName.endsWith('.pdf') ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return '[File uploaded - text extraction will be processed on server]';
    }

    // Try to read as text anyway
    return await file.text();
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error('Failed to extract text from file');
  }
}

export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  
  const allowedExtensions = ['.txt', '.pdf', '.docx'];
  const fileName = file.name.toLowerCase();
  
  return (
    allowedTypes.includes(file.type) ||
    allowedExtensions.some(ext => fileName.endsWith(ext))
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

