'use client';
import { useState } from 'react';
import { useCrud } from '@/lib/admin/useCrud';
import type { Movie } from '@/lib/types';
import { DataTable, Drawer, PageHeader, SaveBar, SetupNotice } from '@/components/admin/ui';
import { NumberField, TextAreaField, TextField } from '@/components/admin/fields';
import { ImageUpload } from '@/components/admin/ImageUpload';
import StarRating from '@/components/ui/StarRating';

const empty = (): Partial<Movie> => ({
  title: '', year: new Date().getFullYear(), genre: 'Terror', director: '', duration: 90,
  rating: 4, review: '', poster_url: null, trailer_url: '', platform: '', instagram_url: '', featured: false,
});

export default function AdminMovies() {
  const { rows, loading, save, remove, configured } = useCrud<Movie>('movies');
  const [draft, setDraft] = useState<Partial<Movie> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) return (<div><PageHeader title="Opiniones de películas" /><SetupNotice /></div>);

  const set = (patch: Partial<Movie>) => setDraft((d) => ({ ...d, ...patch }));
  const onSave = async () => {
    if (!draft?.title) { setError('El título es obligatorio.'); return; }
    setSaving(true); setError(null);
    const { error } = await save(draft);
    setSaving(false);
    if (error) setError(error); else setDraft(null);
  };

  return (
    <div>
      <PageHeader title="Opiniones de películas" description="Tu catálogo de reseñas conectado con Instagram." onNew={() => { setError(null); setDraft(empty()); }} newLabel="Nueva reseña" />
      <DataTable
        rows={rows} loading={loading} searchKeys={['title', 'director', 'genre']}
        onEdit={(r) => { setError(null); setDraft(r); }}
        onDelete={(r) => { if (confirm(`¿Eliminar “${r.title}”?`)) remove(r.id); }}
        columns={[
          { key: 'title', label: 'Película', render: (r) => <span className="font-medium text-white">{r.title} <span className="text-zinc-500">({r.year})</span></span> },
          { key: 'genre', label: 'Género', className: 'w-32' },
          { key: 'director', label: 'Director', className: 'w-48' },
          { key: 'rating', label: 'Calificación', className: 'w-36', render: (r) => <StarRating rating={r.rating} size={13} /> },
        ]}
      />
      <Drawer open={!!draft} title={draft?.id ? 'Editar reseña' : 'Nueva reseña'} onClose={() => setDraft(null)}
        footer={<SaveBar onSave={onSave} onCancel={() => setDraft(null)} saving={saving} error={error} />}>
        {draft && (
          <>
            <TextField label="Título" value={draft.title ?? ''} onChange={(v) => set({ title: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="Año" value={draft.year ?? 2026} onChange={(v) => set({ year: v })} min={1900} max={2100} />
              <NumberField label="Duración (min)" value={draft.duration ?? 90} onChange={(v) => set({ duration: v })} min={1} max={600} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Género" value={draft.genre ?? ''} onChange={(v) => set({ genre: v })} />
              <TextField label="Director" value={draft.director ?? ''} onChange={(v) => set({ director: v })} />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-zinc-400">Calificación · <span className="font-mono text-electric">{draft.rating}</span> / 5</span>
              <input type="range" min={0} max={5} step={0.5} value={draft.rating ?? 0} onChange={(e) => set({ rating: Number(e.target.value) })} className="w-full accent-[#4F8CFF]" aria-label="Calificación en estrellas" />
              <div className="mt-1"><StarRating rating={draft.rating ?? 0} /></div>
            </div>
            <TextAreaField label="Opinión (resumen)" value={draft.review ?? ''} onChange={(v) => set({ review: v })} rows={4} />
            <ImageUpload label="Póster" value={draft.poster_url ?? null} onChange={(v) => set({ poster_url: v })} folder="peliculas" />
            <TextField label="Plataforma (dónde verla)" value={draft.platform ?? ''} onChange={(v) => set({ platform: v })} placeholder="Prime Video / Netflix / HBO Max" />
            <TextField label="Tráiler (YouTube)" value={draft.trailer_url ?? ''} onChange={(v) => set({ trailer_url: v })} placeholder="https://www.youtube.com/watch?v=…" hint="Pega el link normal del video; el sitio lo convierte solo." />
            <TextField label="Enlace de Instagram" value={draft.instagram_url ?? ''} onChange={(v) => set({ instagram_url: v })} placeholder="https://instagram.com/p/…" />
          </>
        )}
      </Drawer>
    </div>
  );
}
