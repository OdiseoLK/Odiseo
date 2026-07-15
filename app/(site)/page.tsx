import Link from 'next/link';
import Hero from '@/components/site/Hero';
import IntroGate from '@/components/site/IntroGate';
import FeaturedGameBanner from '@/components/site/FeaturedGameBanner';
import GameCard from '@/components/site/GameCard';
import NewsCard from '@/components/site/NewsCard';
import DevlogCard from '@/components/site/DevlogCard';
import MovieCard from '@/components/site/MovieCard';
import PortfolioCard from '@/components/site/PortfolioCard';
import NewsletterForm from '@/components/site/NewsletterForm';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { getDevlogs, getFeaturedGame, getGames, getMovies, getNews, getPortfolio, getSettings, getSiteStats } from '@/lib/data';

export default async function HomePage() {
  const [featured, games, news, devlogs, movies, portfolio, settings, stats] = await Promise.all([
    getFeaturedGame(), getGames(), getNews(4), getDevlogs(2), getMovies(), getPortfolio(), getSettings(), getSiteStats(),
  ]);

  if (!featured) return null;
  const startYear = 2026;
  const years = Math.max(1, new Date().getFullYear() - startYear + 1);

  const statItems = [
    { value: stats.games, label: 'Videojuegos' },
    { value: stats.news, label: 'Noticias' },
    { value: stats.movies, label: 'Reseñas' },
    { value: stats.portfolio, label: 'Trabajos' },
    { value: `${years}+`, label: 'Años creando' },
  ];

  return (
    <>
      <IntroGate gameTitle={featured.title} phrase={featured.tagline} />
      <Hero settings={settings} />

      {/* Datos del estudio */}
      <section id="estudio" className="relative z-10 border-y border-white/[0.06] bg-[#070a12]/90">
        <Reveal>
          <div className="container-site grid grid-cols-2 sm:grid-cols-5">
            {statItems.map((s, i) => (
              <div key={s.label} className={`flex flex-col gap-1.5 px-5 py-8 ${i > 0 ? 'sm:border-l sm:border-white/[0.06]' : ''}`}>
                <p className="font-display text-3xl font-extrabold tracking-tight text-white">{s.value}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 01 — Proyecto principal */}
      <FeaturedGameBanner game={featured} />

      {/* 02 — Videojuegos */}
      <section className="container-site py-24">
        <SectionHeading
          num={2}
          eyebrow="Proyectos del estudio"
          title="Videojuegos"
          description="Cada juego es un mundo en construcción. Sigue el progreso en tiempo real."
          href="/videojuegos" hrefLabel="Ver todos"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g, i) => (
            <Reveal key={g.id} delay={i * 0.08}><GameCard game={g} /></Reveal>
          ))}
        </div>
      </section>

      {/* 03 — Trabajo seleccionado */}
      <section className="container-site py-24">
        <SectionHeading
          num={3}
          eyebrow="Fuera del estudio"
          title="Trabajo seleccionado"
          description="Sitios y herramientas construidos para clientes y proyectos propios."
          href="/portafolio" hrefLabel="Ver portafolio"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.slice(0, 3).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}><PortfolioCard item={p} /></Reveal>
          ))}
        </div>
      </section>

      {/* 04 — Reseñas de cine */}
      <section className="border-y border-white/[0.05] bg-[#070a12]/70 py-24">
        <div className="container-site">
          <SectionHeading
            num={4}
            eyebrow="@fotogramas.malditos"
            title="Reseñas de cine"
            description="Terror, ciencia ficción y thriller, analizados fotograma a fotograma."
            href="/peliculas" hrefLabel="Ver catálogo"
          />
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {movies.slice(0, 4).map((m, i) => (
              <Reveal key={m.id} delay={i * 0.07}><MovieCard movie={m} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — Bitácora */}
      <section className="container-site grid gap-14 py-24 lg:grid-cols-[1.2fr,1fr]">
        <div>
          <SectionHeading num={5} eyebrow="Diario de desarrollo" title="Últimos devlogs" href="/devlogs" hrefLabel="Todos" />
          <div className="grid gap-6">
            {devlogs.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.08}><DevlogCard log={d} /></Reveal>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Sala de prensa" title="Noticias" href="/noticias" hrefLabel="Ver todas" />
          <div className="grid gap-4">
            {news.map((n, i) => (
              <Reveal key={n.id} delay={i * 0.06}><NewsCard item={n} compact /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lista de lanzamiento */}
      <section className="container-site py-14">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(79,140,255,0.10), transparent 70%)' }} />
            <p className="eyebrow justify-center">Lista de lanzamiento</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">Sé de los primeros en jugar {featured.title}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
              Sin spam: un solo correo el día del lanzamiento y avisos de las demos. Nada más.
            </p>
            <div className="mt-6">
              <NewsletterForm source="home" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="container-site pb-28">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl p-10 text-center sm:p-14">
            <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 55% 80% at 50% 0%, rgba(79,140,255,0.12), transparent 70%)' }} />
            <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">¿Hablamos?</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-zinc-400">
              Colaboraciones, proyectos web, contenido o solo saludar. La puerta del estudio está abierta.
            </p>
            <Link href="/contacto" className="btn-primary relative mt-7">Ir a contacto</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
