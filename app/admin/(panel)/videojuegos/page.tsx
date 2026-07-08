'use client';
import { useState } from 'react';
import { useCrud } from '@/lib/admin/useCrud';
import type { Game } from '@/lib/types';
import { DataTable, Drawer, PageHeader, SaveBar, SetupNotice } from '@/components/admin/ui';
import { NumberField, ProgressMapField, RepeaterField, SelectField, StringListField, TextAreaField, TextField, ToggleField } from '@/components/admin/fields';
import { GalleryUpload, ImageUpload } from '@/components/admin/ImageUpload';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import StatusBadge from '@/components/ui/StatusBadge';
import { PROGRESS_CATEGORIES, slugify } from '@/lib/utils';

const emptyProgress = () => Object.fromEntries(PROGRESS_CATEGORIES.map((c) => [c, 0]));

const empty = (): Partial<Game> => ({
  title: '', slug: '', tagline: '', description: '', status: 'en_desarrollo',
  progress: 0, progress_categories: emptyProgress(), engine: 'Unity', technologies: [],
  release_estimate: '', cover_url: '', trailer_url: null, demo_url: null, story: '',
  features: [], characters: [], gallery: [], roadmap: [], goals: [], faq: [],
  featured: false, sort: 99,
});

type Tab = 'general' | 'progreso' | 'contenido' | 'roadmap' | 'extras';

