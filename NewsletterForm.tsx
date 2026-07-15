'use client';
import { useEffect, useRef, useState } from 'react';
import { Flashlight, FlashlightOff } from 'lucide-react';

/**
 * Modo linterna: apaga las luces de la página y el cursor se convierte
 * en la linterna del velador. Se sale con el botón o con Escape.
 */
export default function FlashlightToggle() {
  const [on, setOn] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const pending = useRef(false);

  useEffect(() => {
    if (!on) return;
    pos.current = { x: window.innerWidth / 2, y: window.innerHeight * 0.4 };

    const paint = () => {
      pending.current = false;
      const el = overlay.current; if (!el) return;
      const { x, y } = pos.current;
      el.style.background = `radial-gradient(circle 200px at ${x}px ${y}px, rgba(6,10,20,0) 0%, rgba(3,5,10,0.55) 52%, rgba(2,4,9,0.97) 82%)`;
    };
    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!pending.current) { pending.current = true; requestAnimationFrame(paint); }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOn(false); };

    paint();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [on]);

  return (
    <>
      <button onClick={() => setOn(true)} className="btn-ghost" aria-pressed={on}>
        <Flashlight size={16} /> Modo linterna
      </button>
      {on && (
        <>
          <div ref={overlay} aria-hidden className="flashlight-breathe pointer-events-none fixed inset-0 z-[70]" />
          <button
            onClick={() => setOn(false)}
            className="glass fixed bottom-5 left-5 z-[80] inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:text-white"
          >
            <FlashlightOff size={16} /> Encender luces
          </button>
        </>
      )}
    </>
  );
}
