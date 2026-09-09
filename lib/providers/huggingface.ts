import type { VideoProvider } from './types';
import type { VideoRequest, Scene } from '@/types/video';
export const huggingFaceProvider:VideoProvider={
  key:'HUGGING_FACE', name:'Hugging Face',
  async generateTextToVideo(req:VideoRequest,scene:Scene){
    const token=process.env.HF_TOKEN; if(!token) throw new Error('HF_TOKEN belum dikonfigurasi di server.');
    const model=process.env.HF_MODEL||'Wan-AI/Wan2.1-T2V-1.3B-Diffusers';
    const prompt=`${scene.visualPrompt}\nCamera: ${scene.camera}\nLighting: ${scene.lighting}`;
    const r=await fetch(`https://router.huggingface.co/hf-inference/models/${model}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({inputs:prompt})});
    if(!r.ok) throw new Error(`Hugging Face error ${r.status}: ${await r.text()}`);
    const type=r.headers.get('content-type')||'';
    if(!type.startsWith('video/')) return {id:`hf-${scene.id}`,status:'FAILED',message:'Provider tidak mengembalikan video binary.',provider:'HUGGING_FACE'};
    const buffer=Buffer.from(await r.arrayBuffer());
    const base64=buffer.toString('base64');
    return {id:`hf-${scene.id}`,status:'COMPLETED',videoUrl:`data:${type};base64,${base64}`,message:'Video returned from Hugging Face.',provider:'HUGGING_FACE'};
  }
};
