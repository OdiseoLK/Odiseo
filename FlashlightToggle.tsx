import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Game } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import Chip from '@/components/ui/Chip';

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/videojuegos/${game.slug}`} className="glass glass-hover group flex flex-col overflow-hidden rounded-2xl">
      <div className="relative aspect-video overflow-hidden">
        <img src={game.cover_url} alt={`Portada de ${game.title}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent" />
        <StatusBadge status={game.status} className="absolute left-3 top-3 backdrop-blur" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-white">{game.title}</h3>
          <ArrowUpRight size={17} className="mt-1 shrink-0 text-zinc-500 transition group-hover:text-electric" />
        </div>
        <p className="line-clamp-2 text-sm text-zinc-400">{game.description}</p>
        <div className="mt-auto space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <ProgressBar value={game.progress} className="flex-1" />
            <span className="font-mono text-xs text-zinc-400">{game.progress}%</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip>{game.engine}</Chip>
            {game.technologies.slice(0, 3).map((t) => <Chip key={t}>{t}</Chip>)}
          </div>
          <p className="text-[11px] text-zinc-500">Estimado: {game.release_estimate}</p>
        </div>
      </div>
    </Link>
  );
}
