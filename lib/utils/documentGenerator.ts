import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';

export interface DocumentGenerationOptions {
  title: string;
  content: string;
  firmName?: string;
  isDraft?: boolean;
}

export function generateDocxDocument(options: DocumentGenerationOptions): Document {
  const { title, content, firmName = '[Your Firm Name]', isDraft = true } = options;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Parse content into paragraphs
  const contentLines = content.split('\n').filter(line => line.trim() !== '');

  const children: Paragraph[] = [
    // Firm header
    new Paragraph({
      text: firmName,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    
    // Draft watermark if applicable
    ...(isDraft ? [
      new Paragraph({
        children: [
          new TextRun({
            text: '*** DRAFT - REQUIRES ATTORNEY REVIEW ***',
            bold: true,
            color: 'FF0000',
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      }),
    ] : []),

    // Date
    new Paragraph({
      text: today,
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
    }),

    // Document title
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 },
    }),

    // Content paragraphs
    ...contentLines.map(line => 
      new Paragraph({
        text: line,
        spacing: { after: 120 },
      })
    ),
  ];

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

export function generatePlainTextDocument(options: DocumentGenerationOptions): string {
  const { title, content, firmName = '[Your Firm Name]', isDraft = true } = options;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let document = `${firmName}\n`;
  document += `${'='.repeat(firmName.length)}\n\n`;

  if (isDraft) {
    document += `*** DRAFT - REQUIRES ATTORNEY REVIEW ***\n\n`;
  }

  document += `Date: ${today}\n\n`;
  document += `${title}\n`;
  document += `${'-'.repeat(title.length)}\n\n`;
  document += `${content}\n`;

  return document;
}

