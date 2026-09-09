import { NextResponse } from 'next/server';
import { makeStoryboard } from '@/lib/storyboard';
export async function POST(req: Request){ try { const body=await req.json(); if(!body.prompt) return NextResponse.json({error:'Prompt wajib diisi.'},{status:400}); const scenes=makeStoryboard(String(body.prompt),Number(body.duration)||60,String(body.character||'')); return NextResponse.json({scenes}); } catch { return NextResponse.json({error:'Storyboard gagal dibuat.'},{status:500}); } }
