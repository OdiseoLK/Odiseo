import ProgressBar from '@/components/ui/ProgressBar';
import Reveal from '@/components/ui/Reveal';
import { PROGRESS_CATEGORIES } from '@/lib/utils';

export default function ProgressCategories({ categories }: { categories: Record<string, number> }) {
  const keys = PROGRESS_CATEGORIES.filter((k) => k in categories);
  const rest = Object.keys(categories).filter((k) => !keys.includes(k));
  const ordered = [...keys, ...rest];
  return (
    <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
      {ordered.map((name, i) => (
        <Reveal key={name} delay={i * 0.05}>
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-medium text-zinc-300">{name}</span>
              <span className="font-mono text-xs text-electric">{categories[name]}%</span>
            </div>
            <ProgressBar value={categories[name]} />
          </div>
        </Reveal>
      ))}
    </div>
  );
}
