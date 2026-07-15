'use client';
import { useState } from 'react';
import { useCrud } from '@/lib/admin/useCrud';
import type { Tag } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { DataTable, Drawer, PageHeader, SaveBar, SetupNotice } from '@/components/admin/ui';
import { TextField } from '@/components/admin/fields';

export default function AdminTags() {
  const { rows, loading, save, remove, configured } = useCrud<Tag>('tags', 'name', true);
  const [draft, setDraft] = useState<Partial<Tag> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) return (<div><PageHeader title="Etiquetas" /><SetupNotice /></div>);

  const onSave = async () => {
    if (!draft?.name) { setError('El nombre es obligatorio.'); return; }
    setSaving(true); setError(null);
    const { error } = await save({ ...draft, slug: slugify(draft.name) });
    setSaving(false);
    if (error) setError(error); else setDraft(null);
  };

  return (
    <div>
      <PageHeader title="Etiquetas" description="Etiquetas reutilizables para tus noticias." onNew={() => { setError(null); setDraft({ name: '' }); }} newLabel="Nueva etiqueta" />
      <DataTable
        rows={rows} loading={loading} searchKeys={['name']}
        onEdit={(r) => { setError(null); setDraft(r); }}
        onDelete={(r) => { if (confirm(`¿Eliminar “${r.name}”?`)) remove(r.id); }}
        columns={[
          { key: 'name', label: 'Nombre', render: (r) => <span className="font-medium text-white">#{r.name}</span> },
          { key: 'slug', label: 'Slug', className: 'w-56', render: (r) => <span className="font-mono text-xs text-zinc-500">{r.slug}</span> },
        ]}
      />
      <Drawer open={!!draft} title={draft?.id ? 'Editar etiqueta' : 'Nueva etiqueta'} onClose={() => setDraft(null)}
        footer={<SaveBar onSave={onSave} onCancel={() => setDraft(null)} saving={saving} error={error} />}>
        {draft && <TextField label="Nombre" value={draft.name ?? ''} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />}
      </Drawer>
    </div>
  );
}
