import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MODEL = 'fal-ai/ffmpeg-api/merge-videos';

function mergeResolution(ratio: string) {
  if (ratio === '9:16') return 'portrait_16_9';
  if (ratio === '1:1') return 'square';
  return 'landscape_16_9';
}

export async function POST(req: Request) {
  try {
    const key = process.env.FAL_KEY;
    if (!key) return NextResponse.json({ error: 'FAL_KEY belum dikonfigurasi di Vercel.' }, { status: 500 });
    fal.config({ credentials: key });

    const body = await req.json();
    const urls = Array.isArray(body.videoUrls) ? body.videoUrls.filter((x: unknown) => typeof x === 'string' && x) : [];
    if (urls.length < 2 || urls.length > 30) {
      return NextResponse.json({ error: 'Minimal 2 dan maksimal 30 clip diperlukan untuk merge.' }, { status: 400 });
    }

    const result = await fal.queue.submit(MODEL, {
      input: {
        video_urls: urls,
        resolution: mergeResolution(String(body.aspectRatio || '16:9')),
      },
    });

    return NextResponse.json({
      provider: 'FAL_AI',
      model: MODEL,
      requestId: result.request_id,
      status: 'QUEUED',
      clipCount: urls.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal menggabungkan video.' }, { status: 500 });
  }
}
