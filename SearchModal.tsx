'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import SearchModal from './SearchModal';

const LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/videojuegos', label: 'Videojuegos' },
  { href: '/devlogs', label: 'Devlogs' },
  { href: '/noticias', label: 'Noticias' },
  { href: '/peliculas', label: 'Películas' },
  { href: '/portafolio', label: 'Portafolio' },
  { href: '/sobre-mi', label: 'Sobre mí' },
  { href: '/contacto', label: 'Contacto' },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center">
        <svg viewBox="0 0 64 64" className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[24deg]">
          <circle cx="32" cy="32" r="17" fill="none" stroke="#4F8CFF" strokeWidth="5" />
          <ellipse cx="32" cy="32" rx="24" ry="9" fill="none" stroke="#8b6cf0" strokeWidth="3" transform="rotate(-24 32 32)" />
          <circle cx="50" cy="21" r="3.4" fill="#8b6cf0" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-[0.18em] text-white">ODISEO</span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'border-b border-white/[0.07] bg-ink/85 backdrop-blur-md' : 'bg-transparent'
        )}
      >
        <nav className="container-site flex h-16 items-center justify-between gap-4">
          <Logo />
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      'relative px-3 py-2 text-[13px] tracking-wide transition after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-electric after:transition-transform',
                      active ? 'text-white after:scale-x-100' : 'text-zinc-400 hover:text-white hover:after:scale-x-100'
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:text-zinc-200 sm:flex"
              aria-label="Buscar en el sitio"
            >
              <Search size={15} />
              <span className="hidden md:inline">Buscar</span>
              <kbd className="hidden rounded border border-white/10 bg-white/[0.06] px-1.5 font-mono text-[10px] text-zinc-500 md:inline">⌘K</kbd>
            </button>
            <button onClick={() => setSearchOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 sm:hidden" aria-label="Buscar">
              <Search size={16} />
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200 lg:hidden"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-white/[0.07] bg-[#06080f]/95 lg:hidden"
            >
              <ul className="container-site grid gap-1 py-4">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.06] hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
