import Link from 'next/link';
import { ArrowRight, Gamepad2 } from 'lucide-react';
import type { Game } from '@/lib/types';
import { GAME_STATUS_LABEL } from '@/lib/utils';
import Reveal from '@/components/ui/Reveal';

/** Franja protagonista del juego principal — tratamiento tipo ficha de tienda. */
export default function FeaturedGameBanner({ game }: { game: Game }) {
  const meta = [GAME_STATUS_LABEL[game.status], game.engine, game.release_estimate].filter(Boolean) as string[];
  return (
    <section className="container-site py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#080c16]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle 34rem at 84% 12%, rgba(79,140,255,0.10), transparent 65%), radial-gradient(circle 26rem at 4% 112%, rgba(139,108,240,0.08), transparent 65%)' }}
          />
          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_390px] lg:items-center">
            <div>
              <p className="eyebrow">
                <span className="mr-3 text-electric">01</span>Proyecto principal
              </p>
              <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">{game.title}</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-zinc-400">{game.tagline}</p>

              <div className="mt-6 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                {meta.map((m) => (
                  <span key={m} className="rounded-md border border-white/10 px-2.5 py-1">{m}</span>
                ))}
              </div>

              <div className="mt-8 max-w-md">
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  <span>Progreso total</span>
                  <span className="text-electric">{game.progress}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-electric transition-[width] duration-700" style={{ width: `${game.progress}%` }} />
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href={`/videojuegos/${game.slug}`} className="btn-primary">
                  <Gamepad2 size={16} /> Explorar la ficha
                </Link>
                <Link href="/devlogs" className="btn-ghost">
                  Ver devlogs <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <Link href={`/videojuegos/${game.slug}`} className="group relative hidden lg:block" aria-label={`Ver ficha de ${game.title}`}>
              <img
                src={game.cover_url} alt={`Arte de ${game.title}`}
                className="w-full rounded-2xl border border-white/10 transition duration-500 group-hover:scale-[1.015] group-hover:border-electric/40"
              />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
