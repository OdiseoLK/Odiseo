import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Building2, CalendarDays, FolderKanban } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import Chip from '@/components/ui/Chip';
import { getPortfolioBySlug } from '@/lib/data';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getPortfolioBySlug(params.slug);
  return { title: item?.title ?? 'Proyecto', description: item?.description };
}

export default async function WorkPage({ params }: { params: { slug: string } }) {
  const item = await getPortfolioBySlug(params.slug);
  if (!item) notFound();

  return (
    <article className="container-site max-w-5xl pb-24 pt-32">
      <Reveal>
        <p className="eyebrow mb-3">{item.category}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{item.title}</h1>
        <p className="mt-4 max-w-3xl text-lg text-zinc-400">{item.description}</p>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-400">
          <span className="inline-flex items-center gap-2"><Building2 size={15} className="text-electric" /> {item.client}</span>
          <span className="inline-flex items-center gap-2"><CalendarDays size={15} className="text-electric" /> {formatDate(item.date)}</span>
          <span className="inline-flex items-center gap-2"><FolderKanban size={15} className="text-electric" /> {item.category}</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">{item.technologies.map((t) => <Chip key={t}>{t}</Chip>)}</div>
        {item.external_url && (
          <a href={item.external_url} target="_blank" rel="noreferrer" className="btn-primary mt-7">
            Ver proyecto <ArrowUpRight size={15} />
          </a>
        )}
      </Reveal>
      {item.cover_url && (
        <Reveal><img src={item.cover_url} alt="" className="glass mt-12 w-full rounded-2xl object-cover" /></Reveal>
      )}
      {item.gallery.length > 0 && (
        <Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {item.gallery.map((src, i) => <img key={i} src={src} alt="" loading="lazy" className="glass rounded-2xl object-cover" />)}
          </div>
        </Reveal>
      )}
    </article>
  );
}
