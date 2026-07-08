'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

type YTPlayer = {
  playVideo: () => void; pauseVideo: () => void; stopVideo: () => void; destroy: () => void;
  mute: () => void; unMute: () => void; isMuted: () => boolean;
  setVolume: (v: number) => void; getPlayerState: () => number;
};
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement | string, cfg: unknown) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const DEFAULT_VIDEO_ID = '_AAdae7diOU'; // "I Really Want To Stay At Your House" (cover)

/** Extrae el ID de cualquier formato de link de YouTube (o acepta el ID directo). */
function extractYouTubeId(input?: string): string | null {
  if (!input) return null;
  const v = input.trim();
  const m = v.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (m) return m[1];
  if (/^[\w-]{10,12}$/.test(v)) return v;
  return null;
}

const isAudioFile = (v: string) => /\.(mp3|ogg|wav|m4a)(\?.*)?$/i.test(v.trim());

/** Interpreta el ajuste: lista separada por comas/saltos → pista(s) de audio o playlist de YouTube. */
function parseMusicSetting(input?: string): { audio: string[]; ytIds: string[] } {
  const tokens = (input ?? '').split(/[\n,]+/).map((t) => t.trim()).filter(Boolean);
  const audio = tokens.filter(isAudioFile);
  const ytIds = tokens.map(extractYouTubeId).filter(Boolean) as string[];
  return { audio, ytIds };
}

type MusicStatus = 'idle' | 'playing' | 'paused';
type SynthRig = { ctx: AudioContext; master: GainNode };

const MusicCtx = createContext<{ status: MusicStatus; toggle: () => void; autoStart: () => void }>({
  status: 'idle', toggle: () => {}, autoStart: () => {},
});
const setPref = (v: 'on' | 'off') => { try { localStorage.setItem('odiseo-music', v); } catch {} };
export const useMusic = () => useContext(MusicCtx);

/**
 * Música del estudio a nivel global: el reproductor (YouTube oculto, con
 * respaldo WebAudio) vive en el layout, así la canción arranca en la intro
 * y continúa sonando mientras se navega por todo el sitio.
 */
