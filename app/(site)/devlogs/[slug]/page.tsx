import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Bug, Clock, Plus, Target, Wrench } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import ShareButtons from '@/components/site/ShareButtons';
import CommentsSection from '@/components/site/CommentsSection';
import { getDevlogBySlug } from '@/lib/data';
import { mdToHtml } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const log = await getDevlogBySlug(params.slug);
  return { title: log ? `${log.version} — ${log.title}` : 'Devlog', description: log?.summary };
}

const CHANGE_META: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  nuevo: { label: 'Nuevo', icon: <Plus size={12} />, cls: 'text-emerald-400 border-emerald-400/25 bg-emerald-400/10' },
  mejora: { label: 'Mejora', icon: <Wrench size={12} />, cls: 'text-electric border-electric/25 bg-electric/10' },
  arreglo: { label: 'Arreglo', icon: <Bug size={12} />, cls: 'text-amber-400 border-amber-400/25 bg-amber-400/10' },
};

export default async function DevlogPage({ params }: { params: { slug: string } }) {
  const log = await getDevlogBySlug(params.slug);
  if (!log) notFound();

  return (
    <article className="container-site max-w-4xl pb-24 pt-32">
      <Reveal>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-electric/15 px-3 py-1.5 font-mono text-sm font-bold text-electric">{log.version}</span>
          <span className="text-sm text-zinc-500">{formatDate(log.date)}</span>
          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500"><Clock size={13} /> {log.time_invested} invertidas</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{log.title}</h1>
        <p className="mt-4 text-lg text-zinc-400">{log.summary}</p>
        <div className="mt-6"><ShareButtons title={log.title} /></div>
      </Reveal>

      {log.cover_url && (
        <Reveal><img src={log.cover_url} alt="" className="glass mt-10 aspect-video w-full rounded-2xl object-cover" /></Reveal>
      )}

      <Reveal>
        <div className="prose-site mt-10" dangerouslySetInnerHTML={{ __html: mdToHtml(log.content) }} />
      </Reveal>

      {log.gallery.length > 0 && (
        <Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {log.gallery.map((src, i) => <img key={i} src={src} alt="" loading="lazy" className="glass rounded-2xl object-cover" />)}
          </div>
        </Reveal>
      )}

      {log.changes.length > 0 && (
        <Reveal>
          <section className="mt-12">
            <h2 className="mb-5 font-display text-xl font-bold text-white">Lista de cambios</h2>
            <ul className="grid gap-2.5">
              {log.changes.map((c, i) => {
                const meta = CHANGE_META[c.type] ?? CHANGE_META.mejora;
                return (
                  <li key={i} className="glass flex items-center gap-3 rounded-xl px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${meta.cls}`}>
                      {meta.icon}{meta.label}
                    </span>
                    <span className="text-sm text-zinc-300">{c.text}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </Reveal>
      )}

      {log.goals.length > 0 && (
        <Reveal>
          <section className="mt-12">
            <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-bold text-white">
              <Target size={17} className="text-electric" /> Objetivos para la siguiente versión
            </h2>
            <ul className="grid gap-2.5">
              {log.goals.map((g) => (
                <li key={g} className="glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-300">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-nebula" /> {g}
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      )}

      <CommentsSection targetType="devlog" targetId={log.id} />
    </article>
  );
}
