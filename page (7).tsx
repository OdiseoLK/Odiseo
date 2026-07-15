'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Lock } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Atmosphere from '@/components/site/Atmosphere';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    if (!isSupabaseConfigured) return;
    setBusy(true); setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      setBusy(false);
      return;
    }
    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <Atmosphere />
      <div className="glass relative z-10 w-full max-w-md rounded-3xl p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-electric/12 text-electric"><Lock size={22} /></div>
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Panel de administración</h1>
          <p className="mt-1 text-sm text-zinc-500">Inicia sesión para gestionar tu sitio.</p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5 text-sm text-amber-200">
            <p className="font-semibold">El panel necesita Supabase.</p>
            <p className="mt-2 text-amber-200/85">
              1. Crea un proyecto gratuito en supabase.com.<br />
              2. Ejecuta <code className="rounded bg-black/30 px-1">supabase/schema.sql</code> en el SQL Editor.<br />
              3. Copia URL y anon key a <code className="rounded bg-black/30 px-1">.env.local</code>.<br />
              4. Crea tu usuario en Authentication → Users.
            </p>
            <p className="mt-2 text-amber-200/60">La guía completa está en el README.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="l-email" className="mb-1.5 block text-xs font-semibold text-zinc-400">Correo</label>
              <input id="l-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-dark" placeholder="tu@correo.com" />
            </div>
            <div>
              <label htmlFor="l-pass" className="mb-1.5 block text-xs font-semibold text-zinc-400">Contraseña</label>
              <input
                id="l-pass" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') signIn(); }}
                className="input-dark" placeholder="••••••••"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button onClick={signIn} disabled={busy || !email || !password} className="btn-primary w-full disabled:opacity-50">
              {busy && <Loader2 size={14} className="animate-spin" />} Entrar al panel
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link href="/" className="hover:text-zinc-400">← Volver al sitio</Link>
        </p>
      </div>
    </div>
  );
}
