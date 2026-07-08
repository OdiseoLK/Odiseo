import type { Metadata } from 'next';
import NewsCard from '@/components/site/NewsCard';
import Reveal from '@/components/ui/Reveal';
import { getNews } from '@/lib/data';

export const metadata: Metadata = { title: 'Noticias', description: 'Novedades del estudio: lanzamientos, avances y anuncios.' };

export default async function NewsPage() {
  const items = await getNews();
  const featured = items.find((n) => n.featured) ?? items[0];
  const rest = items.filter((n) => n.id !== featured?.id);

  return (
    <div className="container-site pb-24 pt-32">
      <Reveal>
        <p className="eyebrow mb-3">Sala de prensa</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Noticias</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">Todo lo que pasa dentro del estudio, contado a su tiempo.</p>
      </Reveal>
      {featured && (
        <Reveal>
          <div className="mt-12"><NewsCard item={featured} /></div>
        </Reveal>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((n, i) => (
          <Reveal key={n.id} delay={i * 0.06}><NewsCard item={n} /></Reveal>
        ))}
      </div>
      {items.length === 0 && <p className="mt-12 text-zinc-500">Aún no hay noticias publicadas.</p>}
    </div>
  );
}
