'use client';

import Link from 'next/link';

const items = [
  ['Dashboard','dashboard'],['AI Image','ai-image'],['Image to Video','image-to-video'],['Text to Video','text-to-video'],['AI Video Editor','video-editor'],['AI Voice / TTS','voice'],['Prompt Enhancer','prompt'],['AI Storyboard','storyboard'],['Auto Subtitle','subtitle'],['Background Music','music'],['Face / Identity Lock','identity'],
] as const;

export default function Navigation(){
  return <>
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="glass sticky top-24 rounded-3xl p-3">
        <div className="mb-3 px-3 text-[11px] font-bold tracking-[.2em] text-white/35">AI WORLD STUDIO X</div>
        <div className="space-y-1">
          {items.map(([label,id])=><Link key={id} href={`#${id}`} className="block rounded-2xl px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white focus:bg-violet-500/20">{label}</Link>)}
        </div>
      </div>
    </aside>
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#080812]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
        {items.slice(0,4).map(([label,id])=><Link key={id} href={`#${id}`} className="rounded-xl px-2 py-2 text-center text-[10px] text-white/65 hover:bg-white/5">{label.replace('AI ','')}</Link>)}
      </div>
    </nav>
  </>;
}
