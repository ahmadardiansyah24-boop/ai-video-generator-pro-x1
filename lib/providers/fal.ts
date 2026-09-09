import { fal } from '@fal-ai/client';
import type { VideoProvider } from './types';
import type { VideoRequest, Scene } from '@/types/video';

type WanDuration = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

const NEGATIVE_PROMPT = [
  'blurry, low quality, deformed face, deformed hands, extra fingers, extra limbs',
  'warped body, duplicate person, flicker, jitter, broken anatomy',
  'garbled text, random letters, watermark, logo, unstable geometry',
].join(', ');

function getDuration(seconds: number): WanDuration {
  const allowed: WanDuration[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const target = Math.round(Number(seconds) || 5);
  return allowed.reduce<WanDuration>(
    (best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best,
    5,
  );
}

export const falProvider: VideoProvider = {
  key: 'HUGGING_FACE',
  name: 'Fal AI · Wan 2.7',

  async generateTextToVideo(req: VideoRequest, scene: Scene) {
    const key = process.env.FAL_KEY;
    if (!key) throw new Error('FAL_KEY belum dikonfigurasi di server.');

    fal.config({ credentials: key });

    const prompt = [
      'High-quality educational cinematic video.',
      'One coherent continuous shot with realistic physical motion.',
      'Keep the teacher visually consistent with anatomically correct face, hands, fingers and body.',
      'Stable classroom geometry, natural expressions, realistic skin and fabric.',
      'Avoid unreadable writing on the board, clothing, books or screens.',
      scene.visualPrompt,
      `Camera: ${scene.camera}`,
      `Lighting: ${scene.lighting}`,
      `Character continuity: ${scene.character}`,
      `Visual style: ${req.style}`,
    ].join('\n');

    const duration = getDuration(req.duration);

    const result = await fal.subscribe('fal-ai/wan/v2.7/text-to-video', {
      input: {
        prompt: prompt.slice(0, 5000),
        negative_prompt: NEGATIVE_PROMPT.slice(0, 500),
        aspect_ratio: req.aspectRatio,
        resolution: req.resolution === '720p' ? '720p' : '1080p',
        duration,
        enable_prompt_expansion: true,
      },
      logs: false,
    });

    const video = (result.data as { video?: { url?: string } } | undefined)?.video;
    if (!video?.url) throw new Error('Fal AI tidak mengembalikan URL video.');

    return {
      id: result.requestId || `fal-${scene.id}`,
      status: 'COMPLETED' as const,
      videoUrl: video.url,
      message: `Video PRO selesai melalui Fal AI Wan 2.7. Durasi clip: ${duration} detik.`,
      provider: 'HUGGING_FACE',
    };
  },
};
