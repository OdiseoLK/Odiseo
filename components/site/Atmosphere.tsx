'use client';
import { useEffect, useRef } from 'react';

/**
 * Fondo vivo del sitio con profundidad real:
 * — Campo de estrellas 3D (proyección con perspectiva y deriva lenta hacia la cámara)
 * — Cámara con inercia que sigue al cursor y parallax con el scroll
 * — Estrellas fugaces ocasionales, aurora giratoria, niebla volumétrica y grano fílmico
 * Respeta prefers-reduced-motion y se pausa cuando la pestaña no está visible.
 */
export default function Atmosphere({ dense = false, fixed = false }: { dense?: boolean; fixed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let running = true;
    let w = 0, h = 0;
    const cam = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let scroll = 0;

    const Z_NEAR = 0.06, Z_FAR = 1, FOCAL = 0.22, SPREAD = 1.9;
    type Star = { x: number; y: number; z: number; tw: number; hue: number; base: number };
    let stars: Star[] = [];

    type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number };
    let meteor: Meteor | null = null;
    let nextMeteor = 480 + Math.random() * 500; // frames

    const spawn = (far: boolean): Star => ({
      x: (Math.random() * 2 - 1) * SPREAD,
      y: (Math.random() * 2 - 1) * SPREAD,
      z: far ? Z_FAR - Math.random() * 0.15 : Z_NEAR + Math.random() * (Z_FAR - Z_NEAR),
      tw: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.16 ? 262 : 218,
      base: 0.5 + Math.random() * 1.1,
    });

    const resize = () => {
      const dpr = Math.min(1.75, window.devicePixelRatio || 1);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor((w * h) / (dense ? 5200 : 7600));
      stars = Array.from({ length: count }, () => spawn(false));
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
    };
    const onScroll = () => { scroll = window.scrollY; };
    const onVis = () => {
      running = document.visibilityState === 'visible';
      if (running && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
    };

    let t = 0;
    const drawStars = (animate: boolean) => {
      const cx = w / 2, cy = h / 2 - scroll * 0.05;
      for (const s of stars) {
        if (animate) {
          s.z -= 0.00045; // deriva lenta hacia la cámara: sensación de profundidad
          if (s.z <= Z_NEAR) Object.assign(s, spawn(true));
        }
        const k = FOCAL / s.z;
        const px = cx + (s.x + cam.x * (0.5 + 0.6 / (s.z + 0.35))) * k * (w / 2) * 0.42;
        const py = cy + (s.y + cam.y * (0.35 + 0.45 / (s.z + 0.35))) * k * (h / 2) * 0.42;
        if (px < -12 || px > w + 12 || py < -12 || py > h + 12) continue;
        const depth = 1 - (s.z - Z_NEAR) / (Z_FAR - Z_NEAR); // 0 lejos → 1 cerca
        const twinkle = animate ? 0.6 + 0.4 * Math.sin(t * 2 + s.tw) : 0.85;
        const alpha = (0.14 + 0.6 * depth) * twinkle;
        const r = s.base * (0.35 + 1.5 * depth);
        if (depth > 0.78) {
          ctx.beginPath();
          ctx.fillStyle = `hsla(${s.hue}, 95%, 78%, ${alpha * 0.22})`;
          ctx.arc(px, py, r * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.fillStyle = `hsla(${s.hue}, 92%, ${64 + depth * 20}%, ${alpha})`;
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawMeteor = () => {
      if (!meteor) {
        if (--nextMeteor <= 0) {
          const fromLeft = Math.random() < 0.5;
          meteor = {
            x: fromLeft ? -40 : w * (0.3 + Math.random() * 0.6),
            y: h * (0.05 + Math.random() * 0.22),
            vx: (fromLeft ? 1 : 0.8) * (7 + Math.random() * 4),
            vy: 2.2 + Math.random() * 1.6,
            life: 0, max: 46 + Math.random() * 22,
          };
          nextMeteor = 520 + Math.random() * 640;
        }
        return;
      }
      meteor.life++;
      meteor.x += meteor.vx; meteor.y += meteor.vy;
      const p = meteor.life / meteor.max;
      const fade = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
      const tail = 90;
      const g = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * (tail / meteor.vx), meteor.y - meteor.vy * (tail / meteor.vx));
      g.addColorStop(0, `rgba(220,235,255,${0.85 * fade})`);
      g.addColorStop(1, 'rgba(220,235,255,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(meteor.x - (meteor.vx / meteor.vx) * tail, meteor.y - (meteor.vy / meteor.vx) * tail);
      ctx.stroke();
      if (meteor.life >= meteor.max || meteor.x > w + 60 || meteor.y > h + 60) meteor = null;
    };

    const draw = () => {
      if (!running) return;
      t += 0.008;
      cam.x += (target.x - cam.x) * 0.045;
      cam.y += (target.y - cam.y) * 0.045;
      ctx.clearRect(0, 0, w, h);
      drawStars(true);
      drawMeteor();
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    if (!reduce) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('visibilitychange', onVis);
      raf = requestAnimationFrame(draw);
    } else {
      drawStars(false);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [dense]);

  return (
    <div aria-hidden className={`${fixed ? 'fixed' : 'absolute'} pointer-events-none inset-0 z-0 overflow-hidden`}>
      {/* Degradado base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,140,255,0.14),transparent_60%)]" />
      {/* Aurora giratoria muy sutil */}
      <div
        className="absolute left-1/2 top-[-42%] h-[95rem] w-[95rem] -translate-x-1/2 animate-[spin_150s_linear_infinite] rounded-full opacity-[0.08] mix-blend-screen blur-3xl motion-reduce:animate-none"
        style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(79,140,255,0.55) 55deg, transparent 130deg, rgba(139,108,240,0.5) 215deg, transparent 300deg)' }}
      />
      {/* Luces volumétricas */}
      <div className="absolute -left-40 top-1/4 h-[34rem] w-[34rem] animate-drift rounded-full bg-electric/[0.10] blur-[130px] motion-reduce:animate-none" />
      <div className="absolute -right-52 top-8 h-[30rem] w-[30rem] animate-drift rounded-full bg-nebula/[0.10] blur-[130px] [animation-delay:-12s] motion-reduce:animate-none" />
      <div className="absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] animate-pulse-soft rounded-full bg-electric/[0.06] blur-[120px] motion-reduce:animate-none" />
      {/* Estrellas 3D */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Grano fílmico (evita bandas en los degradados) */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")` }}
      />
      {/* Niebla inferior */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
    </div>
  );
}
