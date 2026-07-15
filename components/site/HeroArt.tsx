'use client';
import { useRef } from 'react';

/**
 * Composición derecha del hero: eclipse de luz con anillo azul/violeta
 * y el arte del juego principal flotando encima, con reflejo en el suelo.
 */
export default function HeroArt({ cover, title }: { cover: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = box.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--rx', String(((e.clientY - r.top) / r.height - 0.5) * -8));
    el.style.setProperty('--ry', String(((e.clientX - r.left) / r.width - 0.5) * 10));
  };
  const onLeave = () => {
    const el = box.current; if (!el) return;
    el.style.setProperty('--rx', '0'); el.style.setProperty('--ry', '0');
  };

  return (
    <div ref={box} onPointerMove={onMove} onPointerLeave={onLeave} className="relative mx-auto w-full max-w-[400px] [perspective:1100px]">
      {/* Eclipse */}
      <div aria-hidden className="absolute left-1/2 top-1/2 h-[125%] w-[125%] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(79,140,255,0.16), transparent 68%)' }} />
        <div
          className="absolute inset-[6%] animate-[spin_46s_linear_infinite] rounded-full opacity-80 motion-reduce:animate-none"
          style={{
            background: 'conic-gradient(from 210deg, transparent 0deg, rgba(79,140,255,.9) 50deg, rgba(139,108,240,.85) 120deg, transparent 200deg, rgba(79,140,255,.35) 300deg, transparent 360deg)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
          }}
        />
        <div className="absolute inset-[9%] rounded-full bg-[#040610]/80" />
      </div>

      {/* Arte del juego */}
      <div
        className="hero-float relative will-change-transform"
        style={{ transform: 'rotateX(calc(var(--rx, 0) * 1deg)) rotateY(calc(var(--ry, 0) * 1deg))', transformStyle: 'preserve-3d' }}
      >
        <img
          src={cover} alt={`Arte de ${title}`}
          className="relative w-full rounded-2xl border border-white/10 shadow-glow"
        />
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Reflejo en el suelo mojado */}
      <div aria-hidden className="mt-2 h-24 overflow-hidden opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]">
        <img src={cover} alt="" className="w-full -scale-y-100 rounded-2xl blur-[3px]" />
      </div>
    </div>
  );
}
