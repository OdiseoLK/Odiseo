'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Copy, FileIcon, Folder, Home, Loader2, Trash2, Upload } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { PageHeader, SetupNotice } from '@/components/admin/ui';

type Entry = { name: string; id: string | null; metadata: { size?: number } | null };

const isImage = (name: string) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(name);
const fmtSize = (b?: number) => (!b ? '' : b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.round(b / 1000)} KB`);

export default function AdminFiles() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [path, setPath] = useState<string[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefix = path.join('/');

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.storage.from('media').list(prefix, { limit: 200, sortBy: { column: 'name', order: 'asc' } });
    setEntries(((data ?? []) as Entry[]).filter((e) => e.name !== '.emptyFolderPlaceholder'));
    setLoading(false);
  }, [supabase, prefix]);

  useEffect(() => { load(); }, [load]);

  if (!supabase) return (<div><PageHeader title="Medios" /><SetupNotice /></div>);

  const publicUrl = (name: string) => supabase.storage.from('media').getPublicUrl(prefix ? `${prefix}/${name}` : name).data.publicUrl;

  const copyUrl = async (name: string) => {
    await navigator.clipboard.writeText(publicUrl(name));
    setCopied(name);
    setTimeout(() => setCopied(null), 1400);
  };

  const removeFile = async (name: string) => {
    if (!confirm(`¿Eliminar “${name}”? Las páginas que lo usen dejarán de mostrarlo.`)) return;
    await supabase.storage.from('media').remove([prefix ? `${prefix}/${name}` : name]);
    load();
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const file of Array.from(files)) {
      const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
      const dest = `${prefix ? `${prefix}/` : ''}${Date.now()}-${safe}`;
      await supabase.storage.from('media').upload(dest, file, { cacheControl: '31536000' });
    }
    setBusy(false);
    load();
  };

  return (
    <div>
      <PageHeader title="Medios" description="Todos los archivos subidos al bucket «media» de Supabase Storage." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1 text-sm text-zinc-400">
          <button onClick={() => setPath([])} className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-white/[0.06] hover:text-white"><Home size={13} /> media</button>
          {path.map((seg, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight size={13} className="text-zinc-600" />
              <button onClick={() => setPath(path.slice(0, i + 1))} className="rounded-lg px-2 py-1 hover:bg-white/[0.06] hover:text-white">{seg}</button>
            </span>
          ))}
        </nav>
        <button onClick={() => inputRef.current?.click()} disabled={busy} className="btn-primary !py-2 text-xs disabled:opacity-50">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Subir archivos
        </button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { uploadFiles(e.target.files); e.target.value = ''; }} />
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-12 text-center text-zinc-500"><Loader2 size={18} className="mx-auto animate-spin" /></div>
      ) : entries.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-zinc-500">Carpeta vacía. Sube tu primer archivo o guarda contenido con imágenes desde las otras secciones.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {entries.map((e) => {
            const folder = e.id === null;
            return (
              <div key={e.name} className="glass group overflow-hidden rounded-2xl">
                {folder ? (
                  <button onClick={() => setPath([...path, e.name])} className="flex aspect-square w-full flex-col items-center justify-center gap-2 text-zinc-400 transition hover:text-electric">
                    <Folder size={34} />
                    <span className="max-w-full truncate px-3 text-xs">{e.name}</span>
                  </button>
                ) : (
                  <>
                    <div className="aspect-square bg-night-900">
                      {isImage(e.name) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={publicUrl(e.name)} alt={e.name} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600"><FileIcon size={30} /></div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-[11px] text-zinc-300" title={e.name}>{e.name}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-600">{fmtSize(e.metadata?.size)}</span>
                        <div className="flex gap-0.5">
                          <button onClick={() => copyUrl(e.name)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-electric/15 hover:text-electric" aria-label="Copiar URL">
                            <Copy size={12} />
                          </button>
                          <button onClick={() => removeFile(e.name)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/15 hover:text-red-400" aria-label="Eliminar">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {copied === e.name && <p className="mt-1 text-[10px] font-semibold text-emerald-400">URL copiada ✓</p>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
