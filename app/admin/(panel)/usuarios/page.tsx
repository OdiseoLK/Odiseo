'use client';
import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, ShieldCheck, UserRound } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { PageHeader, SetupNotice } from '@/components/admin/ui';

export default function AdminUsers() {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [email, setEmail] = useState<string | null>(null);
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLastSignIn(data.user?.last_sign_in_at ?? null);
    });
  }, [supabase]);

  if (!supabase) return (<div><PageHeader title="Usuarios" /><SetupNotice /></div>);

  return (
    <div>
      <PageHeader title="Usuarios" description="Cuentas con acceso a este panel." />
      <div className="glass max-w-xl rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-electric/15 text-electric"><UserRound size={22} /></span>
          <div>
            <p className="font-semibold text-white">{email ?? 'Sesión activa'}</p>
            <p className="flex items-center gap-1.5 text-xs text-emerald-300"><ShieldCheck size={12} /> Administrador</p>
            {lastSignIn && <p className="mt-0.5 text-[11px] text-zinc-600">Último acceso: {new Date(lastSignIn).toLocaleString('es-MX')}</p>}
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-zinc-400">
          <p>Cualquier usuario creado en <strong className="text-zinc-200">Supabase → Authentication</strong> puede iniciar sesión en este panel. Para invitar a alguien más o cambiar tu contraseña, hazlo desde el panel de Supabase:</p>
          <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-electric hover:underline">
            Abrir Supabase <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
