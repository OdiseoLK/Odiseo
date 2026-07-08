import Link from 'next/link';
import { Github, Instagram, Mail } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

export default function Footer({ settings }: { settings: SiteSettings }) {
  const s = settings.socials ?? {};
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent" />
      <div className="container-site flex flex-col items-center gap-8 py-14 md:flex-row md:justify-between">
        <div className="text-center md:text-left">
          <p className="font-display text-lg font-bold tracking-[0.18em] text-white">ODISEO</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-zinc-400">
          <Link href="/videojuegos" className="hover:text-white">Videojuegos</Link>
          <Link href="/devlogs" className="hover:text-white">Devlogs</Link>
          <Link href="/noticias" className="hover:text-white">Noticias</Link>
          <Link href="/peliculas" className="hover:text-white">Películas</Link>
          <Link href="/portafolio" className="hover:text-white">Portafolio</Link>
        </nav>
        <div className="flex items-center gap-2">
          {s.instagram && <a href={s.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-electric/50 hover:text-electric"><Instagram size={17} /></a>}
          {s.github && <a href={s.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-electric/50 hover:text-electric"><Github size={17} /></a>}
          {s.email && <a href={`mailto:${s.email}`} aria-label="Correo" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-electric/50 hover:text-electric"><Mail size={17} /></a>}
        </div>
      </div>
      <div className="border-t border-white/[0.05] py-5 text-center text-xs text-zinc-600">
        © {year} Odiseo
      </div>
    </footer>
  );
}
