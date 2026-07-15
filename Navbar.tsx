import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

const NAV = [
  { href: '/videojuegos', label: 'Videojuegos' },
  { href: '/devlogs', label: 'Devlogs' },
  { href: '/noticias', label: 'Noticias' },
  { href: '/peliculas', label: 'Películas' },
  { href: '/portafolio', label: 'Portafolio' },
  { href: '/sobre-mi', label: 'Sobre mí' },
  { href: '/contacto', label: 'Contacto' },
];

export default function Footer({ settings }: { settings: SiteSettings }) {
  const s = settings.socials ?? {};
  const year = new Date().getFullYear();
  const social = [
    s.instagram && { href: s.instagram, label: 'Instagram' },
    s.github && { href: s.github, label: 'GitHub' },
    s.email && { href: `mailto:${s.email}`, label: 'Correo' },
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#060810]">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent" />
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-bold tracking-[0.2em] text-white">ODISEO</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">Estudio independiente</p>
          {settings.footer_quote && (
            <p className="mt-6 max-w-xs text-sm italic leading-relaxed text-zinc-500">“{settings.footer_quote}”</p>
          )}
        </div>
        <nav aria-label="Mapa del sitio">
          <p className="eyebrow mb-5">Explorar</p>
          <ul className="grid gap-2.5">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-zinc-400 transition hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-5">Conecta</p>
          <ul className="grid gap-2.5">
            {social.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-electric"
                >
                  {l.label}
                  <ArrowUpRight size={13} className="opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/[0.05]">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 font-mono text-[11px] tracking-wider text-zinc-600 sm:flex-row">
          <p>© {year} Odiseo — Creating worlds, one game at a time.</p>
          <p>Next.js · Supabase · Vercel</p>
        </div>
      </div>
    </footer>
  );
}
