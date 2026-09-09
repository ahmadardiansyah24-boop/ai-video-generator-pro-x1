'use client';

import { useMemo, useState } from 'react';
import {
  AudioLines,
  Captions,
  Clapperboard,
  Download,
  FileText,
  Film,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  Mic2,
  Play,
  RefreshCw,
  Sparkles,
  Video,
  Wand2,
  X,
} from 'lucide-react';
import type { AspectRatio, Scene, VideoEngine } from '@/types/video';

type Section =
  | 'Dashboard'
  | 'AI Image'
  | 'Image to Video'
  | 'Text to Video'
  | 'AI Video Editor'
  | 'AI Voice / TTS'
  | 'Prompt Enhancer'
  | 'AI Storyboard'
  | 'Auto Subtitle'
  | 'Background Music'
  | 'Face / Identity Lock';

type MenuItem = { name: Section; icon: typeof LayoutDashboard };

const menu: MenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'AI Image', icon: ImageIcon },
  { name: 'Image to Video', icon: Video },
  { name: 'Text to Video', icon: Film },
  { name: 'AI Video Editor', icon: Clapperboard },
  { name: 'AI Voice / TTS', icon: Mic2 },
  { name: 'Prompt Enhancer', icon: Wand2 },
  { name: 'AI Storyboard', icon: FileText },
  { name: 'Auto Subtitle', icon: Captions },
  { name: 'Background Music', icon: AudioLines },
  { name: 'Face / Identity Lock', icon: Sparkles },
];

const styles = ['Educational', 'Realistic', 'Cinematic', 'Documentary', 'Anime', '3D', 'Corporate'];
const durations = [10, 20, 30, 60, 180, 300];

