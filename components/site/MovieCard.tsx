'use client';
import { useEffect, useState } from 'react';
import { Instagram, Play, X } from 'lucide-react';
import type { Movie } from '@/lib/types';
import StarRating from '@/components/ui/StarRating';
import { toEmbedUrl } from '@/lib/utils';

export default function MovieCard({ movie }: { movie: Movie }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const embed = movie.trailer_url ? toEmbedUrl(movie.trailer_url) : null;
  const src = embed?.includes('youtube.com/embed/') ? `${embed}?autoplay=1&rel=0` : embed;

  return (
    <article className="glass glass-hover group flex flex-col overflow-hidden rounded-2xl">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img src={movie.poster_url ?? '/covers/cine.svg'} alt={`Póster de ${movie.title}`} loading="lazy" onError={(e) => { e.currentTarget.src = '/covers/cine.svg'; }} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
        <span className="absolute right-3 top-3 rounded-lg bg-ink/70 px-2 py-1 font-mono text-[11px] text-zinc-300 backdrop-blur">{movie.duration} min</span>
        {movie.platform && (
          <span className="absolute left-3 top-3 rounded-lg bg-ink/70 px-2 py-1 text-[10px] font-semibold tracking-wide text-zinc-200 backdrop-blur">{movie.platform}</span>
        )}
        {movie.trailer_url && (
          <button
            onClick={() => setOpen(true)}
            aria-label={`Ver tráiler de ${movie.title}`}
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-ink/70 text-white shadow-glow backdrop-blur transition-transform group-hover:scale-105">
              <Play size={20} className="ml-0.5 fill-current" />
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-display text-base font-bold leading-tight text-white">{movie.title}</h3>
          <p className="mt-0.5 text-[11px] text-zinc-500">{movie.year} · {movie.genre} · {movie.director}</p>
        </div>
        <StarRating rating={movie.rating} />
        <p className="line-clamp-3 text-xs leading-relaxed text-zinc-400">{movie.review}</p>
        <div className="mt-auto flex gap-2 pt-1">
          {movie.trailer_url && (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-electric/40 bg-electric/10 px-3 py-2 text-xs font-semibold text-electric transition hover:bg-electric/20"
            >
              <Play size={13} /> Tráiler
            </button>
          )}
          {movie.instagram_url && (
            <a
              href={movie.instagram_url}
              target="_blank" rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-electric/50 hover:text-electric"
            >
              <Instagram size={13} /> Reseña
            </a>
          )}
        </div>
      </div>

      {open && src && (
        <div
          role="dialog" aria-modal="true" aria-label={`Tráiler de ${movie.title}`}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{movie.title} <span className="text-zinc-500">· Tráiler</span></p>
              <button onClick={() => setOpen(false)} aria-label="Cerrar tráiler" className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-glow">
              <iframe src={src} title={`Tráiler de ${movie.title}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
