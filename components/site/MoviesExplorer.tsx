'use client';
import { useMemo, useState } from 'react';
import type { Movie } from '@/lib/types';
import MovieCard from './MovieCard';
import Reveal from '@/components/ui/Reveal';

export default function MoviesExplorer({ movies }: { movies: Movie[] }) {
  const [genre, setGenre] = useState('todos');
  const [year, setYear] = useState('todos');
  const [minRating, setMinRating] = useState('0');

  const genres = useMemo(() => Array.from(new Set(movies.map((m) => m.genre))).sort(), [movies]);
  const years = useMemo(() => Array.from(new Set(movies.map((m) => m.year))).sort((a, b) => b - a), [movies]);

  const filtered = movies.filter(
    (m) =>
      (genre === 'todos' || m.genre === genre) &&
      (year === 'todos' || m.year === Number(year)) &&
      m.rating >= Number(minRating)
  );

  const selectCls = 'input-dark !w-auto cursor-pointer !py-2 text-xs';

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="f-genero">Género</label>
        <select id="f-genero" value={genre} onChange={(e) => setGenre(e.target.value)} className={selectCls}>
          <option value="todos">Género: todos</option>
          {genres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <label className="sr-only" htmlFor="f-anio">Año</label>
        <select id="f-anio" value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}>
          <option value="todos">Año: todos</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <label className="sr-only" htmlFor="f-cal">Calificación mínima</label>
        <select id="f-cal" value={minRating} onChange={(e) => setMinRating(e.target.value)} className={selectCls}>
          <option value="0">Calificación: todas</option>
          <option value="3">★ 3+</option>
          <option value="4">★ 4+</option>
          <option value="4.5">★ 4.5+</option>
          <option value="5">★ 5</option>
        </select>
        <span className="ml-auto text-xs text-zinc-500">{filtered.length} de {movies.length} reseñas</span>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((m, i) => (
          <Reveal key={m.id} delay={Math.min(i, 6) * 0.05}><MovieCard movie={m} /></Reveal>
        ))}
      </div>
      {filtered.length === 0 && <p className="mt-12 text-zinc-500">No hay reseñas con esos filtros.</p>}
    </>
  );
}
