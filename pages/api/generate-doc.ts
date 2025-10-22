import type { NextApiRequest, NextApiResponse } from 'next';
import { Packer } from 'docx';
import { generateDocxDocument, generatePlainTextDocument } from '@/lib/utils/documentGenerator';
import Groq from 'groq-sdk';
import { documentGenerationPrompt } from '@/lib/prompts/intakePrompt';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentType, clientInfo, instructions, format = 'docx' } = req.body as {
      documentType: string;
      clientInfo: string;
      instructions: string;
      format?: 'docx' | 'txt';
    };

    if (!documentType || !clientInfo || !instructions) {
      return res.status(400).json({
        error: 'documentType, clientInfo, and instructions are required',
      });
    }

    // Generate document content using AI
    const prompt = documentGenerationPrompt(documentType, clientInfo, instructions);

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3000,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    if (!generatedContent) {
      return res.status(500).json({ error: 'Failed to generate document content' });
    }

    // Generate document based on format
    if (format === 'docx') {
      const doc = generateDocxDocument({
        title: documentType,
        content: generatedContent,
        isDraft: true,
      });

      const buffer = await Packer.toBuffer(doc);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${documentType.replace(/\s+/g, '_')}.docx"`);
      
      return res.status(200).send(buffer);
    } else {
      // Plain text format
      const textDoc = generatePlainTextDocument({
        title: documentType,
        content: generatedContent,
        isDraft: true,
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${documentType.replace(/\s+/g, '_')}.txt"`);
      
      return res.status(200).send(textDoc);
    }
  } catch (error: any) {
    console.error('Document Generation API Error:', error);
    return res.status(500).json({
      error: 'Failed to generate document',
      details: error.message,
    });
  }
}

