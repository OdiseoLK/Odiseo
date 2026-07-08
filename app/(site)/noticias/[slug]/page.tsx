import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Reveal from '@/components/ui/Reveal';
import ShareButtons from '@/components/site/ShareButtons';
import { getNewsBySlug } from '@/lib/data';
import { mdToHtml } from '@/lib/markdown';
import { formatDate, readingTime } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getNewsBySlug(params.slug);
  if (!item) return { title: 'Noticia' };
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: { title: item.title, description: item.excerpt, images: item.cover_url ? [item.cover_url] : [] },
  };
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const item = await getNewsBySlug(params.slug);
  if (!item) notFound();

  return (
    <article className="container-site max-w-4xl pb-24 pt-32">
      <Reveal>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="font-semibold uppercase tracking-widest text-electric">{item.category}</span>
          <span>·</span>
          <span>{formatDate(item.published_at)}</span>
          <span>·</span>
          <span>{readingTime(item.content)} min de lectura</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{item.title}</h1>
        <p className="mt-4 text-lg text-zinc-400">{item.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <ShareButtons title={item.title} />
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t) => <span key={t} className="rounded-md bg-white/[0.05] px-2 py-1 text-[11px] text-zinc-500">#{t}</span>)}
            </div>
          )}
        </div>
      </Reveal>
      {item.cover_url && (
        <Reveal><img src={item.cover_url} alt="" className="glass mt-10 aspect-[16/8] w-full rounded-2xl object-cover" /></Reveal>
      )}
      <Reveal>
        <div className="prose-site mt-10" dangerouslySetInnerHTML={{ __html: mdToHtml(item.content) }} />
      </Reveal>
    </article>
  );
}
