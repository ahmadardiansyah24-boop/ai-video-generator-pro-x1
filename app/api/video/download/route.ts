import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: 'GEMINI_API_KEY belum dikonfigurasi di server.' }, { status: 503 });
    const operationName = new URL(req.url).searchParams.get('id');
    if (!operationName) return NextResponse.json({ error: 'Job id wajib diisi.' }, { status: 400 });
    const ai = new GoogleGenAI({ apiKey: key });
    const operation = await ai.operations.getVideosOperation({ operation: { name: operationName } as any });
    if (!operation.done) return NextResponse.json({ error: 'Video masih diproses.' }, { status: 409 });
    const generated = (operation as any).response?.generatedVideos?.[0]?.video;
    const uri = generated?.uri;
    if (!uri) return NextResponse.json({ error: 'Video selesai tetapi URI tidak tersedia.' }, { status: 502 });
    const upstream = await fetch(uri, { headers: { 'x-goog-api-key': key } });
    if (!upstream.ok) return NextResponse.json({ error: `Gagal mengambil video dari provider (${upstream.status}).` }, { status: 502 });
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'video/mp4',
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': 'inline; filename="ai-video.mp4"',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Gagal mengambil video.' }, { status: 500 });
  }
}
