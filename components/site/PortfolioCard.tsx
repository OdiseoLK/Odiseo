import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { PortfolioItem } from '@/lib/types';
import Chip from '@/components/ui/Chip';

export default function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <Link href={`/portafolio/${item.slug}`} className="glass glass-hover group flex flex-col overflow-hidden rounded-2xl">
      <div className="relative aspect-video overflow-hidden">
        <img src={item.cover_url ?? '/covers/work-web.svg'} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-ink/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-300 backdrop-blur">{item.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-bold text-white">{item.title}</h3>
          <ArrowUpRight size={16} className="mt-1 shrink-0 text-zinc-500 transition group-hover:text-electric" />
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{item.description}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {item.technologies.slice(0, 3).map((t) => <Chip key={t}>{t}</Chip>)}
        </div>
      </div>
    </Link>
  );
}
