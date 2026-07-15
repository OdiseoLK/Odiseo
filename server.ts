'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function useCrud<T extends { id: string }>(table: string, orderBy = 'created_at', ascending = false) {
  const supabase = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending });
    if (error) setError(error.message);
    else setError(null);
    setRows((data as T[]) ?? []);
    setLoading(false);
  }, [supabase, table, orderBy, ascending]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (record: Partial<T>): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Supabase no está configurado.' };
    const { id, ...rest } = record as Record<string, unknown> & { id?: string };
    const { error } = id
      ? await supabase.from(table).update(rest).eq('id', id)
      : await supabase.from(table).insert(rest);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  }, [supabase, table, refresh]);

  const remove = useCallback(async (id: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Supabase no está configurado.' };
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  }, [supabase, table, refresh]);

  return { rows, loading, error, save, remove, refresh, configured: !!supabase };
}
