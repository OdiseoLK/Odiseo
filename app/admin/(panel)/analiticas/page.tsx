'use client';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Eye, TrendingUp } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import LineChart from '@/components/admin/LineChart';
import { PageHeader, SetupNotice } from '@/components/admin/ui';

type Stats = { total: number; month: number; week: number };

export default function AdminAnalytics() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [stats, setStats] = useState<Stats | null>(null);
  const [series, setSeries] = useState<{ label: string; value: number }[]>([]);
  const [topPaths, setTopPaths] = useState<{ path: string; count: number }[]>([]);

  useEffect(() => {
    if (!supabase) return;
    const load = async () => {
      const monthAgo = new Date(Date.now() - 30 * 86400_000).toISOString();
      const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      const [total, month, week] = await Promise.all([
        supabase.from('page_views').select('*', { count: 'exact', head: true }),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      ]);
      setStats({ total: total.count ?? 0, month: month.count ?? 0, week: week.count ?? 0 });

      const { data } = await supabase.from('page_views').select('path,created_at').gte('created_at', monthAgo).limit(20000);
      const byDay = new Map<string, number>();
      for (let i = 29; i >= 0; i--) byDay.set(new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10), 0);
      const byPath = new Map<string, number>();
      (data ?? []).forEach((r) => {
        const day = String(r.created_at).slice(0, 10);
        if (byDay.has(day)) byDay.set(day, (byDay.get(day) ?? 0) + 1);
        byPath.set(r.path, (byPath.get(r.path) ?? 0) + 1);
      });
      setSeries(Array.from(byDay.entries()).map(([k, v]) => ({ label: k.slice(5), value: v })));
      setTopPaths(Array.from(byPath.entries()).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 10));
    };
    load();
  }, [supabase]);

  if (!supabase) return (<div><PageHeader title="Analíticas" /><SetupNotice /></div>);

  const cards = [
    { label: 'Visitas totales', value: stats?.total, icon: Eye },
    { label: 'Últimos 30 días', value: stats?.month, icon: CalendarDays },
    { label: 'Últimos 7 días', value: stats?.week, icon: TrendingUp },
  ];

  return (
    <div>
      <PageHeader title="Analíticas" description="Visitas registradas de forma anónima en tu sitio público." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{c.label}</p>
                <Icon size={16} className="text-electric" />
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-white">{c.value?.toLocaleString('es-MX') ?? '—'}</p>
            </div>
          );
        })}
      </div>
      <div className="glass mb-6 rounded-2xl p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Visitas · últimos 30 días</p>
        <LineChart data={series} height={200} />
      </div>
      <div className="glass overflow-hidden rounded-2xl">
        <p className="border-b border-white/[0.07] px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Páginas más visitadas (30 días)</p>
        {topPaths.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-500">Aún no hay visitas registradas.</p>
        ) : (
          <ul>
            {topPaths.map((p) => (
              <li key={p.path} className="flex items-center justify-between border-b border-white/[0.05] px-5 py-3 text-sm last:border-0">
                <span className="truncate font-mono text-xs text-zinc-300">{p.path}</span>
                <span className="ml-4 shrink-0 rounded-lg bg-electric/12 px-2 py-0.5 font-mono text-xs text-electric">{p.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
