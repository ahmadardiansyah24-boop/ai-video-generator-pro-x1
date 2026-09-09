import type { VideoProvider } from './types';
import type { VideoRequest, Scene } from '@/types/video';
export const mockProvider:VideoProvider={
  key:'MOCK', name:'Demo Engine',
  async generateTextToVideo(req:VideoRequest,scene:Scene){ return {id:`demo-${scene.id}`,status:'COMPLETED',videoUrl:'/demo/demo-scene.mp4',message:`Demo render for ${req.title}`,provider:'MOCK'}; },
  async getStatus(id:string){ return {id,status:'COMPLETED',videoUrl:'/demo/demo-scene.mp4',message:'Demo completed.',provider:'MOCK'}; }
};
