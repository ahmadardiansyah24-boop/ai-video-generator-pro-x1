import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    providers: {
      FAL_AI: { configured: Boolean(process.env.FAL_KEY) },
      VEO: { configured: Boolean(process.env.GEMINI_API_KEY) },
      HUGGING_FACE: { configured: Boolean(process.env.HF_TOKEN) },
    },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
