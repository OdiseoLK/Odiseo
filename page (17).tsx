'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clapperboard, Eye, FileText, Gamepad2, ImagePlus, Newspaper, PenSquare, Briefcase } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import LineChart from '@/components/admin/LineChart';
import { SetupNotice } from '@/components/admin/ui';
import { formatDate } from '@/lib/utils';

type Counts = { views: number; viewsMonth: number; news: number; games: number; devlogs: number; movies: number; portfolio: number };
type Recent = { type: string; title: string; date: string; href: string };

export default function AdminDashboard() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [series, setSeries] = useState<{ label: string; value: number }[]>([]);
  const [recent, setRecent] = useState<Recent[]>([]);

  useEffect(() => {
    if (!supabase) return;
    const load = async () => {
      const monthAgo = new Date(Date.now() - 30 * 86400_000).toISOString();
      const [views, viewsMonth, news, games, devlogs, movies, portfolio] = await Promise.all([
        supabase.from('page_views').select('*', { count: 'exact', head: true }),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('devlogs').select('*', { count: 'exact', head: true }),
        supabase.from('movies').select('*', { count: 'exact', head: true }),
        supabase.from('portfolio').select('*', { count: 'exact', head: true }),
      ]);
      setCounts({
        views: views.count ?? 0, viewsMonth: viewsMonth.count ?? 0,
        news: news.count ?? 0, games: games.count ?? 0, devlogs: devlogs.count ?? 0,
        movies: movies.count ?? 0, portfolio: portfolio.count ?? 0,
      });

      const { data: vd } = await supabase.from('page_views').select('created_at').gte('created_at', monthAgo).limit(20000);
      const byDay = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400_000);
        byDay.set(d.toISOString().slice(0, 10), 0);
      }
      (vd ?? []).forEach((r) => {
        const k = String(r.created_at).slice(0, 10);
        if (byDay.has(k)) byDay.set(k, (byDay.get(k) ?? 0) + 1);
      });
      setSeries(Array.from(byDay.entries()).map(([k, v]) => ({ label: k.slice(5), value: v })));

      const [rn, rd] = await Promise.all([
        supabase.from('news').select('title,slug,created_at').order('created_at', { ascending: false }).limit(4),
        supabase.from('devlogs').select('title,slug,created_at').order('created_at', { ascending: false }).limit(4),
      ]);
      const merged: Recent[] = [
        ...(rn.data ?? []).map((r) => ({ type: 'Noticia', title: r.title, date: r.created_at, href: '/admin/noticias' })),
        ...(rd.data ?? []).map((r) => ({ type: 'Devlog', title: r.title, date: r.created_at, href: '/admin/devlogs' })),
      ].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
      setRecent(merged);
    };
    load();
  }, [supabase]);

  if (!supabase) return (<div><h1 className="mb-6 font-display text-2xl font-bold text-white">Dashboard</h1><SetupNotice /></div>);

  const cards = [
    { label: 'Visitas totales', value: counts?.views, icon: Eye },
    { label: 'Visitas (30 días)', value: counts?.viewsMonth, icon: Eye },
    { label: 'Noticias', value: counts?.news, icon: Newspaper },
    { label: 'Videojuegos', value: counts?.games, icon: Gamepad2 },
    { label: 'Devlogs', value: counts?.devlogs, icon: FileText },
    { label: 'Reseñas', value: counts?.movies, icon: Clapperboard },
  ];

  const quick = [
    { label: 'Nueva noticia', href: '/admin/noticias', icon: Newspaper },
    { label: 'Nuevo devlog', href: '/admin/devlogs', icon: PenSquare },
    { label: 'Nueva reseña', href: '/admin/peliculas', icon: Clapperboard },
    { label: 'Nuevo trabajo', href: '/admin/portafolio', icon: Briefcase },
    { label: 'Subir imagen', href: '/admin/archivos', icon: ImagePlus },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Resumen general de tu sitio.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[11px] uppercase tracking-wider">{c.label}</span>
                <Icon size={14} />
              </div>
              <p className="mt-2 font-display text-2xl font-extrabold text-white">{c.value ?? '—'}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">Visitas · últimos 30 días</h2>
          <LineChart data={series} />
        </div>
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-semibold text-zinc-300">Contenido reciente</h2>
            <ul className="space-y-2.5">
              {recent.map((r, i) => (
                <li key={i}>
                  <Link href={r.href} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/[0.04]">
                    <span className="rounded-md bg-electric/12 px-2 py-0.5 text-[10px] font-bold text-electric">{r.type}</span>
                    <span className="flex-1 truncate text-sm text-zinc-300 group-hover:text-white">{r.title}</span>
                    <span className="text-[11px] text-zinc-600">{formatDate(r.date)}</span>
                  </Link>
                </li>
              ))}
              {recent.length === 0 && <li className="text-sm text-zinc-500">Aún no hay contenido. Empieza con una noticia.</li>}
            </ul>
          </div>
          <div className="glass rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-semibold text-zinc-300">Acciones rápidas</h2>
            <div className="grid gap-2">
              {quick.map((q) => {
                const Icon = q.icon;
                return (
                  <Link key={q.label} href={q.href} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-300 transition hover:border-electric/40 hover:text-white">
                    <Icon size={15} className="text-electric" /> {q.label}
                    <ArrowUpRight size={14} className="ml-auto text-zinc-600" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
