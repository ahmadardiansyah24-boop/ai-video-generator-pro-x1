import type { Scene } from '@/types/video';
export function makeStoryboard(prompt: string, duration: number, character = 'Karakter utama konsisten') : Scene[] {
  const count = Math.max(3, Math.min(30, Math.ceil(duration / 10)));
  const per = Math.max(5, Math.round(duration / count));
  return Array.from({length: count}, (_, i) => ({
    id: `scene-${i+1}`, number:i+1, title:i===0?'Opening':i===count-1?'Kesimpulan':`Scene ${i+1}`,
    duration: i===count-1 ? Math.max(5, duration - per*(count-1)) : per,
    narration: i===0 ? `Pembuka: ${prompt}` : i===count-1 ? 'Penutup dan rangkuman.' : `${prompt} — bagian ${i+1}`,
    visualPrompt: `${prompt}. Scene ${i+1}. Cinematic, coherent visual storytelling, realistic motion, high detail.`,
    camera: i%3===0?'slow dolly-in':i%3===1?'tracking shot':'medium close-up',
    lighting:'natural cinematic soft lighting', character
  }));
}
