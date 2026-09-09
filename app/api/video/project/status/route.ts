import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export const runtime = 'nodejs';
export const maxDuration = 30;

const ALLOWED_MODELS = new Set([
  'fal-ai/wan/v2.7/text-to-video',
  'fal-ai/ffmpeg-api/merge-videos',
]);

export async function POST(req: Request) {
  try {
    const key = process.env.FAL_KEY;
    if (!key) return NextResponse.json({ error: 'FAL_KEY belum dikonfigurasi di Vercel.' }, { status: 500 });
    fal.config({ credentials: key });

    const body = await req.json();
    const jobs = Array.isArray(body.jobs) ? body.jobs : [];
    if (!jobs.length || jobs.length > 30) return NextResponse.json({ error: 'Daftar job tidak valid.' }, { status: 400 });

    const results = await Promise.all(jobs.map(async (job: { id?: string; requestId?: string; model?: string }) => {
      const model = String(job.model || 'fal-ai/wan/v2.7/text-to-video');
      const requestId = String(job.requestId || '');
      if (!requestId || !ALLOWED_MODELS.has(model)) return { id: job.id, requestId, status: 'FAILED', error: 'Job tidak valid.' };

      try {
        const status = await fal.queue.status(model, { requestId, logs: false });
        if (status.status !== 'COMPLETED') return { id: job.id, requestId, status: status.status };
        const result = await fal.queue.result(model, { requestId });
        const data = result.data as { video?: { url?: string } };
        return { id: job.id, requestId, status: 'COMPLETED', videoUrl: data.video?.url || '' };
      } catch (error) {
        return { id: job.id, requestId, status: 'FAILED', error: error instanceof Error ? error.message : 'Polling gagal.' };
      }
    }));

    return NextResponse.json({ jobs: results });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal membaca status queue Fal AI.' }, { status: 500 });
  }
}
