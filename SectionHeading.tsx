'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3, Clapperboard, FileText, FolderOpen, Gamepad2, Inbox, LayoutDashboard,
  LogOut, Menu, Newspaper, Settings, Tags, Users, Briefcase, Layers, ExternalLink, X,
} from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/admin/videojuegos', label: 'Videojuegos', icon: Gamepad2 },
  { href: '/admin/devlogs', label: 'Devlogs', icon: FileText },
  { href: '/admin/peliculas', label: 'Opiniones de películas', icon: Clapperboard },
  { href: '/admin/portafolio', label: 'Trabajos', icon: Briefcase },
  { href: '/admin/categorias', label: 'Categorías', icon: Layers },
  { href: '/admin/etiquetas', label: 'Etiquetas', icon: Tags },
  { href: '/admin/archivos', label: 'Medios', icon: FolderOpen },
  { href: '/admin/mensajes', label: 'Mensajes', icon: Inbox },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/analiticas', label: 'Analíticas', icon: BarChart3 },
  { href: '/admin/ajustes', label: 'Ajustes', icon: Settings },
];

export default function AdminShell({ children, userEmail }: { children: React.ReactNode; userEmail: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push('/admin/login');
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <svg viewBox="0 0 64 64" className="h-8 w-8">
          <circle cx="32" cy="32" r="17" fill="none" stroke="#4F8CFF" strokeWidth="5" />
          <ellipse cx="32" cy="32" rx="24" ry="9" fill="none" stroke="#8b6cf0" strokeWidth="3" transform="rotate(-24 32 32)" />
        </svg>
        <div>
          <p className="font-display text-sm font-bold tracking-[0.14em] text-white">ODISEO</p>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Panel de administración</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                active ? 'bg-electric text-ink font-semibold shadow-glow-sm' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
              )}
            >
              <Icon size={16} /> {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.07] p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white">
          <ExternalLink size={16} /> Ver sitio
        </Link>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-red-500/10 hover:text-red-300">
          <LogOut size={16} /> Cerrar sesión
        </button>
        {userEmail && <p className="truncate px-3 pb-1 pt-2 text-[11px] text-zinc-600">{userEmail}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-night-900">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.07] bg-night-800/70 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>
      {/* Sidebar móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-white/[0.07] bg-night-800">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-zinc-400 hover:text-white" aria-label="Cerrar menú"><X size={18} /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.07] bg-night-900/80 px-4 backdrop-blur-xl lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-zinc-300" aria-label="Abrir menú"><Menu size={18} /></button>
          <p className="font-display text-sm font-bold tracking-widest text-white">PANEL ODISEO</p>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
