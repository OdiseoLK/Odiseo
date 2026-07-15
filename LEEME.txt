import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import {
  demoDevlogs, demoGames, demoMovies, demoNews, demoPortfolio, demoSettings,
} from '@/lib/demo-data';
import type { Devlog, Game, Movie, News, PortfolioItem, SiteSettings, CommentRow } from '@/lib/types';

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

// ── Videojuegos ──────────────────────────────────────────────
export async function getGames(): Promise<Game[]> {
  return safe(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('games').select('*').order('sort', { ascending: true });
    if (error) throw error;
    return (data as Game[]) ?? [];
  }, demoGames);
}

export async function getFeaturedGame(): Promise<Game | null> {
  const games = await getGames();
  return games.find((g) => g.featured) ?? games[0] ?? null;
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const games = await getGames();
  return games.find((g) => g.slug === slug) ?? null;
}

// ── Devlogs ──────────────────────────────────────────────────
export async function getDevlogs(limit?: number): Promise<Devlog[]> {
  return safe(async () => {
    const supabase = createClient();
    let q = supabase.from('devlogs').select('*').eq('status', 'published').order('date', { ascending: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data as Devlog[]) ?? [];
  }, limit ? demoDevlogs.slice(0, limit) : demoDevlogs);
}

export async function getDevlogBySlug(slug: string): Promise<Devlog | null> {
  const logs = await getDevlogs();
  return logs.find((d) => d.slug === slug) ?? null;
}

export async function getDevlogsByGame(gameId: string, limit = 4): Promise<Devlog[]> {
  const logs = await getDevlogs();
  return logs.filter((d) => d.game_id === gameId).slice(0, limit);
}

// ── Noticias ─────────────────────────────────────────────────
export async function getNews(limit?: number): Promise<News[]> {
  return safe(async () => {
    const supabase = createClient();
    let q = supabase
      .from('news')
      .select('*')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data as News[]) ?? [];
  }, limit ? demoNews.slice(0, limit) : demoNews);
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  const items = await getNews();
  return items.find((n) => n.slug === slug) ?? null;
}

// ── Películas ────────────────────────────────────────────────
export async function getMovies(): Promise<Movie[]> {
  return safe(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('movies').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Movie[]) ?? [];
  }, demoMovies);
}

// ── Portafolio ───────────────────────────────────────────────
export async function getPortfolio(): Promise<PortfolioItem[]> {
  return safe(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('portfolio').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data as PortfolioItem[]) ?? [];
  }, demoPortfolio);
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
  const items = await getPortfolio();
  return items.find((p) => p.slug === slug) ?? null;
}

// ── Comentarios (aprobados) ──────────────────────────────────
export async function getComments(targetType: string, targetId: string): Promise<CommentRow[]> {
  return safe(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as CommentRow[]) ?? [];
  }, []);
}

// ── Ajustes del sitio ────────────────────────────────────────
export async function getSettings(): Promise<SiteSettings> {
  return safe(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('site_settings').select('data').eq('id', 1).single();
    if (error) throw error;
    return { ...demoSettings, ...((data?.data as Partial<SiteSettings>) ?? {}) } as SiteSettings;
  }, demoSettings);
}

// ── Conteos para la portada ──────────────────────────────────
export async function getSiteStats() {
  const [games, news, movies, portfolio] = await Promise.all([getGames(), getNews(), getMovies(), getPortfolio()]);
  return {
    games: games.length,
    news: news.length,
    movies: movies.length,
    portfolio: portfolio.length,
  };
}
