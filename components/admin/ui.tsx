'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';

export function PageHeader({ title, description, onNew, newLabel = 'Nuevo' }: {
  title: string; description?: string; onNew?: () => void; newLabel?: string;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {onNew && (
        <button onClick={onNew} className="btn-primary !py-2 text-xs"><Plus size={14} /> {newLabel}</button>
      )}
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="glass rounded-2xl border-amber-400/25 bg-amber-400/[0.06] p-6 text-sm text-amber-200">
      <p className="font-semibold">Supabase no está configurado.</p>
      <p className="mt-1.5 text-amber-200/80">
        Crea un archivo <code className="rounded bg-black/30 px-1.5 py-0.5">.env.local</code> con tus llaves de Supabase y ejecuta el script
        <code className="rounded bg-black/30 px-1.5 py-0.5"> supabase/schema.sql</code>. Los pasos completos están en el README del proyecto.
      </p>
    </div>
  );
}

export type Column<T> = { key: string; label: string; className?: string; render?: (row: T) => React.ReactNode };

export function DataTable<T extends { id: string }>({ rows, columns, loading, onEdit, onDelete, searchKeys, emptyText = 'Sin registros todavía. Crea el primero.' }: {
  rows: T[];
  columns: Column<T>[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  searchKeys?: (keyof T)[];
  emptyText?: string;
}) {
  const [query, setQuery] = useState('');
  const filtered = query && searchKeys?.length
    ? rows.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(query.toLowerCase())))
    : rows;

  return (
    <div className="glass overflow-hidden rounded-2xl">
      {searchKeys && (
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
          <Search size={14} className="text-zinc-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filtrar…" className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600" />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] text-[11px] uppercase tracking-wider text-zinc-500">
              {columns.map((c) => <th key={c.key} className={`px-4 py-3 font-semibold ${c.className ?? ''}`}>{c.label}</th>)}
              {(onEdit || onDelete) && <th className="w-24 px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-zinc-500"><Loader2 size={18} className="mx-auto animate-spin" /></td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-zinc-500">{emptyText}</td></tr>
            )}
            {!loading && filtered.map((row) => (
              <tr key={row.id} className="border-b border-white/[0.05] transition last:border-0 hover:bg-white/[0.03]">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-middle text-zinc-300 ${c.className ?? ''}`}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {onEdit && <button onClick={() => onEdit(row)} className="rounded-lg p-2 text-zinc-400 hover:bg-electric/15 hover:text-electric" aria-label="Editar"><Pencil size={14} /></button>}
                      {onDelete && <button onClick={() => onDelete(row)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/15 hover:text-red-400" aria-label="Eliminar"><Trash2 size={14} /></button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Drawer({ open, title, onClose, children, footer, wide = false }: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm" onClick={onClose}>
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.21, 0.65, 0.36, 1] }}
            className={`ml-auto flex h-full w-full flex-col border-l border-white/[0.08] bg-night-800 shadow-card ${wide ? 'max-w-3xl' : 'max-w-xl'}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-label={title}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
              <h2 className="font-display text-lg font-bold text-white">{title}</h2>
              <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white" aria-label="Cerrar"><X size={17} /></button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">{children}</div>
            {footer && <div className="flex items-center justify-end gap-3 border-t border-white/[0.07] px-6 py-4">{footer}</div>}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SaveBar({ onSave, onCancel, saving, error, deleteAction }: {
  onSave: () => void; onCancel: () => void; saving?: boolean; error?: string | null; deleteAction?: () => void;
}) {
  return (
    <>
      {error && <p className="mr-auto max-w-[50%] text-xs text-red-400">{error}</p>}
      {deleteAction && (
        <button onClick={deleteAction} className="mr-auto rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20">
          Eliminar
        </button>
      )}
      <button onClick={onCancel} className="btn-ghost !py-2 text-xs">Cancelar</button>
      <button onClick={onSave} disabled={saving} className="btn-primary !py-2 text-xs disabled:opacity-50">
        {saving ? <Loader2 size={13} className="animate-spin" /> : null}
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </>
  );
}
