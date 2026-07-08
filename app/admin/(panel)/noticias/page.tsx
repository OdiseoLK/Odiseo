'use client';
import { useState } from 'react';
import { useCrud } from '@/lib/admin/useCrud';
import type { News } from '@/lib/types';
import { DataTable, Drawer, PageHeader, SaveBar, SetupNotice } from '@/components/admin/ui';
import { SelectField, StringListField, TextAreaField, TextField, ToggleField } from '@/components/admin/fields';
import { ImageUpload } from '@/components/admin/ImageUpload';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import { formatDate, slugify } from '@/lib/utils';

const empty = (): Partial<News> => ({
  title: '', slug: '', excerpt: '', content: '', cover_url: null,
  category: 'Actualización', tags: [], featured: false, status: 'draft',
  published_at: new Date().toISOString(),
});

export default function AdminNews() {
  const { rows, loading, save, remove, configured } = useCrud<News>('news', 'published_at');
  const [draft, setDraft] = useState<Partial<News> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) return (<div><PageHeader title="Noticias" /><SetupNotice /></div>);

  const set = (patch: Partial<News>) => setDraft((d) => ({ ...d, ...patch }));

  const onSave = async () => {
    if (!draft?.title) { setError('El título es obligatorio.'); return; }
    setSaving(true); setError(null);
    const record = { ...draft, slug: draft.slug || slugify(draft.title) };
    const { error } = await save(record);
    setSaving(false);
    if (error) setError(error);
    else setDraft(null);
  };

  const scheduled = draft?.published_at ? new Date(draft.published_at) > new Date() : false;

  return (
    <div>
      <PageHeader title="Noticias" description="Crea, programa y destaca las noticias del sitio." onNew={() => { setError(null); setDraft(empty()); }} newLabel="Nueva noticia" />
      <DataTable
        rows={rows}
        loading={loading}
        searchKeys={['title', 'category']}
        onEdit={(r) => { setError(null); setDraft(r); }}
        onDelete={(r) => { if (confirm(`¿Eliminar “${r.title}”?`)) remove(r.id); }}
        columns={[
          { key: 'title', label: 'Título', render: (r) => (
            <span className="flex items-center gap-2 font-medium text-white">
              {r.title}
              {r.featured && <span className="rounded bg-electric/15 px-1.5 py-0.5 text-[9px] font-bold text-electric">DESTACADA</span>}
            </span>
          ) },
          { key: 'category', label: 'Categoría', className: 'w-36' },
          { key: 'status', label: 'Estado', className: 'w-36', render: (r) => {
            const future = new Date(r.published_at) > new Date();
            const label = r.status === 'draft' ? 'Borrador' : future ? 'Programada' : 'Publicada';
            const cls = r.status === 'draft' ? 'text-zinc-400 bg-zinc-400/10' : future ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10';
            return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
          } },
          { key: 'published_at', label: 'Fecha', className: 'w-40', render: (r) => <span className="text-zinc-500">{formatDate(r.published_at)}</span> },
        ]}
      />

      <Drawer
        open={!!draft}
        title={draft?.id ? 'Editar noticia' : 'Nueva noticia'}
        onClose={() => setDraft(null)}
        wide
        footer={<SaveBar onSave={onSave} onCancel={() => setDraft(null)} saving={saving} error={error} />}
      >
        {draft && (
          <>
            <TextField label="Título" value={draft.title ?? ''} onChange={(v) => set({ title: v, slug: draft.id ? draft.slug : slugify(v) })} />
            <TextField label="Slug (URL)" value={draft.slug ?? ''} onChange={(v) => set({ slug: slugify(v) })} hint={`/noticias/${draft.slug || '…'}`} />
            <TextAreaField label="Resumen" value={draft.excerpt ?? ''} onChange={(v) => set({ excerpt: v })} rows={2} />
            <ImageUpload label="Portada" value={draft.cover_url ?? null} onChange={(v) => set({ cover_url: v })} folder="noticias" />
            <MarkdownEditor label="Contenido" value={draft.content ?? ''} onChange={(v) => set({ content: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Categoría" value={draft.category ?? ''} onChange={(v) => set({ category: v })} />
              <SelectField label="Estado" value={draft.status ?? 'draft'} onChange={(v) => set({ status: v as News['status'] })} options={[{ value: 'draft', label: 'Borrador' }, { value: 'published', label: 'Publicada' }]} />
            </div>
            <TextField
              label="Fecha de publicación" type="datetime-local"
              value={draft.published_at ? new Date(draft.published_at).toISOString().slice(0, 16) : ''}
              onChange={(v) => set({ published_at: v ? new Date(v).toISOString() : new Date().toISOString() })}
              hint={scheduled ? 'Fecha futura: la noticia quedará programada y aparecerá automáticamente.' : 'Con fecha futura, la noticia se programa.'}
            />
            <StringListField label="Etiquetas" value={draft.tags ?? []} onChange={(v) => set({ tags: v })} />
            <ToggleField label="Noticia destacada" hint="Aparece en grande al inicio de la sección." value={!!draft.featured} onChange={(v) => set({ featured: v })} />
          </>
        )}
      </Drawer>
    </div>
  );
}
