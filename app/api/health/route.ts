import { NextResponse } from 'next/server';
export async function GET(){ return NextResponse.json({ok:true, gemini:!!process.env.GEMINI_API_KEY, huggingface:!!process.env.HF_TOKEN, veoModel:process.env.VEO_MODEL||'veo-3.1-generate-preview'}); }
