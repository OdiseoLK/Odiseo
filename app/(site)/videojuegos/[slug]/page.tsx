import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, HelpCircle, ListChecks, PlayCircle, Sparkles, Target, Users } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Chip from '@/components/ui/Chip';
import Reveal from '@/components/ui/Reveal';
import ProgressCategories from '@/components/site/ProgressCategories';
import Timeline from '@/components/site/Timeline';
import DevlogCard from '@/components/site/DevlogCard';
import CommentsSection from '@/components/site/CommentsSection';
import FlashlightToggle from '@/components/site/FlashlightToggle';
import NewsletterForm from '@/components/site/NewsletterForm';
import { getDevlogsByGame, getGameBySlug } from '@/lib/data';
import { mdToHtml } from '@/lib/markdown';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const game = await getGameBySlug(params.slug);
  if (!game) return { title: 'Videojuego' };
  return {
    title: game.title,
    description: game.tagline,
    openGraph: { title: game.title, description: game.tagline, images: game.cover_url ? [game.cover_url] : [] },
  };
}

function Section({ id, icon, title, children }: { id: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-24 border-t border-white/[0.06] py-14">
        <h2 className="mb-8 flex items-center gap-2.5 font-display text-2xl font-bold text-white">
          <span className="text-electric">{icon}</span> {title}
        </h2>
        {children}
      </section>
    </Reveal>
  );
}

export default async function GamePage({ params }: { params: { slug: string } }) {
  const game = await getGameBySlug(params.slug);
  if (!game) notFound();
  const devlogs = await getDevlogsByGame(game.id, 4);

  return (
    <article className="pb-24">
      {/* Portada */}
      <header className="relative overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={game.cover_url} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />
        </div>
        <div className="container-site relative py-24">
          <Reveal>
            <StatusBadge status={game.status} />
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">{game.title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-300">{game.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Chip>{game.engine}</Chip>
              {game.technologies.map((t) => <Chip key={t}>{t}</Chip>)}
              <Chip>Estimado: {game.release_estimate}</Chip>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {game.demo_url && (
                <a href={game.demo_url} className="btn-primary" target="_blank" rel="noreferrer">
                  <Download size={16} /> Descargar demo
                </a>
              )}
              <FlashlightToggle />
              <Link href="/devlogs" className="btn-ghost">Ver devlogs</Link>
            </div>
          </Reveal>
        </div>
      </header>

      <div className="container-site">
        {/* Trailer */}
        {game.trailer_url && (
          <Section id="trailer" icon={<PlayCircle size={20} />} title="Trailer">
            <div className="glass aspect-video overflow-hidden rounded-2xl">
              <iframe src={game.trailer_url} title={`Trailer de ${game.title}`} className="h-full w-full" allowFullScreen />
            </div>
          </Section>
        )}

        {game.demo_url && (
          <Section id="demo" icon={<PlayCircle size={20} />} title="Juega la demo aquí mismo">
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-card">
              <iframe src={game.demo_url} title={`Demo de ${game.title}`} loading="lazy" allowFullScreen className="h-full w-full" />
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              ¿Se ve pequeña? <a href={game.demo_url} target="_blank" rel="noreferrer" className="text-electric hover:underline">Ábrela en pantalla completa</a>.
            </p>
          </Section>
        )}

        {/* Progreso */}
        <Section id="progreso" icon={<Sparkles size={20} />} title="Progreso del desarrollo">
          <div className="glass mb-8 flex items-center justify-between rounded-2xl px-6 py-4">
            <span className="text-sm text-zinc-400">Avance total del proyecto</span>
            <span className="font-display text-2xl font-extrabold text-electric">{game.progress}%</span>
          </div>
          <ProgressCategories categories={game.progress_categories} />
        </Section>

        {/* Historia */}
        {game.story && (
          <Section id="historia" icon={<Sparkles size={20} />} title="Historia">
            <div className="prose-site" dangerouslySetInnerHTML={{ __html: mdToHtml(game.story) }} />
          </Section>
        )}

        {/* Personajes */}
        {game.characters.length > 0 && (
          <Section id="personajes" icon={<Users size={20} />} title="Personajes">
            <div className="grid gap-5 sm:grid-cols-2">
              {game.characters.map((c) => (
                <div key={c.name} className="glass flex gap-4 rounded-2xl p-5">
                  {c.image_url && <img src={c.image_url} alt="" className="h-16 w-16 rounded-xl object-cover" />}
                  <div>
                    <h3 className="font-display font-bold text-white">{c.name}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Características */}
        {game.features.length > 0 && (
          <Section id="caracteristicas" icon={<ListChecks size={20} />} title="Características">
            <div className="grid gap-5 sm:grid-cols-2">
              {game.features.map((f) => (
                <div key={f.title} className="glass rounded-2xl p-5">
                  <h3 className="font-display font-bold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-zinc-400">{f.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Galería */}
        {game.gallery.length > 0 && (
          <Section id="galeria" icon={<PlayCircle size={20} />} title="Galería y concept art">
            <div className="grid gap-4 sm:grid-cols-2">
              {game.gallery.map((src, i) => (
                <img key={i} src={src} alt={`Captura ${i + 1} de ${game.title}`} loading="lazy" className="glass aspect-video w-full rounded-2xl object-cover" />
              ))}
            </div>
          </Section>
        )}

        {/* Roadmap */}
        {game.roadmap.length > 0 && (
          <Section id="roadmap" icon={<Target size={20} />} title="Roadmap">
            <Timeline items={game.roadmap} />
          </Section>
        )}

        {/* Objetivos */}
        {game.goals.length > 0 && (
          <Section id="objetivos" icon={<Target size={20} />} title="Objetivos actuales">
            <ul className="grid gap-3">
              {game.goals.map((g) => (
                <li key={g} className="glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-300">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-electric" /> {g}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Devlogs */}
        {devlogs.length > 0 && (
          <Section id="devlogs" icon={<ListChecks size={20} />} title="Devlogs y lista de cambios">
            <div className="grid gap-5 sm:grid-cols-2">
              {devlogs.map((d) => <DevlogCard key={d.id} log={d} />)}
            </div>
          </Section>
        )}

        {/* FAQ */}
        {game.faq.length > 0 && (
          <Section id="faq" icon={<HelpCircle size={20} />} title="Preguntas frecuentes">
            <div className="grid gap-3">
              {game.faq.map((f) => (
                <details key={f.q} className="glass group rounded-2xl px-5 py-4">
                  <summary className="cursor-pointer list-none font-semibold text-white marker:hidden">
                    <span className="mr-2 text-electric transition group-open:rotate-90 inline-block">›</span>{f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.a}</p>
                </details>
              ))}
            </div>
          </Section>
        )}

        {game.status !== 'publicado' && (
          <div className="glass mt-14 rounded-3xl p-8 text-center">
            <p className="eyebrow justify-center">Lista de lanzamiento</p>
            <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">Te aviso cuando {game.title} esté listo</h2>
            <div className="mt-5">
              <NewsletterForm source={game.slug} />
            </div>
          </div>
        )}

        <CommentsSection targetType="game" targetId={game.id} />
      </div>
    </article>
  );
}
