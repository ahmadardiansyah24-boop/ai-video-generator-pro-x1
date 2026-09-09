import type { VideoProvider } from './types';
import type { VideoEngine } from '@/types/video';
import { veoProvider } from './veo';
import { huggingFaceProvider } from './huggingface';
import { falProvider } from './fal';

export function getProvider(engine: VideoEngine): VideoProvider {
  if (engine === 'VEO') return veoProvider;
  if (engine === 'HUGGING_FACE') return huggingFaceProvider;
  if (engine === 'FAL_AI') return falProvider;

  // AUTO is intentionally limited to the configured PRO providers.
  // Do not silently fall back to Hugging Face because its hosted credits
  // can be exhausted and that used to hide the real configuration problem.
  if (process.env.FAL_KEY) return falProvider;
  if (process.env.GEMINI_API_KEY) return veoProvider;

  throw new Error(
    'AUTO belum siap. Tambahkan FAL_KEY untuk Fal AI Wan 2.7 atau GEMINI_API_KEY untuk Veo di Vercel.',
  );
}
