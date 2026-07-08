'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) { setState('error'); return; }
    if (!isSupabaseConfigured) { setState('sent'); return; }
    setState('sending');
    const supabase = createClient();
    const { error } = await supabase.from('messages').insert({ name: name.trim(), email: email.trim(), message: message.trim() });
    if (error) { setState('error'); return; }
    setName(''); setEmail(''); setMessage('');
    setState('sent');
  };

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-nombre" className="mb-1.5 block text-xs font-semibold text-zinc-400">Nombre</label>
          <input id="c-nombre" value={name} onChange={(e) => setName(e.target.value)} className="input-dark" placeholder="Tu nombre" maxLength={80} />
        </div>
        <div>
          <label htmlFor="c-correo" className="mb-1.5 block text-xs font-semibold text-zinc-400">Correo</label>
          <input id="c-correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark" placeholder="tucorreo@ejemplo.com" maxLength={120} />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="c-mensaje" className="mb-1.5 block text-xs font-semibold text-zinc-400">Mensaje</label>
        <textarea id="c-mensaje" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="input-dark resize-none" placeholder="Cuéntame tu idea…" maxLength={2000} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-[11px] text-zinc-500">Respondo normalmente en 24–48 h.</p>
        <button onClick={submit} disabled={state === 'sending'} className="btn-primary disabled:opacity-50">
          <Send size={15} /> {state === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </div>
      {state === 'sent' && <p className="mt-4 text-sm text-emerald-400">Mensaje enviado. Gracias por escribir.</p>}
      {state === 'error' && <p className="mt-4 text-sm text-red-400">Revisa que todos los campos estén completos e intenta de nuevo.</p>}
    </div>
  );
}
