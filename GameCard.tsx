import { GAME_STATUS_COLOR, GAME_STATUS_LABEL, cn } from '@/lib/utils';

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold', GAME_STATUS_COLOR[status] ?? GAME_STATUS_COLOR.pausado, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {GAME_STATUS_LABEL[status] ?? status}
    </span>
  );
}
