import { InferenceClient } from '@huggingface/inference';
import type { VideoProvider } from './types';
import type { VideoRequest, Scene } from '@/types/video';

const NEGATIVE_PROMPT = [
  'low quality',
  'blurry',
  'unfinished frames',
  'incomplete objects',
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
  'frame interpolation artifacts',
].join(', ');

export const huggingFaceProvider: VideoProvider = {
  key: 'HUGGING_FACE',
  name: 'Hugging Face · Fal AI',

  async generateTextToVideo(req: VideoRequest, scene: Scene) {
    const token = process.env.HF_TOKEN;
    if (!token) throw new Error('HF_TOKEN belum dikonfigurasi di server.');

    const model = process.env.HF_MODEL || 'tencent/HunyuanVideo';
    const prompt = [
      'Premium cinematic educational video, polished production quality.',
      'Generate the complete scene from the first frame to the last frame with no unfinished or partially formed objects.',
      'One coherent continuous shot, stable geometry, temporally consistent details, physically plausible motion.',
      'Keep the teacher and students anatomically correct and visually consistent throughout the entire clip.',
      'Natural facial expressions, realistic skin, realistic hands and fingers, correct body proportions.',
      'Clean modern classroom, realistic depth, professional cinematography, smooth camera movement.',
      'Avoid readable text, logos, signs, and accidental writing in the generated environment.',
      scene.visualPrompt,
      `Camera: ${scene.camera}`,
      `Lighting: ${scene.lighting}`,
      `Character continuity: ${scene.character}`,
      `Aspect ratio target: ${req.aspectRatio}`,
      `Resolution target: ${req.resolution}`,
      `Visual style: ${req.style}`,
    ].join('\n');

    try {
      const client = new InferenceClient(token);
      const video = await client.textToVideo({
        model,
        provider: 'fal-ai',
        inputs: prompt,
        parameters: {
          num_frames: 81,
          guidance_scale: 5,
          num_inference_steps: 30,
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
        message: `Video PRO selesai melalui Hugging Face Inference Providers (${model}).`,
        provider: 'HUGGING_FACE',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Hugging Face/Fal AI gagal: ${message}`);
    }
  },
};
