import type { VideoProvider } from './types';
import type { VideoEngine } from '@/types/video';
import { veoProvider } from './veo';
import { huggingFaceProvider } from './huggingface';
import { falProvider } from './fal';

export function getProvider(engine: VideoEngine): VideoProvider {
  if (engine === 'VEO') return veoProvider;
  if (engine === 'HUGGING_FACE') return huggingFaceProvider;

  // AUTO prefers Fal AI when configured, then VEO, then Hugging Face.
  // No mock/demo fallback is used.
  if (process.env.FAL_KEY) return falProvider;
  if (process.env.GEMINI_API_KEY) return veoProvider;
  if (process.env.HF_TOKEN) return huggingFaceProvider;

  throw new Error('Belum ada provider PRO yang dikonfigurasi. Tambahkan FAL_KEY, GEMINI_API_KEY, atau HF_TOKEN di Vercel.');
}
