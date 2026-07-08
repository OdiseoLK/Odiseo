export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(input?: string | null) {
  if (!input) return '';
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function readingTime(text: string) {
  const words = (text || '').trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const GAME_STATUS_LABEL: Record<string, string> = {
  en_desarrollo: 'En desarrollo',
  prototipo: 'Prototipo',
  demo: 'Demo disponible',
  publicado: 'Publicado',
  pausado: 'En pausa',
};

export const GAME_STATUS_COLOR: Record<string, string> = {
  en_desarrollo: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  prototipo: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  demo: 'text-electric bg-electric/10 border-electric/25',
  publicado: 'text-nebula bg-nebula/10 border-nebula/25',
  pausado: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
};

export const PROGRESS_CATEGORIES = ['Gameplay', 'Arte', 'Programación', 'Audio', 'Historia', 'UI', 'Optimización'];

/** Convierte cualquier link de YouTube (watch, youtu.be, shorts) a formato embed. */
export function toEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return yt ? `https://www.youtube.com/embed/${yt[1]}` : url;
}