export default function AdminGames() {
  const { rows, loading, save, remove, configured } = useCrud<Game>('games', 'sort', true);
  const [draft, setDraft] = useState<Partial<Game> | null>(null);
  const [tab, setTab] = useState<Tab>('general');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) return (<div><PageHeader title="Videojuegos" /><SetupNotice /></div>);

  const set = (patch: Partial<Game>) => setDraft((d) => ({ ...d, ...patch }));
  const open = (g: Partial<Game>) => { setError(null); setTab('general'); setDraft(g); };

  const onSave = async () => {
    if (!draft?.title) { setError('El título es obligatorio.'); return; }
    setSaving(true); setError(null);
    const record = { ...draft, slug: draft.slug || slugify(draft.title) };
    const { error } = await save(record);
    setSaving(false);
    if (error) setError(error); else setDraft(null);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'progreso', label: 'Progreso' },
    { id: 'contenido', label: 'Historia y media' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'extras', label: 'Extras' },
  ];

  return (
    <div>
      <PageHeader title="Videojuegos" description="Actualiza porcentajes, roadmap, galería y estado de cada proyecto." onNew={() => open(empty())} newLabel="Nuevo videojuego" />
      <DataTable
        rows={rows} loading={loading} searchKeys={['title']}
        onEdit={(r) => open(r)}
        onDelete={(r) => { if (confirm(`¿Eliminar “${r.title}”? Esto no borra sus devlogs.`)) remove(r.id); }}
        columns={[
          { key: 'title', label: 'Juego', render: (r) => (
            <span className="flex items-center gap-2 font-medium text-white">
              {r.title}
              {r.featured && <span className="rounded bg-nebula/15 px-1.5 py-0.5 text-[9px] font-bold text-nebula">PRINCIPAL</span>}
            </span>
          ) },
          { key: 'status', label: 'Estado', className: 'w-44', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'progress', label: 'Progreso', className: 'w-40', render: (r) => (
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10"><span className="block h-full bg-electric" style={{ width: `${r.progress}%` }} /></span>
              <span className="font-mono text-xs text-zinc-400">{r.progress}%</span>
            </span>
          ) },
          { key: 'engine', label: 'Motor', className: 'w-32' },
        ]}
      />

      <Drawer open={!!draft} title={draft?.id ? `Editar · ${draft.title}` : 'Nuevo videojuego'} onClose={() => setDraft(null)} wide
        footer={<SaveBar onSave={onSave} onCancel={() => setDraft(null)} saving={saving} error={error} />}>
        {draft && (
          <>
            <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${tab === t.id ? 'bg-electric text-ink' : 'text-zinc-400 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'general' && (
              <>
                <TextField label="Título" value={draft.title ?? ''} onChange={(v) => set({ title: v, slug: draft.id ? draft.slug : slugify(v) })} />
                <TextField label="Slug (URL)" value={draft.slug ?? ''} onChange={(v) => set({ slug: slugify(v) })} hint={`/videojuegos/${draft.slug || '…'}`} />
                <TextField label="Frase / tagline" value={draft.tagline ?? ''} onChange={(v) => set({ tagline: v })} />
                <TextAreaField label="Descripción" value={draft.description ?? ''} onChange={(v) => set({ description: v })} rows={3} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="Estado" value={draft.status ?? 'en_desarrollo'} onChange={(v) => set({ status: v as Game['status'] })}
                    options={[
                      { value: 'en_desarrollo', label: 'En desarrollo' },
                      { value: 'prototipo', label: 'Prototipo' },
                      { value: 'demo', label: 'Demo disponible' },
                      { value: 'publicado', label: 'Publicado' },
                      { value: 'pausado', label: 'En pausa' },
                    ]} />
                  <TextField label="Lanzamiento estimado" value={draft.release_estimate ?? ''} onChange={(v) => set({ release_estimate: v })} placeholder="Demo — 2027" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Motor gráfico" value={draft.engine ?? ''} onChange={(v) => set({ engine: v })} />
                  <NumberField label="Orden (menor = primero)" value={draft.sort ?? 99} onChange={(v) => set({ sort: v })} />
                </div>
                <StringListField label="Tecnologías" value={draft.technologies ?? []} onChange={(v) => set({ technologies: v })} />
                <ImageUpload label="Portada" value={draft.cover_url ?? null} onChange={(v) => set({ cover_url: v ?? '' })} folder="videojuegos" />
                <ToggleField label="Proyecto principal" hint="Aparece en el hero de la portada." value={!!draft.featured} onChange={(v) => set({ featured: v })} />
              </>
            )}

            {tab === 'progreso' && (
              <>
                <div>
                  <span className="mb-1.5 block text-xs font-semibold text-zinc-400">Avance total · <span className="font-mono text-electric">{draft.progress}%</span></span>
                  <input type="range" min={0} max={100} value={draft.progress ?? 0} onChange={(e) => set({ progress: Number(e.target.value) })} className="w-full accent-[#4F8CFF]" aria-label="Avance total" />
                </div>
                <ProgressMapField categories={PROGRESS_CATEGORIES} value={draft.progress_categories ?? {}} onChange={(v) => set({ progress_categories: v })} />
              </>
            )}

            {tab === 'contenido' && (
              <>
                <MarkdownEditor label="Historia" value={draft.story ?? ''} onChange={(v) => set({ story: v })} rows={8} />
                <TextField label="URL del trailer (embed)" value={draft.trailer_url ?? ''} onChange={(v) => set({ trailer_url: v || null })} placeholder="https://www.youtube.com/embed/…" hint="Usa el formato /embed/ de YouTube." />
                <TextField label="URL de la demo" value={draft.demo_url ?? ''} onChange={(v) => set({ demo_url: v || null })} placeholder="https://odiseo.itch.io/…" />
                <GalleryUpload label="Galería / concept art" value={draft.gallery ?? []} onChange={(v) => set({ gallery: v })} folder="videojuegos/galeria" />
                <RepeaterField
                  label="Personajes" addLabel="Agregar personaje"
                  value={(draft.characters ?? []) as unknown as Record<string, unknown>[]}
                  onChange={(v) => set({ characters: v as unknown as Game['characters'] })}
                  makeEmpty={() => ({ name: '', description: '', image_url: '' })}
                  fields={[
                    { key: 'name', label: 'Nombre' },
                    { key: 'image_url', label: 'Imagen (URL)' },
                    { key: 'description', label: 'Descripción', type: 'textarea' },
                  ]}
                />
              </>
            )}

            {tab === 'roadmap' && (
              <RepeaterField
                label="Hitos del roadmap" addLabel="Agregar hito"
                value={(draft.roadmap ?? []) as unknown as Record<string, unknown>[]}
                onChange={(v) => set({ roadmap: v as unknown as Game['roadmap'] })}
                makeEmpty={() => ({ date: '2026 · Q4', title: '', description: '', done: false })}
                fields={[
                  { key: 'date', label: 'Fecha / periodo' },
                  { key: 'title', label: 'Título' },
                  { key: 'description', label: 'Descripción', type: 'textarea' },
                  { key: 'done', label: 'Completado', type: 'checkbox' },
                ]}
              />
            )}

            {tab === 'extras' && (
              <>
                <RepeaterField
                  label="Características" addLabel="Agregar característica"
                  value={(draft.features ?? []) as unknown as Record<string, unknown>[]}
                  onChange={(v) => set({ features: v as unknown as Game['features'] })}
                  makeEmpty={() => ({ title: '', description: '' })}
                  fields={[
                    { key: 'title', label: 'Título' },
                    { key: 'description', label: 'Descripción', type: 'textarea' },
                  ]}
                />
                <StringListField label="Objetivos actuales" value={draft.goals ?? []} onChange={(v) => set({ goals: v })} />
                <RepeaterField
                  label="Preguntas frecuentes" addLabel="Agregar pregunta"
                  value={(draft.faq ?? []) as unknown as Record<string, unknown>[]}
                  onChange={(v) => set({ faq: v as unknown as Game['faq'] })}
                  makeEmpty={() => ({ q: '', a: '' })}
                  fields={[
                    { key: 'q', label: 'Pregunta', span: 2 },
                    { key: 'a', label: 'Respuesta', type: 'textarea' },
                  ]}
                />
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
