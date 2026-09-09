'use client';
import { useMemo, useState } from 'react';
import { Captions, Clapperboard, Download, FileText, Mic2, Play, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import type { AspectRatio, Scene, VideoEngine } from '@/types/video';

const styles = ['Educational','Realistic','Cinematic','Documentary','Anime','3D','Corporate'];
const durations = [10,20,30,60,180,300];

export default function VideoStudio(){
  const [prompt,setPrompt] = useState('Buat video pembelajaran bilangan bulat untuk kelas VII, guru menjelaskan konsep di kelas dengan visual yang menarik.');
  const [duration,setDuration] = useState(60);
  const [ratio,setRatio] = useState<AspectRatio>('16:9');
  const [style,setStyle] = useState('Educational');
  const [resolution,setResolution] = useState('1080p');
  const [engine,setEngine] = useState<VideoEngine>('AUTO');
  const [scenes,setScenes] = useState<Scene[]>([]);
  const [loading,setLoading] = useState(false);
  const [status,setStatus] = useState('Siap digunakan');
  const [character,setCharacter] = useState('Guru Indonesia profesional, ramah, pakaian sopan, identitas visual konsisten.');
  const [videoUrl,setVideoUrl] = useState('');
  const [activeProvider,setActiveProvider] = useState('DEMO');
  const total = useMemo(()=>scenes.reduce((a,s)=>a+s.duration,0),[scenes]);

  async function makeStoryboard(){
    setLoading(true); setStatus('Menyusun storyboard…');
    try{
      const r = await fetch('/api/storyboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,duration,character})});
      const j = await r.json();
      if(!r.ok) throw new Error(j.error || 'Storyboard gagal.');
      setScenes(j.scenes); setStatus(`${j.scenes.length} scene siap`);
    }catch(e){setStatus(e instanceof Error ? e.message : 'Gagal membuat storyboard.');}
    finally{setLoading(false);}
  }

  async function pollJob(id:string,eng:VideoEngine){
    for(let i=0;i<60;i++){
      await new Promise(r=>setTimeout(r,5000));
      try{
        const r=await fetch(`/api/video/status?id=${encodeURIComponent(id)}&engine=${eng}`);
        const j=await r.json();
        if(j.videoUrl) setVideoUrl(j.videoUrl);
        if(j.provider) setActiveProvider(j.provider);
        if(j.status==='COMPLETED'){setStatus('Video selesai dibuat');return;}
        setStatus(`Rendering… ${j.status || 'PROCESSING'}`);
      }catch{setStatus('Menunggu status provider…');}
    }
    setStatus('Job masih berjalan. Cek kembali project/history.');
  }

  async function generate(){
    setLoading(true); setStatus('Memulai render…'); setVideoUrl('');
    try{
      const r=await fetch('/api/video',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        title:'AI Video Project',prompt,type:'Educational',language:'id',duration,aspectRatio:ratio,style,engine,resolution,characterDescription:character,subtitle:true
      })});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error || 'Render gagal.');
      setScenes(j.scenes); setVideoUrl(j.job?.videoUrl || ''); setActiveProvider(j.provider || engine); setStatus(j.message || 'Job dibuat');
      if(j.job?.status==='PROCESSING' && j.job?.id) void pollJob(j.job.id,(j.provider||engine) as VideoEngine);
    }catch(e){setStatus(e instanceof Error ? e.message : 'Render gagal.');}
    finally{setLoading(false);}
  }

  function enhancedPrompt(){
    setPrompt(p=>`${p}. High-quality cinematic production, coherent subject identity, natural motion, detailed environment, realistic lighting, professional camera movement.`);
  }

  const pipeline = [
    ['AI Script','Membuat naskah dan dialog',FileText],
    ['AI Storyboard','Memecah video menjadi scene',Clapperboard],
    ['Visual Generation','Text/Image → Video',Play],
    ['Voice & Audio','Narasi, musik, SFX',Mic2],
    ['Subtitle','SRT/ASS otomatis',Captions],
  ] as const;

  return <div className="min-h-screen bg-[radial-gradient(circle_at_top,#17112c,#080812_45%)]">
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080812]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3"><div className="rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 p-2.5"><Clapperboard size={22}/></div>
          <div><div className="font-black tracking-tight">AI WORLD <span className="text-violet-300">STUDIO X</span></div><div className="text-xs text-white/45">AI Video Generator PRO · By Ahmad Yurid Ardiansah, S.Pd.</div></div>
        </div>
        <div className="hidden items-center gap-2 md:flex"><span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">PRO WORKSPACE</span><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">Engine: {activeProvider}</span></div>
      </div>
    </header>

    <main className="mx-auto grid max-w-[1500px] gap-5 p-4 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:p-6">
      <aside className="glass hidden rounded-3xl p-4 lg:block">
        <div className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-white/35">AI Generator</div>
        {['Dashboard','AI Image','Image to Video','Text to Video','AI Video Editor','AI Voice / TTS'].map((x,i)=><button key={x} className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm ${i===2?'bg-violet-500/20 text-white ring-1 ring-violet-400/20':'text-white/60 hover:bg-white/5'}`}><Sparkles size={16}/>{x}</button>)}
        <div className="my-5 border-t border-white/10"/>
        <div className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-white/35">AI Tools</div>
        {['Prompt Enhancer','AI Storyboard','Auto Subtitle','Background Music','Face / Identity Lock'].map(x=><button key={x} className="mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-white/60 hover:bg-white/5"><Wand2 size={16}/>{x}</button>)}
        <div className="mt-6 rounded-3xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 p-4 ring-1 ring-white/10"><div className="font-bold">Studio Pro</div><div className="mt-1 text-xs leading-5 text-white/50">Multi-scene, character consistency, subtitle, audio dan engine fallback.</div></div>
      </aside>

      <section className="space-y-5">
        <div className="glass glow rounded-3xl p-5 lg:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-violet-300">AI VIDEO GENERATOR</div><h1 className="text-3xl font-black lg:text-5xl"><span className="gradient-text">Buat Video Profesional</span> dengan AI</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">Dari satu ide menjadi script, storyboard, scene, voice-over, subtitle, dan final render. Video panjang dibangun melalui multi-scene.</p></div><button onClick={makeStoryboard} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-black"><FileText size={18}/> Generate Storyboard</button></div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/[.04] p-4"><div className="text-xs text-white/40">STYLE</div><select value={style} onChange={e=>setStyle(e.target.value)} className="mt-2 w-full bg-transparent text-sm outline-none">{styles.map(x=><option key={x} value={x}>{x}</option>)}</select></div>
            <div className="rounded-2xl bg-white/[.04] p-4"><div className="text-xs text-white/40">ENGINE</div><select value={engine} onChange={e=>setEngine(e.target.value as VideoEngine)} className="mt-2 w-full bg-transparent text-sm outline-none"><option value="AUTO">AUTO · Fallback</option><option value="VEO">VEO</option><option value="HUGGING_FACE">HUGGING FACE</option><option value="MOCK">DEMO</option></select></div>
            <div className="rounded-2xl bg-white/[.04] p-4"><div className="text-xs text-white/40">STATUS</div><div className="mt-2 text-sm text-cyan-200">{loading?'Processing…':status}</div></div>
          </div>
        </div>

        <div className="glass rounded-3xl p-5"><label className="text-sm font-bold">1. Ide / Prompt</label><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={5} className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 outline-none focus:border-violet-400/40"/><div className="mt-2 flex flex-wrap gap-2"><button onClick={enhancedPrompt} className="rounded-xl bg-violet-500/10 px-3 py-2 text-xs text-violet-200">✨ Enhance Prompt</button><button onClick={()=>setPrompt('Video cinematic tentang guru mengajar di kelas, profesional, natural, inspiratif.')} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">🎲 Random Prompt</button></div></div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="glass rounded-3xl p-5"><div className="mb-4 flex items-center justify-between"><span className="font-bold">2. Video Settings</span><span className="text-xs text-white/35">Target {total || duration}s</span></div><div className="space-y-4">
            <div><div className="mb-2 text-xs text-white/40">DURATION</div><div className="flex flex-wrap gap-2">{durations.map(d=><button key={d} onClick={()=>setDuration(d)} className={`rounded-xl px-3 py-2 text-xs ${duration===d?'bg-violet-500 text-white':'bg-white/5 text-white/55'}`}>{d<60?`${d}s`:`${d/60}m`}</button>)}</div></div>
            <div><div className="mb-2 text-xs text-white/40">ASPECT RATIO</div><div className="grid grid-cols-3 gap-2">{(['9:16','16:9','1:1'] as AspectRatio[]).map(r=><button key={r} onClick={()=>setRatio(r)} className={`rounded-xl px-3 py-3 text-sm ${ratio===r?'bg-cyan-500/20 ring-1 ring-cyan-300/20':'bg-white/5 text-white/55'}`}>{r}</button>)}</div></div>
            <div><div className="mb-2 text-xs text-white/40">RESOLUTION</div><div className="grid grid-cols-3 gap-2">{['720p','1080p','4K'].map(q=><button key={q} onClick={()=>setResolution(q)} className={`rounded-xl px-3 py-2 text-xs ${resolution===q?'bg-cyan-500/20 ring-1 ring-cyan-300/20':'bg-white/5 text-white/55'}`}>{q}</button>)}</div></div>
            <div><div className="mb-2 text-xs text-white/40">CHARACTER / IDENTITY BIBLE</div><textarea value={character} onChange={e=>setCharacter(e.target.value)} rows={4} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs outline-none"/></div>
          </div></div>
          <div className="glass rounded-3xl p-5"><div className="mb-4 font-bold">3. Visual Pipeline</div><div className="space-y-3 text-sm">{pipeline.map(([a,b,Icon])=><div key={a} className="flex items-center gap-3 rounded-2xl bg-white/[.04] p-3"><div className="rounded-xl bg-violet-500/10 p-2 text-violet-200"><Icon size={17}/></div><div><div className="font-medium">{a}</div><div className="text-xs text-white/40">{b}</div></div><span className="ml-auto h-2 w-2 rounded-full bg-cyan-300"/></div>)}</div></div>
        </div>

        <div className="glass rounded-3xl p-5"><div className="mb-4 flex items-center justify-between"><div><div className="font-bold">4. Storyboard & Scene Queue</div><div className="text-xs text-white/35">{scenes.length?`${scenes.length} scene · ${total}s`:'Belum dibuat'}</div></div><button onClick={generate} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-black text-white"><Sparkles size={17}/> Generate Video</button></div>
          {scenes.length===0?<div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/35">Tekan “Generate Storyboard” untuk membuat scene otomatis.</div>:<div className="space-y-3">{scenes.map((s,idx)=><div key={s.id} className="rounded-2xl border border-white/10 bg-black/15 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 font-black text-violet-200">{idx+1}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><div className="font-bold">{s.title}</div><span className="rounded-full bg-white/5 px-2 py-1 text-xs text-white/40">{s.duration}s</span></div><div className="mt-2 text-xs leading-5 text-white/45">{s.visualPrompt}</div><div className="mt-3 flex flex-wrap gap-2 text-[10px] text-white/40"><span className="rounded-lg bg-white/5 px-2 py-1">Camera: {s.camera}</span><span className="rounded-lg bg-white/5 px-2 py-1">Light: {s.lighting}</span></div></div><div className="flex gap-2"><button className="rounded-xl bg-white/5 p-2" title="Regenerate"><RefreshCw size={15}/></button><button className="rounded-xl bg-white/5 p-2" title="Preview"><Play size={15}/></button></div></div></div>)}</div>}
        </div>
      </section>

      <aside className="space-y-5"><div className="glass rounded-3xl p-4"><div className="mb-4 font-bold">Preview</div><div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950 via-slate-950 to-cyan-950 ring-1 ring-white/10">{videoUrl ? <video src={videoUrl} controls playsInline className="h-full w-full object-contain"/> : <div className="text-center"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><Play size={25}/></div><div className="text-sm text-white/55">Video Preview</div></div>}</div><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/5 px-3 py-2 text-center text-xs text-white/55">{resolution}</div><div className="rounded-xl bg-white/5 px-3 py-2 text-center text-xs text-white/55">{ratio}</div></div><a href={videoUrl||'/demo/demo-scene.mp4'} download className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500/10 px-3 py-3 text-sm text-cyan-200"><Download size={16}/> Download MP4</a></div>
        <div className="glass rounded-3xl p-4"><div className="mb-3 font-bold">Engine Matrix</div>{[['Veo 3.1','Premium route'],['Hugging Face','Open-model route'],['Demo','Local UI testing']].map(([a,b])=><div key={a} className="mb-2 rounded-2xl bg-white/[.04] p-3"><div className="text-sm font-medium">{a}</div><div className="text-xs text-white/35">{b}</div></div>)}<div className="mt-3 text-[11px] leading-5 text-white/35">Secret API keys stay server-side. Long renders should run as background jobs.</div></div>
      </aside>
    </main>
  </div>;
}
