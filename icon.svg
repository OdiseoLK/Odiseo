import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/Shell';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const metadata = { title: 'Panel · Odiseo', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let email: string | null = null;
  if (isSupabaseConfigured) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/admin/login');
    email = user.email ?? null;
  } else {
    redirect('/admin/login');
  }
  return <AdminShell userEmail={email}>{children}</AdminShell>;
}
