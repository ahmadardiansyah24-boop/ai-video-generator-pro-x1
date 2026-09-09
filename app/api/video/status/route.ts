import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers';
import type { VideoEngine } from '@/types/video';
export const runtime='nodejs';
export async function GET(req:Request){
  try{
    const {searchParams}=new URL(req.url); const id=searchParams.get('id'); const engine=(searchParams.get('engine')||'AUTO') as VideoEngine;
    if(!id) return NextResponse.json({error:'Job id wajib diisi.'},{status:400});
    const provider=getProvider(engine);
    if(!provider.getStatus) return NextResponse.json({id,status:'COMPLETED',message:'Provider tidak mendukung polling.',provider:provider.key});
    return NextResponse.json(await provider.getStatus(id));
  }catch(e){ return NextResponse.json({error:e instanceof Error?e.message:'Gagal membaca status job.'},{status:500}); }
}
