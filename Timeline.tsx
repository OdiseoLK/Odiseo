'use client';
import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

/** Lista de lanzamiento: guarda correos en la tabla `subscribers`. */
export default function NewsletterForm({ source = 'sitio' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState(''); // honeypot anti-bots
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const submit = async () => {
    if (trap) { setState('done'); return; }
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { setState('error'); return; }
    if (!isSupabaseConfigured) { setState('done'); setEmail(''); return; }
    setState('sending');
    const supabase = createClient();
    const { error } = await supabase.from('subscribers').insert({ email: v, source });
    // 23505 = correo ya registrado: lo tratamos como éxito
    if (error && !`${error.code} ${error.message}`.includes('23505') && !`${error.message}`.toLowerCase().includes('duplicate')) {
      setState('error');
      return;
    }
    setEmail('');
    setState('done');
  };

  if (state === 'done') {
    return (
      <p className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-300">
        <Check size={15} /> Listo. Te avisaré el día del lanzamiento. 🎉
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input
        type="text" value={trap} onChange={(e) => setTrap(e.target.value)}
        className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true"
      />
      <label htmlFor={`nl-${source}`} className="sr-only">Tu correo electrónico</label>
      <input
        id={`nl-${source}`} type="email" value={email}
        onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="tucorreo@ejemplo.com" maxLength={140}
        className="input-dark flex-1"
      />
      <button onClick={submit} disabled={state === 'sending'} className="btn-primary whitespace-nowrap disabled:opacity-60">
        <Bell size={15} /> {state === 'sending' ? 'Guardando…' : 'Avísame'}
      </button>
      {state === 'error' && <p className="text-xs text-rose-400 sm:self-center">Revisa el correo e intenta de nuevo.</p>}
    </div>
  );
}
