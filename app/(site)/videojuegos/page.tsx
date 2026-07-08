import type { Metadata } from 'next';
import GameCard from '@/components/site/GameCard';
import Reveal from '@/components/ui/Reveal';
import { getGames } from '@/lib/data';

export const metadata: Metadata = { title: 'Videojuegos', description: 'Todos los proyectos de videojuegos del estudio, con su estado y progreso.' };

export default async function GamesPage() {
  const games = await getGames();
  return (
    <div className="container-site pb-24 pt-32">
      <Reveal>
        <p className="eyebrow mb-3">Proyectos del estudio</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Videojuegos</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Mundos en distintas etapas de construcción. Cada tarjeta muestra el estado real del desarrollo.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g, i) => (
          <Reveal key={g.id} delay={i * 0.07}><GameCard game={g} /></Reveal>
        ))}
      </div>
      {games.length === 0 && <p className="mt-12 text-zinc-500">Aún no hay videojuegos publicados.</p>}
    </div>
  );
}
