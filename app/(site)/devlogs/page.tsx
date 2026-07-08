import type { Metadata } from 'next';
import DevlogCard from '@/components/site/DevlogCard';
import Reveal from '@/components/ui/Reveal';
import { getDevlogs } from '@/lib/data';

export const metadata: Metadata = { title: 'Devlogs', description: 'Diario técnico del desarrollo: versiones, cambios y lecciones de cada semana.' };

export default async function DevlogsPage() {
  const logs = await getDevlogs();
  return (
    <div className="container-site pb-24 pt-32">
      <Reveal>
        <p className="eyebrow mb-3">Diario de desarrollo</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Devlogs</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          El registro honesto del proyecto: qué se construyó, cuánto tomó y qué se aprendió en cada versión.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {logs.map((d, i) => (
          <Reveal key={d.id} delay={i * 0.06}><DevlogCard log={d} /></Reveal>
        ))}
      </div>
      {logs.length === 0 && <p className="mt-12 text-zinc-500">Aún no hay devlogs publicados.</p>}
    </div>
  );
}
