import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

export default function SectionHeading({
  eyebrow, title, description, href, hrefLabel,
}: { eyebrow: string; title: string; description?: string; href?: string; hrefLabel?: string }) {
  return (
    <Reveal>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
          {description && <p className="mt-3 text-zinc-400">{description}</p>}
        </div>
        {href && (
          <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-electric hover:text-electric-400">
            {hrefLabel ?? 'Ver todo'}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </Reveal>
  );
}
