'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Clapperboard, FileText, Gamepad2, Newspaper, Briefcase, Search, CornerDownLeft } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { demoDevlogs, demoGames, demoMovies, demoNews, demoPortfolio } from '@/lib/demo-data';

type Result = { type: string; title: string; href: string; meta?: string };

const TYPE_META: Record<string, { label: string; icon: React.ReactNode }> = {
  game: { label: 'Videojuego', icon: <Gamepad2 size={15} /> },
  devlog: { label: 'Devlog', icon: <FileText size={15} /> },
  news: { label: 'Noticia', icon: <Newspaper size={15} /> },
  movie: { label: 'Película', icon: <Clapperboard size={15} /> },
  work: { label: 'Trabajo', icon: <Briefcase size={15} /> },
};

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    const handle = setTimeout(async () => {
      if (!supabase) {
        const ql = q.toLowerCase();
        const local: Result[] = [
          ...demoGames.filter((g) => g.title.toLowerCase().includes(ql)).map((g) => ({ type: 'game', title: g.title, href: `/videojuegos/${g.slug}` })),
          ...demoNews.filter((n) => n.title.toLowerCase().includes(ql)).map((n) => ({ type: 'news', title: n.title, href: `/noticias/${n.slug}` })),
          ...demoDevlogs.filter((d) => d.title.toLowerCase().includes(ql)).map((d) => ({ type: 'devlog', title: d.title, href: `/devlogs/${d.slug}`, meta: d.version })),
          ...demoMovies.filter((m) => m.title.toLowerCase().includes(ql)).map((m) => ({ type: 'movie', title: m.title, href: '/peliculas', meta: String(m.year) })),
          ...demoPortfolio.filter((p) => p.title.toLowerCase().includes(ql)).map((p) => ({ type: 'work', title: p.title, href: `/portafolio/${p.slug}` })),
        ];
        setResults(local.slice(0, 12));
        setActive(0);
        return;
      }
      const like = `%${q}%`;
      const [games, news, devlogs, movies, works] = await Promise.all([
        supabase.from('games').select('title,slug').ilike('title', like).limit(4),
        supabase.from('news').select('title,slug').eq('status', 'published').ilike('title', like).limit(4),
        supabase.from('devlogs').select('title,slug,version').eq('status', 'published').ilike('title', like).limit(4),
        supabase.from('movies').select('title,year').ilike('title', like).limit(4),
        supabase.from('portfolio').select('title,slug').ilike('title', like).limit(4),
      ]);
      const merged: Result[] = [
        ...(games.data ?? []).map((g) => ({ type: 'game', title: g.title, href: `/videojuegos/${g.slug}` })),
        ...(news.data ?? []).map((n) => ({ type: 'news', title: n.title, href: `/noticias/${n.slug}` })),
        ...(devlogs.data ?? []).map((d) => ({ type: 'devlog', title: d.title, href: `/devlogs/${d.slug}`, meta: d.version })),
        ...(movies.data ?? []).map((m) => ({ type: 'movie', title: m.title, href: '/peliculas', meta: String(m.year) })),
        ...(works.data ?? []).map((p) => ({ type: 'work', title: p.title, href: `/portafolio/${p.slug}` })),
      ];
      setResults(merged.slice(0, 12));
      setActive(0);
    }, 180);
    return () => clearTimeout(handle);
  }, [query, supabase]);

  const go = (r?: Result) => {
    const target = r ?? results[active];
    if (!target) return;
    onClose();
    router.push(target.href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-ink/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass mx-auto mt-[12vh] w-[min(92vw,40rem)] overflow-hidden rounded-2xl shadow-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-label="Buscador global"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
              <Search size={17} className="text-zinc-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                  if (e.key === 'Enter') go();
                  if (e.key === 'Escape') onClose();
                }}
                placeholder="Buscar videojuegos, noticias, devlogs, películas, trabajos…"
                className="w-full bg-transparent py-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
              />
            </div>
            <div className="max-h-[46vh] overflow-y-auto p-2">
              {query && results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-zinc-500">Sin resultados para “{query}”.</p>
              )}
              {!query && (
                <p className="px-3 py-8 text-center text-sm text-zinc-500">Escribe para buscar en todo el sitio.</p>
              )}
              {results.map((r, i) => (
                <button
                  key={`${r.type}-${r.href}-${i}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${i === active ? 'bg-electric/15 text-white' : 'text-zinc-300 hover:bg-white/[0.05]'}`}
                >
                  <span className="text-electric">{TYPE_META[r.type]?.icon}</span>
                  <span className="flex-1 truncate">{r.title}</span>
                  {r.meta && <span className="font-mono text-[11px] text-zinc-500">{r.meta}</span>}
                  <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500">{TYPE_META[r.type]?.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2.5 text-[11px] text-zinc-500">
              <span className="inline-flex items-center gap-1"><kbd className="rounded border border-white/10 px-1">↑↓</kbd> navegar</span>
              <span className="inline-flex items-center gap-1"><CornerDownLeft size={11} /> abrir</span>
              <span className="inline-flex items-center gap-1"><kbd className="rounded border border-white/10 px-1">esc</kbd> cerrar</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
