'use client';
import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-zinc-600">{hint}</span>}
    </label>
  );
}

export function TextField({ label, value, onChange, placeholder, hint, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; type?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-dark" />
    </Field>
  );
}

export function NumberField({ label, value, onChange, min = 0, max = 100000 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <Field label={label}>
      <input type="number" value={Number.isFinite(value) ? value : 0} min={min} max={max} step="any" onChange={(e) => onChange(Number(e.target.value))} className="input-dark" />
    </Field>
  );
}

export function TextAreaField({ label, value, onChange, rows = 4, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <Field label={label}>
      <textarea value={value ?? ''} rows={rows} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-dark resize-y" />
    </Field>
  );
}

export function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-dark cursor-pointer">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

export function ToggleField({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left">
      <span>
        <span className="block text-sm font-medium text-zinc-200">{label}</span>
        {hint && <span className="block text-[11px] text-zinc-500">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${value ? 'bg-electric' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

export function StringListField({ label, value, onChange, placeholder = 'Escribe y presiona Enter' }: {
  label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...(value ?? []), v]);
    setDraft('');
  };
  return (
    <Field label={label}>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
        <div className="flex flex-wrap gap-1.5">
          {(value ?? []).map((v, i) => (
            <span key={`${v}-${i}`} className="inline-flex items-center gap-1 rounded-lg bg-electric/15 px-2 py-1 text-xs text-electric">
              {v}
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label={`Quitar ${v}`}><X size={12} /></button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            onBlur={add}
            placeholder={placeholder}
            className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
        </div>
      </div>
    </Field>
  );
}

type RepeaterFieldSpec = { key: string; label: string; type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'select'; options?: { value: string; label: string }[]; span?: 2 };

export function RepeaterField({ label, value, onChange, fields, addLabel = 'Agregar elemento', makeEmpty }: {
  label: string;
  value: Record<string, unknown>[];
  onChange: (v: Record<string, unknown>[]) => void;
  fields: RepeaterFieldSpec[];
  addLabel?: string;
  makeEmpty: () => Record<string, unknown>;
}) {
  const rows = value ?? [];
  const update = (i: number, key: string, v: unknown) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r));
    onChange(next);
  };
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</span>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="relative rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="absolute right-2 top-2 rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/15 hover:text-red-400" aria-label="Eliminar elemento">
              <Trash2 size={14} />
            </button>
            <div className="grid gap-3 pr-8 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.span === 2 || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <span className="mb-1 block text-[11px] text-zinc-500">{f.label}</span>
                  {f.type === 'textarea' ? (
                    <textarea rows={2} value={String(row[f.key] ?? '')} onChange={(e) => update(i, f.key, e.target.value)} className="input-dark !py-2 resize-y" />
                  ) : f.type === 'number' ? (
                    <input type="number" value={Number(row[f.key] ?? 0)} onChange={(e) => update(i, f.key, Number(e.target.value))} className="input-dark !py-2" />
                  ) : f.type === 'checkbox' ? (
                    <button type="button" onClick={() => update(i, f.key, !row[f.key])} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${row[f.key] ? 'border-electric/40 bg-electric/15 text-electric' : 'border-white/10 bg-white/[0.04] text-zinc-400'}`}>
                      {row[f.key] ? 'Sí' : 'No'}
                    </button>
                  ) : f.type === 'select' ? (
                    <select value={String(row[f.key] ?? '')} onChange={(e) => update(i, f.key, e.target.value)} className="input-dark !py-2 cursor-pointer">
                      {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input value={String(row[f.key] ?? '')} onChange={(e) => update(i, f.key, e.target.value)} className="input-dark !py-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...rows, makeEmpty()])} className="btn-ghost mt-3 !px-3 !py-2 text-xs">
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

export function ProgressMapField({ value, onChange, categories }: {
  value: Record<string, number>; onChange: (v: Record<string, number>) => void; categories: string[];
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-zinc-400">Progreso por categoría</span>
      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
        {categories.map((cat) => (
          <div key={cat}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-zinc-300">{cat}</span>
              <span className="font-mono text-electric">{value?.[cat] ?? 0}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={value?.[cat] ?? 0}
              onChange={(e) => onChange({ ...value, [cat]: Number(e.target.value) })}
              className="w-full accent-[#4F8CFF]"
              aria-label={`Progreso de ${cat}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
