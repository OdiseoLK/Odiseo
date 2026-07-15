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
    let quality = 1;              // se reduce solo si el equipo va lento
    let frames = 0, lastCheck = performance.now();
    // Colores precalculados: evita crear cientos de strings por frame
    const PALETTE = Array.from({ length: 12 }, (_, i) =>
      `rgba(${180 + i * 5}, ${205 + i * 3}, 255, ${(0.16 + i * 0.07).toFixed(2)})`);
    const PALETTE_N = Array.from({ length: 12 }, (_, i) =>
      `rgba(${170 + i * 5}, ${160 + i * 4}, 255, ${(0.16 + i * 0.07).toFixed(2)})`);
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
      const dpr = Math.min(1.4, window.devicePixelRatio || 1);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor((w * h) / (dense ? 11000 : 15000)) * quality;
      stars = Array.from({ length: Math.max(24, count) }, () => spawn(false));
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
        const twinkle = animate ? 0.65 + 0.35 * Math.sin(t * 2 + s.tw) : 0.85;
        const level = Math.min(11, Math.max(0, Math.round(depth * twinkle * 11)));
        const r = s.base * (0.35 + 1.5 * depth);
        ctx.fillStyle = (s.hue === 262 ? PALETTE_N : PALETTE)[level];
        // fillRect es mucho más rápido que arc+fill; a este tamaño se ve igual
        ctx.fillRect(px - r, py - r, r * 2, r * 2);
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
      // Si el equipo no sostiene ~50fps, baja la densidad una sola vez
      if (quality === 1 && ++frames === 90) {
        const fps = 90000 / (performance.now() - lastCheck);
        if (fps < 45) { quality = 0.5; resize(); }
      }
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
      {/* Luces volumétricas: degradados radiales (sin filtro blur → coste casi nulo) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(79,140,255,0.13), transparent 60%)',
            'radial-gradient(circle 32rem at -6% 28%, rgba(79,140,255,0.10), transparent 65%)',
            'radial-gradient(circle 30rem at 106% 6%, rgba(139,108,240,0.10), transparent 65%)',
            'radial-gradient(circle 26rem at 38% 108%, rgba(79,140,255,0.07), transparent 65%)',
          ].join(','),
        }}
      />
      {/* Estrellas 3D */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Niebla inferior */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
    </div>
  );
}
