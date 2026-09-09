import { InferenceClient } from '@huggingface/inference';
import type { VideoProvider } from './types';
import type { VideoRequest, Scene } from '@/types/video';

export const huggingFaceProvider: VideoProvider = {
  key: 'HUGGING_FACE',
  name: 'Hugging Face · Fal AI',

  async generateTextToVideo(req: VideoRequest, scene: Scene) {
    const token = process.env.HF_TOKEN;
    if (!token) throw new Error('HF_TOKEN belum dikonfigurasi di server.');

    const model = process.env.HF_MODEL || 'Wan-AI/Wan2.2-TI2V-5B';
    const prompt = [
      scene.visualPrompt,
      `Camera: ${scene.camera}`,
      `Lighting: ${scene.lighting}`,
      `Character continuity: ${scene.character}`,
      `Aspect ratio: ${req.aspectRatio}`,
      `Style: ${req.style}`,
    ].join('\n');

    try {
      const client = new InferenceClient(token);
      const video = await client.textToVideo({
        model,
        provider: 'fal-ai',
        inputs: prompt,
      });

      const type = video.type || 'video/mp4';
      const buffer = Buffer.from(await video.arrayBuffer());
      if (!buffer.length) throw new Error('Provider tidak mengembalikan data video.');

      return {
        id: `hf-${scene.id}`,
        status: 'COMPLETED' as const,
        videoUrl: `data:${type};base64,${buffer.toString('base64')}`,
        message: `Video PRO selesai melalui Hugging Face Inference Providers (${model}).`,
        provider: 'HUGGING_FACE',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Hugging Face/Fal AI gagal: ${message}`);
    }
  },
};
