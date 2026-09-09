import type { VideoProvider } from './types';
import type { VideoEngine } from '@/types/video';
import { veoProvider } from './veo';
import { huggingFaceProvider } from './huggingface';

export function getProvider(engine: VideoEngine): VideoProvider {
  if (engine === 'VEO') return veoProvider;
  if (engine === 'HUGGING_FACE') return huggingFaceProvider;
  if (process.env.GEMINI_API_KEY) return veoProvider;
  if (process.env.HF_TOKEN) return huggingFaceProvider;
  throw new Error('Provider AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY untuk Veo atau HF_TOKEN untuk Hugging Face di Vercel.');
}
