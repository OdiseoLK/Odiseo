'use client';
import { useEffect, useMemo, useState } from 'react';
import { useCrud } from '@/lib/admin/useCrud';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Devlog } from '@/lib/types';
import { formatDate, slugify } from '@/lib/utils';
import { DataTable, Drawer, PageHeader, SaveBar, SetupNotice } from '@/components/admin/ui';
import { RepeaterField, SelectField, StringListField, TextAreaField, TextField } from '@/components/admin/fields';
import { GalleryUpload, ImageUpload } from '@/components/admin/ImageUpload';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

const empty = (): Partial<Devlog> => ({
  game_id: null, slug: '', version: 'v0.0.1', title: '', date: new Date().toISOString().slice(0, 10),
  time_invested: '', summary: '', content: '', cover_url: null, gallery: [], goals: [], changes: [], status: 'draft',
});

export default function AdminDevlogs() {
  const { rows, loading, save, remove, configured } = useCrud<Devlog>('devlogs', 'date');
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [games, setGames] = useState<{ id: string; title: string }[]>([]);
  const [draft, setDraft] = useState<Partial<Devlog> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('games').select('id,title').order('sort').then(({ data }) => setGames(data ?? []));
  }, [supabase]);

  if (!configured) return (<div><PageHeader title="Devlogs" /><SetupNotice /></div>);

  const set = (patch: Partial<Devlog>) => setDraft((d) => ({ ...d, ...patch }));
  const gameName = (id: string | null) => games.find((g) => g.id === id)?.title ?? '—';
  const onSave = async () => {
    if (!draft?.title) { setError('El título es obligatorio.'); return; }
    setSaving(true); setError(null);
    const payload = { ...draft, slug: draft.slug || slugify(`${draft.version} ${draft.title}`) };
    const { error } = await save(payload);
    setSaving(false);
    if (error) setError(error); else setDraft(null);
  };

  return (
    <div>
      <PageHeader title="Devlogs" description="Bitácora de desarrollo por versión: cambios, objetivos y avances." onNew={() => { setError(null); setDraft(empty()); }} newLabel="Nuevo devlog" />
      <DataTable
        rows={rows} loading={loading} searchKeys={['title', 'version']}
        onEdit={(r) => { setError(null); setDraft(r); }}
        onDelete={(r) => { if (confirm(`¿Eliminar “${r.title}”?`)) remove(r.id); }}
        columns={[
          { key: 'version', label: 'Versión', className: 'w-24', render: (r) => <span className="font-mono text-xs text-electric">{r.version}</span> },
          { key: 'title', label: 'Título', render: (r) => <span className="font-medium text-white">{r.title}</span> },
          { key: 'game_id', label: 'Juego', className: 'w-44', render: (r) => gameName(r.game_id) },
          { key: 'date', label: 'Fecha', className: 'w-36', render: (r) => formatDate(r.date) },
          { key: 'status', label: 'Estado', className: 'w-28', render: (r) => (
            <span className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${r.status === 'published' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.08] text-zinc-400'}`}>
              {r.status === 'published' ? 'Publicado' : 'Borrador'}
            </span>
          ) },
        ]}
      />
      <Drawer wide open={!!draft} title={draft?.id ? 'Editar devlog' : 'Nuevo devlog'} onClose={() => setDraft(null)}
        footer={<SaveBar onSave={onSave} onCancel={() => setDraft(null)} saving={saving} error={error} />}>
        {draft && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Título" value={draft.title ?? ''} onChange={(v) => set({ title: v })} />
              <SelectField label="Juego" value={draft.game_id ?? ''} onChange={(v) => set({ game_id: v || null })}
                options={[{ value: '', label: 'Sin juego' }, ...games.map((g) => ({ value: g.id, label: g.title }))]} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField label="Versión" value={draft.version ?? ''} onChange={(v) => set({ version: v })} placeholder="v0.0.3" />
              <TextField label="Fecha" type="date" value={(draft.date ?? '').slice(0, 10)} onChange={(v) => set({ date: v })} />
              <TextField label="Tiempo invertido" value={draft.time_invested ?? ''} onChange={(v) => set({ time_invested: v })} placeholder="12 horas" />
            </div>
            <TextField label="Slug (URL)" value={draft.slug ?? ''} onChange={(v) => set({ slug: slugify(v) })} hint="Se genera solo si lo dejas vacío." />
            <TextAreaField label="Resumen" value={draft.summary ?? ''} onChange={(v) => set({ summary: v })} rows={2} />
            <MarkdownEditor label="Contenido" value={draft.content ?? ''} onChange={(v) => set({ content: v })} />
            <RepeaterField
              label="Lista de cambios" addLabel="Agregar cambio"
              value={(draft.changes ?? []) as unknown as Record<string, unknown>[]}
              onChange={(v) => set({ changes: v as unknown as Devlog['changes'] })}
              makeEmpty={() => ({ type: 'nuevo', text: '' })}
              fields={[
                { key: 'type', label: 'Tipo', type: 'select', options: [
                  { value: 'nuevo', label: 'Nuevo' }, { value: 'mejora', label: 'Mejora' }, { value: 'arreglo', label: 'Arreglo' },
                ] },
                { key: 'text', label: 'Descripción' },
              ]}
            />
            <StringListField label="Objetivos de esta versión" value={draft.goals ?? []} onChange={(v) => set({ goals: v })} />
            <ImageUpload label="Portada" value={draft.cover_url ?? null} onChange={(v) => set({ cover_url: v })} folder="devlogs" />
            <GalleryUpload label="Galería" value={draft.gallery ?? []} onChange={(v) => set({ gallery: v })} folder="devlogs/galeria" />
            <SelectField label="Estado" value={draft.status ?? 'draft'} onChange={(v) => set({ status: v as Devlog['status'] })}
              options={[{ value: 'draft', label: 'Borrador' }, { value: 'published', label: 'Publicado' }]} />
          </>
        )}
      </Drawer>
    </div>
  );
}
