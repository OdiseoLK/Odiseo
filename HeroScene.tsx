'use client';
import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url: window.location.href }); } catch {}
    } else {
      copy();
    }
  };
  return (
    <div className="flex items-center gap-2">
      <button onClick={copy} className="btn-ghost !px-3 !py-2 text-xs">
        {copied ? <Check size={13} className="text-emerald-400" /> : <Link2 size={13} />}
        {copied ? 'Copiado' : 'Copiar enlace'}
      </button>
      <button onClick={nativeShare} className="btn-ghost !px-3 !py-2 text-xs">
        <Share2 size={13} /> Compartir
      </button>
    </div>
  );
}
