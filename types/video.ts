export type AspectRatio = '9:16' | '16:9' | '1:1';
export type VideoEngine = 'AUTO' | 'VEO' | 'HUGGING_FACE' | 'FAL_AI';
export type JobStatus = 'QUEUED' | 'GENERATING' | 'PROCESSING' | 'COMPOSITING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';

export interface Scene {
  id: string; number: number; title: string; duration: number; narration: string;
  visualPrompt: string; camera: string; lighting: string; character: string;
}

export interface VideoRequest {
  title: string; prompt: string; type: string; language: string; duration: number;
  aspectRatio: AspectRatio; style: string; engine: VideoEngine; resolution: string;
  characterDescription?: string; referenceImage?: string; music?: string;
  subtitle?: boolean;
}
