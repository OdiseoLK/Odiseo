import type { Metadata } from 'next';
import Reveal from '@/components/ui/Reveal';
import MoviesExplorer from '@/components/site/MoviesExplorer';
import { getMovies } from '@/lib/data';

export const metadata: Metadata = { title: 'Opiniones de películas', description: 'Catálogo de reseñas de terror, ciencia ficción y thriller de @fotogramas.malditos.' };

export default async function MoviesPage() {
  const movies = await getMovies();
  return (
    <div className="container-site pb-24 pt-32">
      <Reveal>
        <p className="eyebrow mb-3">@fotogramas.malditos</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Opiniones de películas</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Terror, ciencia ficción y thriller. Cada ficha resume la reseña completa publicada en Instagram.
        </p>
      </Reveal>
      <MoviesExplorer movies={movies} />
    </div>
  );
}
