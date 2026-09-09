'use client';

import { useMemo, useState } from 'react';
import { AudioLines, Captions, Clapperboard, Download, FileText, Film, Image as ImageIcon, LayoutDashboard, Menu, Mic2, Play, Plus, RefreshCw, Sparkles, Upload, Video, Wand2, X } from 'lucide-react';
import type { AspectRatio, Scene, VideoEngine } from '@/types/video';

const primary = [
  ['Dashboard', LayoutDashboard], ['AI Image', ImageIcon], ['Image to Video', Video],
  ['Text to Video', Film], ['AI Video Editor', Clapperboard], ['AI Voice / TTS', Mic2],
] as const;
const tools = [
  ['Prompt Enhancer', Wand2], ['AI Storyboard', FileText], ['Auto Subtitle', Captions],
  ['Background Music', AudioLines], ['Face / Identity Lock', Sparkles],
] as const;
const styles = ['Educational','Realistic','Cinematic','Documentary','Anime','3D','Corporate'];
const durations = [10,20,30,60,180,300];
type Section = (typeof primary[number][0]) | (typeof tools[number][0]);

export default function VideoStudio() {
  const [section,setSection] = useState<Section>('Image to Video');
  const [drawer,setDrawer] = useState(false);
  const [prompt,setPrompt] = useState('Buat video pembelajaran bilangan bulat untuk kelas VII, guru menjelaskan konsep di kelas dengan visual yang menarik.');
  const [duration,setDuration] = useState(60);
  const [ratio,setRatio] = useState<AspectRatio>('16:9');
  const [resolution,setResolution] = useState('1080p');
  const [style,setStyle] = useState('Educational');
  const [engine,setEngine] = useState<VideoEngine>('AUTO');
  const [character,setCharacter] = useState('Guru Indonesia profesional, ramah, berpakaian sopan, identitas visual konsisten.');
  const [scenes,setScenes] = useState<Scene[]>([]);
  const [videoUrl,setVideoUrl] = useState('');
  const [status,setStatus] = useState('Siap digunakan');
  const [loading,setLoading] = useState(false);
  const total = useMemo(()=>scenes.reduce((n,s)=>n+s.duration,0),[scenes]);

  const selectSection = (name: Section) => { setSection(name); setDrawer(false); setStatus(`${name} aktif`); };

  async function storyboard(){
    setLoading(true); setStatus('Menyusun storyboard…');
    try{
      const r=await fetch('/api/storyboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,duration,character})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||'Storyboard gagal.');
      setScenes(j.scenes||[]); setSection('AI Storyboard'); setStatus(`${j.scenes?.length||0} scene siap`);
    }catch(e){setStatus(e instanceof Error?e.message:'Storyboard gagal.');}
    finally{setLoading(false);}
  }

  async function generate(){
    setLoading(true); setVideoUrl(''); setStatus('Memulai render…');
    try{
      const r=await fetch('/api/video',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'AI Video Project',prompt,type:'Educational',language:'id',duration,aspectRatio:ratio,style,engine,resolution,characterDescription:character,subtitle:true})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||'Render gagal.');
      setScenes(j.scenes||[]); setVideoUrl(j.job?.videoUrl||''); setStatus(j.message||'Job dibuat');
      if(j.job?.status==='PROCESSING'&&j.job?.id) void poll(j.job.id,(j.provider||engine) as VideoEngine);
    }catch(e){setStatus(e instanceof Error?e.message:'Render gagal.');}
    finally{setLoading(false);}
  }

  async function poll(id:string,eng:VideoEngine){
    for(let i=0;i<60;i++){
      await new Promise(r=>setTimeout(r,5000));
      try{
        const r=await fetch(`/api/video/status?id=${encodeURIComponent(id)}&engine=${eng}`); const j=await r.json();
        if(j.videoUrl) setVideoUrl(j.videoUrl); if(j.status==='COMPLETED'){setStatus('Video selesai dibuat');return;}
        setStatus(`Rendering… ${j.status||'PROCESSING'}`);
      }catch{setStatus('Menunggu status provider…');}
    }
  }

  function enhance(){ setPrompt(p=>`${p}. Cinematic, natural motion, consistent identity, detailed environment, professional camera movement, realistic lighting.`); setSection('Prompt Enhancer'); setStatus('Prompt ditingkatkan'); }

  return <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#18112f,#080812_48%)] text-white">
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080812]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden" onClick={()=>setDrawer(true)} aria-label="Buka menu"><Menu size={20}/></button>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Clapperboard size={20}/></div>
          <div className="min-w-0"><div className="truncate font-black">AI WORLD <span className="text-violet-300">STUDIO X</span></div><div className="hidden truncate text-xs text-white/40 sm:block">AI Video Generator PRO · By Ahmad Yurid Ardiansah, S.Pd.</div></div>
        </div>
        <div className="hidden items-center gap-2 sm:flex"><span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">PRO WORKSPACE</span><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">{engine}</span></div>
        <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs lg:hidden" onClick={()=>selectSection('Dashboard')}>Home</button>
      </div>
    </header>

    {drawer && <><button className="fixed inset-0 z-[60] bg-black/70 lg:hidden" onClick={()=>setDrawer(false)} aria-label="Tutup"/><aside className="fixed left-0 top-0 z-[70] h-full w-[86vw] max-w-[340px] overflow-y-auto bg-[#0c0b17] p-4 shadow-2xl lg:hidden"><div className="mb-6 flex items-center justify-between"><b>AI WORLD STUDIO X</b><button onClick={()=>setDrawer(false)} className="rounded-xl border border-white/10 p-2"><X size={18}/></button></div><NavGroup title="AI GENERATOR" items={primary} active={section} onSelect={selectSection}/><div className="my-5 border-t border-white/10"/><NavGroup title="AI TOOLS" items={tools} active={section} onSelect={selectSection}/></aside></>}

    <main className="mx-auto grid max-w-[1500px] gap-4 p-3 pb-24 sm:p-5 lg:grid-cols-[260px_minmax(0,1fr)_310px] lg:p-6 lg:pb-8">
      <aside className="glass hidden self-start rounded-3xl p-4 lg:block lg:sticky lg:top-[82px]"><NavGroup title="AI GENERATOR" items={primary} active={section} onSelect={selectSection}/><div className="my-5 border-t border-white/10"/><NavGroup title="AI TOOLS" items={tools} active={section} onSelect={selectSection}/></aside>

      <section className="min-w-0 space-y-4">
        <div className="glass rounded-3xl p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div className="min-w-0"><div className="text-[11px] font-bold uppercase tracking-[.25em] text-violet-300">{section}</div><h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl"><span className="gradient-text">Buat Video Profesional</span> dengan AI</h1><p className="mt-3 text-sm leading-6 text-white/55">Dari satu ide menjadi script, storyboard, scene, voice-over, subtitle, dan final render.</p></div><div className="grid grid-cols-2 gap-2 sm:flex"><button onClick={storyboard} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black"><FileText size={16} className="mr-2 inline"/>Storyboard</button><button onClick={generate} disabled={loading} className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-3 text-sm font-black disabled:opacity-50"><Sparkles size={16} className="mr-2 inline"/>Generate Video</button></div></div>
          <div className="mt-5 grid gap-3 md:grid-cols-3"><Card label="STYLE"><select value={style} onChange={e=>setStyle(e.target.value)} className="mt-2 w-full bg-transparent text-sm outline-none">{styles.map(x=><option key={x}>{x}</option>)}</select></Card><Card label="ENGINE"><select value={engine} onChange={e=>setEngine(e.target.value as VideoEngine)} className="mt-2 w-full bg-transparent text-sm outline-none"><option value="AUTO">AUTO · Fallback</option><option value="VEO">VEO</option><option value="HUGGING_FACE">HUGGING FACE</option><option value="MOCK">DEMO</option></select></Card><Card label="STATUS"><div className="mt-2 flex items-center gap-2 text-sm text-cyan-200"><i className={`h-2 w-2 rounded-full ${loading?'animate-pulse bg-amber-300':'bg-cyan-300'}`}/>{status}</div></Card></div>
        </div>

        {section !== 'AI Video Editor' && section !== 'AI Voice / TTS' && <div className="glass rounded-3xl p-4 sm:p-5"><div className="flex items-center justify-between"><b>1. Ide / Prompt</b><span className="text-xs text-white/30">{section}</span></div><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={5} className="mt-3 min-h-[125px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 outline-none focus:border-violet-400/40"/><div className="mt-2 flex flex-wrap gap-2"><button onClick={enhance} className="rounded-xl bg-violet-500/10 px-3 py-2 text-xs text-violet-200"><Wand2 size={14} className="mr-1 inline"/>Enhance Prompt</button><button onClick={()=>setPrompt('Video cinematic tentang guru mengajar di kelas, profesional, natural, inspiratif.')} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">Random Prompt</button><button onClick={()=>setPrompt('')} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">Clear</button></div></div>}

        <div className="grid gap-4 xl:grid-cols-2"><div className="glass rounded-3xl p-4 sm:p-5"><b>2. Video Settings</b><div className="mt-4 space-y-4"><div><div className="mb-2 text-xs text-white/40">DURATION</div><div className="flex flex-wrap gap-2">{durations.map(d=><button key={d} onClick={()=>setDuration(d)} className={`rounded-xl px-3 py-2 text-xs ${duration===d?'bg-violet-500':'bg-white/5 text-white/55'}`}>{d<60?`${d}s`:`${d/60}m`}</button>)}</div></div><div><div className="mb-2 text-xs text-white/40">ASPECT RATIO</div><div className="grid grid-cols-3 gap-2">{(['9:16','16:9','1:1'] as AspectRatio[]).map(x=><button key={x} onClick={()=>setRatio(x)} className={`rounded-xl px-3 py-3 text-sm ${ratio===x?'bg-cyan-500/20 ring-1 ring-cyan-300/20':'bg-white/5 text-white/55'}`}>{x}</button>)}</div></div><div><div className="mb-2 text-xs text-white/40">RESOLUTION</div><div className="grid grid-cols-3 gap-2">{['720p','1080p','4K'].map(x=><button key={x} onClick={()=>setResolution(x)} className={`rounded-xl px-3 py-2 text-xs ${resolution===x?'bg-cyan-500/20 ring-1 ring-cyan-300/20':'bg-white/5 text-white/55'}`}>{x}</button>)}</div></div><div><div className="mb-2 text-xs text-white/40">CHARACTER / IDENTITY BIBLE</div><textarea value={character} onChange={e=>setCharacter(e.target.value)} rows={3} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs outline-none"/></div></div></div>

        <div className="glass rounded-3xl p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><b>3. Storyboard & Scene Queue</b><span className="text-xs text-white/35">{scenes.length?`${scenes.length} scene · ${total}s`:'Belum dibuat'}</span></div>{scenes.length===0?<div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">Generate storyboard untuk membuat scene.</div>:<div className="space-y-3">{scenes.map((s,i)=><div key={s.id} className="rounded-2xl border border-white/10 bg-black/10 p-4"><div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-sm font-black text-violet-200">{i+1}</div><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><b className="break-words">{s.title}</b><span className="shrink-0 text-xs text-white/35">{s.duration}s</span></div><div className="mt-2 text-xs leading-5 text-white/45">{s.visualPrompt}</div></div><button onClick={()=>setStatus(`Scene ${i+1} siap di-regenerate`)} className="h-9 w-9 shrink-0 rounded-xl bg-white/5"><RefreshCw size={14}/></button></div></div>)}</div>}</div>

        {(section==='AI Video Editor'||section==='AI Voice / TTS'||section==='Auto Subtitle'||section==='Background Music') && <div className="glass rounded-3xl p-5"><b>{section}</b><p className="mt-2 text-sm text-white/45">Workspace {section} aktif. Komponen ini siap dihubungkan ke pipeline produksi tanpa meninggalkan halaman utama.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><button onClick={()=>setStatus(`${section} siap`)} className="rounded-xl bg-white/5 p-3 text-sm">Open Workspace</button><button onClick={()=>setStatus('Pengaturan tersimpan')} className="rounded-xl bg-white/5 p-3 text-sm">Save Settings</button><button onClick={()=>setStatus('Preview diperbarui')} className="rounded-xl bg-violet-500/15 p-3 text-sm">Preview</button></div></div>}
      </section>

      <aside className="min-w-0 space-y-4 xl:sticky xl:top-[82px] xl:self-start"><div className="glass rounded-3xl p-4"><div className="mb-3 flex justify-between"><b>Preview</b><span className="text-xs text-white/30">{ratio}</span></div><div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950 via-slate-950 to-cyan-950">{videoUrl?<video src={videoUrl} controls playsInline className="h-full w-full object-contain"/>:<div className="text-center text-white/45"><Play size={26} className="mx-auto mb-2"/>Video Preview</div>}</div><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/5 p-2 text-center text-xs">{resolution}</div><div className="rounded-xl bg-white/5 p-2 text-center text-xs">{ratio}</div></div><a href={videoUrl||'#'} download className={`mt-3 flex items-center justify-center gap-2 rounded-xl p-3 text-sm ${videoUrl?'bg-cyan-500/15 text-cyan-200':'pointer-events-none bg-white/5 text-white/25'}`}><Download size={16}/>Download MP4</a></div><div className="glass rounded-3xl p-4"><b>Quick Actions</b><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={()=>setStatus('Upload asset dibuka')} className="rounded-xl bg-white/5 p-3 text-xs"><Upload size={15} className="mx-auto mb-1"/>Upload</button><button onClick={()=>{setScenes([]);setVideoUrl('');setStatus('Project baru') }} className="rounded-xl bg-white/5 p-3 text-xs"><Plus size={15} className="mx-auto mb-1"/>New</button></div></div></aside>
    </main>

    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a0914]/95 px-2 py-2 backdrop-blur-xl lg:hidden"><div className="mx-auto grid max-w-[720px] grid-cols-4 gap-1">{([['Dashboard',LayoutDashboard],['Image to Video',Video],['AI Storyboard',FileText],['AI Video Editor',Clapperboard]] as const).map(([label,Icon])=><button key={label} onClick={()=>selectSection(label)} className={`rounded-xl px-1 py-2 text-[10px] ${section===label?'bg-violet-500/20 text-white':'text-white/45'}`}><Icon size={17} className="mx-auto"/><span className="mt-1 block truncate">{label.replace('AI ','')}</span></button>)}</div></nav>
  </div>;
}

function NavGroup({title,items,active,onSelect}:{title:string;items:readonly (readonly [Section,typeof Sparkles])[];active:Section;onSelect:(name:Section)=>void}){
  return <div><div className="mb-3 text-[11px] font-bold uppercase tracking-[.2em] text-white/35">{title}</div><div className="space-y-1">{items.map(([label,Icon])=><button key={label} onClick={()=>onSelect(label)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${active===label?'bg-violet-500/20 text-white ring-1 ring-violet-400/20':'text-white/60 hover:bg-white/5 hover:text-white'}`}><Icon size={17}/><span className="truncate">{label}</span></button>)}</div></div>;
}
function Card({label,children}:{label:string;children:React.ReactNode}){ return <div className="min-w-0 rounded-2xl bg-white/[.04] p-4"><div className="text-[10px] font-semibold tracking-[.15em] text-white/40">{label}</div>{children}</div>; }
