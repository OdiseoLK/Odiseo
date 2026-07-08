'use client';
import { useEffect, useRef, useState } from 'react';

const SEQ = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

/**
 * Easter egg: código Konami (↑↑↓↓←→←→BA).
 * Las luces fallan y la entidad de El Velador se asoma un instante.
 */
type Phase = 'idle' | 'flicker1' | 'entity' | 'flicker2' | 'text';

export default function KonamiEgg() {
  const [phase, setPhase] = useState<Phase>('idle');
  const idx = useRef(0);
  const side = useRef<'left' | 'right'>('left');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const rumble = () => {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 38;
      const gain = ctx.createGain(); gain.gain.value = 0;
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start();
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
      setTimeout(() => { try { osc.stop(); ctx.close(); } catch {} }, 2600);
    } catch {}
  };

  const trigger = () => {
    if (phase !== 'idle') return;
    side.current = Math.random() < 0.5 ? 'left' : 'right';
    rumble();
    const seq: Array<[Phase, number]> = [['flicker1', 0], ['entity', 380], ['flicker2', 2100], ['text', 2500], ['idle', 4600]];
    for (const [ph, at] of seq) timers.current.push(setTimeout(() => setPhase(ph), at));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      idx.current = k === SEQ[idx.current] ? idx.current + 1 : k === SEQ[0] ? 1 : 0;
      if (idx.current === SEQ.length) { idx.current = 0; trigger(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
      {(phase === 'flicker1' || phase === 'flicker2') && <div className="egg-flicker absolute inset-0 bg-black" />}
      {(phase === 'entity' || phase === 'flicker2') && (
        <>
          <div className="absolute inset-0 bg-black/70" />
          <svg
            viewBox="0 0 200 600"
            className={`absolute bottom-0 h-[76vh] w-auto opacity-90 blur-[2px] ${side.current === 'left' ? 'left-[4%]' : 'right-[4%] -scale-x-100'}`}
          >
            <path d="M100 40 C74 40 60 66 60 96 C60 118 68 132 66 158 L52 340 C48 420 60 480 66 600 L86 600 L92 470 L104 470 L112 600 L134 600 C142 470 152 400 146 330 L136 156 C138 130 140 116 140 94 C140 64 126 40 100 40 Z" fill="#01030a" />
            <ellipse cx="86" cy="92" rx="5" ry="7" fill="#dfe8ff" opacity=".95" />
            <ellipse cx="116" cy="92" rx="5" ry="7" fill="#dfe8ff" opacity=".95" />
          </svg>
        </>
      )}
      {phase === 'text' && (
        <div className="absolute inset-0 grid place-items-center bg-black/85">
          <p className="font-mono text-sm uppercase tracking-[0.5em] text-[#ff5c5c]">No estás solo aquí</p>
        </div>
      )}
    </div>
  );
}
