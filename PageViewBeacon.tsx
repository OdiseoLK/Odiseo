'use client';
import { useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { CommentRow } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function CommentsSection({ targetType, targetId }: { targetType: string; targetId: string }) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    supabase
      .from('comments')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => setComments((data as CommentRow[]) ?? []));
  }, [targetType, targetId]);

  const submit = async () => {
    if (!name.trim() || !content.trim()) return;
    if (!isSupabaseConfigured) { setState('sent'); return; }
    setState('sending');
    const supabase = createClient();
    const { error } = await supabase.from('comments').insert({
      target_type: targetType, target_id: targetId, author_name: name.trim(), content: content.trim(), approved: false,
    });
    if (error) { setState('error'); return; }
    setName(''); setContent(''); setState('sent');
  };

  return (
    <section className="mt-14">
      <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-white">
        <MessageSquare size={18} className="text-electric" /> Comentarios
      </h2>
      <div className="glass rounded-2xl p-5">
        <div className="grid gap-3 sm:grid-cols-[220px,1fr]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="input-dark" maxLength={60} />
          <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escribe un comentario…" className="input-dark" maxLength={600} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-500">Los comentarios se publican después de moderación.</p>
          <button onClick={submit} disabled={state === 'sending'} className="btn-primary !px-4 !py-2 text-xs disabled:opacity-50">
            <Send size={13} /> {state === 'sending' ? 'Enviando…' : 'Comentar'}
          </button>
        </div>
        {state === 'sent' && <p className="mt-3 text-xs text-emerald-400">Comentario recibido. Aparecerá cuando sea aprobado.</p>}
        {state === 'error' && <p className="mt-3 text-xs text-red-400">No se pudo enviar. Intenta de nuevo.</p>}
      </div>
      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-200">{c.author_name}</span>
              <span>·</span>
              <span>{formatDate(c.created_at)}</span>
            </div>
            <p className="mt-1.5 text-sm text-zinc-300">{c.content}</p>
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-zinc-500">Aún no hay comentarios. Sé el primero.</li>}
      </ul>
    </section>
  );
}
