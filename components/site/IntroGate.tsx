'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMusic } from './MusicProvider';
import { Building2, School, Volume2, VolumeX } from 'lucide-react';


type LayerFn = (depth: number) => React.CSSProperties | undefined;


/**
 * Portada cinematográfica del estudio con dos escenas que se alternan:
 * la escuela nocturna de "El Velador" y una ciudad oscura vista desde una azotea.
 * Parallax por capas, ambiente sonoro WebAudio y botón de entrada.
 */
export default function IntroGate({ gameTitle, phrase }: { gameTitle: string; phrase: string }) {
  const [show, setShow] = useState(true);
  const { status: musicStatus, toggle: toggleSound } = useMusic();
  const sound = musicStatus === 'playing';
  const [scene, setScene] = useState<0 | 1>(0); // 0 = escuela, 1 = ciudad
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try { if (sessionStorage.getItem('odiseo-intro') === '1') setShow(false); } catch {}
  }, []);

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = 'hidden';
    btnRef.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  // Parallax con el cursor
  useEffect(() => {
    if (!show || reduced) return;
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current; if (!el) return;
      el.style.setProperty('--px', String(e.clientX / window.innerWidth - 0.5));
      el.style.setProperty('--py', String(e.clientY / window.innerHeight - 0.5));
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [show, reduced]);

  // Las escenas se alternan solas cada 15 s (cambiar manualmente reinicia el reloj)
  useEffect(() => {
    if (!show || reduced) return;
    const t = setInterval(() => setScene((s) => (s === 0 ? 1 : 0)), 15000);
    return () => clearInterval(t);
  }, [show, reduced, scene]);

  const enter = () => {
    try { sessionStorage.setItem('odiseo-intro', '1'); } catch {}
    setShow(false); // la música continúa dentro del sitio
  };

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === 'Escape') enter(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const layer: LayerFn = (depth) =>
    reduced ? undefined : { transform: `translate3d(calc(var(--px, 0) * ${-depth}px), calc(var(--py, 0) * ${-depth / 2}px), 0)` };

  const sceneCls = (active: boolean) =>
    `absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro" role="dialog" aria-label="Portada del estudio Odiseo"
          className="fixed inset-0 z-[100] overflow-hidden bg-[#04060d]"
          exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <div ref={wrapRef} className="absolute inset-0">
            {/* Cielo y astros (compartidos por ambas escenas) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#05070f] via-[#070b18] to-[#0a0f1e]" />
            <div className="intro-pan-1 absolute inset-0" style={layer(8)}>
              <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
                <defs>
                  <radialGradient id="moonGlow" cx=".5" cy=".5" r=".5">
                    <stop offset="0" stopColor="#cfe0ff" stopOpacity=".5" />
                    <stop offset="1" stopColor="#cfe0ff" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {Array.from({ length: 70 }, (_, i) => (
                  <circle key={i} className={i % 3 === 0 ? 'intro-twinkle' : i % 3 === 1 ? 'intro-twinkle-b' : ''}
                    cx={(i * 173) % 1200} cy={((i * 97) % 360) + 12} r={i % 5 === 0 ? 1.6 : 1} fill="#dbe7ff" opacity=".7" />
                ))}
                <circle cx="930" cy="150" r="120" fill="url(#moonGlow)" />
                <circle cx="930" cy="150" r="42" fill="#e8efff" />
                <circle cx="916" cy="140" r="7" fill="#c9d6f2" opacity=".7" />
                <circle cx="944" cy="162" r="5" fill="#c9d6f2" opacity=".6" />
              </svg>
            </div>

            {/* Escena A: la escuela de El Velador */}
            <div className={sceneCls(scene === 0)} aria-hidden={scene !== 0}>
              <SchoolScene layer={layer} />
            </div>

            {/* Escena B: ciudad oscura desde la azotea */}
            <div className={sceneCls(scene === 1)} aria-hidden={scene !== 1}>
              <CityScene layer={layer} />
            </div>

            {/* Viñeta */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(4,6,13,.88)_100%)]" />
          </div>

          {/* Controles: sonido y cambio de escena */}
          <div className="absolute right-5 top-5 z-30 flex flex-col gap-2">
            <button
              onClick={toggleSound} aria-pressed={sound}
              aria-label={sound ? 'Silenciar la música' : 'Reproducir la música del estudio'}
              className="glass rounded-full p-3 text-zinc-300 transition hover:text-white"
            >
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              onClick={() => setScene((s) => (s === 0 ? 1 : 0))}
              aria-label={scene === 0 ? 'Cambiar a la escena de la ciudad' : 'Cambiar a la escena de la escuela'}
              title="Cambiar escena"
              className="glass rounded-full p-3 text-zinc-300 transition hover:text-white"
            >
              {scene === 0 ? <Building2 size={18} /> : <School size={18} />}
            </button>
          </div>

          {/* Contenido central */}
          <div className="pointer-events-none relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
            <motion.img
              src="/logo.svg" alt="" width={64} height={64} className="mb-6 h-16 w-16"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}
            />
            <motion.p className="eyebrow mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.8 }}>
              Odiseo · Estudio independiente
            </motion.p>
            <motion.h1
              className="font-display text-5xl font-extrabold tracking-tight text-white md:text-7xl"
              style={{ textShadow: '0 0 46px rgba(79,140,255,.45)' }}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9 }}
            >
              {gameTitle}
            </motion.h1>
            <motion.p
              className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300 md:text-base"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.9 }}
            >
              {phrase}
            </motion.p>
            <motion.button
              ref={btnRef} onClick={enter}
              className="pointer-events-auto mt-10 rounded-2xl bg-electric px-10 py-4 text-base font-bold text-ink shadow-glow transition hover:scale-[1.03] hover:bg-[#6ea1ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.8 }}
            >
              Entrar al estudio
            </motion.button>
            <motion.p
              className="mt-6 text-[11px] uppercase tracking-[0.3em] text-zinc-600"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}
            >
              Desarrollado por Odiseo
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Escena A: escuela nocturna ---------- */
function SchoolScene({ layer }: { layer: LayerFn }) {
  const windows = Array.from({ length: 20 }, (_, i) => ({
    x: 210 + (i % 10) * 62, y: i < 10 ? 452 : 524, lit: i === 3 || i === 18, flicker: i === 12,
  }));
  return (
    <>
      {/* Montañas de Orizaba con luces de pueblo */}
      <div className="intro-pan-1 absolute inset-0" style={layer(10)}>
        <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d="M0 560 L150 470 L260 540 L420 420 L540 520 L700 470 L820 545 L1000 480 L1200 560 L1200 800 L0 800 Z" fill="#0a1020" />
          <path d="M330 470 L420 420 L505 475 Z" fill="#141d33" opacity=".9" />
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={60 + ((i * 43) % 1100)} cy={575 + ((i * 13) % 26)} r="1.4" fill="#f5c26b" opacity={0.25 + (i % 3) * 0.18} />
          ))}
        </svg>
      </div>
      <div className="intro-pan-2 absolute inset-0" style={layer(20)}>
        <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <rect x="170" y="420" width="860" height="230" fill="#080d1a" stroke="#1b2742" strokeWidth="1.5" />
          <rect x="170" y="404" width="860" height="16" fill="#0c1224" />
          {windows.map((w, i) => (
            <rect key={i} x={w.x} y={w.y} width="34" height="42" rx="2"
              className={w.flicker ? 'intro-flicker' : undefined}
              fill={w.lit || w.flicker ? '#f5c26b' : '#0b1322'}
              opacity={w.lit ? 0.85 : w.flicker ? 0.8 : 1}
              stroke="#1b2742" strokeWidth="1" />
          ))}
          <rect x="565" y="500" width="86" height="150" fill="#0c1327" stroke="#1b2742" strokeWidth="1.5" />
          <path d="M565 500 q43 -34 86 0 Z" fill="#0c1327" stroke="#1b2742" strokeWidth="1.5" />
          <rect x="586" y="560" width="20" height="90" fill="#060a14" />
          <rect x="610" y="560" width="20" height="90" fill="#060a14" />
          <circle cx="608" cy="530" r="13" fill="#0a1020" stroke="#31405f" strokeWidth="1.5" />
          <line x1="608" y1="530" x2="608" y2="521" stroke="#8fa3c8" strokeWidth="1.6" />
          <line x1="608" y1="530" x2="616" y2="534" stroke="#8fa3c8" strokeWidth="1.2" />
          <line x1="128" y1="650" x2="128" y2="410" stroke="#182236" strokeWidth="3" />
          <circle cx="128" cy="406" r="3" fill="#31405f" />
          <g className="intro-beam">
            <polygon points="608,652 520,800 700,800" fill="#9cc3ff" opacity="0.09" />
            <polygon points="608,652 560,800 660,800" fill="#cfe4ff" opacity="0.08" />
          </g>
        </svg>
      </div>
      <div className="intro-pan-3 absolute inset-0" style={layer(36)}>
        <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <rect x="0" y="650" width="1200" height="150" fill="#04070f" />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={i * 41} y="612" width="5" height="46" fill="#060b16" />
          ))}
          <rect x="0" y="606" width="1200" height="7" fill="#060b16" />
          <path d="M60 660 C40 590 55 560 78 528 C96 560 116 596 96 660 Z" fill="#03060c" />
          <path d="M1120 660 C1096 580 1116 545 1142 512 C1162 552 1180 600 1158 660 Z" fill="#03060c" />
        </svg>
        <div className="absolute bottom-6 left-[8%] h-40 w-[45%] rounded-full bg-[#7f9cc9]/10 blur-3xl" />
        <div className="animate-drift absolute bottom-10 right-[4%] h-32 w-[40%] rounded-full bg-[#8b6cf0]/10 blur-3xl" />
      </div>
    </>
  );
}

/* ---------- Escena B: ciudad oscura desde la azotea ---------- */
function CityScene({ layer }: { layer: LayerFn }) {
  // Silueta lejana de edificios
  const far = [
    { x: 0, w: 90, h: 130 }, { x: 100, w: 70, h: 175 }, { x: 180, w: 110, h: 120 }, { x: 300, w: 80, h: 200 },
    { x: 392, w: 120, h: 145 }, { x: 525, w: 75, h: 185 }, { x: 610, w: 105, h: 125 }, { x: 728, w: 85, h: 205 },
    { x: 825, w: 115, h: 140 }, { x: 952, w: 80, h: 180 }, { x: 1044, w: 156, h: 120 },
  ];
  // Edificios principales con ventanas
  const mid = [
    { x: 60, w: 130, h: 260, cols: 4, rows: 8 }, { x: 250, w: 160, h: 330, cols: 5, rows: 10 },
    { x: 470, w: 120, h: 235, cols: 4, rows: 7 }, { x: 650, w: 175, h: 360, cols: 5, rows: 11 },
    { x: 890, w: 140, h: 285, cols: 4, rows: 9 }, { x: 1075, w: 115, h: 225, cols: 3, rows: 7 },
  ];
  return (
    <>
      <div className="intro-pan-1 absolute inset-0" style={layer(10)}>
        <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          {far.map((b, i) => (
            <rect key={i} x={b.x} y={640 - b.h} width={b.w} height={b.h} fill="#0a1020" />
          ))}
          <line x1="340" y1="440" x2="340" y2="405" stroke="#0e1526" strokeWidth="3" />
          <circle className="intro-blink" cx="340" cy="402" r="3" fill="#ff5c5c" />
          <line x1="768" y1="435" x2="768" y2="392" stroke="#0e1526" strokeWidth="3" />
          <circle className="intro-blink-b" cx="768" cy="389" r="3" fill="#ff5c5c" />
        </svg>
      </div>
      <div className="intro-pan-2 absolute inset-0" style={layer(20)}>
        <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <filter id="neon" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {mid.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={690 - b.h} width={b.w} height={b.h} fill="#080d1a" stroke="#1b2742" strokeWidth="1.2" />
              {Array.from({ length: b.cols * b.rows }, (_, k) => {
                const c = k % b.cols, r = Math.floor(k / b.cols);
                const wx = b.x + 12 + c * ((b.w - 24) / b.cols);
                const wy = 690 - b.h + 16 + r * ((b.h - 30) / b.rows);
                const seed = (i * 31 + k * 17) % 13;
                const lit = seed < 2; const blue = seed === 4;
                return (
                  <rect key={k} x={wx} y={wy} width={(b.w - 24) / b.cols - 8} height={(b.h - 30) / b.rows - 8} rx="1"
                    fill={lit ? '#f5c26b' : blue ? '#9cc3ff' : '#0b1322'} opacity={lit ? 0.75 : blue ? 0.5 : 1} />
                );
              })}
            </g>
          ))}
          {/* letrero neón del estudio */}
          <g filter="url(#neon)">
            <rect x="672" y="352" width="132" height="34" rx="6" fill="none" stroke="#8b6cf0" strokeWidth="2" opacity=".9" />
            <text x="738" y="376" textAnchor="middle" fontFamily="Sora, Arial" fontSize="20" fontWeight="700" fill="#b79bff" letterSpacing="6">ODISEO</text>
          </g>
          {/* cables cruzando */}
          <path d="M0 300 C 300 360, 700 340, 1200 290" stroke="#060b16" strokeWidth="2.5" fill="none" />
          <path d="M0 320 C 350 380, 750 365, 1200 315" stroke="#060b16" strokeWidth="1.8" fill="none" />
        </svg>
      </div>
      <div className="intro-pan-3 absolute inset-0" style={layer(36)}>
        <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          {/* borde de la azotea en primer plano */}
          <rect x="0" y="700" width="1200" height="100" fill="#04070f" />
          <rect x="0" y="688" width="1200" height="14" fill="#060b16" />
          {Array.from({ length: 34 }, (_, i) => (
            <rect key={i} x={12 + i * 36} y="652" width="4" height="38" fill="#060b16" />
          ))}
          <rect x="0" y="648" width="1200" height="6" fill="#060b16" />
          {/* tinaco */}
          <g>
            <rect x="1010" y="596" width="96" height="72" rx="8" fill="#05080f" stroke="#101827" strokeWidth="1.5" />
            <ellipse cx="1058" cy="596" rx="48" ry="12" fill="#0a1020" stroke="#101827" strokeWidth="1.5" />
            <rect x="1022" y="668" width="10" height="26" fill="#05080f" />
            <rect x="1074" y="668" width="10" height="26" fill="#05080f" />
          </g>
          {/* maceta */}
          <path d="M120 700 l36 0 -6 -28 -24 0 Z" fill="#05080f" />
          <path d="M138 672 C 126 650 132 636 138 626 C 146 638 152 652 138 672 Z" fill="#03060c" />
        </svg>
        <div className="absolute bottom-8 left-[10%] h-36 w-[42%] rounded-full bg-[#f5c26b]/[0.07] blur-3xl" />
        <div className="animate-drift absolute bottom-12 right-[6%] h-32 w-[38%] rounded-full bg-[#4F8CFF]/10 blur-3xl" />
      </div>
    </>
  );
}
