'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function PageViewBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    if (!isSupabaseConfigured || !pathname || pathname.startsWith('/admin')) return;
    const supabase = createClient();
    supabase.from('page_views').insert({ path: pathname }).then(() => {});
  }, [pathname]);
  return null;
}
