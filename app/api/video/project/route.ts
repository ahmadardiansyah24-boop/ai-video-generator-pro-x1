import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import type { AspectRatio, Scene } from '@/types/video';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'fal-ai/wan/v2.7/text-to-video';
const MAX_PROJECT_SECONDS = 300;
const MAX_CLIP_SECONDS = 15;

const NEGATIVE_PROMPT = [
  'blurry, low quality, deformed face, deformed hands, extra fingers, extra limbs',
  'warped body, duplicate person, flicker, jitter, broken anatomy',
  'garbled text, random letters, watermark, logo, unstable geometry',
].join(', ');

function assertKey() {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY belum dikonfigurasi di Vercel.');
  fal.config({ credentials: key });
}

function makeClipScenes(prompt: string, totalSeconds: number, character: string, style: string, ratio: AspectRatio): Scene[] {
  const count = Math.ceil(totalSeconds / MAX_CLIP_SECONDS);
  return Array.from({ length: count }, (_, index) => {
    const elapsed = index * MAX_CLIP_SECONDS;
    const duration = Math.min(MAX_CLIP_SECONDS, totalSeconds - elapsed);
    const number = index + 1;
    return {
      id: `scene-${number}`,
      number,
      title: number === 1 ? 'Opening' : number === count ? 'Closing' : `Scene ${number}`,
      duration,
      narration: `${prompt} Bagian ${number} dari ${count}.`,
      visualPrompt: [
        prompt,
        `Educational cinematic scene ${number} of ${count}.`,
        'Continue naturally from the previous scene and prepare the next one.',
        `Aspect ratio ${ratio}. Style ${style}.`,
      ].join(' '),
      camera: index % 3 === 0 ? 'slow dolly-in' : index % 3 === 1 ? 'tracking shot' : 'medium close-up',
      lighting: 'natural cinematic soft lighting',
      character,
    };
  });
}

export async function POST(req: Request) {
  try {
    assertKey();
    const body = await req.json();
    const totalSeconds = Math.round(Number(body.duration) || 60);
    const prompt = String(body.prompt || '').trim();
    const character = String(body.characterDescription || 'Karakter utama konsisten').trim();
    const style = String(body.style || 'Educational').trim();
    const ratio = (body.aspectRatio || '16:9') as AspectRatio;
    const resolution = body.resolution === '720p' ? '720p' : '1080p';

    if (!prompt) return NextResponse.json({ error: 'Prompt wajib diisi.' }, { status: 400 });
    if (![10, 20, 30, 60, 180, 300].includes(totalSeconds)) {
      return NextResponse.json({ error: 'Durasi project harus 10, 20, 30, 60, 180, atau 300 detik.' }, { status: 400 });
    }

    const scenes = makeClipScenes(prompt, totalSeconds, character, style, ratio);
    const submitted = [] as Array<{ id: string; requestId: string; duration: number; number: number }>;

    for (let start = 0; start < scenes.length; start += 5) {
      const batch = scenes.slice(start, start + 5);
      const results = await Promise.all(batch.map(async (scene) => {
        const input = {
          prompt: [
            'High-quality educational cinematic video.',
            'One coherent continuous shot with realistic physical motion.',
            'Keep the teacher visually consistent with anatomically correct face, hands, fingers and body.',
            'Stable environment, natural expressions, realistic skin and fabric.',
            'Avoid unreadable writing on boards, clothing, books or screens.',
            scene.visualPrompt,
            `Camera: ${scene.camera}`,
            `Lighting: ${scene.lighting}`,
            `Character continuity: ${scene.character}`,
          ].join('\n').slice(0, 5000),
          negative_prompt: NEGATIVE_PROMPT,
          aspect_ratio: ratio,
          resolution,
          duration: scene.duration,
          enable_prompt_expansion: true,
        } as const;

        const result = await fal.queue.submit(MODEL, { input });
        return { id: scene.id, requestId: result.request_id, duration: scene.duration, number: scene.number };
      }));
      submitted.push(...results);
    }

    return NextResponse.json({
      projectDuration: totalSeconds,
      clipLimitSeconds: MAX_CLIP_SECONDS,
      scenes,
      jobs: submitted,
      provider: 'FAL_AI',
      model: MODEL,
      status: 'QUEUED',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal mengirim project video ke Fal AI.' },
      { status: 500 },
    );
  }
}
