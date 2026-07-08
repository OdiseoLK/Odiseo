'use client';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { SiteSettings } from '@/lib/types';
import { demoSettings } from '@/lib/demo-data';
import { PageHeader, SetupNotice } from '@/components/admin/ui';
import { RepeaterField, TextAreaField, TextField } from '@/components/admin/fields';
import { ImageUpload } from '@/components/admin/ImageUpload';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

export default function AdminSettings() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('site_settings').select('data').eq('id', 1).maybeSingle().then(({ data }) => {
      const merged = { ...demoSettings, ...((data?.data as Partial<SiteSettings>) ?? {}) };
      setSettings(merged as SiteSettings);
    });
  }, [supabase]);

  if (!supabase) return (<div><PageHeader title="Ajustes" /><SetupNotice /></div>);

  const set = (patch: Partial<SiteSettings>) => { setStatus('idle'); setSettings((s) => (s ? { ...s, ...patch } : s)); };

  const onSave = async () => {
    if (!settings) return;
    setSaving(true); setStatus('idle'); setErrorMsg(null);
    const { error } = await supabase.from('site_settings').upsert({ id: 1, data: settings });
    setSaving(false);
    if (error) { setStatus('error'); setErrorMsg(error.message); } else setStatus('saved');
  };

  if (!settings) return (<div><PageHeader title="Ajustes" /><div className="glass rounded-2xl p-10 text-center text-zinc-500"><Loader2 size={18} className="mx-auto animate-spin" /></div></div>);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Ajustes del sitio" description="Identidad, redes sociales, sección «Sobre mí» y SEO." />

      <div className="space-y-8">
        <section className="glass space-y-5 rounded-2xl p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-electric">Identidad</h2>
          <TextField label="Tagline (aparece en el hero)" value={settings.tagline} onChange={(v) => set({ tagline: v })} />
          <TextField label="Banner «Ahora mismo» (bajo el menú)" value={settings.now_banner ?? ''} onChange={(v) => set({ now_banner: v })} hint="Una línea sobre lo que estás haciendo esta semana. Déjalo vacío para ocultar el banner." />
          <ImageUpload label="Imagen de portada del inicio (hero)" value={settings.hero_image ?? null} onChange={(v) => set({ hero_image: v ?? '' })} folder="site" />
          <TextField label="Frase del footer" value={settings.footer_quote} onChange={(v) => set({ footer_quote: v })} />
        </section>

        <section className="glass space-y-5 rounded-2xl p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-electric">Redes y contacto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Instagram" value={settings.socials.instagram ?? ''} onChange={(v) => set({ socials: { ...settings.socials, instagram: v } })} placeholder="https://instagram.com/…" />
            <TextField label="GitHub" value={settings.socials.github ?? ''} onChange={(v) => set({ socials: { ...settings.socials, github: v } })} placeholder="https://github.com/…" />
            <TextField label="Discord" value={settings.socials.discord ?? ''} onChange={(v) => set({ socials: { ...settings.socials, discord: v } })} placeholder="https://discord.gg/… o usuario" />
            <TextField label="YouTube" value={settings.socials.youtube ?? ''} onChange={(v) => set({ socials: { ...settings.socials, youtube: v } })} placeholder="https://youtube.com/@…" />
            <TextField label="Correo" value={settings.socials.email ?? ''} onChange={(v) => set({ socials: { ...settings.socials, email: v } })} placeholder="hola@…" />
          </div>
        </section>

        <section className="glass space-y-5 rounded-2xl p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-electric">Sobre mí</h2>
          <ImageUpload label="Foto o ilustración" value={settings.about.photo_url ?? null} onChange={(v) => set({ about: { ...settings.about, photo_url: v ?? undefined } })} folder="sobre-mi" />
          <MarkdownEditor label="Historia / biografía" value={settings.about.bio} onChange={(v) => set({ about: { ...settings.about, bio: v } })} rows={8} />
          <RepeaterField
            label="Habilidades (con nivel 0–100)" addLabel="Agregar habilidad"
            value={settings.about.skills as unknown as Record<string, unknown>[]}
            onChange={(v) => set({ about: { ...settings.about, skills: v as unknown as SiteSettings['about']['skills'] } })}
            makeEmpty={() => ({ name: '', level: 50 })}
            fields={[{ key: 'name', label: 'Habilidad' }, { key: 'level', label: 'Nivel (%)', type: 'number' }]}
          />
          <RepeaterField
            label="Experiencia" addLabel="Agregar experiencia"
            value={settings.about.experience as unknown as Record<string, unknown>[]}
            onChange={(v) => set({ about: { ...settings.about, experience: v as unknown as SiteSettings['about']['experience'] } })}
            makeEmpty={() => ({ period: '2026', role: '', place: '', description: '' })}
            fields={[
              { key: 'period', label: 'Periodo' },
              { key: 'role', label: 'Rol' },
              { key: 'place', label: 'Lugar / proyecto' },
              { key: 'description', label: 'Descripción', type: 'textarea' },
            ]}
          />
        </section>

        <section className="glass space-y-5 rounded-2xl p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-electric">SEO</h2>
          <TextField label="Título del sitio" value={settings.seo.title} onChange={(v) => set({ seo: { ...settings.seo, title: v } })} />
          <TextAreaField label="Descripción (meta description)" value={settings.seo.description} onChange={(v) => set({ seo: { ...settings.seo, description: v } })} rows={3} />
        </section>

        <div className="sticky bottom-4 flex items-center justify-end gap-3">
          {status === 'saved' && <span className="text-xs font-semibold text-emerald-400">Cambios guardados ✓</span>}
          {status === 'error' && <span className="max-w-xs text-xs text-red-400">{errorMsg}</span>}
          <button onClick={onSave} disabled={saving} className="btn-primary text-sm shadow-glow disabled:opacity-50">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Guardar ajustes
          </button>
        </div>
      </div>
    </div>
  );
}
