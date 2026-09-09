import type { VideoProvider } from './types';
import type { VideoRequest, Scene } from '@/types/video';
import { GoogleGenAI } from '@google/genai';

function client(){ const key=process.env.GEMINI_API_KEY; if(!key) throw new Error('GEMINI_API_KEY belum dikonfigurasi di server.'); return new GoogleGenAI({apiKey:key}); }

export const veoProvider:VideoProvider={
  key:'VEO', name:'Veo 3.1',
  async generateTextToVideo(req:VideoRequest,scene:Scene){
    const ai=client();
    const prompt=[scene.visualPrompt,`Camera: ${scene.camera}`,`Lighting: ${scene.lighting}`,`Character continuity: ${scene.character}`,`Aspect ratio: ${req.aspectRatio}`].join('\n');
    const op=await ai.models.generateVideos({ model:process.env.VEO_MODEL||'veo-3.1-generate-preview', prompt, config:{ aspectRatio:req.aspectRatio, resolution:req.resolution==='4K'?'4k':'1080p', numberOfVideos:1 } });
    return {id:String(op.name??`veo-${scene.id}`),status:op.done?'COMPLETED':'PROCESSING',message:'Veo operation created.',provider:'VEO'};
  },
  async getStatus(id:string){
    const ai=client();
    const operation=await ai.operations.getVideosOperation({operation:{name:id} as any});
    if(!operation.done) return {id,status:'PROCESSING',provider:'VEO'};
    const generated=(operation as any).response?.generatedVideos?.[0]?.video;
    return {id,status:'COMPLETED',videoUrl:`/api/video/download?id=${encodeURIComponent(id)}`,message:'Veo generation completed.',provider:'VEO'};
  }
};
