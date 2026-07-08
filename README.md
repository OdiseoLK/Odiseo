# 🌌 Odiseo — Sitio personal + estudio indie

Sitio web completo construido con **Next.js 14, TypeScript, Tailwind CSS, Framer Motion y Supabase**.
Incluye páginas públicas (videojuegos, devlogs, noticias, películas, portafolio, sobre mí, contacto),
buscador global (⌘K), fondo animado con partículas y un **panel de administración** en `/admin`
para gestionar todo el contenido sin tocar código.

---

## 🚀 1. Probarlo en tu computadora (modo demo, 2 minutos)

Necesitas tener instalado [Node.js 18 o superior](https://nodejs.org).

```bash
npm install
npm run dev
```

Abre **http://localhost:3000**. El sitio arranca en **modo demo** con contenido de ejemplo
(El Velador, devlogs, reseñas de @fotogramas.malditos, etc.) sin necesidad de configurar nada.

> En modo demo el panel `/admin`, el formulario de contacto y los comentarios están desactivados,
> porque necesitan base de datos. Para activarlos sigue el paso 2.

---

## 🗄️ 2. Conectar Supabase (base de datos real + panel admin)

1. **Crea una cuenta y un proyecto** en [supabase.com](https://supabase.com) (plan gratuito es suficiente).
2. En tu proyecto ve a **SQL Editor → New query**, pega TODO el contenido del archivo
   [`supabase/schema.sql`](./supabase/schema.sql) y presiona **Run**.
   Esto crea las tablas, la seguridad, el bucket de imágenes y el contenido inicial.
3. Crea tu usuario administrador: **Authentication → Users → Add user → Create new user**.
   Escribe tu correo y una contraseña (marca *Auto confirm user*).
4. Copia tus llaves: **Project Settings → API**. Necesitas la **Project URL** y la **anon public key**.
5. En la carpeta del proyecto crea un archivo llamado `.env.local` (puedes copiar `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

6. Reinicia el servidor (`npm run dev`). Entra a **http://localhost:3000/admin**
   e inicia sesión con el usuario del paso 3. 🎉

Desde el panel puedes crear/editar/eliminar: noticias, videojuegos (con progreso por categoría,
roadmap, características, FAQ, galería…), devlogs, reseñas de películas, trabajos del portafolio,
categorías, etiquetas, archivos del bucket, moderar comentarios, leer mensajes de contacto,
ver analíticas de visitas y editar los ajustes del sitio (redes, «Sobre mí», SEO).

---

## ☁️ 3. Publicarlo en internet (Vercel, gratis)

1. Sube el proyecto a un repositorio de **GitHub**.
2. Entra a [vercel.com](https://vercel.com), **Add New → Project** e importa tu repositorio.
3. En **Environment Variables** agrega las mismas tres variables de `.env.local`
   (en `NEXT_PUBLIC_SITE_URL` pon tu dominio final, por ejemplo `https://odiseo.vercel.app`).
4. **Deploy**. Cada `git push` volverá a publicar el sitio automáticamente.

---

## 🗂️ Estructura del proyecto

```
app/
  (site)/            Páginas públicas (inicio, videojuegos, devlogs, noticias, …)
  admin/             Panel de administración (login + secciones CRUD)
  layout.tsx         Layout raíz, SEO y fuentes
  sitemap.ts         Sitemap automático
components/
  site/              Navbar, Hero, fondo animado, tarjetas, buscador ⌘K, …
  admin/             Tablas, formularios, editor Markdown, subida de imágenes, …
  ui/                Piezas reutilizables (badges, barras de progreso, estrellas, …)
lib/
  data.ts            Lectura de datos (Supabase, con respaldo al modo demo)
  demo-data.ts       Contenido del modo demo
  supabase/          Clientes de Supabase (navegador y servidor)
supabase/schema.sql  Base de datos completa: tablas + seguridad + datos iniciales
public/covers/       Imágenes de ejemplo (SVG)
```

## 🛠️ Comandos

| Comando         | Qué hace                          |
| --------------- | --------------------------------- |
| `npm run dev`   | Servidor de desarrollo            |
| `npm run build` | Compilación de producción         |
| `npm start`     | Servir la compilación             |

## 📌 Notas y mejoras futuras

- El editor de contenido usa **Markdown** con barra de herramientas y vista previa
  (negritas, títulos, listas, imágenes, citas). Una mejora futura natural es un editor
  visual tipo Notion (TipTap).
- Las imágenes subidas desde el panel se guardan en **Supabase Storage** (bucket `media`)
  y son públicas para poder mostrarse en el sitio.
- Los comentarios de visitantes nacen **pendientes de aprobación**: se publican desde
  *Admin → Mensajes → Comentarios*.
- Las noticias con fecha de publicación futura se muestran automáticamente al llegar la fecha.
- Seguridad: el sitio usa la *anon key* pública (es lo correcto); las reglas RLS del schema
  impiden que cualquiera que no haya iniciado sesión modifique contenido.
