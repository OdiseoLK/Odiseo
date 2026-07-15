'use client';
import { useEffect, useState } from 'react';
import { X, Zap } from 'lucide-react';

/** Banner "Ahora mismo": una línea editable desde Admin → Ajustes. Vacío = oculto. */
export default function NowBanner({ text }: { text: string }) {
  const [hidden, setHidden] = useState(true);
  const key = `odiseo-now:${text.slice(0, 60)}`;

  useEffect(() => {
    if (!text.trim()) return;
    try { setHidden(sessionStorage.getItem(key) === '1'); } catch { setHidden(false); }
  }, [key, text]);

  if (!text.trim() || hidden) return null;

  return (
    <div className="fixed inset-x-0 top-16 z-40 border-b border-electric/15 bg-[#070a12]">
      <div className="container-site flex items-center gap-3 py-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-electric/50 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-electric" />
        </span>
        <Zap size={13} className="shrink-0 text-electric" aria-hidden />
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-300">
          <span className="mr-2 hidden font-semibold uppercase tracking-[0.14em] text-electric sm:inline">Ahora mismo</span>
          {text}
        </p>
        <button
          onClick={() => { try { sessionStorage.setItem(key, '1'); } catch {} setHidden(true); }}
          aria-label="Ocultar aviso" className="shrink-0 rounded-md p-1 text-zinc-500 transition hover:bg-white/10 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
