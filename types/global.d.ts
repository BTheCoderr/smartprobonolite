// Type declarations for modules without TypeScript definitions
declare module 'formidable' {
  export interface File {
    filepath: string;
    originalFilename: string;
    mimetype: string;
    size: number;
  }
  
  export interface Fields {
    [key: string]: string | string[];
  }
  
  export interface Files {
    [key: string]: File | File[];
  }
  
  export interface IncomingForm {
    parse(req: any, callback?: (err: any, fields: Fields, files: Files) => void): Promise<{ fields: Fields; files: Files }>;
  }
  
  function formidable(options?: any): IncomingForm;
  export = formidable;
}

declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }
  
  function pdf(buffer: Buffer): Promise<PDFData>;
  export = pdf;
}

declare module 'mammoth' {
  interface ConvertResult {
    value: string;
    messages: any[];
  }
  
  interface ConvertOptions {
    path?: string;
    buffer?: Buffer;
  }
  
  export function convertToHtml(options: ConvertOptions): Promise<ConvertResult>;
  export function extractRawText(options: ConvertOptions): Promise<ConvertResult>;
}
