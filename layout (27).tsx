'use client';
import { useState } from 'react';
import { useCrud } from '@/lib/admin/useCrud';
import type { PortfolioItem } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { DataTable, Drawer, PageHeader, SaveBar, SetupNotice } from '@/components/admin/ui';
import { StringListField, TextAreaField, TextField } from '@/components/admin/fields';
import { GalleryUpload, ImageUpload } from '@/components/admin/ImageUpload';

const empty = (): Partial<PortfolioItem> => ({
  slug: '', title: '', description: '', category: 'Desarrollo web', client: '', date: '2026',
  technologies: [], cover_url: null, gallery: [], external_url: '',
});

export default function AdminPortfolio() {
  const { rows, loading, save, remove, configured } = useCrud<PortfolioItem>('portfolio');
  const [draft, setDraft] = useState<Partial<PortfolioItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) return (<div><PageHeader title="Trabajos" /><SetupNotice /></div>);

  const set = (patch: Partial<PortfolioItem>) => setDraft((d) => ({ ...d, ...patch }));
  const onSave = async () => {
    if (!draft?.title) { setError('El título es obligatorio.'); return; }
    setSaving(true); setError(null);
    const { error } = await save({ ...draft, slug: draft.slug || slugify(draft.title) });
    setSaving(false);
    if (error) setError(error); else setDraft(null);
  };

  return (
    <div>
      <PageHeader title="Trabajos" description="Tu portafolio de proyectos y colaboraciones." onNew={() => { setError(null); setDraft(empty()); }} newLabel="Nuevo trabajo" />
      <DataTable
        rows={rows} loading={loading} searchKeys={['title', 'category', 'client']}
        onEdit={(r) => { setError(null); setDraft(r); }}
        onDelete={(r) => { if (confirm(`¿Eliminar “${r.title}”?`)) remove(r.id); }}
        columns={[
          { key: 'title', label: 'Proyecto', render: (r) => <span className="font-medium text-white">{r.title}</span> },
          { key: 'category', label: 'Categoría', className: 'w-44' },
          { key: 'client', label: 'Cliente', className: 'w-44' },
          { key: 'date', label: 'Fecha', className: 'w-24' },
        ]}
      />
      <Drawer wide open={!!draft} title={draft?.id ? 'Editar trabajo' : 'Nuevo trabajo'} onClose={() => setDraft(null)}
        footer={<SaveBar onSave={onSave} onCancel={() => setDraft(null)} saving={saving} error={error} />}>
        {draft && (
          <>
            <TextField label="Título" value={draft.title ?? ''} onChange={(v) => set({ title: v })} />
            <TextField label="Slug (URL)" value={draft.slug ?? ''} onChange={(v) => set({ slug: slugify(v) })} hint="Se genera solo si lo dejas vacío." />
            <TextAreaField label="Descripción" value={draft.description ?? ''} onChange={(v) => set({ description: v })} rows={4} />
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField label="Categoría" value={draft.category ?? ''} onChange={(v) => set({ category: v })} placeholder="Desarrollo web" />
              <TextField label="Cliente" value={draft.client ?? ''} onChange={(v) => set({ client: v })} placeholder="Proyecto personal" />
              <TextField label="Fecha" value={draft.date ?? ''} onChange={(v) => set({ date: v })} placeholder="Junio 2026" />
            </div>
            <StringListField label="Tecnologías" value={draft.technologies ?? []} onChange={(v) => set({ technologies: v })} />
            <ImageUpload label="Portada" value={draft.cover_url ?? null} onChange={(v) => set({ cover_url: v })} folder="portafolio" />
            <GalleryUpload label="Galería" value={draft.gallery ?? []} onChange={(v) => set({ gallery: v })} folder="portafolio/galeria" />
            <TextField label="Enlace externo" value={draft.external_url ?? ''} onChange={(v) => set({ external_url: v })} placeholder="https://…" />
          </>
        )}
      </Drawer>
    </div>
  );
}
