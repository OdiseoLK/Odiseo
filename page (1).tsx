import Link from 'next/link';
import type { News } from '@/lib/types';
import { formatDate, readingTime } from '@/lib/utils';

export default function NewsCard({ item, compact = false }: { item: News; compact?: boolean }) {
  if (compact) {
    return (
      <Link href={`/noticias/${item.slug}`} className="glass glass-hover group flex gap-4 rounded-2xl p-3">
        <img src={item.cover_url ?? '/covers/cine.svg'} alt="" loading="lazy" className="h-16 w-24 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0">
          <p className="eyebrow !text-[10px]">{item.category}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-white group-hover:text-electric">{item.title}</h3>
          <p className="mt-1 text-[11px] text-zinc-500">{formatDate(item.published_at)}</p>
        </div>
      </Link>
    );
  }
  return (
    <Link href={`/noticias/${item.slug}`} className="glass glass-hover group flex flex-col overflow-hidden rounded-2xl">
      <div className="relative aspect-[16/8] overflow-hidden">
        <img src={item.cover_url ?? '/covers/cine.svg'} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        {item.featured && <span className="absolute left-3 top-3 rounded-full bg-electric px-2.5 py-1 text-[10px] font-bold text-ink">DESTACADA</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="font-semibold uppercase tracking-widest text-electric">{item.category}</span>
          <span>·</span>
          <span>{formatDate(item.published_at)}</span>
          <span>·</span>
          <span>{readingTime(item.content)} min</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-bold text-white">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{item.excerpt}</p>
        {item.tags?.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {item.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] text-zinc-500">#{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
