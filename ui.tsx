'use client';
import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

async function uploadFile(file: File, folder: string): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured) return { url: null, error: 'Supabase no está configurado.' };
  const supabase = createClient();
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const path = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '31536000' });
  if (error) return { url: null, error: error.message };
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export function ImageUpload({ label, value, onChange, folder }: {
  label: string; value: string | null; onChange: (url: string | null) => void; folder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true); setError(null);
    const { url, error } = await uploadFile(file, folder);
    if (error) setError(error);
    if (url) onChange(url);
    setBusy(false);
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</span>
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-white/10">
          <img src={value} alt="" className="aspect-video w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/70 opacity-0 transition group-hover:opacity-100">
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-ghost !px-3 !py-1.5 text-xs">Cambiar</button>
            <button type="button" onClick={() => onChange(null)} className="rounded-xl border border-red-400/30 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300">
              <Trash2 size={12} className="mr-1 inline" />Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-zinc-500 transition hover:border-electric/50 hover:text-electric"
        >
          {busy ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
          <span className="text-xs">{busy ? 'Subiendo…' : 'Subir imagen'}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} placeholder="…o pega una URL" className="input-dark mt-2 !py-2 text-xs" />
    </div>
  );
}

export function GalleryUpload({ label, value, onChange, folder }: {
  label: string; value: string[]; onChange: (urls: string[]) => void; folder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = value ?? [];

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError(null);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const { url, error } = await uploadFile(file, folder);
      if (error) { setError(error); break; }
      if (url) urls.push(url);
    }
    if (urls.length) onChange([...list, ...urls]);
    setBusy(false);
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</span>
      <div className="grid grid-cols-3 gap-2">
        {list.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative overflow-hidden rounded-lg border border-white/10">
            <img src={url} alt="" className="aspect-video w-full object-cover" />
            <button type="button" onClick={() => onChange(list.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 rounded-md bg-ink/80 p-1 text-red-400 opacity-0 transition group-hover:opacity-100" aria-label="Quitar imagen">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] text-zinc-500 transition hover:border-electric/50 hover:text-electric"
          aria-label="Agregar imágenes"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
