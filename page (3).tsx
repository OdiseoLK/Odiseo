'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Github, Instagram, MessageCircle, Newspaper, Rocket, Youtube } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

/**
 * Hero personal estilo estudio: "Hola, soy Odiseo." sobre la imagen de
 * portada (editable en Admin → Ajustes), con botones y redes sociales.
 */
export default function Hero({ settings }: { settings: SiteSettings }) {
  const reduce = useReducedMotion();
  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, delay: 0.12 * i, ease: [0.21, 0.65, 0.36, 1] as const },
  });

  const s = settings.socials ?? {};
  const img = settings.hero_image || '/covers/hero-odiseo.jpg';
  const socials = [
    s.instagram && { href: s.instagram, label: 'Instagram', Icon: Instagram },
    s.youtube && { href: s.youtube, label: 'YouTube', Icon: Youtube },
    s.discord && { href: s.discord, label: 'Discord', Icon: MessageCircle },
    s.github && { href: s.github, label: 'GitHub', Icon: Github },
  ].filter(Boolean) as Array<{ href: string; label: string; Icon: typeof Github }>;

  return (
    <section className="relative flex min-h-[80vh] flex-col justify-center overflow-hidden pt-16">
      {/* Imagen de portada con paneo lento */}
      <div aria-hidden className="absolute inset-0">
        <img src={img} alt="" className="hero-kenburns absolute inset-0 h-full w-full object-cover object-[58%_36%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/[0.82] to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      </div>

      <div className="container-site relative z-10 py-24">
        <motion.p {...item(0)} className="font-display text-2xl font-semibold text-zinc-100 sm:text-3xl">
          Hola, soy
        </motion.p>
        <motion.h1
          {...item(1)}
          className="font-display text-6xl font-extrabold leading-[0.95] tracking-tight text-electric sm:text-8xl"
          style={{ textShadow: '0 0 60px rgba(79,140,255,.35)' }}
        >
          Odiseo<span className="text-white">.</span>
        </motion.h1>

        <motion.p {...item(2)} className="mt-6 max-w-md text-lg leading-relaxed text-zinc-300">
          {settings.tagline}
        </motion.p>

        <motion.div {...item(3)} className="mt-9 flex flex-wrap gap-3">
          <Link href="/videojuegos" className="btn-primary">
            <Rocket size={16} /> Ver proyectos
          </Link>
          <Link href="/noticias" className="btn-ghost">
            <Newspaper size={16} /> Últimas noticias
          </Link>
        </motion.div>

        {socials.length > 0 && (
          <motion.div {...item(4)} className="mt-9 flex items-center gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-ink/40 text-zinc-300 backdrop-blur transition hover:border-electric/50 hover:text-electric"
              >
                <Icon size={17} />
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
