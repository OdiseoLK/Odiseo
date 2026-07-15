'use client';
import { useState } from 'react';
import { BellRing, Check, Copy, Download, Mail, MailOpen, MessageSquare, Trash2, X } from 'lucide-react';
import { useCrud } from '@/lib/admin/useCrud';
import type { CommentRow, ContactMessage, Subscriber } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { PageHeader, SetupNotice } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

const TARGET_LABEL: Record<CommentRow['target_type'], string> = { game: 'Videojuego', devlog: 'Devlog', news: 'Noticia' };

export default function AdminMessages() {
  const contact = useCrud<ContactMessage>('messages');
  const comments = useCrud<CommentRow>('comments');
  const subs = useCrud<Subscriber>('subscribers');
  const [tab, setTab] = useState<'contacto' | 'comentarios' | 'suscriptores'>('contacto');
  const [copied, setCopied] = useState(false);

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(subs.rows.map((r) => r.email).join(', '));
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  const exportCsv = () => {
    const rows = [['email', 'origen', 'fecha'], ...subs.rows.map((r) => [r.email, r.source, r.created_at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'suscriptores-odiseo.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!contact.configured) return (<div><PageHeader title="Mensajes" /><SetupNotice /></div>);

  const pendingComments = comments.rows.filter((c) => !c.approved).length;
  const unread = contact.rows.filter((m) => !m.read).length;

  return (
    <div>
      <PageHeader title="Mensajes" description="Formulario de contacto y moderación de comentarios." />
      <div className="mb-5 flex gap-2">
        {([
          { id: 'contacto', label: 'Contacto', badge: unread },
          { id: 'comentarios', label: 'Comentarios', badge: pendingComments },
          { id: 'suscriptores', label: 'Suscriptores', badge: subs.rows.length },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
              tab === t.id ? 'bg-electric text-ink shadow-glow-sm' : 'bg-white/[0.05] text-zinc-400 hover:text-white')}>
            {t.label}
            {t.badge > 0 && <span className={cn('rounded-full px-1.5 py-0.5 text-[10px]', tab === t.id ? 'bg-ink/20' : 'bg-electric/20 text-electric')}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'contacto' && (
        <div className="space-y-3">
          {contact.loading && <div className="glass rounded-2xl p-10 text-center text-sm text-zinc-500">Cargando…</div>}
          {!contact.loading && contact.rows.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center text-sm text-zinc-500">Aún no hay mensajes. Cuando alguien escriba desde la página de contacto aparecerá aquí.</div>
          )}
          {contact.rows.map((m) => (
            <article key={m.id} className={cn('glass rounded-2xl p-5', !m.read && 'border-electric/25')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{m.name} {!m.read && <span className="ml-2 rounded-full bg-electric/15 px-2 py-0.5 text-[10px] font-bold text-electric">NUEVO</span>}</p>
                  <a href={`mailto:${m.email}`} className="text-xs text-electric hover:underline">{m.email}</a>
                  <p className="mt-0.5 text-[11px] text-zinc-600">{formatDate(m.created_at)}</p>
                </div>
                <div className="flex gap-1">
                  <a href={`mailto:${m.email}?subject=Re: mensaje en odiseo.dev`} className="rounded-lg p-2 text-zinc-400 hover:bg-electric/15 hover:text-electric" aria-label="Responder por correo"><Mail size={15} /></a>
                  <button onClick={() => contact.save({ id: m.id, read: !m.read } as Partial<ContactMessage>)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.08] hover:text-white" aria-label={m.read ? 'Marcar como no leído' : 'Marcar como leído'}>
                    <MailOpen size={15} />
                  </button>
                  <button onClick={() => { if (confirm('¿Eliminar este mensaje?')) contact.remove(m.id); }} className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/15 hover:text-red-400" aria-label="Eliminar"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{m.message}</p>
            </article>
          ))}
        </div>
      )}

      {tab === 'comentarios' && (
        <div className="space-y-3">
          {comments.loading && <div className="glass rounded-2xl p-10 text-center text-sm text-zinc-500">Cargando…</div>}
          {!comments.loading && comments.rows.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center text-sm text-zinc-500">Todavía no hay comentarios de visitantes.</div>
          )}
          {comments.rows.map((c) => (
            <article key={c.id} className={cn('glass rounded-2xl p-5', !c.approved && 'border-amber-400/25')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {c.author_name}
                    <span className={cn('ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold', c.approved ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300')}>
                      {c.approved ? 'APROBADO' : 'PENDIENTE'}
                    </span>
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <MessageSquare size={11} /> {TARGET_LABEL[c.target_type]} · {formatDate(c.created_at)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => comments.save({ id: c.id, approved: !c.approved } as Partial<CommentRow>)}
                    className={cn('rounded-lg p-2', c.approved ? 'text-zinc-400 hover:bg-amber-400/15 hover:text-amber-300' : 'text-zinc-400 hover:bg-emerald-400/15 hover:text-emerald-300')}
                    aria-label={c.approved ? 'Ocultar comentario' : 'Aprobar comentario'}>
                    {c.approved ? <X size={15} /> : <Check size={15} />}
                  </button>
                  <button onClick={() => { if (confirm('¿Eliminar este comentario?')) comments.remove(c.id); }} className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/15 hover:text-red-400" aria-label="Eliminar"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{c.content}</p>
            </article>
          ))}
        </div>
      )}

      {tab === 'suscriptores' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={copyEmails} className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:text-white">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} {copied ? 'Copiados' : 'Copiar correos'}
            </button>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:text-white">
              <Download size={14} /> Exportar CSV
            </button>
            <p className="ml-auto text-xs text-zinc-500">{subs.rows.length} suscriptor{subs.rows.length === 1 ? '' : 'es'}</p>
          </div>
          {subs.loading && <div className="glass rounded-2xl p-10 text-center text-sm text-zinc-500">Cargando…</div>}
          {!subs.loading && subs.rows.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center text-sm text-zinc-500">
              <BellRing size={18} className="mx-auto mb-2 opacity-60" />
              Aún no hay suscriptores. Cuando alguien deje su correo en la lista de lanzamiento aparecerá aquí.
            </div>
          )}
          {subs.rows.map((r) => (
            <div key={r.id} className="glass flex items-center gap-3 rounded-2xl px-5 py-3.5">
              <p className="flex-1 truncate text-sm font-medium text-white">{r.email}</p>
              <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-400">{r.source || 'sitio'}</span>
              <span className="hidden text-xs text-zinc-500 sm:block">{formatDate(r.created_at)}</span>
              <button onClick={() => { if (confirm(`¿Eliminar a ${r.email}?`)) subs.remove(r.id); }} aria-label="Eliminar suscriptor" className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-rose-500/15 hover:text-rose-400">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