export default function MusicProvider({ children, videoUrl }: { children: React.ReactNode; videoUrl?: string }) {
  const { audio: audioTracks, ytIds } = parseMusicSetting(videoUrl);
  const videoId = ytIds[0] ?? DEFAULT_VIDEO_ID;
  const playlist = ytIds.length > 1 ? ytIds.join(',') : videoId;
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const audioIdx = useRef(0);
  const [status, setStatus] = useState<MusicStatus>('idle');
  const box = useRef<HTMLDivElement>(null);
  const yt = useRef<{ p: YTPlayer | null; ready: boolean; failed: boolean; pending: boolean }>({
    p: null, ready: false, failed: false, pending: false,
  });
  const synth = useRef<SynthRig | null>(null);

  // Cargar el reproductor oculto de YouTube una sola vez (si no hay MP3 propios)
  useEffect(() => {
    if (audioTracks.length > 0) return;
    let cancelled = false;

    const startYt = () => {
      const p = yt.current.p; if (!p) return;
      try { p.unMute(); p.setVolume(58); p.playVideo(); setStatus('playing'); } catch {}
    };

    const init = () => {
      if (cancelled || yt.current.p || !box.current || !window.YT?.Player) return;
      try {
        yt.current.p = new window.YT.Player(box.current, {
          width: '1', height: '1', videoId,
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0, loop: 1, playlist },
          events: {
            onReady: () => {
              yt.current.ready = true;
              if (yt.current.pending) { yt.current.pending = false; startYt(); }
            },
            onError: () => {
              yt.current.failed = true;
              if (yt.current.pending) { yt.current.pending = false; setStatus('idle'); }
            },
          },
        });
      } catch { yt.current.failed = true; }
    };

    if (window.YT?.Player) init();
    else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); init(); };
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api'; tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }
    return () => {
      cancelled = true;
      try { yt.current.p?.destroy(); } catch {}
      // eslint-disable-next-line react-hooks/exhaustive-deps
      yt.current = { p: null, ready: false, failed: false, pending: false };
    };
  }, []);

  // Respaldo: ambiente de viento + dron grave por WebAudio (si YouTube falla)
  const startSynth = () => {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0; master.connect(ctx.destination);
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
      const lowpass = ctx.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 320; lowpass.Q.value = 0.7;
      const windGain = ctx.createGain(); windGain.gain.value = 0.5;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      const lfoAmp = ctx.createGain(); lfoAmp.gain.value = 150;
      lfo.connect(lfoAmp); lfoAmp.connect(lowpass.frequency);
      noise.connect(lowpass); lowpass.connect(windGain); windGain.connect(master);
      const drone1 = ctx.createOscillator(); drone1.type = 'sine'; drone1.frequency.value = 55;
      const drone2 = ctx.createOscillator(); drone2.type = 'triangle'; drone2.frequency.value = 82.4;
      const droneGain = ctx.createGain(); droneGain.gain.value = 0.15;
      drone1.connect(droneGain); drone2.connect(droneGain); droneGain.connect(master);
      noise.start(); lfo.start(); drone1.start(); drone2.start();
      master.gain.linearRampToValueAtTime(0.11, ctx.currentTime + 1.2);
      synth.current = { ctx, master };
      setStatus('playing');
    } catch {}
  };

  const stopSynth = () => {
    const a = synth.current; synth.current = null;
    if (!a) return;
    try {
      a.master.gain.linearRampToValueAtTime(0.0001, a.ctx.currentTime + 0.4);
      setTimeout(() => { a.ctx.close().catch(() => {}); }, 500);
    } catch {}
  };

  const playAudioTrack = (i: number) => {
    const src = audioTracks[i % audioTracks.length];
    let el = audioEl.current;
    if (!el) {
      el = new Audio();
      el.volume = 0.6;
      el.addEventListener('ended', () => {
        audioIdx.current = (audioIdx.current + 1) % audioTracks.length;
        playAudioTrack(audioIdx.current);
      });
      audioEl.current = el;
    }
    if (!el.src.endsWith(src)) el.src = src;
    el.loop = audioTracks.length === 1;
    el.play().then(() => setStatus('playing')).catch(() => setStatus('idle'));
  };

  const play = () => {
    if (audioTracks.length > 0) { playAudioTrack(audioIdx.current); return; }
    if (yt.current.ready && !yt.current.failed) {
      const p = yt.current.p;
      try { p?.unMute(); p?.setVolume(58); p?.playVideo(); setStatus('playing'); return; } catch {}
    }
    if (!yt.current.failed) { yt.current.pending = true; setStatus('playing'); return; }
    startSynth();
  };

  const toggle = () => {
    if (status === 'playing') {
      if (audioEl.current && !audioEl.current.paused) { audioEl.current.pause(); setStatus('paused'); setPref('off'); return; }
      if (synth.current) { stopSynth(); setStatus('paused'); setPref('off'); return; }
      try { yt.current.p?.pauseVideo(); } catch {}
      yt.current.pending = false;
      setStatus('paused');
      setPref('off');
      return;
    }
    setPref('on');
    play();
  };

  /** Arranque automático (p. ej. al dar "Entrar al estudio"): respeta si el visitante la apagó antes. */
  const autoStart = () => {
    if (status !== 'idle') return;
    try { if (localStorage.getItem('odiseo-music') === 'off') return; } catch {}
    play();
  };

  useEffect(() => () => {
    stopSynth();
    try { audioEl.current?.pause(); } catch {}
    audioEl.current = null;
  }, []);

  return (
    <MusicCtx.Provider value={{ status, toggle, autoStart }}>
      <div ref={box} aria-hidden className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px overflow-hidden" />
      {children}
      {/* Control flotante dentro del sitio */}
      <button
        onClick={toggle}
        aria-pressed={status === 'playing'}
        aria-label={status === 'playing' ? 'Pausar la música del estudio' : 'Reproducir la música del estudio'}
        title="Música del estudio"
        className="glass fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full text-zinc-300 transition hover:scale-105 hover:text-white"
      >
        {status === 'playing' && <span aria-hidden className="absolute inset-0 animate-pulse-soft rounded-full bg-electric/15" />}
        {status === 'playing' ? <Volume2 size={18} className="relative" /> : <VolumeX size={18} className="relative" />}
      </button>
    </MusicCtx.Provider>
  );
}
