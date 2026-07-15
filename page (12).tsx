'use client';
import { useState } from 'react';
import { useCrud } from '@/lib/admin/useCrud';
import type { Category } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { DataTable, Drawer, PageHeader, SaveBar, SetupNotice } from '@/components/admin/ui';
import { SelectField, TextField } from '@/components/admin/fields';

const SCOPES = [
  { value: 'noticias', label: 'Noticias' },
  { value: 'portafolio', label: 'Portafolio' },
  { value: 'peliculas', label: 'Películas' },
];

export default function AdminCategories() {
  const { rows, loading, save, remove, configured } = useCrud<Category>('categories', 'name', true);
  const [draft, setDraft] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) return (<div><PageHeader title="Categorías" /><SetupNotice /></div>);

  const set = (patch: Partial<Category>) => setDraft((d) => ({ ...d, ...patch }));
  const onSave = async () => {
    if (!draft?.name) { setError('El nombre es obligatorio.'); return; }
    setSaving(true); setError(null);
    const { error } = await save({ ...draft, slug: slugify(draft.name) });
    setSaving(false);
    if (error) setError(error); else setDraft(null);
  };

  return (
    <div>
      <PageHeader title="Categorías" description="Organiza noticias, trabajos y reseñas por categoría." onNew={() => { setError(null); setDraft({ name: '', scope: 'noticias' }); }} newLabel="Nueva categoría" />
      <DataTable
        rows={rows} loading={loading} searchKeys={['name']}
        onEdit={(r) => { setError(null); setDraft(r); }}
        onDelete={(r) => { if (confirm(`¿Eliminar “${r.name}”?`)) remove(r.id); }}
        columns={[
          { key: 'name', label: 'Nombre', render: (r) => <span className="font-medium text-white">{r.name}</span> },
          { key: 'scope', label: 'Sección', className: 'w-40', render: (r) => SCOPES.find((s) => s.value === r.scope)?.label ?? r.scope },
          { key: 'slug', label: 'Slug', className: 'w-48', render: (r) => <span className="font-mono text-xs text-zinc-500">{r.slug}</span> },
        ]}
      />
      <Drawer open={!!draft} title={draft?.id ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setDraft(null)}
        footer={<SaveBar onSave={onSave} onCancel={() => setDraft(null)} saving={saving} error={error} />}>
        {draft && (
          <>
            <TextField label="Nombre" value={draft.name ?? ''} onChange={(v) => set({ name: v })} />
            <SelectField label="Sección" value={draft.scope ?? 'noticias'} onChange={(v) => set({ scope: v })} options={SCOPES} />
          </>
        )}
      </Drawer>
    </div>
  );
}
