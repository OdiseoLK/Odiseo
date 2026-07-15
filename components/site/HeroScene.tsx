'use client';
import { useEffect, useRef } from 'react';

/**
 * Escenario cinematográfico del hero, por capas con parallax real:
 * montañas → ciudad en ruinas → niebla volumétrica → pilares en primer plano
 * → suelo mojado con reflejos. Iluminación azul eléctrico / violeta.
 */
export default function HeroScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    let pending = false, mx = 0, my = 0;
    const apply = () => {
      pending = false;
      const el = root.current; if (!el) return;
      el.style.setProperty('--hx', String(mx));
      el.style.setProperty('--hy', String(my));
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (!pending) { pending = true; requestAnimationFrame(apply); }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const layer = (d: number): React.CSSProperties => ({
    transform: `translate3d(calc(var(--hx, 0) * ${-d}px), calc(var(--hy, 0) * ${-d / 2.2}px), 0)`,
  });

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Resplandor central (degradados radiales, sin filtro) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(circle 40rem at 62% 38%, rgba(79,140,255,0.08), transparent 62%)',
            'radial-gradient(circle 26rem at 60% 42%, rgba(139,108,240,0.09), transparent 62%)',
          ].join(','),
        }}
      />

      {/* Montañas lejanas */}
      <div className="absolute inset-x-0 bottom-24 h-[38vh]" style={layer(5)}>
        <svg className="h-full w-full" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
          <path d="M0 320 L0 210 L170 130 L300 205 L460 105 L610 190 L780 120 L930 200 L1090 128 L1250 196 L1440 140 L1440 320 Z" fill="#070c19" />
          <path d="M430 125 L460 105 L495 128 Z" fill="#111a30" opacity=".8" />
        </svg>
      </div>

      {/* Ciudad en ruinas */}
      <div className="absolute inset-x-0 bottom-[5.5rem] h-[30vh]" style={layer(11)}>
        <svg className="h-full w-full" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice">
          <g fill="#0a1020">
            <path d="M40 260 L40 130 L78 118 L86 60 L102 118 L128 128 L128 260 Z" />
            <rect x="170" y="112" width="70" height="148" />
            <path d="M240 112 L240 96 L268 112 Z" fill="#0c1428" />
            <path d="M300 260 L300 76 L318 60 L330 92 L356 70 L372 96 L372 260 Z" />
            <rect x="430" y="140" width="86" height="120" />
            <path d="M516 140 L560 118 L560 260 L516 260 Z" />
            <path d="M640 260 L640 54 L664 44 L668 20 L680 46 L706 58 L706 260 Z" />
            <rect x="770" y="120" width="60" height="140" />
            <path d="M830 120 L830 100 L872 84 L872 260 L830 260 Z" />
            <path d="M950 260 L950 92 L978 78 L1002 108 L1002 260 Z" />
            <rect x="1070" y="132" width="92" height="128" />
            <path d="M1162 132 L1198 96 L1210 132 Z" fill="#0c1428" />
            <path d="M1270 260 L1270 108 L1296 88 L1290 60 L1310 84 L1338 104 L1338 260 Z" />
          </g>
          <line x1="668" y1="20" x2="668" y2="6" stroke="#0e1526" strokeWidth="3" />
          <circle className="intro-blink" cx="668" cy="4" r="2.6" fill="#ff5c5c" />
          <g fill="#f5c26b">
            <rect x="184" y="150" width="6" height="8" opacity=".5" /><rect x="214" y="188" width="6" height="8" opacity=".35" />
            <rect x="448" y="168" width="6" height="8" opacity=".45" /><rect x="654" y="120" width="6" height="8" opacity=".4" />
            <rect x="786" y="150" width="6" height="8" opacity=".3" /><rect x="1092" y="164" width="6" height="8" opacity=".45" />
          </g>
          <g fill="#9cc3ff">
            <rect x="320" y="130" width="6" height="8" opacity=".35" /><rect x="964" y="130" width="6" height="8" opacity=".3" />
          </g>
        </svg>
      </div>

      {/* Niebla volumétrica (radial-gradient: se desplaza sin repintar desenfoques) */}
      <div className="fog-a absolute inset-x-0 bottom-24 h-48" style={{ backgroundImage: 'radial-gradient(ellipse 60% 100% at 22% 60%, rgba(127,156,201,0.10), transparent 70%)' }} />
      <div className="fog-b absolute inset-x-0 bottom-16 h-52" style={{ backgroundImage: 'radial-gradient(ellipse 55% 100% at 82% 55%, rgba(139,108,240,0.09), transparent 70%)' }} />
      <div className="fog-c absolute inset-x-0 bottom-32 h-40" style={{ backgroundImage: 'radial-gradient(ellipse 50% 100% at 48% 60%, rgba(79,140,255,0.07), transparent 70%)' }} />

      {/* Suelo reflectante (mojado) */}
      <div className="absolute inset-x-0 bottom-0 h-28">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a101f] via-[#070b16] to-ink" />
        {/* reflejo de la ciudad */}
        <div className="absolute inset-x-0 top-px h-24 overflow-hidden opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" style={layer(11)}>
          <svg className="h-[200%] w-full -scale-y-100 blur-[5px]" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice">
            <g fill="#16213c">
              <path d="M40 260 L40 130 L128 128 L128 260 Z" /><rect x="170" y="112" width="70" height="148" />
              <path d="M300 260 L300 76 L372 96 L372 260 Z" /><rect x="430" y="140" width="130" height="120" />
              <path d="M640 260 L640 54 L706 58 L706 260 Z" /><rect x="770" y="120" width="102" height="140" />
              <path d="M950 260 L950 92 L1002 108 L1002 260 Z" /><rect x="1070" y="132" width="92" height="128" />
              <path d="M1270 260 L1270 108 L1338 104 L1338 260 Z" />
            </g>
          </svg>
        </div>
        {/* brillo del eclipse sobre el agua */}
        <div className="absolute left-[62%] top-2 h-16 w-72 -translate-x-1/2" style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(79,140,255,0.22), transparent 70%)' }} />
        <div className="sheen absolute left-0 top-6 h-px w-56 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      {/* Pilares en primer plano */}
      <div className="absolute bottom-0 left-0 hidden h-[62vh] w-[26vw] max-w-[340px] md:block" style={layer(30)}>
        <svg className="h-full w-full" viewBox="0 0 300 620" preserveAspectRatio="xMinYMax slice">
          <path d="M-20 620 L-20 150 L40 90 L86 140 L74 300 L108 340 L96 620 Z" fill="#03060c" />
          <path d="M40 90 L86 140 L74 300 L108 340" fill="none" stroke="url(#rimL)" strokeWidth="2" opacity=".8" />
          <path d="M120 620 L128 380 L168 340 L196 400 L188 620 Z" fill="#04070f" />
          <path d="M168 340 L196 400" fill="none" stroke="#4F8CFF" strokeOpacity=".35" strokeWidth="1.6" />
          <defs>
            <linearGradient id="rimL" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4F8CFF" stopOpacity=".7" />
              <stop offset="1" stopColor="#8b6cf0" stopOpacity=".2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 hidden h-[46vh] w-[20vw] max-w-[260px] md:block" style={layer(36)}>
        <svg className="h-full w-full" viewBox="0 0 240 460" preserveAspectRatio="xMaxYMax slice">
          <path d="M260 460 L260 120 L196 70 L150 128 L166 260 L128 310 L142 460 Z" fill="#03060c" />
          <path d="M196 70 L150 128 L166 260" fill="none" stroke="url(#rimR)" strokeWidth="2" opacity=".75" />
          <path d="M96 460 L104 340 L64 300 L40 356 L52 460 Z" fill="#04070f" />
          <defs>
            <linearGradient id="rimR" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8b6cf0" stopOpacity=".7" />
              <stop offset="1" stopColor="#4F8CFF" stopOpacity=".2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
