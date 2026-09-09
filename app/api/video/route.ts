import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers';
import { makeStoryboard } from '@/lib/storyboard';
import type { VideoRequest } from '@/types/video';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as VideoRequest;
    if (!data.prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt wajib diisi.' }, { status: 400 });
    }

    const requestedDuration = Math.round(Number(data.duration) || 10);
    const clipDuration = Math.max(2, Math.min(15, requestedDuration));
    const engine = data.engine || 'AUTO';
    const scenes = makeStoryboard(data.prompt, clipDuration, data.characterDescription || '');
    const first = { ...scenes[0], duration: clipDuration };
    const provider = getProvider(engine);
    const job = await provider.generateTextToVideo({ ...data, duration: clipDuration }, first);

    return NextResponse.json({
      message: `${provider.name}: ${job.status}`,
      provider: provider.key,
      requestedDuration,
      clipDuration,
      scenes: [first],
      job,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Video generation gagal.' },
      { status: 500 },
    );
  }
}
