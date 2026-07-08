import type { Metadata } from 'next';
import { Github, Instagram, Mail, MessageCircle } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import ContactForm from '@/components/site/ContactForm';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Contacto', description: 'Escríbeme para colaboraciones, proyectos o cualquier idea.' };

export default async function ContactPage() {
  const { socials } = await getSettings();
  const channels = [
    socials.instagram && { icon: <Instagram size={17} />, label: 'Instagram', value: '@fotogramas.malditos', href: socials.instagram },
    socials.github && { icon: <Github size={17} />, label: 'GitHub', value: 'Repositorios y proyectos', href: socials.github },
    socials.discord && { icon: <MessageCircle size={17} />, label: 'Discord', value: 'Comunidad del estudio', href: socials.discord },
    socials.email && { icon: <Mail size={17} />, label: 'Correo', value: socials.email, href: `mailto:${socials.email}` },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href: string }[];

  return (
    <div className="container-site pb-24 pt-32">
      <Reveal>
        <p className="eyebrow mb-3">Canal abierto</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Contacto</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          ¿Colaboración, proyecto web o feedback sobre un juego? Escríbeme por aquí o por cualquiera de estos canales.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr,1fr]">
        <Reveal><ContactForm /></Reveal>
        <Reveal delay={0.1}>
          <div className="grid gap-3">
            {channels.map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="glass glass-hover flex items-center gap-4 rounded-2xl p-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-electric/12 text-electric">{c.icon}</span>
                <span>
                  <span className="block text-sm font-semibold text-white">{c.label}</span>
                  <span className="block text-xs text-zinc-500">{c.value}</span>
                </span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
