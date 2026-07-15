'use client';
import { useRef, useState } from 'react';
import { Bold, Eye, Heading2, Image as ImageIcon, Italic, Link2, List, PencilLine, Quote } from 'lucide-react';
import { mdToHtml } from '@/lib/markdown';

export default function MarkdownEditor({ label, value, onChange, rows = 12 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  const wrap = (before: string, after = before, placeholder = 'texto') => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const prefixLine = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
  };

  const tools = [
    { icon: <Bold size={14} />, title: 'Negritas', act: () => wrap('**') },
    { icon: <Italic size={14} />, title: 'Cursivas', act: () => wrap('*') },
    { icon: <Heading2 size={14} />, title: 'Encabezado', act: () => prefixLine('## ') },
    { icon: <List size={14} />, title: 'Lista', act: () => prefixLine('- ') },
    { icon: <Quote size={14} />, title: 'Cita', act: () => prefixLine('> ') },
    { icon: <Link2 size={14} />, title: 'Enlace', act: () => wrap('[', '](https://)', 'texto del enlace') },
    { icon: <ImageIcon size={14} />, title: 'Imagen', act: () => wrap('![', '](https://url-de-la-imagen)', 'descripción') },
  ];

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-zinc-400">{label}</span>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
        <div className="flex items-center gap-1 border-b border-white/[0.07] px-2 py-1.5">
          {tools.map((t) => (
            <button key={t.title} type="button" title={t.title} onClick={t.act} className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/[0.07] hover:text-white">
              {t.icon}
            </button>
          ))}
          <button type="button" onClick={() => setPreview((v) => !v)} className={`ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${preview ? 'bg-electric/15 text-electric' : 'text-zinc-400 hover:bg-white/[0.07]'}`}>
            {preview ? <PencilLine size={13} /> : <Eye size={13} />} {preview ? 'Editar' : 'Vista previa'}
          </button>
        </div>
        {preview ? (
          <div className="prose-site max-h-[420px] overflow-y-auto px-4 py-3 text-sm" dangerouslySetInnerHTML={{ __html: mdToHtml(value || '*Sin contenido…*') }} />
        ) : (
          <textarea
            ref={ref}
            value={value ?? ''}
            rows={rows}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escribe en Markdown…"
            className="w-full resize-y bg-transparent px-4 py-3 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
        )}
      </div>
      <p className="mt-1 text-[11px] text-zinc-600">Formato Markdown: **negritas**, *cursivas*, ## títulos, - listas, enlaces e imágenes.</p>
    </div>
  );
}