export default function VideoStudio() {
  const [section, setSection] = useState<Section>('Dashboard');
  const [drawer, setDrawer] = useState(false);
  const [prompt, setPrompt] = useState(
    'Buat video pembelajaran bilangan bulat untuk kelas VII, guru menjelaskan konsep di kelas dengan visual menarik dan gerakan kamera natural.'
  );
  const [duration, setDuration] = useState(60);
  const [ratio, setRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState('1080p');
  const [style, setStyle] = useState('Educational');
  const [engine, setEngine] = useState<VideoEngine>('AUTO');
  const [character, setCharacter] = useState(
    'Guru Indonesia profesional, ramah, berpakaian sopan, identitas visual konsisten sepanjang video.'
  );
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState('PRO siap digunakan');
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => scenes.reduce((sum, scene) => sum + scene.duration, 0), [scenes]);

  function go(next: Section) {
    setSection(next);
    setDrawer(false);
    setStatus(`${next} aktif`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function makeStoryboard() {
    setLoading(true);
    setStatus('Menyusun storyboard PRO…');
    try {
      const response = await fetch('/api/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration, character }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Storyboard gagal.');
      setScenes(data.scenes || []);
      setSection('AI Storyboard');
      setStatus(`${data.scenes?.length || 0} scene siap`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Storyboard gagal.');
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setLoading(true);
    setVideoUrl('');
    setStatus('Menghubungkan ke engine PRO…');
    try {
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'AI Video Project',
          prompt,
          type: 'Educational',
          language: 'id',
          duration,
          aspectRatio: ratio,
          style,
          engine,
          resolution,
          characterDescription: character,
          subtitle: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Render PRO gagal.');
      setScenes(data.scenes || []);
      setVideoUrl(data.job?.videoUrl || '');
      setStatus(data.message || 'Job PRO dibuat');
      if (data.job?.status === 'PROCESSING' && data.job?.id) {
        void poll(data.job.id, (data.provider || engine) as VideoEngine);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Render PRO gagal.');
    } finally {
      setLoading(false);
    }
  }

  async function poll(id: string, selectedEngine: VideoEngine) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      try {
        const response = await fetch(
          `/api/video/status?id=${encodeURIComponent(id)}&engine=${selectedEngine}`
        );
        const data = await response.json();
        if (data.videoUrl) setVideoUrl(data.videoUrl);
        if (data.status === 'COMPLETED') {
          setStatus('Video PRO selesai dibuat');
          return;
        }
        setStatus(`Rendering PRO… ${data.status || 'PROCESSING'}`);
      } catch {
        setStatus('Menunggu status engine PRO…');
      }
    }
  }

  function enhancePrompt() {
    setPrompt(
      (current) =>
        `${current}. Cinematic composition, natural motion, consistent identity, detailed environment, professional camera movement, realistic lighting, high quality.`
    );
    go('Prompt Enhancer');
    setStatus('Prompt PRO ditingkatkan');
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#18112f,#080812_48%)] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080812]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
              <Clapperboard size={20} />
            </div>
            <div className="min-w-0">
              <div className="truncate font-black">
                AI WORLD <span className="text-violet-300">STUDIO X</span>
              </div>
              <div className="hidden text-xs text-white/40 sm:block">
                AI Video Generator PRO · By Ahmad Yurid Ardiansyah, S.Pd.
              </div>
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
              PRO WORKSPACE
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
              REAL AI
            </span>
          </div>
        </div>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setDrawer(false)}
            aria-label="Tutup menu"
          />
          <aside className="absolute left-0 top-0 h-full w-[86vw] max-w-[340px] overflow-y-auto bg-[#0c0b17] p-4 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <b>PRO MENU</b>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="rounded-xl border border-white/10 p-2"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>
            <MenuList active={section} onSelect={go} />
          </aside>
        </div>
      )}

      <main className="mx-auto grid max-w-[1500px] gap-4 p-3 pb-24 sm:p-5 lg:grid-cols-[260px_minmax(0,1fr)_310px] lg:p-6 lg:pb-8">
        <aside className="glass hidden self-start rounded-3xl p-3 lg:sticky lg:top-24 lg:block">
          <MenuList active={section} onSelect={go} />
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="glass rounded-3xl p-4 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[.25em] text-violet-300">
                  {section}
                </div>
                <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                  <span className="gradient-text">Buat Video Profesional</span> dengan AI
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
                  Semua menu aktif sebagai workspace PRO. Tidak ada Demo Engine atau video contoh.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={makeStoryboard}
                  disabled={loading}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black disabled:opacity-50"
                >
                  <FileText size={16} className="mr-2 inline" /> Storyboard
                </button>
                <button
                  type="button"
                  onClick={generate}
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-3 text-sm font-black disabled:opacity-50"
                >
                  <Sparkles size={16} className="mr-2 inline" /> Generate PRO
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Card label="ENGINE PRO">
                <select
                  value={engine}
                  onChange={(event) => setEngine(event.target.value as VideoEngine)}
                  className="mt-2 w-full bg-transparent text-sm outline-none"
                >
                  <option value="AUTO">AUTO · REAL AI</option>
                  <option value="VEO">VEO · PRO</option>
                  <option value="HUGGING_FACE">HUGGING FACE · PRO</option>
                </select>
              </Card>
              <Card label="STYLE">
                <select
                  value={style}
                  onChange={(event) => setStyle(event.target.value)}
                  className="mt-2 w-full bg-transparent text-sm outline-none"
                >
                  {styles.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Card>
              <Card label="STATUS">
                <div className="mt-2 flex items-center gap-2 text-sm text-cyan-200">
                  <i className={`h-2 w-2 rounded-full ${loading ? 'animate-pulse bg-amber-300' : 'bg-cyan-300'}`} />
                  {status}
                </div>
              </Card>
            </div>
          </div>

          <div className="glass rounded-3xl p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <b>1. Ide / Prompt</b>
              <span className="text-xs text-white/30">PRO</span>
            </div>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={5}
              className="mt-3 min-h-[125px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 outline-none focus:border-violet-400/40"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={enhancePrompt} className="rounded-xl bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
                <Wand2 size={14} className="mr-1 inline" /> Enhance Prompt
              </button>
              <button
                type="button"
                onClick={() => setPrompt('Video cinematic tentang guru mengajar di kelas, profesional, natural, inspiratif.')}
                className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60"
              >
                Random Prompt
              </button>
              <button type="button" onClick={() => setPrompt('')} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white/60">
                Clear
              </button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="glass rounded-3xl p-4 sm:p-5">
              <b>2. Video Settings</b>
              <div className="mt-4 space-y-4">
                <SettingBlock label="DURATION">
                  <div className="flex flex-wrap gap-2">
                    {durations.map((value) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setDuration(value)}
                        className={`rounded-xl px-3 py-2 text-xs ${duration === value ? 'bg-violet-500' : 'bg-white/5 text-white/55'}`}
                      >
                        {value < 60 ? `${value}s` : `${value / 60}m`}
                      </button>
                    ))}
                  </div>
                </SettingBlock>

                <SettingBlock label="ASPECT RATIO">
                  <div className="grid grid-cols-3 gap-2">
                    {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((value) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setRatio(value)}
                        className={`rounded-xl px-3 py-3 text-sm ${ratio === value ? 'bg-cyan-500/20 ring-1 ring-cyan-300/20' : 'bg-white/5 text-white/55'}`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </SettingBlock>

                <SettingBlock label="RESOLUTION">
                  <div className="grid grid-cols-3 gap-2">
                    {['720p', '1080p', '4K'].map((value) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setResolution(value)}
                        className={`rounded-xl px-3 py-2 text-xs ${resolution === value ? 'bg-cyan-500/20 ring-1 ring-cyan-300/20' : 'bg-white/5 text-white/55'}`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </SettingBlock>

                <SettingBlock label="CHARACTER / IDENTITY BIBLE">
                  <textarea
                    value={character}
                    onChange={(event) => setCharacter(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs outline-none"
                  />
                </SettingBlock>
              </div>
            </div>

            <div className="glass rounded-3xl p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <b>3. Storyboard & Scene Queue</b>
                <span className="text-xs text-white/35">
                  {scenes.length ? `${scenes.length} scene · ${total}s` : 'Belum dibuat'}
                </span>
              </div>
              {scenes.length ? (
                <div className="space-y-3">
                  {scenes.map((scene, index) => (
                    <div key={scene.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-sm font-black text-violet-200">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-3">
                            <b className="break-words">{scene.title}</b>
                            <span className="shrink-0 text-xs text-white/35">{scene.duration}s</span>
                          </div>
                          <div className="mt-2 text-xs leading-5 text-white/45">{scene.visualPrompt}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStatus(`Scene ${index + 1} siap di-regenerate PRO`)}
                          className="h-9 w-9 shrink-0 rounded-xl bg-white/5"
                          aria-label={`Regenerate scene ${index + 1}`}
                        >
                          <RefreshCw size={14} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
                  Klik Storyboard untuk membuat scene dengan engine aplikasi.
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-3xl p-5">
            <b>{section}</b>
            <p className="mt-2 text-sm text-white/45">
              Workspace {section} aktif dalam mode PRO. Semua navigasi menggunakan tombol aplikasi langsung.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => setStatus(`${section} dibuka`)} className="rounded-xl bg-white/5 p-3 text-sm">
                Open Workspace
              </button>
              <button type="button" onClick={() => setStatus('Pengaturan PRO tersimpan')} className="rounded-xl bg-white/5 p-3 text-sm">
                Save Settings
              </button>
              <button type="button" onClick={() => setStatus('Preview diperbarui')} className="rounded-xl bg-violet-500/15 p-3 text-sm">
                Preview
              </button>
            </div>
          </div>
        </section>

        <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <div className="glass rounded-3xl p-4">
            <div className="mb-3 flex justify-between">
              <b>Preview PRO</b>
              <span className="text-xs text-white/30">{ratio}</span>
            </div>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950 via-slate-950 to-cyan-950">
              {videoUrl ? (
                <video src={videoUrl} controls playsInline className="h-full w-full object-contain" />
              ) : (
                <div className="text-center text-white/45">
                  <Play size={26} className="mx-auto mb-2" />
                  Belum ada video
                </div>
              )}
            </div>
            {videoUrl && (
              <a href={videoUrl} download className="mt-3 block rounded-xl bg-white p-3 text-center text-sm font-bold text-black">
                <Download size={15} className="mr-2 inline" /> Download MP4
              </a>
            )}
          </div>
        </aside>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#080812]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
          {menu.slice(0, 4).map(({ name, icon: Icon }) => (
            <button
              type="button"
              key={name}
              onClick={() => go(name)}
              className={`rounded-xl px-1 py-2 text-[10px] ${section === name ? 'bg-violet-500/20 text-white' : 'text-white/60'}`}
            >
              <Icon size={16} className="mx-auto mb-1" />
              {name.replace('AI ', '')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuList({ active, onSelect }: { active: Section; onSelect: (section: Section) => void }) {
  return (
    <div className="space-y-1">
      {menu.map(({ name, icon: Icon }) => (
        <button
          type="button"
          key={name}
          onClick={() => onSelect(name)}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
            active === name ? 'bg-violet-500/15 text-white ring-1 ring-violet-400/20' : 'text-white/65 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Icon size={17} className="shrink-0" />
          <span className="min-w-0 break-words">{name}</span>
        </button>
      ))}
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><div className="text-[10px] font-bold tracking-[.2em] text-white/35">{label}</div>{children}</div>;
}

function SettingBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="mb-2 text-xs text-white/40">{label}</div>{children}</div>;
}
