import type { MetadataRoute } from 'next';
import { getDevlogs, getGames, getNews, getPortfolio } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const [games, news, devlogs, works] = await Promise.all([getGames(), getNews(), getDevlogs(), getPortfolio()]);
  const staticRoutes = ['', '/videojuegos', '/devlogs', '/noticias', '/peliculas', '/portafolio', '/sobre-mi', '/contacto'].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));
  return [
    ...staticRoutes,
    ...games.map((g) => ({ url: `${base}/videojuegos/${g.slug}`, lastModified: new Date() })),
    ...news.map((n) => ({ url: `${base}/noticias/${n.slug}`, lastModified: new Date(n.published_at) })),
    ...devlogs.map((d) => ({ url: `${base}/devlogs/${d.slug}`, lastModified: new Date(d.date) })),
    ...works.map((w) => ({ url: `${base}/portafolio/${w.slug}`, lastModified: new Date(w.date) })),
  ];
}
