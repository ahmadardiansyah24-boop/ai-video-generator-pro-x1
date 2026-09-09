import { InferenceClient } from '@huggingface/inference';
import type { VideoProvider } from './types';
import type { VideoRequest, Scene } from '@/types/video';

const NEGATIVE_PROMPT = [
  'low quality',
  'blurry',
  'deformed face',
  'deformed hands',
  'extra fingers',
  'fused fingers',
  'extra limbs',
  'duplicate person',
  'warped body',
  'bad anatomy',
  'distorted classroom',
  'garbled text',
  'random letters',
  'watermark',
  'logo',
  'flicker',
  'jitter',
].join(', ');

export const huggingFaceProvider: VideoProvider = {
  key: 'HUGGING_FACE',
  name: 'Hugging Face · Fal AI',

  async generateTextToVideo(req: VideoRequest, scene: Scene) {
    const token = process.env.HF_TOKEN;
    if (!token) throw new Error('HF_TOKEN belum dikonfigurasi di server.');

    const model = process.env.HF_MODEL || 'Wan-AI/Wan2.2-TI2V-5B';
    const prompt = [
      'High-quality educational cinematic video.',
      'A single coherent continuous shot with physically plausible motion.',
      'Keep the main teacher character anatomically correct and visually consistent.',
      'Natural facial expression, realistic skin, realistic hands and fingers.',
      'Clean classroom environment, stable geometry, no unreadable writing.',
      'Do not generate text on boards, shirts, books, or screens unless explicitly requested.',
      scene.visualPrompt,
      `Camera: ${scene.camera}`,
      `Lighting: ${scene.lighting}`,
      `Character continuity: ${scene.character}`,
      `Aspect ratio target: ${req.aspectRatio}`,
      `Visual style: ${req.style}`,
    ].join('\n');

    try {
      const client = new InferenceClient(token);
      const video = await client.textToVideo({
        model,
        provider: 'fal-ai',
        inputs: prompt,
        parameters: {
          num_frames: 121,
          guidance_scale: 4,
          num_inference_steps: 40,
          negative_prompt: [NEGATIVE_PROMPT],
          seed: Math.floor(Math.random() * 2_147_483_647),
        },
      });

      const type = video.type || 'video/mp4';
      const buffer = Buffer.from(await video.arrayBuffer());
      if (!buffer.length) throw new Error('Provider tidak mengembalikan data video.');

      return {
        id: `hf-${scene.id}`,
        status: 'COMPLETED' as const,
        videoUrl: `data:${type};base64,${buffer.toString('base64')}`,
        message: `Video PRO selesai melalui Hugging Face Inference Providers (${model}), 24fps/sekitar 5 detik per clip.`,
        provider: 'HUGGING_FACE',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Hugging Face/Fal AI gagal: ${message}`);
    }
  },
};
