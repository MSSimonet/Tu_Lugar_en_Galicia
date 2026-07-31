import Image from 'next/image';
import { getUltimosPosts } from '@/lib/instagram/posts';

// Server Component async: necesita leer el token de Instagram desde Supabase, así que no
// puede ser "use client". Mientras no haya ninguna cuenta conectada (o Instagram falle),
// getUltimosPosts() devuelve [] y se muestra el placeholder "Próximamente" de siempre.

function PlaceholderGrid() {
  const cuadros = Array.from({ length: 6 }, (_, i) => i + 1);
  return (
    <div className="relative">
      {/* Antes el "Próximamente" vivía solo en el aria-label — visualmente el grid
          gris parecía una sección rota (auditoría 2026-07-19). */}
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 px-[var(--space-4)] py-[var(--space-2)] [font-size:var(--text-sm)] uppercase tracking-[var(--tracking-ui)]"
        style={{
          fontFamily: 'var(--font-dz-ui)',
          fontWeight: 700,
          color: 'var(--dz-ink)',
          backgroundColor: 'var(--dz-luz)',
          border: '1px solid var(--dz-borde)',
          borderRadius: '999px',
          boxShadow: 'var(--dz-shadow-sm)',
        }}
      >
        Próximamente
      </span>
    <ul
      className="grid grid-cols-3 gap-[var(--space-3)]"
      aria-label="Próximamente: feed de Instagram"
    >
      {cuadros.map((n) => (
        <li
          key={n}
          className="relative aspect-square overflow-hidden opacity-40"
          style={{ borderRadius: '4px', backgroundColor: 'var(--dz-muted)' }}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="absolute inset-0 m-auto h-8 w-8"
            style={{ color: 'var(--dz-luz)' }}
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </li>
      ))}
    </ul>
    </div>
  );
}

function Carrusel({ posts }: { posts: Awaited<ReturnType<typeof getUltimosPosts>> }) {
  return (
    <ul
      className="flex snap-x snap-mandatory gap-[var(--space-4)] overflow-x-auto pb-[var(--space-2)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Carrusel de publicaciones de Instagram"
      tabIndex={0}
    >
      {posts.map((post) => (
        <li key={post.id} className="w-[65%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[22%]">
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={post.caption ? `Abrir publicación: ${post.caption.slice(0, 80)}` : 'Abrir publicación en Instagram'}
          >
            <div
              className="relative aspect-square overflow-hidden"
              style={{ borderRadius: '4px', backgroundColor: 'var(--dz-muted)' }}
            >
              <Image
                src={post.imageUrl}
                alt={post.caption ? post.caption.slice(0, 140) : 'Publicación de Instagram'}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 65vw"
                className="transition-brand object-cover hover:scale-[1.03]"
              />
              {post.isVideo && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="absolute right-2 top-2 h-5 w-5 drop-shadow"
                  style={{ color: 'var(--dz-luz)' }}
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
            {post.caption && (
              <p
                className="mt-[var(--space-2)] line-clamp-2 [font-size:var(--text-xs)]"
                style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
              >
                {post.caption}
              </p>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}

export async function FeedInstagram() {
  const posts = await getUltimosPosts(10);

  return (
    <section
      className="px-[var(--space-6)] py-[var(--dz-section-y)]"
      style={{ backgroundColor: 'transparent' /* la capa de fondo de pagina pinta el color; ver FondoAnimado */ }}
      aria-labelledby="instagram-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="instagram-heading"
          className="mb-[var(--space-12)] flex items-center justify-center gap-[var(--space-3)]"
        >
          <a
            href="https://instagram.com/tulugarengalicia"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir @tulugarengalicia en Instagram"
            className="shrink-0"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="ig-gradient-home" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FEE411" />
                  <stop offset="18%" stopColor="#FEA10B" />
                  <stop offset="40%" stopColor="#F5433E" />
                  <stop offset="65%" stopColor="#C32AA3" />
                  <stop offset="100%" stopColor="#5A51D6" />
                </linearGradient>
              </defs>
              <path
                fill="url(#ig-gradient-home)"
                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
              />
            </svg>
          </a>
          <a
            href="https://instagram.com/tulugarengalicia"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 'var(--dz-weight-h2)', color: 'var(--dz-ink)', fontSize: 'var(--dz-text-h2)', lineHeight: 'var(--dz-leading-h2)' }}
          >
            Síguenos en Instagram
          </a>
        </h2>

        {posts.length > 0 ? <Carrusel posts={posts} /> : <PlaceholderGrid />}
      </div>
    </section>
  );
}
