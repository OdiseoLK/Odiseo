'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProgressBar({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  const reduce = useReducedMotion();
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]', className)}>
      <motion.div
        className={cn('h-full rounded-full bg-gradient-to-r from-electric to-nebula', barClassName)}
        initial={reduce ? { width: `${v}%` } : { width: 0 }}
        whileInView={{ width: `${v}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.21, 0.65, 0.36, 1] }}
      />
    </div>
  );
}
