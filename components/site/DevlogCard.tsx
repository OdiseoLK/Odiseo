import Link from 'next/link';
import { Clock, GitCommitHorizontal } from 'lucide-react';
import type { Devlog } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function DevlogCard({ log }: { log: Devlog }) {
  return (
    <Link href={`/devlogs/${log.slug}`} className="glass glass-hover group block rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-electric/15 px-2.5 py-1 font-mono text-xs font-semibold text-electric">{log.version}</span>
        <span className="text-xs text-zinc-500">{formatDate(log.date)}</span>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-500"><Clock size={12} /> {log.time_invested}</span>
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-white group-hover:text-electric">{log.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{log.summary}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-500">
        <GitCommitHorizontal size={13} className="text-nebula" />
        {log.changes?.length ?? 0} cambios registrados
      </p>
    </Link>
  );
}
