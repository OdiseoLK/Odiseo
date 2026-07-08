-- ============================================================
--  ODISEO · Esquema de base de datos para Supabase
--  Pega TODO este archivo en: Supabase → SQL Editor → Run
--  Es seguro ejecutarlo una sola vez en un proyecto nuevo.
-- ============================================================

-- ─── Tablas ─────────────────────────────────────────────────

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null default '',
  description text not null default '',
  status text not null default 'en_desarrollo',
  progress int not null default 0,
  progress_categories jsonb not null default '{}'::jsonb,
  engine text not null default '',
  technologies text[] not null default '{}',
  release_estimate text not null default '',
  cover_url text not null default '',
  trailer_url text,
  demo_url text,
  story text,
  features jsonb not null default '[]'::jsonb,
  characters jsonb not null default '[]'::jsonb,
  gallery text[] not null default '{}',
  roadmap jsonb not null default '[]'::jsonb,
  goals text[] not null default '{}',
  faq jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  sort int not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.devlogs (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete set null,
  slug text not null unique,
  version text not null default 'v0.0.1',
  title text not null,
  date date not null default current_date,
  time_invested text not null default '',
  summary text not null default '',
  content text not null default '',
  cover_url text,
  gallery text[] not null default '{}',
  goals text[] not null default '{}',
  changes jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_url text,
  category text not null default 'Actualización',
  tags text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'draft',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year int not null default 2026,
  genre text not null default '',
  director text not null default '',
  duration int not null default 90,
  rating numeric(2,1) not null default 0,
  review text not null default '',
  poster_url text,
  trailer_url text,
  platform text,
  instagram_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text not null default '',
  client text not null default '',
  date text not null default '',
  technologies text[] not null default '{}',
  cover_url text,
  gallery text[] not null default '{}',
  external_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  scope text not null default 'noticias'
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('game','devlog','news')),
  target_id text not null,
  author_name text not null,
  content text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key,
  data jsonb not null default '{}'::jsonb
);

create index if not exists page_views_created_idx on public.page_views (created_at);
create index if not exists devlogs_game_idx on public.devlogs (game_id);
create index if not exists comments_target_idx on public.comments (target_type, target_id);

-- ─── Seguridad (RLS) ────────────────────────────────────────
-- Lectura pública de contenido publicado; escritura solo para
-- el usuario autenticado (tú, desde el panel /admin).

alter table public.games enable row level security;
alter table public.devlogs enable row level security;
alter table public.news enable row level security;
alter table public.movies enable row level security;
alter table public.portfolio enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.subscribers enable row level security;
alter table public.messages enable row level security;
alter table public.comments enable row level security;
alter table public.page_views enable row level security;
alter table public.site_settings enable row level security;

-- Contenido visible para todo el mundo
create policy "public read games"      on public.games      for select using (true);
create policy "public read movies"     on public.movies     for select using (true);
create policy "public read portfolio"  on public.portfolio  for select using (true);
create policy "public read categories" on public.categories for select using (true);
create policy "public read tags"       on public.tags       for select using (true);
create policy "public read settings"   on public.site_settings for select using (true);
create policy "public read devlogs"    on public.devlogs    for select using (status = 'published' or auth.role() = 'authenticated');
create policy "public read news"       on public.news       for select using ((status = 'published' and published_at <= now()) or auth.role() = 'authenticated');
create policy "public read comments"   on public.comments   for select using (approved = true or auth.role() = 'authenticated');

-- Visitantes pueden: enviar mensajes, comentar (quedan pendientes) y registrar visitas
create policy "anyone insert subscribers" on public.subscribers for insert with check (true);
create policy "anyone insert messages"   on public.messages   for insert with check (true);
create policy "anyone insert comments"   on public.comments   for insert with check (approved = false);
create policy "anyone insert page_views" on public.page_views for insert with check (true);

