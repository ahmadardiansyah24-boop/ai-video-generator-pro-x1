import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers';
import { makeStoryboard } from '@/lib/storyboard';
import type { VideoRequest } from '@/types/video';

export const runtime='nodejs';
export const maxDuration=60;
export async function POST(req:Request){
  try{
    const data=(await req.json()) as VideoRequest;
    if(!data.prompt?.trim()) return NextResponse.json({error:'Prompt wajib diisi.'},{status:400});
    const scenes=makeStoryboard(data.prompt,Math.max(10,Number(data.duration)||60),data.characterDescription||'');
    const first=scenes[0];
    let provider=getProvider(data.engine||'AUTO');
    let job;
    try{ job=await provider.generateTextToVideo(data,first); }
    catch(primary){
      if((data.engine||'AUTO')!=='AUTO') throw primary;
      provider=getProvider('MOCK'); job=await provider.generateTextToVideo(data,first);
    }
    return NextResponse.json({message:`${provider.name}: ${job.status}`,provider:provider.key,scenes,job});
  }catch(e){ return NextResponse.json({error:e instanceof Error?e.message:'Video generation gagal.'},{status:500}); }
}
