import type { VideoRequest, Scene } from '@/types/video';

export type ProviderKey = 'VEO' | 'HUGGING_FACE' | 'FAL_AI';

export interface VideoGenerationResult {
  id: string;
  status: string;
  videoUrl?: string;
  message?: string;
  provider?: ProviderKey;
  scenes?: Scene[];
}

export interface VideoProvider {
  key: ProviderKey;
  name: string;
  generateTextToVideo(req: VideoRequest, scene: Scene): Promise<VideoGenerationResult>;
  generateImageToVideo?(req: VideoRequest, scene: Scene): Promise<VideoGenerationResult>;
  getStatus?(id: string): Promise<VideoGenerationResult>;
}
