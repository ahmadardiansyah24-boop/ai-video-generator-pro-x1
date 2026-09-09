'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AudioLines, Captions, Clapperboard, Download, FileText, Film, Image as ImageIcon, LayoutDashboard, Menu, Mic2, RefreshCw, Sparkles, Video, Wand2, X } from 'lucide-react';
import type { AspectRatio, Scene, VideoEngine } from '@/types/video';

type Section = 'Dashboard'|'AI Image'|'Image to Video'|'Text to Video'|'AI Video Editor'|'AI Voice / TTS'|'Prompt Enhancer'|'AI Storyboard'|'Auto Subtitle'|'Background Music'|'Face / Identity Lock';
type ProviderStatus = { providers: { FAL_AI: { configured: boolean }; VEO: { configured: boolean }; HUGGING_FACE: { configured: boolean } } };
type QueueJob = { id: string; requestId: string; duration: number; number: number; model?: string };
type QueueResult = { id: string; requestId: string; status: string; videoUrl?: string; error?: string };

const menu: Array<{name:Section;icon:typeof LayoutDashboard}> = [
  {name:'Dashboard',icon:LayoutDashboard},{name:'AI Image',icon:ImageIcon},{name:'Image to Video',icon:Video},
  {name:'Text to Video',icon:Film},{name:'AI Video Editor',icon:Clapperboard},{name:'AI Voice / TTS',icon:Mic2},
  {name:'Prompt Enhancer',icon:Wand2},{name:'AI Storyboard',icon:FileText},{name:'Auto Subtitle',icon:Captions},
  {name:'Background Music',icon:AudioLines},{name:'Face / Identity Lock',icon:Sparkles},
];
const styles=['Educational','Realistic','Cinematic','Documentary','Anime','3D','Corporate'];
const projectDurations=[10,20,30,60,180,300];
const clipDurations=[5,10,15];
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));

