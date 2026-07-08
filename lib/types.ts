export type GameStatus = 'en_desarrollo' | 'prototipo' | 'demo' | 'publicado' | 'pausado';

export interface RoadmapItem { date: string; title: string; description?: string; done: boolean; }
export interface Feature { title: string; description: string; }
export interface Character { name: string; description: string; image_url?: string; }
export interface FaqItem { q: string; a: string; }
export interface ChangeItem { type: 'nuevo' | 'mejora' | 'arreglo'; text: string; }

export interface Game {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  status: GameStatus;
  progress: number;
  progress_categories: Record<string, number>;
  engine: string;
  technologies: string[];
  release_estimate: string;
  cover_url: string;
  trailer_url: string | null;
  demo_url: string | null;
  story: string | null;
  features: Feature[];
  characters: Character[];
  gallery: string[];
  roadmap: RoadmapItem[];
  goals: string[];
  faq: FaqItem[];
  featured: boolean;
  sort: number;
  created_at: string;
}

export interface Devlog {
  id: string;
  game_id: string | null;
  slug: string;
  version: string;
  title: string;
  date: string;
  time_invested: string;
  summary: string;
  content: string;
  cover_url: string | null;
  gallery: string[];
  goals: string[];
  changes: ChangeItem[];
  status: 'draft' | 'published';
  created_at: string;
}

export interface News {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  category: string;
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published';
  published_at: string;
  created_at: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string;
  director: string;
  duration: number;
  rating: number;
  review: string;
  poster_url: string | null;
  trailer_url: string | null;
  platform: string | null;
  instagram_url: string | null;
  featured: boolean;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  client: string;
  date: string;
  technologies: string[];
  cover_url: string | null;
  gallery: string[];
  external_url: string | null;
  created_at: string;
}

export interface Subscriber { id: string; email: string; source: string; created_at: string; }

export interface Category { id: string; name: string; slug: string; scope: string; }
export interface Tag { id: string; name: string; slug: string; }

export interface CommentRow {
  id: string;
  target_type: 'game' | 'devlog' | 'news';
  target_id: string;
  author_name: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string; name: string; email: string; message: string; read: boolean; created_at: string;
}

export interface SkillBar { name: string; level: number; }
export interface ExperienceItem { period: string; role: string; place: string; description: string; }

export interface SiteSettings {
  tagline: string;
  now_banner?: string;
  hero_image?: string;
  footer_quote: string;
  socials: { instagram?: string; github?: string; discord?: string; email?: string; youtube?: string };
  about: { photo_url?: string; bio: string; skills: SkillBar[]; experience: ExperienceItem[] };
  seo: { title: string; description: string };
}
