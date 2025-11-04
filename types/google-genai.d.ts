// Type declarations for @google/genai (loaded via CDN/importmap)
declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(config: { apiKey: string });
    live: {
      connect(options: any): Promise<any>;
    };
    models: {
      generateContent(options: any): Promise<any>;
    };
  }
  
  export enum Modality {
    AUDIO = 'AUDIO',
  }
  
  export enum Type {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    OBJECT = 'OBJECT',
    ARRAY = 'ARRAY',
  }
}