export default function VideoStudio(){
  const [section,setSection]=useState<Section>('Dashboard');
  const [drawer,setDrawer]=useState(false);
  const [prompt,setPrompt]=useState('Buat video pembelajaran bilangan bulat untuk kelas VII, guru menjelaskan konsep di kelas dengan visual menarik dan gerakan kamera natural.');
  const [projectDuration,setProjectDuration]=useState(60);
  const [clipDuration,setClipDuration]=useState(10);
  const [ratio,setRatio]=useState<AspectRatio>('16:9');
  const [resolution,setResolution]=useState('1080p');
  const [style,setStyle]=useState('Educational');
  const [engine,setEngine]=useState<VideoEngine>('FAL_AI');
  const [character,setCharacter]=useState('Guru Indonesia profesional, ramah, berpakaian sopan, identitas visual konsisten sepanjang video.');
  const [scenes,setScenes]=useState<Scene[]>([]);
  const [videoUrl,setVideoUrl]=useState('');
  const [status,setStatus]=useState('PRO siap digunakan');
  const [loading,setLoading]=useState(false);
  const [providerStatus,setProviderStatus]=useState<ProviderStatus|null>(null);
  const [queue,setQueue]=useState<QueueResult[]>([]);
  const [mergeJob,setMergeJob]=useState<QueueJob|null>(null);

  const completed=queue.filter(x=>x.status==='COMPLETED'&&x.videoUrl).length;
  const failed=queue.filter(x=>x.status==='FAILED').length;
  const progress=queue.length?Math.round((completed/queue.length)*100):0;
  const total=useMemo(()=>scenes.reduce((sum,scene)=>sum+scene.duration,0),[scenes]);
  const generatedClip=useMemo(()=>scenes[0]?.duration||0,[scenes]);

  async function checkProviders(){
    try{const r=await fetch('/api/provider-status',{cache:'no-store'});if(!r.ok)throw new Error();setProviderStatus(await r.json());}catch{setProviderStatus(null);}
  }
  useEffect(()=>{checkProviders();},[]);

  function go(next:Section){setSection(next);setDrawer(false);setStatus(`${next} workspace dibuka`);requestAnimationFrame(()=>document.getElementById('studio-workspace')?.scrollIntoView({behavior:'smooth',block:'start'}));}

  async function storyboard(){
    setLoading(true);setStatus('Menyusun storyboard PRO…');
    try{const r=await fetch('/api/storyboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,duration:projectDuration,character})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Storyboard gagal.');setScenes(j.scenes||[]);setSection('AI Storyboard');setStatus(`${j.scenes?.length||0} scene storyboard siap untuk ${projectDuration}s`);}catch(e){setStatus(e instanceof Error?e.message:'Storyboard gagal.');}finally{setLoading(false);}
  }

  async function pollJobs(jobs:QueueJob[]):Promise<QueueResult[]>{
    for(let attempt=0;attempt<180;attempt++){
      const r=await fetch('/api/video/project/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobs:jobs.map(j=>({id:j.id,requestId:j.requestId,model:'fal-ai/wan/v2.7/text-to-video'}))})});
      const j=await r.json();if(!r.ok)throw new Error(j.error||'Status queue gagal.');
      const results=(j.jobs||[]) as QueueResult[];setQueue(results);
      const done=results.filter(x=>x.status==='COMPLETED'&&x.videoUrl).length;
      const bad=results.filter(x=>x.status==='FAILED').length;
      setStatus(bad?`Render ${done}/${jobs.length} selesai · ${bad} gagal`:`Render PRO ${done}/${jobs.length} scene selesai…`);
      if(bad)return results;
      if(done===jobs.length)return results;
      await sleep(4000);
    }
    throw new Error('Render terlalu lama. Job tetap berada di queue Fal AI; coba Refresh/poll lagi.');
  }

  async function pollMerge(job:QueueJob){
    for(let attempt=0;attempt<180;attempt++){
      const r=await fetch('/api/video/project/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobs:[{id:'merge',requestId:job.requestId,model:'fal-ai/ffmpeg-api/merge-videos'}]})});
      const j=await r.json();if(!r.ok)throw new Error(j.error||'Status merge gagal.');
      const result=(j.jobs?.[0]) as QueueResult|undefined;
      if(result?.status==='FAILED')throw new Error(result.error||'Merge video gagal.');
      if(result?.status==='COMPLETED'&&result.videoUrl)return result.videoUrl;
      setStatus(`Menggabungkan ${queue.length} clip menjadi video final…`);await sleep(4000);
    }
    throw new Error('Proses merge terlalu lama.');
  }

  async function generateProject(){
    setLoading(true);setVideoUrl('');setQueue([]);setMergeJob(null);setStatus('Menyiapkan project video PRO…');
    try{
      if(engine!=='FAL_AI')throw new Error('Long-form PRO saat ini menggunakan FAL AI Wan 2.7. Pilih FAL AI · WAN 2.7.');
      if(providerStatus && !providerStatus.providers.FAL_AI.configured)throw new Error('FAL_KEY belum dikonfigurasi di Vercel. Tambahkan secret FAL_KEY lalu redeploy.');
      const r=await fetch('/api/video/project',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,duration:projectDuration,aspectRatio:ratio,style,resolution,characterDescription:character})});
      const j=await r.json();if(!r.ok)throw new Error(j.error||'Project video gagal dikirim.');
      setScenes(j.scenes||[]);
      const jobs=(j.jobs||[]) as QueueJob[];setQueue(jobs.map(x=>({id:x.id,requestId:x.requestId,status:'IN_QUEUE'})));
      setStatus(`${jobs.length} scene masuk queue Fal AI. Rendering dimulai…`);
      const results=await pollJobs(jobs);
      const urls=results.map(x=>x.videoUrl).filter((x):x is string=>Boolean(x));
      if(results.some(x=>x.status==='FAILED')||urls.length!==jobs.length)throw new Error('Salah satu scene gagal dibuat. Project belum di-merge.');
      setStatus('Semua scene selesai. Mengirim ke FFmpeg merge…');
      const mr=await fetch('/api/video/project/merge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({videoUrls:urls,aspectRatio:ratio,resolution})});
      const mj=await mr.json();if(!mr.ok)throw new Error(mj.error||'Merge project gagal.');
      const merge:QueueJob={id:'merge',requestId:mj.requestId,duration:projectDuration,number:0,model:'fal-ai/ffmpeg-api/merge-videos'};setMergeJob(merge);
      const finalUrl=await pollMerge(merge);setVideoUrl(finalUrl);setStatus(`✓ Video final PRO ${projectDuration}s berhasil dibuat.`);
      requestAnimationFrame(()=>document.getElementById('video-result')?.scrollIntoView({behavior:'smooth',block:'center'}));
    }catch(e){setStatus(e instanceof Error?e.message:'Render PRO gagal.');}finally{setLoading(false);}
  }

  async function generateClip(){
    setLoading(true);setVideoUrl('');setStatus('Mengirim clip ke Fal AI Wan 2.7…');
    try{
      if(engine==='FAL_AI'&&providerStatus&&!providerStatus.providers.FAL_AI.configured)throw new Error('FAL_KEY belum dikonfigurasi di Vercel. Tambahkan secret FAL_KEY lalu redeploy.');
      const r=await fetch('/api/video',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'AI Video Clip',prompt,type:'Educational',language:'id',duration:clipDuration,aspectRatio:ratio,style,engine,resolution,characterDescription:character,subtitle:true})});
      const j=await r.json();if(!r.ok)throw new Error(j.error||'Render clip gagal.');const url=j.job?.videoUrl||'';setScenes(j.scenes||[]);setVideoUrl(url);setStatus(url?'✓ Clip PRO selesai dan siap dipreview.':(j.message||'Clip selesai tanpa URL.'));if(url)requestAnimationFrame(()=>document.getElementById('video-result')?.scrollIntoView({behavior:'smooth',block:'center'}));
    }catch(e){setStatus(e instanceof Error?e.message:'Render clip gagal.');}finally{setLoading(false);}
  }

  function enhance(){setPrompt(p=>`${p}. Cinematic composition, realistic physical motion, consistent identity, detailed classroom environment, natural camera movement, realistic lighting, anatomically correct hands and face, clean composition.`);go('Prompt Enhancer');}

  return <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#18112f,#080812_48%)] text-white">
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080812]/95 backdrop-blur-xl"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={()=>setDrawer(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden" aria-label="Buka menu"><Menu size={20}/></button><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Clapperboard size={20}/></div><div className="min-w-0"><div className="truncate font-black">AI WORLD <span className="text-violet-300">STUDIO X</span></div><div className="hidden text-xs text-white/40 sm:block">AI Video Generator PRO · By Ahmad Yurid Ardiansyah, S.Pd.</div></div></div><div className="hidden gap-2 sm:flex"><span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">PRO WORKSPACE</span><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">REAL AI</span></div></div></header>
    {drawer&&<div className="fixed inset-0 z-[100] lg:hidden"><button type="button" className="absolute inset-0 bg-black/70" onClick={()=>setDrawer(false)} aria-label="Tutup menu"/><aside className="relative z-[101] h-full w-[86vw] max-w-[340px] overflow-y-auto bg-[#0c0b17] p-4 shadow-2xl"><div className="mb-6 flex items-center justify-between"><b>PRO MENU</b><button type="button" onClick={()=>setDrawer(false)} className="rounded-xl border border-white/10 p-2"><X size={18}/></button></div><MenuList active={section} onSelect={go}/></aside></div>}
    <main className="mx-auto grid max-w-[1500px] gap-4 p-3 pb-24 sm:p-5 lg:grid-cols-[250px_minmax(0,1fr)_300px] lg:p-6 lg:pb-8"><aside className="glass hidden self-start rounded-3xl p-3 lg:sticky lg:top-24 lg:block"><MenuList active={section} onSelect={go}/></aside><section className="min-w-0 space-y-4">
      <div id="studio-workspace" className="glass scroll-mt-24 rounded-3xl p-4 sm:p-6"><div className="text-[11px] font-bold uppercase tracking-[.25em] text-violet-300">{section}</div><h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl"><span className="gradient-text">AI Video Generator PRO</span></h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">Generate nyata melalui Fal AI Wan 2.7. Long-form 10s–5m dibuat dari scene AI nyata lalu digabung otomatis. Tidak ada demo, mock, atau video contoh.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><button type="button" onClick={storyboard} disabled={loading} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black disabled:opacity-50"><FileText size={16} className="mr-2 inline"/>Buat Storyboard</button><button type="button" onClick={generateProject} disabled={loading} className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-3 text-sm font-black disabled:opacity-50"><Sparkles size={16} className="mr-2 inline"/>Generate Project PRO</button><button type="button" onClick={generateClip} disabled={loading} className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 disabled:opacity-50"><Film size={16} className="mr-2 inline"/>Generate Clip</button></div><div className="mt-5 grid gap-3 md:grid-cols-3"><Card label="ENGINE PRO"><select value={engine} onChange={e=>setEngine(e.target.value as VideoEngine)} className="mt-2 w-full bg-transparent text-sm outline-none"><option value="FAL_AI">FAL AI · WAN 2.7</option><option value="AUTO">AUTO · REAL AI</option><option value="VEO">VEO · PRO</option><option value="HUGGING_FACE">HUGGING FACE · PRO</option></select></Card><Card label="STYLE"><select value={style} onChange={e=>setStyle(e.target.value)} className="mt-2 w-full bg-transparent text-sm outline-none">{styles.map(x=><option key={x}>{x}</option>)}</select></Card><Card label="STATUS"><div className="mt-2 flex items-center gap-2 text-sm text-cyan-200"><i className={`h-2 w-2 rounded-full ${loading?'animate-pulse bg-amber-300':status.toLowerCase().includes('gagal')?'bg-rose-300':'bg-cyan-300'}`}/><span className="break-words">{status}</span></div></Card></div></div>
      <div className="glass rounded-3xl p-4 sm:p-5"><div className="flex items-center justify-between"><b>Provider Diagnostics</b><button type="button" onClick={checkProviders} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/65"><RefreshCw size={13} className="mr-1 inline"/>Refresh</button></div><div className="mt-3 grid gap-2 sm:grid-cols-3"><ProviderBadge name="FAL AI" ok={Boolean(providerStatus?.providers.FAL_AI.configured)}/><ProviderBadge name="VEO" ok={Boolean(providerStatus?.providers.VEO.configured)}/><ProviderBadge name="HUGGING FACE" ok={Boolean(providerStatus?.providers.HUGGING_FACE.configured)}/></div><p className="mt-3 text-xs leading-5 text-white/40">API key hanya dipakai server. Nilai secret tidak pernah dikirim ke browser.</p></div>
      <div className="glass rounded-3xl p-4 sm:p-5"><div className="flex items-center justify-between"><b>1. Ide / Prompt</b><span className="text-xs text-white/30">REAL AI</span></div><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={5} className="mt-3 min-h-[125px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 outline-none focus:border-violet-400/40"/><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={enhance} className="rounded-xl bg-violet-500/10 px-3 py-2 text-xs text-violet-200"><Wand2 size={14} className="mr-1 inline"/>Enhance Prompt</button><button type="button" onClick={()=>setPrompt('Video cinematic tentang guru mengajar di kelas, profesional, natural, inspiratif.')} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">Random Prompt</button><button type="button" onClick={()=>setPrompt('')} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">Clear</button></div></div>
      <div className="grid gap-4 xl:grid-cols-2"><div className="glass rounded-3xl p-4 sm:p-5"><b>2. Video Settings</b><div className="mt-4 space-y-4"><div><div className="mb-2 text-xs text-white/40">PROJECT TARGET</div><div className="flex flex-wrap gap-2">{projectDurations.map(d=><button type="button" key={d} onClick={()=>setProjectDuration(d)} className={`rounded-xl px-3 py-2 text-xs ${projectDuration===d?'bg-violet-500':'bg-white/5 text-white/55'}`}>{d<60?`${d}s`:`${d/60}m`}</button>)}</div><p className="mt-2 text-[11px] leading-5 text-white/35">Project PRO sekarang benar-benar membuat beberapa clip AI lalu merge menjadi satu MP4 final.</p></div><div><div className="mb-2 text-xs text-white/40">FAL CLIP DURATION</div><div className="flex flex-wrap gap-2">{clipDurations.map(d=><button type="button" key={d} onClick={()=>setClipDuration(d)} className={`rounded-xl px-3 py-2 text-xs ${clipDuration===d?'bg-cyan-500':'bg-white/5 text-white/55'}`}>{d}s</button>)}</div><p className="mt-2 text-[11px] text-white/35">Dipakai untuk Generate Clip cepat. Project memakai maksimum 15s per scene.</p></div><div><div className="mb-2 text-xs text-white/40">ASPECT RATIO</div><div className="grid grid-cols-3 gap-2">{(['9:16','16:9','1:1'] as AspectRatio[]).map(x=><button type="button" key={x} onClick={()=>setRatio(x)} className={`rounded-xl px-3 py-3 text-sm ${ratio===x?'bg-cyan-500/20 ring-1 ring-cyan-300/20':'bg-white/5 text-white/55'}`}>{x}</button>)}</div></div><div><div className="mb-2 text-xs text-white/40">RESOLUTION</div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={()=>setResolution('720p')} className={`rounded-xl px-3 py-2 text-xs ${resolution==='720p'?'bg-cyan-500/20 ring-1 ring-cyan-300/20':'bg-white/5 text-white/55'}`}>720p</button><button type="button" onClick={()=>setResolution('1080p')} className={`rounded-xl px-3 py-2 text-xs ${resolution==='1080p'?'bg-cyan-500/20 ring-1 ring-cyan-300/20':'bg-white/5 text-white/55'}`}>1080p</button></div></div><div><div className="mb-2 text-xs text-white/40">CHARACTER / IDENTITY BIBLE</div><textarea value={character} onChange={e=>setCharacter(e.target.value)} rows={3} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs outline-none"/></div></div></div><div className="glass rounded-3xl p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><b>3. Audio & Output</b><span className="text-xs text-cyan-300">REAL AI</span></div><div className="space-y-3"><div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4"><div className="flex items-center gap-2 font-semibold"><AudioLines size={17}/> Audio AI</div><p className="mt-2 text-xs leading-5 text-white/50">Wan 2.7 dapat menyediakan audio latar pada clip. Narasi guru/TTS adalah pipeline terpisah dan akan ditambahkan tanpa memalsukan hasil.</p></div><div className="rounded-2xl border border-white/10 bg-black/10 p-4"><div className="text-xs text-white/40">PROJECT RENDER</div><div className="mt-1 text-2xl font-black">{projectDuration}s</div><div className="mt-1 text-xs text-white/35">Scene storyboard: {scenes.length} · total: {total}s · clip contoh: {generatedClip||0}s</div></div></div></div></div></div>
      {(loading||queue.length>0||mergeJob)&&<div className="glass rounded-3xl p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><b>4. PRO Render Queue</b><span className="text-xs text-cyan-300">{completed}/{queue.length||0} selesai</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{width:`${progress}%`}}/></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl bg-white/5 p-3"><b>{queue.length}</b><div className="text-white/35">Scene</div></div><div className="rounded-xl bg-white/5 p-3"><b>{completed}</b><div className="text-white/35">Selesai</div></div><div className="rounded-xl bg-white/5 p-3"><b>{failed}</b><div className="text-white/35">Gagal</div></div></div>{mergeJob&&<div className="mt-3 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-3 text-xs text-cyan-100">✓ Semua scene selesai · sedang merge menjadi 1 MP4 final.</div>}</div>}
      {videoUrl&&<div id="video-result" className="glass rounded-3xl p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><b>5. Hasil Video PRO</b><div className="mt-1 text-xs text-cyan-300">Render nyata · Fal AI Wan 2.7 + FFmpeg Merge</div></div><a href={videoUrl} download="ai-world-studio-x-pro.mp4" className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black"><Download size={14} className="mr-1 inline"/>Download MP4</a></div><div className="overflow-hidden rounded-2xl border border-white/10 bg-black"><video src={videoUrl} controls playsInline preload="metadata" className="max-h-[70vh] w-full bg-black"/></div><p className="mt-3 text-[11px] text-white/35">MP4 final berasal dari hasil scene AI nyata yang digabung di server Fal AI.</p></div>}
      <div className="glass rounded-3xl p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><b>6. Storyboard & Scene Queue</b><span className="text-xs text-white/35">{scenes.length?`${scenes.length} scene · ${total}s`:'Belum dibuat'}</span></div>{scenes.length?<div className="space-y-3">{scenes.map((s,i)=><div key={s.id} className="rounded-2xl border border-white/10 bg-black/10 p-4"><div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-sm font-black text-violet-200">{i+1}</div><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><b className="break-words">{s.title}</b><span className="shrink-0 text-xs text-white/35">{s.duration}s</span></div><div className="mt-2 text-xs leading-5 text-white/45">{s.visualPrompt}</div></div></div></div>)}</div>:<div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/35">Belum ada scene. Tekan Buat Storyboard.</div>}</div>
    </section></main>
  </div>;
}

function MenuList({active,onSelect}:{active:Section;onSelect:(s:Section)=>void}){return <nav className="space-y-1">{menu.map(({name,icon:Icon})=><button key={name} type="button" onClick={()=>onSelect(name)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active===name?'bg-violet-500/15 text-violet-200':'text-white/55 hover:bg-white/5 hover:text-white'}`}><Icon size={17}/><span className="truncate">{name}</span></button>)}</nav>}
function Card({label,children}:{label:string;children:ReactNode}){return <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><div className="text-[10px] font-bold uppercase tracking-[.18em] text-white/35">{label}</div>{children}</div>}
function ProviderBadge({name,ok}:{name:string;ok:boolean}){return <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2"><div className="flex items-center gap-2 text-xs font-semibold"><i className={`h-2 w-2 rounded-full ${ok?'bg-emerald-300':'bg-rose-300'}`}/>{name}</div><div className="mt-1 text-[11px] text-white/40">{ok?'Configured':'Not configured'}</div></div>}
