import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
      uploadDir: uploadDir,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedText = '';
    const fileName = file.originalFilename || 'unknown';
    const fileType = file.mimetype || '';

    // Extract text based on file type
    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      extractedText = await extractTextFromPDF(file.filepath);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.toLowerCase().endsWith('.docx')
    ) {
      extractedText = await extractTextFromDocx(file.filepath);
    } else if (fileType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
      extractedText = fs.readFileSync(file.filepath, 'utf-8');
    } else {
      // Clean up temp file
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      fileName,
      fileType,
      fileSize: file.size,
      extractedText,
    });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up any temp files if they exist
    try {
      if (error.filepath && fs.existsSync(error.filepath)) {
        fs.unlinkSync(error.filepath);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    
    return res.status(500).json({
      error: 'Failed to process file upload',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
}

