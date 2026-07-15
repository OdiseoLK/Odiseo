import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

export default function SectionHeading({
  eyebrow, num, title, description, href, hrefLabel,
}: { eyebrow: string; num?: number; title: string; description?: string; href?: string; hrefLabel?: string }) {
  return (
    <Reveal>
      <div className="mb-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-white/[0.07] pt-5">
          <p className="eyebrow">
            {typeof num === 'number' && <span className="mr-3 text-electric">{String(num).padStart(2, '0')}</span>}
            {eyebrow}
          </p>
          {href && (
            <Link href={href} className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 transition hover:text-electric">
              {hrefLabel ?? 'Ver todo'}
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">{title}</h2>
        {description && <p className="mt-4 max-w-2xl leading-relaxed text-zinc-400">{description}</p>}
      </div>
    </Reveal>
  );
}
