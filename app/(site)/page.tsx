import Link from 'next/link';
import { Gamepad2, Newspaper, Clapperboard, Briefcase, ArrowRight } from 'lucide-react';
import Hero from '@/components/site/Hero';
import IntroGate from '@/components/site/IntroGate';
import GameCard from '@/components/site/GameCard';
import NewsCard from '@/components/site/NewsCard';
import DevlogCard from '@/components/site/DevlogCard';
import MovieCard from '@/components/site/MovieCard';
import PortfolioCard from '@/components/site/PortfolioCard';
import ProgressCategories from '@/components/site/ProgressCategories';
import Timeline from '@/components/site/Timeline';
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
    { value: stats.games, label: 'Videojuegos', icon: <Gamepad2 size={15} /> },
    { value: stats.news, label: 'Noticias', icon: <Newspaper size={15} /> },
    { value: stats.movies, label: 'Reseñas', icon: <Clapperboard size={15} /> },
    { value: stats.portfolio, label: 'Trabajos', icon: <Briefcase size={15} /> },
    { value: `${years}+`, label: 'Años creando', icon: <ArrowRight size={15} className="rotate-[-45deg]" /> },
  ];

  return (
    <>
      <IntroGate gameTitle={featured.title} phrase={featured.tagline} />
      <Hero settings={settings} />

      {/* Cinta de estadísticas */}
      <section id="estudio" className="container-site -mt-10 relative z-20">
        <Reveal>
          <div className="glass grid grid-cols-2 divide-white/[0.06] rounded-2xl sm:grid-cols-5 sm:divide-x">
            {statItems.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 px-4 py-5">
                <p className="font-display text-2xl font-extrabold text-white">{s.value}</p>
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-zinc-500">{s.icon}{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Videojuegos */}
      <section className="container-site py-24">
        <SectionHeading
          eyebrow="Proyectos del estudio"
          title="Mis videojuegos"
          description="Cada juego es un mundo en construcción. Sigue el progreso en tiempo real."
          href="/videojuegos" hrefLabel="Ver todos"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.slice(0, 3).map((g, i) => (
            <Reveal key={g.id} delay={i * 0.08}><GameCard game={g} /></Reveal>
          ))}
        </div>
      </section>

      {/* Progreso del juego principal */}
      <section className="border-y border-white/[0.05] bg-night-900/60 py-24">
        <div className="container-site grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Estado de la build"
              title={`Progreso de ${featured.title}`}
              description="El desarrollo se mide por área, no con una sola barra. Así se ve el estado real del proyecto."
            />
            <ProgressCategories categories={featured.progress_categories} />
          </div>
          <div>
            <SectionHeading eyebrow="Roadmap" title="Línea del tiempo" description="Los hitos del camino hacia la demo pública." />
            <Timeline items={featured.roadmap.slice(0, 5)} />
            <Link href={`/videojuegos/${featured.slug}`} className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-electric hover:text-electric-400">
              Ver roadmap completo <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Devlogs + Noticias */}
      <section className="container-site grid gap-14 py-24 lg:grid-cols-[1.2fr,1fr]">
        <div>
          <SectionHeading eyebrow="Diario de desarrollo" title="Últimos devlogs" href="/devlogs" hrefLabel="Todos los devlogs" />
          <div className="grid gap-5">
            {devlogs.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.08}><DevlogCard log={d} /></Reveal>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Sala de prensa" title="Noticias recientes" href="/noticias" hrefLabel="Ver todas" />
          <div className="grid gap-4">
            {news.map((n, i) => (
              <Reveal key={n.id} delay={i * 0.06}><NewsCard item={n} compact /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Películas */}
      <section className="border-y border-white/[0.05] bg-night-900/60 py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="@fotogramas.malditos"
            title="Opiniones de películas"
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

      {/* Portafolio */}
      <section className="container-site py-24">
        <SectionHeading eyebrow="Fuera del estudio" title="Trabajos destacados" href="/portafolio" hrefLabel="Ver portafolio" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.slice(0, 3).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}><PortfolioCard item={p} /></Reveal>
          ))}
        </div>
      </section>

      {/* Lista de lanzamiento */}
      <section className="container-site py-14">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-electric/10 blur-3xl" />
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
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-electric/15 blur-[100px]" />
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