-- El administrador (usuario autenticado) puede hacer todo
create policy "admin all games"      on public.games      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all devlogs"    on public.devlogs    for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all news"       on public.news       for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all movies"     on public.movies     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all portfolio"  on public.portfolio  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all categories" on public.categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all tags"       on public.tags       for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin read subscribers" on public.subscribers for select using (auth.role() = 'authenticated');
create policy "admin delete subscribers" on public.subscribers for delete using (auth.role() = 'authenticated');
create policy "admin all messages"   on public.messages   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all comments"   on public.comments   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin read page_views" on public.page_views for select using (auth.role() = 'authenticated');
create policy "admin all settings"   on public.site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ─── Storage: bucket «media» para imágenes y archivos ───────

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media"    on storage.objects for select using (bucket_id = 'media');
create policy "admin insert media"   on storage.objects for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "admin update media"   on storage.objects for update using (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "admin delete media"   on storage.objects for delete using (bucket_id = 'media' and auth.role() = 'authenticated');

-- ─── Datos iniciales (los mismos del modo demo) ─────────────
-- Puedes editarlos o borrarlos después desde el panel /admin.

insert into public.games (id, slug, title, tagline, description, status, progress, progress_categories, engine, technologies, release_estimate, cover_url, story, features, characters, gallery, roadmap, goals, faq, featured, sort) values
(
  '11111111-1111-1111-1111-111111111111',
  'el-velador',
  'El Velador',
  'Nadie debería quedarse en la escuela después del anochecer.',
  'Horror atmosférico en primera persona. Eres el velador nocturno de una escuela antigua y algo más recorre los pasillos contigo. Explora, escucha y sobrevive hasta el amanecer.',
  'en_desarrollo', 18,
  '{"Gameplay":22,"Arte":10,"Programación":30,"Audio":8,"Historia":45,"UI":12,"Optimización":5}'::jsonb,
  'Unity', array['Unity','C#','Blender','FMOD'], 'Demo — 2027', '/covers/velador.svg',
  E'La escuela primaria *Benito Juárez* cerró hace años, pero el municipio sigue pagando a un velador. Nadie dura más de un mes en el puesto.\n\nEsta noche es tu primer turno. Tienes una lámpara, un manojo de llaves y una libreta con las notas del velador anterior. Las últimas páginas están escritas con otra letra.',
  '[{"title":"Exploración con lámpara","description":"La luz es tu única herramienta: revela, pero también delata tu posición."},{"title":"Audio 3D posicional","description":"El sonido cuenta la historia. Escuchar bien es sobrevivir."},{"title":"Noches procedurales","description":"Cada turno cambia rutas, eventos y apariciones."},{"title":"Sin combate","description":"No puedes pelear. Solo esconderte, correr y pensar."}]'::jsonb,
  '[{"name":"El Velador","description":"Tú. Un tipo normal que necesitaba el trabajo."},{"name":"Don Ramiro","description":"El velador anterior. Su libreta es tu única guía… y tu primera advertencia."}]'::jsonb,
  array['/covers/velador.svg','/covers/velador-alt.svg'],
  '[{"date":"2026 · Q2","title":"Inicio del proyecto","description":"Concepto, documento de diseño y primeras pruebas en Unity.","done":true},{"date":"2026 · Q3","title":"Primer prototipo","description":"Movimiento en primera persona, lámpara e interacciones básicas.","done":false},{"date":"2026 · Q4","title":"Sistema de sonido y tensión","description":"Audio posicional, eventos de susto y ciclo de la noche.","done":false},{"date":"2027 · Q1","title":"IA de la entidad","description":"Comportamiento que reacciona a luz y ruido.","done":false},{"date":"2027 · Q2","title":"Demo privada","description":"Pruebas con jugadores cercanos.","done":false},{"date":"2027 · Q3","title":"Demo pública","description":"Publicación de la demo en itch.io.","done":false}]'::jsonb,
  array['Terminar el prototipo jugable de la primera noche','Definir el diseño sonoro base','Publicar el primer devlog en video'],
  '[{"q":"¿En qué plataformas saldrá?","a":"Primero PC (itch.io / Steam). Consolas se evaluarán después del lanzamiento."},{"q":"¿Tendrá demo gratuita?","a":"Sí. La demo pública está planeada dentro del roadmap."},{"q":"¿Es un juego de combate?","a":"No. Es horror de evasión: esconderse, observar y sobrevivir."}]'::jsonb,
  true, 1
),
(
  '22222222-2222-2222-2222-222222222222',
  'archivo-clave',
  'Archivo Clave',
  'Operativo Encubierto — un juego de espías por equipos, en el navegador.',
  'Juego multijugador de palabras clave estilo espionaje. Dos equipos, un tablero de nombres en clave y jefes de inteligencia dando pistas. Corre directo en el navegador con WebRTC, sin servidor.',
  'demo', 80,
  '{"Gameplay":90,"Arte":70,"Programación":85,"Audio":40,"Historia":60,"UI":85,"Optimización":75}'::jsonb,
  'Web (HTML5)', array['JavaScript','PeerJS','WebRTC','HTML/CSS'], 'Jugable ahora', '/covers/archivo.svg',
  null,
  '[{"title":"Multijugador P2P","description":"Conexión directa entre jugadores con WebRTC. Sin backend."},{"title":"Un solo archivo","description":"Todo el juego vive en un HTML: fácil de hospedar en cualquier hosting estático."},{"title":"Partidas rápidas","description":"Salas por código, roles de agente y jefe de inteligencia."}]'::jsonb,
  '[]'::jsonb,
  array['/covers/archivo.svg'],
  '[{"date":"2026 · Q2","title":"Versión 3 estable","description":"Auditoría de red y corrección para hosting estático.","done":true},{"date":"2026 · Q3","title":"Modo espectador","description":"Permitir observar partidas en curso.","done":false}]'::jsonb,
  array['Pulir reconexión de jugadores','Agregar sonidos de interfaz'],
  '[{"q":"¿Necesito instalar algo?","a":"No. Se juega directo en el navegador, en escritorio o móvil."}]'::jsonb,
  false, 2
)
on conflict (slug) do nothing;

insert into public.devlogs (game_id, slug, version, title, date, time_invested, summary, content, cover_url, goals, changes, status) values
(
  '11111111-1111-1111-1111-111111111111',
  'velador-devlog-001-inicio', 'v0.0.1', 'Comienza el turno: nace El Velador', '2026-06-10', '9 h',
  'Documento de diseño, primer proyecto en Unity y controlador en primera persona caminando por un pasillo gris.',
  E'Todo proyecto empieza con un pasillo gris y un capsule collider.\n\nEsta semana escribí el documento de diseño inicial de **El Velador**, armé el proyecto en Unity y dejé funcionando el controlador en primera persona: caminar, correr, agacharse. Nada de esto es impresionante todavía — pero ya se puede *caminar dentro de la idea*, y eso lo cambia todo.',
  '/covers/velador.svg',
  array['Prototipo de lámpara','Blockout del primer pasillo'],
  '[{"type":"nuevo","text":"Proyecto base en Unity (URP)"},{"type":"nuevo","text":"Controlador en primera persona"},{"type":"nuevo","text":"Documento de diseño v1"}]'::jsonb,
  'published'
),
(
  '11111111-1111-1111-1111-111111111111',
  'velador-devlog-002-lampara', 'v0.0.2', 'La lámpara ya funciona (y ya da miedo)', '2026-06-28', '14 h',
  'Sistema de lámpara con batería, parpadeo y sombras dinámicas. Primeras pruebas de iluminación en el pasillo principal.',
  E'Esta semana el objetivo era uno solo: que la **lámpara** se sintiera viva.\n\n### Qué se hizo\n\nLa lámpara ahora consume batería, parpadea cuando está por agotarse y proyecta sombras dinámicas sobre el pasillo. Probé tres perfiles de luz distintos hasta encontrar uno que ilumina lo justo: suficiente para avanzar, no suficiente para sentirte seguro.\n\n### Lo que aprendí\n\nEl miedo no está en la oscuridad total, está en la **frontera** entre lo que ves y lo que no.',
  '/covers/velador-alt.svg',
  array['Perfil de luz definitivo','Sonido de interruptor y parpadeo'],
  '[{"type":"nuevo","text":"Sistema de batería para la lámpara"},{"type":"nuevo","text":"Parpadeo procedural al quedar poca carga"},{"type":"mejora","text":"Sombras dinámicas en el pasillo principal"},{"type":"arreglo","text":"La luz ya no atraviesa las puertas cerradas"}]'::jsonb,
  'published'
)
on conflict (slug) do nothing;

insert into public.news (slug, title, excerpt, content, cover_url, category, tags, featured, status, published_at) values
(
  'nace-odiseo-studio', 'Bienvenidos a la base de operaciones',
  'Este sitio será el hogar de mis videojuegos, devlogs, reseñas de cine y proyectos. Así se ve el plan.',
  E'Hoy abre oficialmente este sitio: la base de operaciones de todo lo que hago.\n\nAquí vas a poder seguir el desarrollo de **El Velador**, leer devlogs técnicos, encontrar mis reseñas de cine de terror y ciencia ficción, y ver los proyectos en los que trabajo.\n\nEl objetivo es simple: documentar el camino de cero a desarrollador de videojuegos, en público.',
  '/covers/velador.svg', 'Actualización', array['sitio','estudio'], true, 'published', '2026-07-01T12:00:00Z'
),
(
  'primer-devlog-el-velador', 'Primer devlog de El Velador ya disponible',
  'Documento de diseño, Unity y un pasillo gris: así empieza todo proyecto de horror.',
  E'Ya está publicado el primer devlog de **El Velador**. Puedes leerlo completo en la sección de Devlogs.\n\nSpoiler: todavía no da miedo. Pero ya camina.',
  '/covers/velador-alt.svg', 'Videojuegos', array['el-velador','devlog'], false, 'published', '2026-06-11T12:00:00Z'
),
(
  'nueva-resena-hereditary', 'Nueva reseña en Instagram: Hereditary',
  'El terror familiar de Ari Aster, analizado en @fotogramas.malditos.',
  'Ya puedes leer mi opinión completa sobre **Hereditary** en Instagram. La ficha con calificación también está en la sección de Opiniones de este sitio.',
  '/covers/cine.svg', 'Cine', array['resena','terror'], false, 'published', '2026-06-20T12:00:00Z'
)
on conflict (slug) do nothing;

insert into public.movies (title, year, genre, director, duration, rating, review, poster_url, trailer_url, platform, instagram_url, featured) values
  ('Midsommar', 2019, 'Terror', 'Ari Aster', 147, 5, 'El terror a plena luz del día. Aster cambia la oscuridad por flores y convierte un duelo en pesadilla ritual. Incómoda, hipnótica y hermosa a partes iguales.', '/covers/midsommar.jpg', 'https://www.youtube.com/watch?v=1Vnghdsjmd0', 'HBO Max', 'https://www.instagram.com/fotogramas.malditos', false),
  ('The Witch', 2015, 'Terror', 'Robert Eggers', 92, 4.5, 'Terror puritano a fuego lento: Eggers construye el mal con silencio, fe y paranoia hasta que la familia se devora sola. Black Phillip ya es leyenda.', '/covers/the-witch.jpg', 'https://www.youtube.com/watch?v=iQXmlf3Sefg', 'Prime Video', 'https://www.instagram.com/fotogramas.malditos', false),
  ('Obsesión', 2026, 'Terror', 'Curry Barker', 110, 4, 'Entiende algo que pocas películas de terror se animan a tocar: el deseo de que alguien nos quiera, y lo poco que sabemos lo que queremos hasta que lo tenemos. Te da una falsa tranquilidad y, justo cuando bajas la guardia, te regresa de lleno al terror. Deja con ganas de más, pero la recomiendo.', '/covers/obsesion.jpg', 'https://www.youtube.com/watch?v=gMC8kkwbIQQ', 'Prime Video', 'https://www.instagram.com/fotogramas.malditos', true),
  ('Gonjiam: Hospital Maldito', 2018, 'Terror', 'Jung Bum-shik', 95, 4, 'El streaming de terror hecho película. Corea entiende el ritmo del miedo moderno: cámaras, likes y un psiquiátrico que no perdona.', '/covers/gonjiam.jpg', 'https://www.youtube.com/watch?v=KKGJTgnkQA8', 'Prime Video', 'https://www.instagram.com/fotogramas.malditos', false),
  ('REC', 2007, 'Terror', 'Balagueró y Plaza', 78, 4, 'Found footage en estado puro: un edificio, una cámara y claustrofobia creciente. El último tramo sigue siendo de lo mejor del género.', '/covers/rec.jpg', 'https://www.youtube.com/watch?v=KLizS5GFBQI', 'Prime Video', 'https://www.instagram.com/fotogramas.malditos', false),
  ('Hereditary', 2018, 'Terror', 'Ari Aster', 127, 4.5, 'El terror como herencia: una familia que se desmorona escena a escena hasta un final que no se olvida. Toni Collette está monumental.', '/covers/hereditary.jpg', 'https://www.youtube.com/watch?v=V6wWKNij_1M', 'Prime Video', 'https://www.instagram.com/fotogramas.malditos', true),
  ('Fenómeno Siniestro', 2011, 'Terror', 'The Vicious Brothers', 92, 4, 'Un reality de fantasmas atrapado en su propio programa. Serie B con ideas brillantes y pasillos que cambian de lugar.', '/covers/fenomeno-siniestro.jpg', 'https://www.youtube.com/watch?v=RAChPb4MvAU', 'Netflix · Prime Video', 'https://www.instagram.com/fotogramas.malditos', false);

insert into public.portfolio (slug, title, description, category, client, date, technologies, cover_url, gallery, external_url) values
(
  'editor-pdf', 'Odiseo — Editor PDF',
  'Herramienta web gratuita para trabajar con PDFs directamente en el navegador: unir, dividir, anotar y firmar documentos. Todo el procesamiento ocurre en el dispositivo del usuario — los archivos nunca se suben a un servidor. Desplegada en Netlify.',
  'Aplicación Web', 'Proyecto propio', 'Julio 2026',
  array['HTML','CSS','JavaScript','Netlify'], '/covers/work-pdf.svg', '{}',
  'https://splendid-douhua-0ad145.netlify.app/'
),
(
  'tarotec', 'TaroTec — landing de producto',
  'Sitio de presentación para TaroTec, botana artesanal de malanga creada para InnovaTecNM 2026 (TecNM Orizaba): tres sabores, sección de beneficios, galería del producto y del stand, y canales de contacto. Desplegado en Netlify.',
  'Desarrollo Web', 'TaroTec · InnovaTecNM 2026', 'Julio 2026',
  array['HTML','CSS','JavaScript','Netlify'], 'https://voluble-sunflower-7d8571.netlify.app/Sabores.jpeg',
  array['https://voluble-sunflower-7d8571.netlify.app/Natural.jpeg','https://voluble-sunflower-7d8571.netlify.app/Queso.jpeg','https://voluble-sunflower-7d8571.netlify.app/Habanero.jpeg','https://voluble-sunflower-7d8571.netlify.app/InnovaTec.jpg'],
  'https://voluble-sunflower-7d8571.netlify.app/'
),
(
  'fotogramas-malditos', 'Identidad — @fotogramas.malditos',
  'Identidad visual completa para una cuenta de reseñas de cine de terror y sci-fi: estética oscura, estrellas doradas, plantillas de publicación y estructura editorial de sinopsis, reseña y calificación.',
  'Branding', 'Proyecto propio', 'Junio 2026',
  array['Dirección de arte','Instagram','Contenido'], '/covers/work-brand.svg', '{}',
  'https://www.instagram.com/fotogramas.malditos'
),
(
  'archivo-clave-web', 'Archivo Clave — juego web multijugador',
  'Juego de palabras clave por equipos con conexión P2P vía WebRTC, empaquetado en un solo archivo HTML y desplegado en hosting estático.',
  'Videojuegos', 'Proyecto propio', 'Junio 2026',
  array['JavaScript','PeerJS','WebRTC'], '/covers/archivo.svg', '{}',
  null
)
on conflict (slug) do nothing;

insert into public.categories (name, slug, scope) values
('Actualización', 'actualizacion', 'noticias'),
('Videojuegos', 'videojuegos', 'noticias'),
('Cine', 'cine', 'noticias'),
('Desarrollo Web', 'desarrollo-web', 'portafolio'),
('Branding', 'branding', 'portafolio'),
('Terror', 'terror', 'peliculas');

insert into public.tags (name, slug) values
('el-velador', 'el-velador'), ('devlog', 'devlog'), ('resena', 'resena'), ('terror', 'terror'), ('sitio', 'sitio');

insert into public.site_settings (id, data) values (1, '{
  "tagline": "Desarrollador de videojuegos, creador de contenido y apasionado por el cine.",
  "hero_image": "/covers/hero-odiseo.jpg",
  "now_banner": "Esta semana: puliendo el sistema de baterías de la linterna en El Velador 🔦",
  "footer_quote": "Creating worlds, one game at a time.",
  "socials": {
    "instagram": "https://www.instagram.com/fotogramas.malditos",
    "github": "https://github.com/",
    "discord": "https://discord.com/",
    "email": "hola@odiseo.dev"
  },
  "about": {
    "photo_url": "/covers/avatar.svg",
    "bio": "Soy **Odiseo**, desarrollador independiente desde Orizaba, México.\n\nVengo de la gestión empresarial y estoy construyendo, en público, mi camino hacia la industria del videojuego: aprendiendo C# y Unity, escribiendo devlogs y diseñando **El Velador**, un horror atmosférico en primera persona.\n\nCuando no programo, analizo cine de terror, ciencia ficción y thriller en @fotogramas.malditos. Mi meta: desarrollar juegos en Vancouver.",
    "skills": [
      { "name": "C# / Unity", "level": 35 },
      { "name": "HTML / CSS / JavaScript", "level": 60 },
      { "name": "Diseño de juego", "level": 45 },
      { "name": "Análisis de cine", "level": 90 },
      { "name": "Gestión de proyectos", "level": 80 },
      { "name": "Inglés", "level": 55 }
    ],
    "experience": [
      { "period": "2026 — hoy", "role": "Desarrollador indie", "place": "Odiseo Studio", "description": "Diseño y desarrollo de El Velador y proyectos web propios." },
      { "period": "2026 — hoy", "role": "Ingeniería de Software", "place": "Hybridge Education", "description": "Formación formal en desarrollo de software." },
      { "period": "2022 — 2026", "role": "Ingeniería en Gestión Empresarial", "place": "Instituto Tecnológico de Orizaba", "description": "Formación en gestión, análisis y estrategia." }
    ]
  },
  "seo": {
    "title": "Odiseo — Estudio independiente",
    "description": "Sitio oficial de Odiseo: desarrollo de videojuegos, devlogs, noticias, reseñas de cine y portafolio."
  }
}'::jsonb)
on conflict (id) do nothing;
