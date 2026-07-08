import { Check, CircleDashed } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import type { RoadmapItem } from '@/lib/types';

export default function Timeline({ items }: { items: RoadmapItem[] }) {
  return (
    <ol className="relative ml-3 border-l border-white/10">
      {items.map((item, i) => (
        <Reveal key={`${item.title}-${i}`} delay={i * 0.06}>
          <li className="relative pb-10 pl-8 last:pb-0">
            <span
              className={`absolute -left-[13px] top-0.5 grid h-6 w-6 place-items-center rounded-full border ${
                item.done
                  ? 'border-electric bg-electric text-ink shadow-glow-sm'
                  : 'border-white/20 bg-night-800 text-zinc-500'
              }`}
            >
              {item.done ? <Check size={13} strokeWidth={3} /> : <CircleDashed size={12} />}
            </span>
            <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">{item.date}</p>
            <h3 className={`mt-1 font-display text-base font-bold ${item.done ? 'text-white' : 'text-zinc-300'}`}>{item.title}</h3>
            {item.description && <p className="mt-1 max-w-xl text-sm text-zinc-400">{item.description}</p>}
          </li>
        </Reveal>
      ))}
    </ol>
  );
}
