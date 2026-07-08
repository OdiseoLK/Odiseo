import type { Metadata } from 'next';
import PortfolioCard from '@/components/site/PortfolioCard';
import Reveal from '@/components/ui/Reveal';
import { getPortfolio } from '@/lib/data';

export const metadata: Metadata = { title: 'Portafolio', description: 'Proyectos web, branding y contenido digital realizados fuera del estudio.' };

export default async function PortfolioPage() {
  const items = await getPortfolio();
  return (
    <div className="container-site pb-24 pt-32">
      <Reveal>
        <p className="eyebrow mb-3">Fuera del estudio</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Portafolio</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">Desarrollo web, identidad visual y contenido digital para proyectos reales.</p>
      </Reveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.07}><PortfolioCard item={p} /></Reveal>
        ))}
      </div>
      {items.length === 0 && <p className="mt-12 text-zinc-500">Aún no hay proyectos publicados.</p>}
    </div>
  );
}
