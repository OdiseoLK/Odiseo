import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-sm tracking-widest text-electric">ERROR 404</p>
        <h1 className="mt-3 font-display text-5xl font-extrabold text-white">Zona sin mapear</h1>
        <p className="mx-auto mt-4 max-w-md text-zinc-400">Esta página no existe… o todavía no se ha desbloqueado en el roadmap.</p>
        <Link href="/" className="btn-primary mt-8">Volver al inicio</Link>
      </div>
    </div>
  );
}
